/* Procedural soundtrack: public-domain nursery melodies + auto bass/chords + drums + SFX.
   Deterministic, rendered offline to a mono Float32Array, shared by preview and export. */
(function () {
  const K = window.KS;
  const TAU = Math.PI * 2;

  K.SONGS = {
    wheels: { bpm: 120, bpb: 4, inst: 'toy', drums: 1, oct: 0, mel: 'C4:.5 F4:.5 F4:.5 F4:.5 F4:.5 A4:.5 C5:.5 A4:.5 F4:1 G4:.5 E4:.5 C4:1 C5:.5 A4:.5 F4:1 C4:.5 F4:.5 F4:.5 F4:.5 F4:.5 A4:.5 C5:.5 A4:.5 F4:1 G4:1 C4:1 F4:2 R:2', key: 5 },
    macdonald: { bpm: 122, bpb: 4, inst: 'toy', drums: 1, oct: 12, mel: 'C4 C4 C4 G3 A3 A3 G3:2 E4 E4 D4 D4 C4:3 G3 C4 C4 C4 G3 A3 A3 G3:2 E4 E4 D4 D4 C4:4', key: 0 },
    oldman: { bpm: 118, bpb: 4, inst: 'bell', drums: 1, oct: 0, mel: 'G4 E4 G4:2 G4 E4 G4:2 A4 G4 F4 E4 D4 E4 F4:2 E4 F4 G4 C4:.5 C4:.5 C4 C4:.5 C4:.5 C4:.5 D4:.5 E4:.5 F4:.5 G4:2 G4 D4 D4 F4 E4 D4 C4:2 R:2', key: 0 },
    london: { bpm: 124, bpb: 4, inst: 'toy', drums: 1, oct: 0, mel: 'G4:1.5 A4:.5 G4 F4 E4 F4 G4:2 D4 E4 F4:2 E4 F4 G4:2 G4:1.5 A4:.5 G4 F4 E4 F4 G4:2 D4:2 G4:2 E4 C4:3', key: 0 },
    twinkle: { bpm: 116, bpb: 4, inst: 'bell', drums: 1, oct: 0, mel: 'C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2 G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2 C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2', key: 0 },
    happy: { bpm: 120, bpb: 4, inst: 'toy', drums: 1, oct: 12, mel: 'G3:.5 G3:.5 C4 C4 C4 C4 C4:.5 C4:.5 B3:.5 C4:.5 D4:2 R:1 G3:.5 G3:.5 D4 D4 D4 D4 D4:.5 D4:.5 C4:.5 D4:.5 E4:2 R:1 E4:.5 E4:.5 F4 F4 F4 A4 A4:.5 G4:.5 F4:.5 E4:.5 D4 D4 R:.5 E4:.5 D4:.5 C4:.5 B3 B3 A3:.5 B3:.5 C4:3 R:1', key: 0 },
    brahms: { bpm: 84, bpb: 3, inst: 'bell', drums: 0, oct: 0, mel: 'E4:.5 E4:.5 G4:2 E4:.5 E4:.5 G4:2 E4:.5 G4:.5 C5:1 B4:1.5 A4:.5 A4:1 G4:1 D4:.5 E4:.5 F4:1 D4:1 D4:.5 E4:.5 F4:2 D4:.5 F4:.5 B4:.5 A4:.5 G4:1 B4:1 C5:3', key: 0 },
    dell: { bpm: 132, bpb: 3, inst: 'toy', drums: 1, oct: -12, mel: 'G4:1 C5:1 C5:.5 C5:1 C5:.5 C5:3 D5:1 E5:1 E5:.5 E5:1 E5:.5 E5:3 G5:1 G5:.5 A5:1 G5:.5 E5:1 C5:.5 D5:1 E5:.5 E5:1 D5:.5 D5:1 C5:.5 C5:3', key: 0 },
    rowboat: { bpm: 112, bpb: 3, inst: 'bell', drums: 1, oct: 0, mel: 'C4:1.5 C4:1.5 C4:1 D4:.5 E4:1.5 E4:1 D4:.5 E4:1 F4:.5 G4:3 C5:.5 C5:.5 C5:.5 G4:.5 G4:.5 G4:.5 E4:.5 E4:.5 E4:.5 C4:.5 C4:.5 C4:.5 G4:1 F4:.5 E4:1 D4:.5 C4:3', key: 0 },
    dance: { bpm: 124, bpb: 4, inst: 'pluck', drums: 2, oct: 0, mel: 'C5:.5 R:.5 C5:.5 G4:.5 A4:.5 C5:.5 R:.5 D5:.5 E5:.5 D5:.5 C5:.5 A4:.5 G4:1 R:1 A4:.5 R:.5 A4:.5 G4:.5 F4:.5 A4:.5 R:.5 C5:.5 D5:1 C5:.5 A4:.5 G4:2', key: 0 },
    jacques: { bpm: 108, bpb: 4, inst: 'bell', drums: 1, oct: 12, mel: 'C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4:2 E4 F4 G4:2 G4:.5 A4:.5 G4:.5 F4:.5 E4 C4 G4:.5 A4:.5 G4:.5 F4:.5 E4 C4 C4 G3 C4:2 C4 G3 C4:2', key: 0 },
    birthday: { bpm: 104, bpb: 3, inst: 'toy', drums: 1, oct: 0, mel: 'G4:.75 G4:.25 A4:1 G4:1 C5:1 B4:2 G4:.75 G4:.25 A4:1 G4:1 D5:1 C5:2 G4:.75 G4:.25 G5:1 E5:1 C5:1 B4:1 A4:2 F5:.75 F5:.25 E5:1 C5:1 D5:1 C5:3', key: 0 },
    mary: { bpm: 116, bpb: 4, inst: 'toy', drums: 1, oct: 0, mel: 'E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:4', key: 0 },
    hotcross: { bpm: 112, bpb: 4, inst: 'bell', drums: 1, oct: 0, mel: 'E4 D4 C4:2 E4 D4 C4:2 C4:.5 C4:.5 C4:.5 C4:.5 D4:.5 D4:.5 D4:.5 D4:.5 E4 D4 C4:2', key: 0 },
    rainrain: { bpm: 112, bpb: 4, inst: 'toy', drums: 1, oct: 0, mel: 'G4 E4:2 G4:.5 G4:.5 E4:2 G4:.5 G4:.5 E4 G4:.5 G4:.5 E4:2 F4 D4:2 F4:.5 F4:.5 D4:2 F4:.5 F4:.5 D4 F4 G4 C4:2 R:1', key: 0 },
    itsy: { bpm: 112, bpb: 3, inst: 'bell', drums: 1, oct: 0, mel: 'G3:.5 C4 C4:.5 C4 D4:.5 E4:1.5 E4 E4:.5 D4 C4:.5 D4 E4:.5 C4:3 E4:1.5 E4 F4:.5 G4:1.5 G4:1.5 F4 E4:.5 F4 G4:.5 E4:3 C4:1.5 C4 D4:.5 E4:1.5 E4:1.5 D4 C4:.5 D4 E4:.5 C4:1.5 G3:1.5', key: 0 },
    jingle: { bpm: 126, bpb: 4, inst: 'bell', drums: 1, oct: 0, mel: 'E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4:1.5 D4:.5 E4:4 F4 F4 F4:1.5 F4:.5 F4 E4 E4 E4:.5 E4:.5 E4 D4 D4 E4 D4:2 G4:2', key: 0 },
    yankee: { bpm: 128, bpb: 4, inst: 'toy', drums: 1, oct: 0, mel: 'C4 C4 D4 E4 C4 E4 D4 G3 C4 C4 D4 E4 C4:2 B3:2 C4 C4 D4 E4 F4 E4 D4 C4 B3 G3 A3 B3 C4:2 C4:2', key: 0 },
    weasel: { bpm: 120, bpb: 3, inst: 'pluck', drums: 1, oct: 0, mel: 'C4:1 C4:.5 D4:1 D4:.5 E4:.5 G4:.5 E4:.5 C4:1.5 C4:1 C4:.5 D4:1 D4:.5 E4:1.5 C4:1.5 C4:1 C4:.5 D4:1 D4:.5 E4:.5 G4:.5 E4:.5 C4:1.5 A4:1.5 D4:1 F4:.5 E4:1.5 C4:1.5', key: 0 },
    bingo: { bpm: 124, bpb: 4, inst: 'toy', drums: 1, oct: 0, mel: 'G3 C4 C4 G3 G3 A3 A3 G3 G3 C4 C4 D4 D4 E4:2 C4 E4 E4:2 F4 F4:2 D4 D4:2 E4 E4:2 C4 C4:2 D4 D4 D4 C4 B3 G3 A3 B3 C4:4', key: 0 },
    muffin: { bpm: 120, bpb: 4, inst: 'bell', drums: 1, oct: 0, mel: 'C4 F4 F4:.5 G4:.5 A4 F4 F4:.5 F4:.5 E4 G4 G4 E4 C4:2 C4 F4 F4:.5 G4:.5 A4 F4 F4 G4:.5 G4:.5 C4 C4 F4:3', key: 5 },
    mulberry: { bpm: 118, bpb: 3, inst: 'toy', drums: 1, oct: 0, mel: 'F4:1.5 F4:1 F4:.5 F4:1.5 A4:1 C5:.5 C5:1 A4:.5 F4:1.5 F4:1.5 G4:1.5 E4:1 C4:.5 C4:1.5 G4:1 G4:.5 F4:1.5 F4:1 F4:.5 F4:1.5 A4:1 C5:.5 C5:1 A4:.5 F4:1.5 F4:1.5 G4:1.5 C4:1.5 F4:3', key: 5 },
    skip: { bpm: 126, bpb: 4, inst: 'pluck', drums: 1, oct: 0, mel: 'E4 C4 E4:2 G4:2 D4 B3 D4:2 F4:2 E4 C4 E4:2 G4:2 D4 E4 F4 E4 D4 C4 C4:2', key: 0 },
    hickory: { bpm: 120, bpb: 3, inst: 'bell', drums: 1, oct: 0, mel: 'C4:.5 D4:.5 E4:.5 F4:.5 G4:1 G4:.5 A4:1 G4:.5 F4:1 E4:.5 D4:1.5 G3:1.5 C4:.5 D4:.5 E4:.5 F4:.5 G4:1 G4:.5 A4:1 G4:.5 F4:1 E4:.5 D4:1 B3:.5 C4:3', key: 0 },
  };

  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function parseMel(str, oct = 0) {
    return str.trim().split(/\s+/).map((tok) => {
      const [n, d] = tok.split(':');
      const dur = d ? parseFloat(d) : 1;
      if (n === 'R') return { m: null, d: dur };
      const mm = n.match(/^([A-G][#b]?)(\d)$/);
      return { m: 12 * (+mm[2] + 1) + NOTE[mm[1]] + oct, d: dur };
    });
  }
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  let seed = 1;
  const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

  function tone(buf, sr, t0, dur, f, inst, vol) {
    const rel = inst === 'bell' ? 1.1 : inst === 'pluck' ? 0.25 : inst === 'pad' ? 0.35 : 0.12;
    const i0 = Math.floor(t0 * sr), n = Math.floor((dur + rel) * sr), w = TAU * f;
    for (let k = 0; k < n; k++) {
      const i = i0 + k; if (i < 0 || i >= buf.length) continue;
      const tt = k / sr;
      let env, v;
      const att = Math.min(1, tt / (inst === 'pad' ? 0.15 : 0.005));
      const after = tt > dur ? Math.exp(-(tt - dur) * (inst === 'bell' ? 4 : 22)) : 1;
      if (inst === 'bell') {
        env = Math.exp(-tt * 3.0);
        v = Math.sin(w * tt) + 0.4 * Math.sin(2 * w * tt) * Math.exp(-tt * 6) + 0.18 * Math.sin(3.01 * w * tt) * Math.exp(-tt * 10);
      } else if (inst === 'toy') {
        env = 0.65 * Math.exp(-tt * 5) + 0.35 * Math.exp(-tt * 1.2);
        const ph = (f * tt) % 1;
        v = 0.75 * (4 * Math.abs(ph - 0.5) - 1) + 0.12 * (ph < 0.5 ? 1 : -1) + 0.2 * Math.sin(2 * w * tt);
      } else if (inst === 'pluck') {
        env = Math.exp(-tt * 6);
        v = 0; for (let h = 1; h <= 5; h++) v += (Math.sin(h * w * tt) / h) * Math.exp(-tt * h * 2.5);
      } else if (inst === 'bass') {
        env = Math.exp(-tt * 3.5);
        v = Math.sin(w * tt) + 0.3 * Math.sin(2 * w * tt);
      } else {
        env = 1;
        v = Math.sin(w * tt);
      }
      buf[i] += v * env * att * after * vol;
    }
  }
  function kick(buf, sr, t0, vol) {
    const i0 = Math.floor(t0 * sr), n = Math.floor(0.3 * sr); let ph = 0;
    for (let k = 0; k < n; k++) { const i = i0 + k; if (i >= buf.length) break; const tt = k / sr; ph += (TAU * (48 + 100 * Math.exp(-tt * 32))) / sr; buf[i] += Math.sin(ph) * Math.exp(-tt * 11) * vol; }
  }
  function noiseHit(buf, sr, t0, dur, decay, vol, hp = true) {
    const i0 = Math.floor(t0 * sr), n = Math.floor(dur * sr); let prev = 0;
    for (let k = 0; k < n; k++) { const i = i0 + k; if (i >= buf.length) break; const x = noise(); const y = hp ? x - prev : x; prev = x; buf[i] += y * Math.exp((-k / sr) * decay) * vol; }
  }
  function sweep(buf, sr, t0, dur, fFn, wave, vol, envFn, lp = 0) {
    const i0 = Math.floor(t0 * sr), n = Math.floor(dur * sr); let ph = 0, y = 0;
    const a = lp ? 1 - Math.exp((-TAU * lp) / sr) : 1;
    for (let k = 0; k < n; k++) {
      const i = i0 + k; if (i < 0 || i >= buf.length) continue;
      const tt = k / sr, p = tt / dur; ph += fFn(p, tt) / sr; const f = ph % 1;
      let v = wave === 'sin' ? Math.sin(TAU * ph) : wave === 'saw' ? 2 * f - 1 : wave === 'sq' ? (f < 0.5 ? 1 : -1) : 4 * Math.abs(f - 0.5) - 1;
      y += a * (v - y);
      buf[i] += y * envFn(p, tt) * vol;
    }
  }
  const bellEnv = (p) => Math.min(1, p * 40) * (1 - p);
  function sfx(buf, sr, t, type) {
    const V = 0.55;
    switch (type) {
      case 'pop': sweep(buf, sr, t, 0.09, (p) => 900 - 700 * p, 'sin', V * 0.9, (p) => 1 - p); break;
      case 'boing': sweep(buf, sr, t, 0.5, (p, tt) => 180 + 220 * p + 60 * Math.sin(tt * TAU * 14) * (1 - p), 'sin', V * 0.7, bellEnv); break;
      case 'ding': tone(buf, sr, t, 0.1, 1568, 'bell', V * 0.35); tone(buf, sr, t + 0.08, 0.1, 2093, 'bell', V * 0.3); break;
      case 'sparkle': for (let i = 0; i < 6; i++) tone(buf, sr, t + i * 0.05, 0.05, hz(84 + [0, 4, 7, 12, 16, 19][i]), 'bell', V * 0.14); break;
      case 'tada': [60, 64, 67, 72].forEach((m, i) => tone(buf, sr, t + i * 0.06, 0.5, hz(m + 12), 'toy', V * 0.22)); break;
      case 'cheer': noiseHit(buf, sr, t, 0.9, 3, V * 0.12, false); for (let i = 0; i < 4; i++) tone(buf, sr, t + i * 0.12, 0.08, hz(88 + i * 3), 'bell', V * 0.1); break;
      case 'whoosh': { let y = 0; const n = Math.floor(0.5 * sr), i0 = Math.floor(t * sr); for (let k = 0; k < n; k++) { const i = i0 + k; if (i >= buf.length) break; const p = k / n; const a = 0.02 + 0.2 * Math.sin(p * Math.PI); y += a * (noise() - y); buf[i] += y * Math.sin(p * Math.PI) * V * 1.4; } break; }
      case 'splash': noiseHit(buf, sr, t, 0.5, 7, V * 0.35, false); for (let i = 0; i < 5; i++) sweep(buf, sr, t + i * 0.05, 0.06, (p) => 600 + i * 150 + 900 * p, 'sin', V * 0.2, (p) => 1 - p); break;
      case 'bubble': for (let i = 0; i < 4; i++) sweep(buf, sr, t + i * 0.09, 0.07, (p) => 400 + i * 90 + 900 * p, 'sin', V * 0.35, (p) => Math.sin(p * Math.PI)); break;
      case 'click': noiseHit(buf, sr, t, 0.03, 120, V * 0.6); sweep(buf, sr, t, 0.04, () => 1800, 'sin', V * 0.2, (p) => 1 - p); break;
      case 'clap': noiseHit(buf, sr, t, 0.16, 22, V * 0.45); break;
      case 'shake': for (let i = 0; i < 6; i++) noiseHit(buf, sr, t + i * 0.06, 0.04, 70, V * 0.25); break;
      case 'crunch': for (let i = 0; i < 4; i++) noiseHit(buf, sr, t + i * 0.03, 0.03, 90, V * 0.4); break;
      case 'blow': { let y = 0; const n = Math.floor(0.8 * sr), i0 = Math.floor(t * sr); for (let k = 0; k < n; k++) { const i = i0 + k; if (i >= buf.length) break; const p = k / n; y += 0.08 * (noise() - y); buf[i] += y * Math.min(1, p * 8) * (1 - p) * V * 1.6; } break; }
      case 'yawn': sweep(buf, sr, t, 0.9, (p) => 420 - 220 * p, 'tri', V * 0.35, (p) => Math.sin(p * Math.PI), 900); break;
      case 'sad': [67, 66, 65, 64].forEach((m, i) => tone(buf, sr, t + i * 0.22, 0.2, hz(m), 'toy', V * 0.18)); break;
      case 'moo': sweep(buf, sr, t, 1.0, (p, tt) => 118 - 22 * p + 3 * Math.sin(tt * TAU * 5), 'saw', V * 0.9, (p) => Math.min(1, p * 6) * (1 - p * 0.7), 700); break;
      case 'baa': sweep(buf, sr, t, 0.7, (p, tt) => 320 + 28 * Math.sin(tt * TAU * 9), 'saw', V * 0.6, (p, tt) => Math.min(1, p * 8) * (1 - p) * (0.7 + 0.3 * Math.sin(tt * TAU * 9)), 1800); break;
      case 'oink': sweep(buf, sr, t, 0.45, (p, tt) => 170 + 50 * Math.sin(tt * TAU * 28), 'sq', V * 0.4, (p, tt) => (1 - p) * (Math.sin(tt * TAU * 12) > 0 ? 1 : 0.25), 1100); break;
      case 'cluck': [0, 0.16, 0.28].forEach((d) => sweep(buf, sr, t + d, 0.07, (p) => 780 - 300 * p, 'sq', V * 0.35, (p) => 1 - p, 2600)); break;
      case 'peep': [0, 0.14].forEach((d) => sweep(buf, sr, t + d, 0.08, (p) => 2400 + 600 * Math.sin(p * Math.PI), 'sin', V * 0.25, (p) => Math.sin(p * Math.PI))); break;
      case 'quack': [0, 0.22].forEach((d) => sweep(buf, sr, t + d, 0.17, (p) => 540 - 180 * p, 'saw', V * 0.45, (p) => Math.min(1, p * 10) * (1 - p), 1500)); break;
      case 'woof': [0, 0.28].forEach((d) => sweep(buf, sr, t + d, 0.16, (p) => 300 - 140 * p, 'saw', V * 0.6, (p) => Math.min(1, p * 12) * (1 - p), 900)); break;
      case 'roar': { let y = 0, ph = 0; const n = Math.floor(0.9 * sr), i0 = Math.floor(t * sr); for (let k = 0; k < n; k++) { const i = i0 + k; if (i >= buf.length) break; const p = k / n; ph += (90 + 40 * Math.sin(p * 9)) / sr; const x = (2 * (ph % 1) - 1) * 0.6 + noise() * 0.6; y += 0.12 * (x - y); buf[i] += y * Math.min(1, p * 6) * (1 - p) * V * 2.2; } break; }
      case 'elephant': sweep(buf, sr, t, 0.8, (p, tt) => 420 + 260 * Math.sin(p * Math.PI) + 18 * Math.sin(tt * TAU * 20), 'saw', V * 0.45, (p) => Math.min(1, p * 8) * (1 - p), 2400); break;
      case 'monkey': [0, 0.16, 0.32, 0.5].forEach((d, i) => sweep(buf, sr, t + d, 0.13, (p) => (i < 2 ? 500 + 500 * p : 900 - 300 * p), 'tri', V * 0.5, (p) => Math.sin(p * Math.PI), 2500)); break;
      case 'ribbit': [0, 0.22].forEach((d) => sweep(buf, sr, t + d, 0.16, (p, tt) => 260 + 60 * (Math.sin(tt * TAU * 45) > 0 ? 1 : -1), 'sq', V * 0.35, (p) => Math.sin(p * Math.PI), 1200)); break;
      case 'buzz': sweep(buf, sr, t, 0.8, (p, tt) => 210 + 20 * Math.sin(tt * TAU * 6), 'saw', V * 0.3, (p) => Math.min(1, p * 10) * Math.min(1, (1 - p) * 6), 1500); break;
      case 'tweet': [0, 0.15, 0.3].forEach((d) => sweep(buf, sr, t + d, 0.1, (p) => 2600 + 1400 * Math.sin(p * Math.PI), 'sin', V * 0.3, (p) => Math.sin(p * Math.PI))); break;
      case 'hoot': [0, 0.35].forEach((d) => sweep(buf, sr, t + d, 0.3, (p) => 380 - 40 * p, 'sin', V * 0.5, (p) => Math.sin(p * Math.PI))); break;
      case 'neigh': sweep(buf, sr, t, 0.9, (p, tt) => 700 - 400 * p + 60 * Math.sin(tt * TAU * 14), 'saw', V * 0.4, (p) => Math.min(1, p * 10) * (1 - p), 2200); break;
      case 'grunt': sweep(buf, sr, t, 0.35, (p) => 110 - 30 * p, 'saw', V * 0.8, (p) => Math.sin(p * Math.PI), 500); break;
      case 'hum': sweep(buf, sr, t, 0.9, (p) => 160 + 20 * Math.sin(p * 6), 'tri', V * 0.6, (p) => Math.sin(p * Math.PI), 800); break;
      case 'stomp': [0, 0.35].forEach((d) => { kick(buf, sr, t + d, V * 1.2); noiseHit(buf, sr, t + d, 0.2, 18, V * 0.25, false); }); break;
      case 'honk': [0, 0.25].forEach((d) => sweep(buf, sr, t + d, 0.18, () => 440, 'sq', V * 0.3, (p) => Math.min(1, p * 20) * (1 - p * 0.5), 1800)); break;
      case 'choo': [0, 0.3].forEach((d) => { noiseHit(buf, sr, t + d, 0.25, 9, V * 0.3, false); sweep(buf, sr, t + d, 0.25, () => 620, 'sq', V * 0.15, (p) => Math.sin(p * Math.PI), 1500); }); break;
      case 'siren': sweep(buf, sr, t, 1.2, (p) => (Math.floor(p * 4) % 2 ? 660 : 880), 'tri', V * 0.35, (p) => Math.min(1, p * 10) * Math.min(1, (1 - p) * 10)); break;
      case 'engine': sweep(buf, sr, t, 0.8, (p, tt) => 70 + 30 * p + 10 * Math.sin(tt * TAU * 18), 'saw', V * 0.5, (p) => Math.sin(p * Math.PI), 400); break;
      case 'plane': { let y = 0; const n = Math.floor(1.0 * sr), i0 = Math.floor(t * sr); for (let k = 0; k < n; k++) { const i = i0 + k; if (i >= buf.length) break; const p = k / n; y += (0.02 + 0.1 * p) * (noise() - y); buf[i] += y * Math.sin(p * Math.PI) * V * 1.6; } break; }
      case 'heli': for (let i = 0; i < 10; i++) noiseHit(buf, sr, t + i * 0.08, 0.06, 40, V * 0.25, false); break;
      case 'horn': sweep(buf, sr, t, 0.7, () => 196, 'saw', V * 0.5, (p) => Math.min(1, p * 10) * (1 - p * 0.6), 900); break;
      case 'blastoff': { let y = 0; const n = Math.floor(1.6 * sr), i0 = Math.floor(t * sr); for (let k = 0; k < n; k++) { const i = i0 + k; if (i >= buf.length) break; const p = k / n; y += 0.05 * (noise() - y); buf[i] += y * Math.min(1, p * 4) * (1 - p) * V * 2.4; } sweep(buf, sr, t, 1.4, (p) => 120 + 600 * p, 'sin', V * 0.25, (p) => 1 - p); break; }
      case 'drum': [0, 0.25, 0.5].forEach((d) => { kick(buf, sr, t + d, V); noiseHit(buf, sr, t + d, 0.1, 30, V * 0.2); }); break;
      case 'strum': [48, 52, 55, 60, 64].forEach((m, i) => tone(buf, sr, t + i * 0.03, 0.8, hz(m), 'pluck', V * 0.18)); break;
      case 'piano': [60, 64, 67, 72].forEach((m, i) => tone(buf, sr, t + i * 0.18, 0.3, hz(m), 'bell', V * 0.2)); break;
      case 'trumpet': [[67, 0], [72, 0.15], [76, 0.3]].forEach(([m, d]) => sweep(buf, sr, t + d, 0.25, () => hz(m), 'saw', V * 0.3, (p) => Math.min(1, p * 15) * (1 - p * 0.4), 2500)); break;
      case 'xylo': [72, 74, 76, 79, 81, 84].forEach((m, i) => tone(buf, sr, t + i * 0.1, 0.1, hz(m), 'bell', V * 0.16)); break;
      case 'giggle': for (let i = 0; i < 5; i++) sweep(buf, sr, t + i * 0.09, 0.07, (p) => 700 + i * 40 - 200 * p, 'tri', V * 0.25, (p) => Math.sin(p * Math.PI), 2500); break;
      case 'brush': for (let i = 0; i < 6; i++) noiseHit(buf, sr, t + i * 0.13, 0.1, 25, V * 0.12); break;
      case 'thunder': noiseHit(buf, sr, t, 1.2, 3, V * 0.4, false); kick(buf, sr, t, V * 0.8); break;
      case 'meow': sweep(buf, sr, t, 0.55, (p) => (p < 0.4 ? 520 + 320 * (p / 0.4) : 840 - 400 * ((p - 0.4) / 0.6)), 'saw', V * 0.4, (p) => Math.min(1, p * 6) * (1 - p), 2200); break;
    }
  }

  function chooseChords(notes, bpb, key) {
    const total = notes.reduce((a, n) => a + n.d, 0), bars = Math.ceil(total / bpb);
    const chords = [[0, 4, 7], [5, 9, 0], [7, 11, 2], [9, 0, 4]].map((ch) => ch.map((x) => (x + key) % 12));
    const roots = [0, 5, 7, 9].map((r) => (r + key) % 12);
    const out = [];
    for (let b = 0; b < bars; b++) {
      const score = [0, 0, 0, 0]; let pos = 0;
      for (const n of notes) { const s = pos, e = pos + n.d; pos = e; if (n.m == null) continue; const ov = Math.max(0, Math.min(e, (b + 1) * bpb) - Math.max(s, b * bpb)); if (!ov) continue; chords.forEach((ch, ci) => { if (ch.includes(n.m % 12)) score[ci] += ov * (ci === 3 ? 0.8 : 1); }); }
      let best = 0; for (let i = 1; i < 4; i++) if (score[i] > score[best] + 1e-6) best = i;
      out.push({ root: roots[best], tri: chords[best] });
    }
    return { chords: out, total };
  }

  K.renderAudio = function (style, opts = {}, sr = 44100) {
    const tl = K.timeline(style, opts), dur = tl.total;
    const v = K.variant(style, opts.seed), base = K.SONGS[v.song || style.song] || K.SONGS.twinkle;
    const mv0 = v.music || {}, shift = mv0.shift || 0;
    const spec = Object.assign({}, base, { bpm: base.bpm * (mv0.tempo || 1), inst: mv0.inst || base.inst, key: (base.key + shift + 12) % 12, oct: base.oct + shift });
    const buf = new Float32Array(Math.ceil((dur + 0.5) * sr));
    seed = 1;
    const spb = 60 / spec.bpm, notes = parseMel(spec.mel, spec.oct);
    const { chords, total } = chooseChords(notes, spec.bpb, spec.key);
    const mv = opts.musicVol ?? 1;
    for (let loop = 0; loop * total * spb < dur; loop++) {
      const base = loop * total;
      let pos = 0;
      for (const n of notes) {
        const st = (base + pos) * spb; pos += n.d;
        if (st > dur) break;
        if (n.m == null) continue;
        tone(buf, sr, st, n.d * spb * 0.92, hz(n.m), spec.inst, 0.24 * mv);
        if (spec.inst !== 'bell') tone(buf, sr, st, n.d * spb * 0.5, hz(n.m + 12), 'bell', 0.045 * mv);
      }
      chords.forEach((ch, b) => {
        const bs = (base + b * spec.bpb) * spb; if (bs > dur) return;
        for (let beat = 0; beat < spec.bpb; beat++) {
          const t = bs + beat * spb; if (t > dur) break;
          const m = 36 + ((ch.root + (beat % 2 && spec.bpb === 4 ? 7 : 0)) % 12);
          tone(buf, sr, t, spb * 0.8, hz(m), 'bass', (spec.drums ? 0.22 : 0.12) * mv);
          if (spec.drums) {
            if (spec.drums >= 2 || beat === 0 || (spec.bpb === 4 && beat === 2)) kick(buf, sr, t, 0.42 * mv);
            if (spec.bpb === 4 && beat % 2 === 1) noiseHit(buf, sr, t, 0.16, 22, 0.16 * mv);
            noiseHit(buf, sr, t, 0.05, 70, 0.05 * mv);
            if (spec.drums >= 2) noiseHit(buf, sr, t + spb / 2, 0.05, 60, 0.09 * mv);
          }
        }
        ch.tri.forEach((pc) => tone(buf, sr, bs, spec.bpb * spb * 0.95, hz(60 + pc), 'pad', 0.028 * mv));
      });
    }
    if (opts.sfx !== false) for (const e of K.sfxEvents(style, opts)) sfx(buf, sr, e.t, e.type);
    // master: fades, soft clip, normalize
    const total2 = Math.floor(dur * sr), fin = Math.floor(0.04 * sr), fout = Math.floor(0.7 * sr);
    let peak = 0;
    for (let i = 0; i < buf.length; i++) {
      let v = Math.tanh(buf[i] * 1.2);
      if (i < fin) v *= i / fin;
      if (i > total2 - fout) v *= Math.max(0, (total2 - i) / fout);
      buf[i] = v; peak = Math.max(peak, Math.abs(v));
    }
    const g = peak > 0 ? 0.89 / peak : 1;
    for (let i = 0; i < buf.length; i++) buf[i] *= g;
    return { sr, data: buf.subarray(0, total2) };
  };

  K.toWav = function ({ sr, data }) {
    const n = data.length, ab = new ArrayBuffer(44 + n * 2), v = new DataView(ab);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, 'data'); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 32767, true);
    return new Blob([ab], { type: 'audio/wav' });
  };
})();
