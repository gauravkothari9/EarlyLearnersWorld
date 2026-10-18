import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Pause, Play } from 'lucide-react';
import { api, ttsUrl } from '../api';
import { drawOptions, fontsReady, KS, sizeCanvas, styleById } from '../engine';

let audioCtx = null;
const ctx = () => (audioCtx ||= new (window.AudioContext || window.webkitAudioContext)());
const voiceBuffers = new Map(); // "voice|text" -> Promise<AudioBuffer>
const durationCache = {}; // voice -> { text: seconds }

function voiceBuffer(voice, text) {
  const key = `${voice}|${text}`;
  if (!voiceBuffers.has(key)) {
    voiceBuffers.set(key, fetch(ttsUrl(voice, text), { credentials: 'same-origin' })
      .then((r) => { if (!r.ok) throw new Error(`tts ${r.status}`); return r.arrayBuffer(); })
      .then((ab) => ctx().decodeAudioData(ab))
      .catch((e) => { voiceBuffers.delete(key); throw e; }));
  }
  return voiceBuffers.get(key);
}

/** How long each narration line runs, so scenes stretch to fit the voice (same as the final video). */
async function withDurations(style, opts, voice) {
  if (!opts.narration) return opts;
  const have = (durationCache[voice] ||= {});
  const texts = KS().voiceLines(style, { ...opts, voiceDur: null }).map((l) => l.text).filter((t) => !(t in have));
  if (texts.length) {
    try { Object.assign(have, (await api.voiceDurations(voice, texts)).durs); } catch {}
  }
  return { ...opts, voiceDur: have };
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * Plays a style in the browser with its music and narration: the same frames and sound the
 * server will render. `seed` picks the variation.
 */
export default function PreviewPlayer({ styleId, format, settings, seed = 0 }) {
  const style = styleById(styleId);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const audio = useRef({ sources: [], gain: null, startAt: 0, token: 0 });
  const [opts, setOpts] = useState(() => drawOptions(settings, seed));
  const [t, setTState] = useState(0.3);
  const tRef = useRef(0.3); // current time for callbacks that outlive a render
  const setT = (v) => { tRef.current = v; setTState(v); };
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const voice = settings?.voice || 'en-US-AnaNeural';
  const timeline = useMemo(() => (style ? KS().timeline(style, opts) : null), [style, opts]);
  const total = timeline?.total || 1;

  // narration lengths change the timeline, so fetch them before drawing
  useEffect(() => {
    let live = true;
    const base = drawOptions(settings, seed);
    setOpts(base);
    if (style) withDurations(style, base, voice).then((o) => live && setOpts(o));
    return () => { live = false; };
  }, [style, settings, seed, voice]);

  const draw = useCallback((time) => {
    const canvas = canvasRef.current;
    if (!canvas || !style || !timeline) return;
    KS().renderFrame(canvas.getContext('2d'), canvas.width, canvas.height, style, Math.min(time, total - 0.001), { ...opts, _tl: timeline });
  }, [style, opts, timeline, total]);

  // fit the canvas to the box at the format's aspect ratio
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const fit = () => {
      const short = format === 'short';
      const maxW = wrap.clientWidth;
      const maxH = Math.min(window.innerHeight - 220, short ? 620 : 480);
      let w = maxW;
      let h = short ? (w * 16) / 9 : (w * 9) / 16;
      if (h > maxH) { h = maxH; w = short ? (h * 9) / 16 : (h * 16) / 9; }
      sizeCanvas(canvasRef.current, Math.round(w), Math.round(h));
      draw(tRef.current);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [format, draw]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fontsReady.then(() => draw(tRef.current)); }, [draw]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    const a = audio.current;
    a.token++;
    a.sources.forEach((s) => { try { s.stop(); } catch {} });
    a.sources = [];
    setPlaying(false);
    setLoading(false);
  }, []);

  useEffect(() => stop, [stop, styleId, format, opts]);

  const play = async () => {
    const a = audio.current;
    const token = ++a.token;
    const ac = ctx();
    await ac.resume();
    const from = tRef.current >= total - 0.05 ? 0 : tRef.current;
    const lines = opts.narration ? KS().voiceLines(style, opts) : [];
    let bufs = [];
    if (lines.length) {
      setLoading(true);
      try { bufs = await Promise.all(lines.map((l) => voiceBuffer(voice, l.text))); } catch { bufs = []; }
      if (token !== a.token) return;
      setLoading(false);
    }
    const music = KS().renderAudio(style, opts);
    const buf = ac.createBuffer(1, music.data.length, music.sr);
    buf.copyToChannel(music.data, 0);
    a.gain = ac.createGain();
    a.gain.connect(ac.destination);
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.connect(a.gain);
    const now = ac.currentTime + 0.05;
    src.start(now, from);
    a.startAt = now - from;
    a.sources = [src];
    // same placement rule as the server: a line starts at its cue, or just after the previous one ends
    let prevEnd = -1;
    lines.forEach((l, i) => {
      if (!bufs[i]) return;
      const at = Math.max(l.t, prevEnd + 0.3);
      prevEnd = at + bufs[i].duration;
      if (at < from - 0.05) return;
      const v = ac.createBufferSource();
      v.buffer = bufs[i];
      const g = ac.createGain();
      g.gain.value = 1.4;
      v.connect(g);
      g.connect(ac.destination);
      v.start(a.startAt + at);
      a.gain.gain.setTargetAtTime(0.45, a.startAt + at - 0.05, 0.04);
      a.gain.gain.setTargetAtTime(1, a.startAt + at + bufs[i].duration, 0.15);
      a.sources.push(v);
    });
    setPlaying(true);
    const loop = () => {
      if (token !== a.token) return;
      const now2 = ac.currentTime - a.startAt;
      if (now2 >= total) { setT(total); draw(total); stop(); return; }
      setT(now2);
      draw(now2);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  const seek = (value) => {
    const was = playing;
    stop();
    setT(value);
    draw(value);
    if (was) setTimeout(play, 0);
  };

  if (!style) return null;
  return (
    <div className="player">
      <div className="player-wrap" ref={wrapRef}><canvas ref={canvasRef} /></div>
      <div className="controls">
        <button type="button" className="round" onClick={() => (playing || loading ? stop() : play())} aria-label={playing ? 'Pause' : 'Play'}>
          {loading ? <Loader2 className="spin" size={16} /> : playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <input type="range" min={0} max={total} step={0.05} value={Math.min(t, total)} aria-label="Seek"
          onChange={(e) => seek(Number(e.target.value))} />
        <span className="time">{fmt(t)} / {fmt(total)}</span>
      </div>
    </div>
  );
}
