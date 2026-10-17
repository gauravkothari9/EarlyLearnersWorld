/* Studio UI: style gallery, live preview with music + narration, MP4/WebM export, batch mode. */
(function () {
  const K = window.KS;
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const SKINS = ['#ffd3b4', '#f1b98c', '#c98b5e', '#8d5a3b'];

  const state = {
    style: K.STYLES[0], format: 'short', playing: false, t: 0, server: false,
    opts: { name: 'Leo', channel: 'EarlyLearnersWorld', captions: true, narration: true, outro: true, watermark: true, skin: '', outfit: '', seed: 0 },
  };
  let audioCtx = null, source = null, startAt = 0, audioCache = new Map(), voiceIdx = 0, voiceLines = [], voiceSources = [], musicGain = null, playToken = 0;
  const voiceBufs = new Map();

  const dims = (format, res) => { const long = Math.round((res * 16) / 9 / 2) * 2; return format === 'short' ? [res, long] : [long, res]; };
  const voiceDurs = {}; // voice -> { text: seconds }
  const curOpts = () => { const o = Object.assign({}, state.opts); const vd = voiceDurs[$('optVoice').value]; if (o.narration && vd) o.voiceDur = vd; return o; };
  // Ask the server how long each spoken line is, so scenes can stretch to fit the narration.
  async function ensureDurations(style, opts) {
    if (!state.server || !opts.narration) return opts;
    const voice = $('optVoice').value, have = (voiceDurs[voice] = voiceDurs[voice] || {});
    const texts = K.voiceLines(style, Object.assign({}, opts, { voiceDur: null })).map((l) => l.text).filter((x) => !(x in have));
    if (texts.length) {
      try { Object.assign(have, (await (await fetch('/api/voice-durations', { method: 'POST', body: JSON.stringify({ voice, texts }) })).json()).durs); } catch (e) {}
    }
    return Object.assign({}, opts, { voiceDur: have });
  }
  const tl = () => K.timeline(state.style, curOpts());

  // ---------- gallery ----------
  function buildGrid() {
    const grid = $('styleGrid'); grid.innerHTML = '';
    K.STYLES.forEach((s, i) => {
      const b = document.createElement('button'); b.className = 'style-card' + (s === state.style ? ' on' : ''); b.dataset.q = (s.name + ' ' + s.tag + ' ' + s.desc).toLowerCase();
      const cv = document.createElement('canvas'); cv.width = 180; cv.height = 320;
      b.append(cv);
      b.insertAdjacentHTML('beforeend', `<span class="num">${String(i + 1).padStart(2, '0')} · ${s.tag}</span><b>${s.name}</b>`);
      b.onclick = () => selectStyle(s);
      grid.append(b);
      s._thumb = cv;
    });
    drawThumbs();
  }
  function drawThumbs() { for (const s of K.STYLES) if (s._thumb) K.renderFrame(s._thumb.getContext('2d'), 180, 320, s, s.thumbT || 1.5, Object.assign(curOpts(), { watermark: false, seed: 0, voiceDur: null })); }
  function filterGrid(q) { q = q.trim().toLowerCase(); document.querySelectorAll('.style-card').forEach((el) => el.classList.toggle('hidden', !!q && !el.dataset.q.includes(q))); }

  function selectStyle(s, seed = 0) {
    stop(); state.style = s; state.t = 0; state.opts.seed = seed; $('optSeed').value = seed; audioCache.clear();
    document.querySelectorAll('.style-card').forEach((el, i) => el.classList.toggle('on', K.STYLES[i] === s));
    $('styleName').textContent = s.name; $('styleDesc').textContent = s.desc;
    $('variantInfo').textContent = seed ? `Variation #${seed}` + (s.pick ? ' · new content' : ' · new look & music') : 'Classic version';
    buildStrip(); draw(); prefetchVoice();
  }
  function buildStrip() {
    const strip = $('sceneStrip'); strip.innerHTML = '';
    tl().scenes.forEach((sc, i) => {
      const b = document.createElement('button'); b.textContent = (K.fmt(sc.cap || sc.say || '', curOpts()) || 'Scene ' + (i + 1)).replace(/\*/g, '');
      b.style.flex = sc.d; b.title = b.textContent; b.onclick = () => seek(sc.start + 0.01);
      strip.append(b);
    });
  }

  // ---------- player ----------
  const player = $('player');
  function sizePlayer() {
    const wrap = $('playerWrap'), short = state.format === 'short';
    const maxW = wrap.clientWidth - 24, maxH = Math.min(window.innerHeight - 260, short ? 760 : 520);
    let w = short ? (maxH * 9) / 16 : maxW, h = short ? maxH : (maxW * 9) / 16;
    if (w > maxW) { w = maxW; h = short ? (w * 16) / 9 : (w * 9) / 16; }
    if (h > maxH) { h = maxH; w = short ? (h * 9) / 16 : (h * 16) / 9; }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    player.style.width = w + 'px'; player.style.height = h + 'px';
    player.width = Math.round(w * dpr); player.height = Math.round(h * dpr);
    draw();
  }
  function draw() {
    const T = tl();
    const tt = !state.playing && state.t < 0.3 ? 0.3 : state.t; // skip the fade-in for the idle poster
    K.renderFrame(player.getContext('2d'), player.width, player.height, state.style, Math.min(tt, T.total - 0.001), curOpts());
    $('scrub').value = Math.round((state.t / T.total) * 1000);
    $('timeLbl').textContent = `${state.t.toFixed(1)} / ${T.total.toFixed(1)}s`;
    const strip = $('sceneStrip').children;
    T.scenes.forEach((sc, i) => strip[i] && strip[i].classList.toggle('on', state.t >= sc.start && state.t < sc.start + sc.d));
  }
  function audioFor(style, opts) {
    const key = style.id + '|' + opts.outro + '|' + K.timeline(style, opts).total.toFixed(3);
    if (!audioCache.has(key)) audioCache.set(key, K.renderAudio(style, opts));
    return audioCache.get(key);
  }
  // Natural narration: fetch each line from the server (same voice + cache as the MP4 export).
  function voiceBuffer(text) {
    const voice = $('optVoice').value, key = voice + '|' + text;
    if (!voiceBufs.has(key)) {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      voiceBufs.set(key, fetch('/api/tts?voice=' + encodeURIComponent(voice) + '&text=' + encodeURIComponent(text))
        .then((r) => { if (!r.ok) throw new Error('tts ' + r.status); return r.arrayBuffer(); })
        .then((ab) => audioCtx.decodeAudioData(ab))
        .catch((e) => { voiceBufs.delete(key); throw e; }));
    }
    return voiceBufs.get(key);
  }
  function prefetchVoice() {
    if (!state.server || !state.opts.narration) return;
    const style = state.style;
    ensureDurations(style, curOpts()).then(() => { if (state.style === style && !state.playing) { buildStrip(); draw(); } K.voiceLines(style, curOpts()).forEach((l) => voiceBuffer(l.text).catch(() => {})); });
  }
  // Same rule as the server: a line starts at its cue, or just after the previous line ends.
  function scheduleLines(lines, bufs) {
    let prevEnd = -1;
    return lines.map((l, i) => { const t = Math.max(l.t, prevEnd + 0.3); prevEnd = t + bufs[i].duration; return { t, buf: bufs[i] }; });
  }
  async function play() {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume();
    const token = ++playToken;
    if (state.server && state.opts.narration) { $('playBtn').textContent = '…'; await ensureDurations(state.style, curOpts()); if (token !== playToken) return; buildStrip(); }
    const T = tl(); if (state.t >= T.total - 0.05) state.t = 0;
    const lines = state.opts.narration ? K.voiceLines(state.style, curOpts()) : [];
    let sched = null;
    if (state.server && lines.length) {
      $('playBtn').textContent = '…';
      try { sched = scheduleLines(lines, await Promise.all(lines.map((l) => voiceBuffer(l.text)))); }
      catch (e) { console.warn('natural voice unavailable, using browser voice', e); }
      if (token !== playToken) return;
    }
    const a = audioFor(state.style, curOpts());
    const buf = audioCtx.createBuffer(1, a.data.length, a.sr); buf.copyToChannel(a.data, 0);
    musicGain = audioCtx.createGain(); musicGain.connect(audioCtx.destination);
    source = audioCtx.createBufferSource(); source.buffer = buf; source.connect(musicGain);
    const now = audioCtx.currentTime + 0.05;
    source.start(now, state.t); startAt = now - state.t;
    voiceSources = []; voiceLines = [];
    if (sched) {
      for (const l of sched) {
        if (l.t < state.t - 0.05) continue;
        const at = startAt + l.t, src = audioCtx.createBufferSource(); src.buffer = l.buf;
        const g = audioCtx.createGain(); g.gain.value = 1.4; src.connect(g); g.connect(audioCtx.destination);
        src.start(at); voiceSources.push(src);
        musicGain.gain.setTargetAtTime(0.45, at - 0.05, 0.04); musicGain.gain.setTargetAtTime(1, at + l.buf.duration, 0.15);
      }
    } else voiceLines = lines;
    voiceIdx = voiceLines.findIndex((v) => v.t >= state.t - 0.05); if (voiceIdx < 0) voiceIdx = voiceLines.length;
    state.playing = true; $('playBtn').textContent = '❚❚';
    requestAnimationFrame(loop);
  }
  function stop() {
    playToken++;
    if (source) { try { source.stop(); } catch (e) {} source = null; }
    voiceSources.forEach((s) => { try { s.stop(); } catch (e) {} }); voiceSources = [];
    if (window.speechSynthesis) speechSynthesis.cancel();
    state.playing = false; $('playBtn').textContent = '▶';
  }
  function seek(t) { const was = state.playing; stop(); state.t = Math.max(0, t); draw(); if (was) play(); }
  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text); u.pitch = 1.1; u.rate = 0.85;
    const vs = speechSynthesis.getVoices();
    const v = vs.find((x) => /natural|neural/i.test(x.name) && /en/i.test(x.lang)) || vs.find((x) => /zira|samantha|google us english/i.test(x.name)); if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
  function loop() {
    if (!state.playing) return;
    const T = tl();
    state.t = audioCtx.currentTime - startAt;
    while (voiceIdx < voiceLines.length && voiceLines[voiceIdx].t <= state.t) speak(voiceLines[voiceIdx++].text);
    if (state.t >= T.total) { state.t = T.total; draw(); stop(); return; }
    draw(); requestAnimationFrame(loop);
  }

  // ---------- export ----------
  async function exportMP4(style, format, res, fps, opts, onProgress, outName) {
    onProgress(0, `${style.name} · preparing narration…`);
    opts = await ensureDurations(style, opts);
    const [W, H] = dims(format, res);
    const T = K.timeline(style, opts), n = Math.round(T.total * fps);
    const idx = K.STYLES.indexOf(style) + 1;
    const v = K.variant(style, opts.seed);
    const name = outName || `${String(idx).padStart(2, '0')}-${style.id}${opts.seed ? '-v' + opts.seed : ''}-${format}`;
    const job = await (await fetch('/api/job', { method: 'POST', body: JSON.stringify({ name, total: n, width: W, height: H, fps, voice: opts.narration ? K.voiceLines(style, opts) : [], voiceName: $('optVoice').value, styleId: style.id, styleName: style.name, seed: opts.seed || 0, fp: v.fp, format, heroName: opts.name, record: opts.record }) })).json();
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const o = Object.assign({}, opts, { _tl: T });
    let pending = Promise.resolve();
    for (let i = 0; i < n; i++) {
      K.renderFrame(c, W, H, style, i / fps, o);
      const blob = await new Promise((r) => cv.toBlob(r, 'image/jpeg', 0.93));
      await pending;
      pending = fetch(`/api/job/${job.id}/frame`, { method: 'POST', body: blob });
      if (i % 10 === 0) onProgress(i / n, `${style.name} · ${format} · ${Math.round((i / n) * 100)}% done, ${100 - Math.round((i / n) * 100)}% left · frame ${i} of ${n}`);
    }
    await pending;
    await fetch(`/api/job/${job.id}/audio`, { method: 'POST', body: K.toWav(K.renderAudio(style, opts)) });
    onProgress(1, `${style.name} · ${format} · encoding…`);
    const r = await (await fetch(`/api/job/${job.id}/finish`, { method: 'POST' })).json();
    if (r.error) throw new Error(r.error);
    return r;
  }
  async function exportWebM(style, format, res, fps, opts, onProgress) {
    const [W, H] = dims(format, Math.min(res, 720));
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    const T = K.timeline(style, opts);
    audioCtx = audioCtx || new AudioContext(); await audioCtx.resume();
    const a = K.renderAudio(style, opts), buf = audioCtx.createBuffer(1, a.data.length, a.sr); buf.copyToChannel(a.data, 0);
    const dest = audioCtx.createMediaStreamDestination(), src = audioCtx.createBufferSource(); src.buffer = buf; src.connect(dest);
    const stream = new MediaStream([...cv.captureStream(fps).getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 8e6 });
    const chunks = []; rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise((r) => (rec.onstop = r));
    K.renderFrame(c, W, H, style, 0, opts);
    rec.start(); src.start(); const t0 = audioCtx.currentTime;
    await new Promise((resolve) => { const step = () => { const t = audioCtx.currentTime - t0; K.renderFrame(c, W, H, style, Math.min(t, T.total - 0.001), opts); onProgress(t / T.total, `${style.name} · recording live…`); if (t < T.total) requestAnimationFrame(step); else resolve(); }; step(); });
    rec.stop(); await done;
    const url = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
    const link = document.createElement('a'); link.href = url; link.download = `${style.id}-${format}.webm`; link.click();
    return { url, file: link.download };
  }
  function progress(p, msg) {
    $('progress').classList.remove('hidden');
    $('progress').querySelector('i').style.width = Math.round(p * 100) + '%';
    $('progress').querySelector('span').textContent = msg;
    if (params.get('batch')) $('batchMsg').textContent = msg;
  }
  async function runExport(list) {
    stop();
    $('exportBtn').disabled = $('exportAllBtn').disabled = true;
    const res = +$('optRes').value, fps = +$('optFps').value, base = curOpts(), results = [];
    let error = null;
    try {
      for (const [s, f, extra, outName] of list) {
        const opts = Object.assign({}, base, extra || {});
        const r = state.server ? await exportMP4(s, f, res, fps, opts, progress, outName) : await exportWebM(s, f, res, fps, opts, progress);
        results.push(Object.assign({ format: f }, r));
        log(`done ${r.file}`);
        refreshOutputs();
      }
      progress(1, `Finished ${list.length} file(s).`);
    } catch (e) { error = e.message; progress(0, 'Error: ' + e.message); log('ERROR ' + e.message); }
    $('exportBtn').disabled = $('exportAllBtn').disabled = false;
    return { results, error };
  }
  // Ask the server for a style + variation that has never been made before.
  async function randomPick(styles) {
    const learningOnly = $('optLessons').checked;
    if (state.server) { try { const r = await fetch('/api/random/pick', { method: 'POST', body: JSON.stringify({ styles, learningOnly }) }); if (r.ok) return r.json(); } catch (e) {} }
    const pool = styles ? K.STYLES.filter((x) => styles.includes(x.id)) : K.STYLES.filter((x) => !learningOnly || K.isLesson(x));
    const st = pool[Math.floor(Math.random() * pool.length)];
    return { styleId: st.id, seed: 1 + Math.floor(Math.random() * 2e9), name: K.NAMES[Math.floor(Math.random() * K.NAMES.length)] };
  }
  function log(msg) { console.log(msg); if (state.server) fetch('/api/log', { method: 'POST', body: msg }).catch(() => {}); }
  async function refreshOutputs() {
    if (!state.server) return;
    const files = await (await fetch('/api/outputs')).json();
    const box = $('outputs');
    if (!files.length) { box.innerHTML = '<p class="muted">Nothing yet.</p>'; return; }
    box.innerHTML = files.slice(0, 40).map((f) => `<div class="out"><video src="${studioUrl(f.url)}#t=1" preload="metadata" muted></video><div><b title="${f.file}">${f.file}</b><a href="${studioUrl(f.url)}" target="_blank">open</a> · <a href="${studioUrl(f.url)}" download>download</a> · ${(f.size / 1048576).toFixed(1)} MB</div></div>`).join('');
  }

  // ---------- settings ----------
  function bind() {
    const upd = () => { state.opts.name = K.HOST; state.opts.channel = $('optChannel').value || 'EarlyLearnersWorld'; state.opts.captions = $('optCaptions').checked; state.opts.narration = $('optNarration').checked; state.opts.outro = $('optOutro').checked; state.opts.watermark = $('optWatermark').checked; state.opts.outfit = $('optOutfitAuto').checked ? '' : $('optOutfit').value; $('optOutfit').disabled = $('optOutfitAuto').checked; audioCache.clear(); buildStrip(); draw(); clearTimeout(bind._t); bind._t = setTimeout(drawThumbs, 200); };
    ['optName', 'optChannel', 'optOutfit'].forEach((id) => $(id).addEventListener('input', upd));
    ['optCaptions', 'optNarration', 'optOutro', 'optWatermark', 'optOutfitAuto'].forEach((id) => $(id).addEventListener('change', () => { stop(); upd(); }));
    const sw = $('skinSw');
    SKINS.forEach((col, i) => { const b = document.createElement('button'); b.style.background = col; b.className = i === 0 ? 'on' : ''; b.onclick = () => { state.opts.skin = col; [...sw.children].forEach((x) => x.classList.toggle('on', x === b)); upd(); }; sw.append(b); });
    $('formatSeg').querySelectorAll('button').forEach((b) => (b.onclick = () => { state.format = b.dataset.v; $('formatSeg').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); sizePlayer(); }));
    $('playBtn').onclick = () => (state.playing ? stop() : play());
    $('scrub').oninput = (e) => seek((e.target.value / 1000) * tl().total);
    $('exportBtn').onclick = () => runExport([[state.style, state.format]]);
    $('exportAllBtn').onclick = () => runExport(K.STYLES.flatMap((s) => [[s, 'short'], [s, 'video']]));
    $('optVoice').addEventListener('change', () => { stop(); prefetchVoice(); });
    $('styleSearch').addEventListener('input', (e) => filterGrid(e.target.value));
    $('optSeed').addEventListener('change', (e) => selectStyle(state.style, Math.max(0, parseInt(e.target.value, 10) || 0)));
    $('diceBtn').onclick = async () => { const p = await randomPick([state.style.id]); selectStyle(state.style, p.seed); };
    $('classicBtn').onclick = () => selectStyle(state.style, 0);
    $('randomBtn').onclick = async () => {
      const p = await randomPick(null), st = K.STYLES.find((x) => x.id === p.styleId);
      selectStyle(st, p.seed);
      const card = document.querySelectorAll('.style-card')[K.STYLES.indexOf(st)]; if (card) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    window.addEventListener('resize', sizePlayer);
    window.addEventListener('keydown', (e) => { if (e.code === 'Space' && e.target.tagName !== 'INPUT') { e.preventDefault(); state.playing ? stop() : play(); } });
  }

  async function checkServer() {
    try { const r = await fetch('/api/ping'); state.server = r.ok; } catch (e) { state.server = false; }
    const b = $('serverBadge');
    if (state.server) {
      b.textContent = 'MP4 export ready'; b.className = 'badge ok'; refreshOutputs();
      try {
        const v = await (await fetch('/api/voices')).json();
        $('optVoice').innerHTML = v.voices.map((x) => `<option value="${x.id}">${x.label}</option>`).join('');
        $('optVoice').value = params.get('voice') || v.default;
      } catch (e) {}
      prefetchVoice();
    }
    else { b.textContent = 'No server: WebM export only'; b.className = 'badge warn'; $('exportAllBtn').textContent = `Record all ${K.STYLES.length} (WebM)`; }
  }

  async function init() {
    try { await Promise.race([document.fonts.load('700 64px Fredoka'), new Promise((r) => setTimeout(r, 4000))]); } catch (e) {}
    bind(); buildGrid(); selectStyle(K.STYLES[0]); sizePlayer();
    $('styleCount').textContent = K.STYLES.length; $('exportAllBtn').textContent = `Export all ${K.STYLES.length} (shorts + videos)`;
    await checkServer();
    if (params.get('batch') && params.get('jobs')) {
      $('batchOverlay').classList.remove('hidden');
      const jobs = JSON.parse(params.get('jobs'));
      let out = { results: [], error: null };
      try {
        const j0 = jobs[0] || {};
        if (j0.voice) $('optVoice').value = j0.voice;
        $('optRes').value = String(j0.res || 1080); $('optFps').value = String(j0.fps || 30);
        const list = jobs.map((j) => [K.STYLES.find((x) => x.id === j.styleId), j.format, { seed: j.seed, name: j.name, channel: j.channel || state.opts.channel, captions: j.captions !== false, outro: j.outro !== false, record: j.record }, j.outName]);
        if (list.some((x) => !x[0])) throw new Error('unknown style in job list');
        out = await runExport(list);
      } catch (e) { out.error = e.message; }
      await fetch('/api/batch-done', { method: 'POST', body: JSON.stringify({ batchId: params.get('batchId'), results: out.results, error: out.error }) });
      return;
    }
    if (params.get('batch')) {
      $('batchOverlay').classList.remove('hidden');
      if (params.get('name')) { state.opts.name = params.get('name'); $('optName').value = state.opts.name; }
      $('optRes').value = params.get('res') || '1080'; $('optFps').value = params.get('fps') || '30';
      const formats = (params.get('formats') || 'short,video').split(',');
      const ids = params.get('styles') && params.get('styles') !== 'all' ? params.get('styles').split(',') : null;
      const list = K.STYLES.filter((s) => !ids || ids.includes(s.id)).flatMap((s) => formats.map((f) => [s, f]));
      log(`batch: ${list.length} renders`);
      await runExport(list);
      await fetch('/api/batch-done', { method: 'POST' });
    }
  }
  init();
})();
