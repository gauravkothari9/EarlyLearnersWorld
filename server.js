// Kids Shorts Studio — local server. Needs ffmpeg on PATH (and `npm install` for natural voices).
// Serves the studio UI, receives JPEG frames + WAV soundtrack from the page,
// encodes MP4 with ffmpeg and mixes in narration (see voice.js).
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const { VOICES, DEFAULT_VOICE, speechFile, wavDuration, schedule } = require('./voice');
const core = require('./core');
const runner = require('./runner');
const yt = require('./youtube');
const autopilot = require('./autopilot');
let PORT = 5180;
// PUBLIC_URL is set on a hosted server (e.g. https://name.example.com). Locally the loopback address is used.
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');
const redirectUri = () => (PUBLIC_URL ? `${PUBLIC_URL}/oauth2callback` : `http://127.0.0.1:${PORT}/oauth2callback`);
const siteUrl = () => PUBLIC_URL || `http://localhost:${PORT}`;

const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const OUT = path.join(ROOT, 'output');
const TMP = path.join(ROOT, '.tmp');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.mp4': 'video/mp4', '.webm': 'video/webm', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.wav': 'audio/wav' };
const events = new EventEmitter();
const jobs = new Map();

function readBody(req) {
  return new Promise((res, rej) => { const chunks = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => res(Buffer.concat(chunks))); req.on('error', rej); });
}
function json(res, code, obj) { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); }
function run(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { windowsHide: true });
    let err = '';
    p.stderr.on('data', (d) => { err += d; if (err.length > 20000) err = err.slice(-10000); });
    p.on('error', rej);
    p.on('close', (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}: ${err.slice(-600)}`))));
  });
}
const safe = (s) => String(s || 'video').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'video';

async function narration(job) {
  if (!job.voice || !job.voice.length) return [];
  const lines = [];
  for (const v of job.voice) {
    try { const file = await speechFile(v.text, job.voiceName); lines.push({ t: v.t, file, dur: wavDuration(file) }); }
    catch (e) { console.warn('[voice] skipped line:', v.text, e.message); }
  }
  return schedule(lines);
}

async function finish(job) {
  await new Promise((res, rej) => { job.ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg video encode failed: ' + job.ffErr.slice(-600))))); job.ff.stdin.end(); });
  const video = path.join(job.dir, 'video.mp4');
  const music = path.join(job.dir, 'music.wav');
  const voices = await narration(job);
  const outFile = path.join(OUT, `${safe(job.name)}.mp4`);
  const args = ['-y', '-i', video];
  if (fs.existsSync(music)) args.push('-i', music);
  voices.forEach((v) => args.push('-i', v.file));
  if (fs.existsSync(music)) {
    const parts = ['[1:a]volume=0.8[m]'];
    if (voices.length) {
      // place each line at its time, mix them, then duck the music under the voice
      voices.forEach((v, i) => { const ms = Math.max(0, Math.round(v.t * 1000)); parts.push(`[${i + 2}:a]adelay=${ms}|${ms},volume=1.5[v${i}]`); });
      parts.push(`${voices.map((v, i) => `[v${i}]`).join('')}amix=inputs=${voices.length}:duration=longest:normalize=0,apad,asplit=2[vk][vm]`);
      parts.push('[m][vk]sidechaincompress=threshold=0.03:ratio=5:attack=15:release=350[md]');
      parts.push('[md][vm]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[a]');
    } else parts.push('[m]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[a]');
    args.push('-filter_complex', parts.join(';'), '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '192k');
  }
  args.push('-c:v', 'copy', '-movflags', '+faststart', '-shortest', outFile);
  await run('ffmpeg', args);
  fs.rmSync(job.dir, { recursive: true, force: true });
  return outFile;
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  try {
    if (p === '/api/ping') return json(res, 200, { ok: true, platform: process.platform });
    if (p === '/api/voices') return json(res, 200, { voices: VOICES.map(({ id, label }) => ({ id, label })), default: DEFAULT_VOICE });
    if (p === '/api/voice-durations' && req.method === 'POST') {
      const { voice, texts } = JSON.parse((await readBody(req)).toString());
      const durs = {};
      for (const t of (texts || []).slice(0, 200)) { try { durs[t] = wavDuration(await speechFile(String(t).slice(0, 300), voice || DEFAULT_VOICE)); } catch (e) {} }
      return json(res, 200, { durs });
    }
    if (p === '/api/tts') {
      const file = await speechFile(String(url.searchParams.get('text') || '').slice(0, 300), url.searchParams.get('voice') || DEFAULT_VOICE);
      res.writeHead(200, { 'Content-Type': 'audio/wav', 'Cache-Control': 'max-age=86400' });
      return fs.createReadStream(file).pipe(res);
    }
    if (p === '/api/log' && req.method === 'POST') { console.log('[page]', (await readBody(req)).toString()); return json(res, 200, { ok: true }); }
    if (p === '/api/batch-done' && req.method === 'POST') { let payload = {}; try { payload = JSON.parse((await readBody(req)).toString() || '{}'); } catch (e) {} json(res, 200, { ok: true }); events.emit('batch-done', payload); return; }
    if (p === '/api/styles') return json(res, 200, core.styleList());
    if (p === '/api/history') return json(res, 200, core.readHistory().slice(-200).reverse());
    if (p === '/api/random/pick' && req.method === 'POST') { const o = JSON.parse((await readBody(req)).toString() || '{}'); return json(res, 200, core.pickRandom(o)); }
    if (p === '/api/autopilot/status') return json(res, 200, await autopilot.statusReport());
    if (p === '/api/autopilot/settings' && req.method === 'POST') return json(res, 200, autopilot.saveSettings(JSON.parse((await readBody(req)).toString())));
    if (p === '/api/autopilot/run' && req.method === 'POST') { const o = JSON.parse((await readBody(req)).toString() || '{}'); autopilot.runNow(o); return json(res, 200, { started: true }); }
    if (p === '/api/youtube/client' && req.method === 'POST') { yt.setClient(JSON.parse((await readBody(req)).toString())); return json(res, 200, { ok: true, redirectUri: redirectUri() }); }
    if (p === '/api/youtube/disconnect' && req.method === 'POST') { yt.disconnect(); return json(res, 200, { ok: true }); }
    if (p === '/api/youtube/connect') { res.writeHead(302, { Location: yt.authUrl(redirectUri()) }); return res.end(); }
    if (p === '/oauth2callback') {
      try { if (url.searchParams.get('error')) throw new Error(url.searchParams.get('error')); await yt.handleCallback(url.searchParams.get('code'), url.searchParams.get('state'), redirectUri()); res.writeHead(302, { Location: `${siteUrl()}/autopilot.html?yt=connected` }); }
      catch (e) { res.writeHead(302, { Location: `${siteUrl()}/autopilot.html?yt=error&msg=` + encodeURIComponent(e.message) }); }
      return res.end();
    }
    if (p === '/api/outputs') {
      const files = fs.readdirSync(OUT).filter((f) => /\.(mp4|webm)$/i.test(f)).map((f) => { const st = fs.statSync(path.join(OUT, f)); return { file: f, url: '/output/' + encodeURIComponent(f), size: st.size, mtime: st.mtimeMs }; }).sort((a, b) => b.mtime - a.mtime);
      return json(res, 200, files);
    }
    if (p === '/api/job' && req.method === 'POST') {
      const spec = JSON.parse((await readBody(req)).toString());
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const dir = path.join(TMP, id); fs.mkdirSync(dir, { recursive: true });
      const fps = spec.fps || 30;
      const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), path.join(dir, 'video.mp4')], { windowsHide: true });
      const job = Object.assign({}, spec, { id, dir, ff, ffErr: '', frames: 0 });
      ff.stderr.on('data', (d) => { job.ffErr += d; if (job.ffErr.length > 20000) job.ffErr = job.ffErr.slice(-8000); });
      ff.stdin.on('error', () => {});
      jobs.set(id, job);
      console.log(`[job ${id}] start ${spec.name} ${spec.width}x${spec.height}@${fps}`);
      return json(res, 200, { id });
    }
    let m = p.match(/^\/api\/job\/([a-z0-9]+)\/(frame|audio|finish)$/);
    if (m && req.method === 'POST') {
      const job = jobs.get(m[1]); if (!job) return json(res, 404, { error: 'no such job' });
      if (m[2] === 'frame') {
        const buf = await readBody(req);
        if (!job.ff.stdin.write(buf)) await new Promise((r) => job.ff.stdin.once('drain', r));
        job.frames++;
        return json(res, 200, { ok: true });
      }
      if (m[2] === 'audio') { fs.writeFileSync(path.join(job.dir, 'music.wav'), await readBody(req)); return json(res, 200, { ok: true }); }
      if (m[2] === 'finish') {
        const out = await finish(job);
        jobs.delete(job.id);
        if (job.record !== false && job.seed > 0 && job.fp) core.addHistory({ fp: job.fp, styleId: job.styleId, styleName: job.styleName, seed: job.seed, name: job.heroName, formats: [job.format], files: [path.basename(out)], status: 'rendered', source: 'studio' });
        console.log(`[job ${job.id}] done ${job.frames} frames -> ${path.relative(ROOT, out)}`);
        return json(res, 200, { file: path.basename(out), format: job.format, url: '/output/' + encodeURIComponent(path.basename(out)) });
      }
    }
    // static
    let file;
    if (p.startsWith('/output/')) file = path.join(OUT, decodeURIComponent(p.slice(8)));
    else file = path.join(PUB, p === '/' ? 'index.html' : decodeURIComponent(p));
    if (!file.startsWith(PUB) && !file.startsWith(OUT)) return json(res, 403, { error: 'forbidden' });
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return json(res, 404, { error: 'not found' });
    const st = fs.statSync(file), type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      const [a, b] = range.replace('bytes=', '').split('-'); const start = +a, end = b ? +b : st.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    console.error(e);
    json(res, 500, { error: e.message });
  }
}

function startServer(port = +process.env.PORT || 5180, o = {}) {
  PORT = port; runner.init(port, events);
  return new Promise((res) => { const srv = http.createServer(handle); srv.listen(port, '127.0.0.1', () => { if (o.autopilot) autopilot.start(); res({ srv, port, events }); }); });
}

module.exports = { startServer };
if (require.main === module) startServer(undefined, { autopilot: true }).then(({ port }) => console.log(`Kids Shorts Studio running at http://localhost:${port}`));
