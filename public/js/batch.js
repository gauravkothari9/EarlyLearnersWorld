/* Headless renderer: draws every frame of each job in ?jobs=[...] and streams them to the server,
   which encodes the MP4 and mixes in music + narration. Reports back on /api/engine/batch-done. */
(function () {
  const K = window.KS;
  const params = new URLSearchParams(location.search);
  const post = (url, body) => fetch(url, { method: 'POST', body });
  const msg = (t) => { document.getElementById('msg').textContent = t; };
  const log = (t) => { console.log(t); post('/api/engine/log', t).catch(() => {}); };
  const dims = (format, res) => { const long = Math.round((res * 16) / 9 / 2) * 2; return format === 'short' ? [res, long] : [long, res]; };

  // Spoken line lengths, so scenes stretch to fit the narration.
  async function withDurations(style, opts, voice) {
    if (!opts.narration) return opts;
    const texts = K.voiceLines(style, Object.assign({}, opts, { voiceDur: null })).map((l) => l.text);
    let durs = {};
    try { durs = (await (await post('/api/engine/voice-durations', JSON.stringify({ voice, texts }))).json()).durs || {}; } catch (e) {}
    return Object.assign({}, opts, { voiceDur: durs });
  }

  async function renderOne(j) {
    const style = K.STYLES.find((x) => x.id === j.styleId);
    if (!style) throw new Error('unknown style ' + j.styleId);
    const fps = j.fps || 30;
    let opts = {
      seed: j.seed || 0, name: K.HOST, channel: j.channel || 'EarlyLearnersWorld',
      captions: j.captions !== false, narration: j.narration !== false, outro: j.outro !== false,
      watermark: j.watermark !== false, trialMark: j.trialMark || '',
    };
    opts = await withDurations(style, opts, j.voice);
    const [W, H] = dims(j.format, j.res || 1080);
    const T = K.timeline(style, opts), n = Math.round(T.total * fps);
    const job = await (await post('/api/engine/job', JSON.stringify({
      name: j.outName, total: n, width: W, height: H, fps, format: j.format,
      voice: opts.narration ? K.voiceLines(style, opts) : [], voiceName: j.voice,
    }))).json();
    if (job.error) throw new Error(job.error);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const o = Object.assign({}, opts, { _tl: T });
    let pending = Promise.resolve();
    for (let i = 0; i < n; i++) {
      K.renderFrame(c, W, H, style, i / fps, o);
      const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.93));
      await pending;
      pending = post(`/api/engine/job/${job.id}/frame`, blob);
      if (i % 30 === 0) msg(`${style.name} · ${j.format} · frame ${i} of ${n}`);
    }
    await pending;
    await post(`/api/engine/job/${job.id}/audio`, K.toWav(K.renderAudio(style, opts)));
    const r = await (await post(`/api/engine/job/${job.id}/finish`)).json();
    if (r.error) throw new Error(r.error);
    return Object.assign({ format: j.format, duration: T.total }, r);
  }

  async function main() {
    const jobs = JSON.parse(params.get('jobs') || '[]');
    const out = { batchId: params.get('batchId'), results: [], error: null };
    try {
      try { await Promise.race([document.fonts.load('700 64px Fredoka'), new Promise((r) => setTimeout(r, 4000))]); } catch (e) {}
      for (const j of jobs) {
        const r = await renderOne(j);
        out.results.push(r);
        log(`done ${r.file}`);
      }
    } catch (e) { out.error = e.message; log('ERROR ' + e.message); }
    await post('/api/engine/batch-done', JSON.stringify(out));
    msg(out.error ? 'Error: ' + out.error : 'Done');
  }
  main();
})();
