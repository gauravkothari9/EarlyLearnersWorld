// Video encoding for the headless render page (public/render.html), plus narration for previews.
// The render page posts JPEG frames and a WAV music track; ffmpeg encodes the MP4 and mixes in
// the narrator voice. Those endpoints only answer requests from this machine.
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import express, { Router } from 'express';
import { OUTPUT_DIR, ROOT, voice } from '../config.js';
import { requireAuth } from '../services/auth.js';

const { VOICES, DEFAULT_VOICE, speechFile, wavDuration, schedule } = voice;
const TMP = path.join(ROOT, '.tmp');
fs.mkdirSync(TMP, { recursive: true });

export const engineEvents = new EventEmitter(); // 'batch-done' for runner.js
const progressHooks = new Map(); // output name -> (stage, fraction) => void
/** Follow a render by its output name. Returns a function that stops following. */
export function onRenderProgress(name, fn) {
  progressHooks.set(name, fn);
  return () => progressHooks.delete(name);
}

const jobs = new Map();
const router = Router();
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
const raw = express.raw({ type: () => true, limit: '64mb' });
const bodyJson = (req) => JSON.parse(Buffer.isBuffer(req.body) && req.body.length ? req.body.toString() : '{}');
const safeName = (s) => String(s || 'video').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'video';

// Direct requests from this machine only (headless Chrome). Caddy and Vercel add X-Forwarded-For.
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
function localOnly(req, res, next) {
  if (LOOPBACK.has(req.socket.remoteAddress) && !req.headers['x-forwarded-for']) return next();
  res.status(403).json({ error: 'Forbidden' });
}

// Drop renders whose page went away: stop ffmpeg and delete the temp folder.
setInterval(() => {
  for (const job of jobs.values()) {
    if (job.finishing || Date.now() - job.seen < 3 * 60 * 1000) continue;
    jobs.delete(job.id);
    try { job.ff.kill('SIGKILL'); } catch {}
    setTimeout(() => fs.rmSync(job.dir, { recursive: true, force: true }), 2000);
    console.log(`[engine] ${job.name} abandoned after ${job.frames} frames`);
  }
}, 60 * 1000).unref();

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { windowsHide: true });
    let err = '';
    p.stderr.on('data', (d) => { err = (err + d).slice(-10000); });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}: ${err.slice(-600)}`))));
  });
}

async function narration(job) {
  if (!job.voice?.length) return [];
  const lines = [];
  for (const v of job.voice) {
    try {
      const file = await speechFile(v.text, job.voiceName);
      lines.push({ t: v.t, file, dur: wavDuration(file) });
    } catch (e) {
      console.warn('[voice] skipped line:', v.text, e.message);
    }
  }
  return schedule(lines);
}

/** Close the video stream, then mix music + narration (music ducks under the voice). */
async function finish(job) {
  await new Promise((resolve, reject) => {
    job.ff.on('close', (c) => (c === 0 ? resolve() : reject(new Error('ffmpeg video encode failed: ' + job.ffErr.slice(-600)))));
    job.ff.stdin.end();
  });
  const video = path.join(job.dir, 'video.mp4');
  const music = path.join(job.dir, 'music.wav');
  const voices = await narration(job);
  const outFile = path.join(OUTPUT_DIR, `${safeName(job.name)}.mp4`);
  const args = ['-y', '-i', video];
  if (fs.existsSync(music)) args.push('-i', music);
  voices.forEach((v) => args.push('-i', v.file));
  if (fs.existsSync(music)) {
    const parts = ['[1:a]volume=0.8[m]'];
    if (voices.length) {
      voices.forEach((v, i) => {
        const ms = Math.max(0, Math.round(v.t * 1000));
        parts.push(`[${i + 2}:a]adelay=${ms}|${ms},volume=1.5[v${i}]`);
      });
      parts.push(`${voices.map((_, i) => `[v${i}]`).join('')}amix=inputs=${voices.length}:duration=longest:normalize=0,apad,asplit=2[vk][vm]`);
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

/** A still from the finished video for the Shorts library and YouTube. */
export function makeThumbnail(videoFile) {
  const jpg = videoFile.replace(/\.mp4$/, '.jpg');
  return new Promise((resolve) => {
    const p = spawn('ffmpeg', ['-y', '-v', 'error', '-ss', '3', '-i', videoFile, '-frames:v', '1', '-q:v', '3', jpg], { windowsHide: true });
    p.on('close', (c) => resolve(c === 0 ? jpg : null));
    p.on('error', () => resolve(null));
  });
}

async function durations(voiceId, texts) {
  const durs = {};
  for (const t of (texts || []).slice(0, 200)) {
    try { durs[t] = wavDuration(await speechFile(String(t).slice(0, 300), voiceId || DEFAULT_VOICE)); } catch {}
  }
  return durs;
}

// --- for signed-in users (preview player) -------------------------------------------
router.get('/voices', (_req, res) => {
  res.json({ voices: VOICES.map(({ id, label }) => ({ id, label })), default: DEFAULT_VOICE });
});

router.post('/voice-durations', requireAuth, wrap(async (req, res) => {
  res.json({ durs: await durations(req.body?.voice, req.body?.texts) });
}));

router.get('/tts', requireAuth, wrap(async (req, res) => {
  const file = await speechFile(String(req.query.text || '').slice(0, 300), String(req.query.voice || DEFAULT_VOICE));
  res.set({ 'Content-Type': 'audio/wav', 'Cache-Control': 'private, max-age=86400' });
  fs.createReadStream(file).pipe(res);
}));

// --- for the headless render page only ----------------------------------------------
router.use('/engine', localOnly, raw);

router.post('/engine/log', (req, res) => {
  console.log('[render page]', req.body.toString().slice(0, 500));
  res.json({ ok: true });
});

router.post('/engine/batch-done', (req, res) => {
  let payload = {};
  try { payload = bodyJson(req); } catch {}
  res.json({ ok: true });
  engineEvents.emit('batch-done', payload);
});

router.post('/engine/voice-durations', wrap(async (req, res) => {
  const { voice: voiceId, texts } = bodyJson(req);
  res.json({ durs: await durations(voiceId, texts) });
}));

router.post('/engine/job', (req, res) => {
  const spec = bodyJson(req);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const dir = path.join(TMP, id);
  fs.mkdirSync(dir, { recursive: true });
  const fps = spec.fps || 30;
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), path.join(dir, 'video.mp4')], { windowsHide: true });
  const job = { ...spec, id, dir, ff, ffErr: '', frames: 0, seen: Date.now() };
  ff.stderr.on('data', (d) => { job.ffErr = (job.ffErr + d).slice(-10000); });
  ff.stdin.on('error', () => {});
  jobs.set(id, job);
  console.log(`[engine] start ${spec.name} ${spec.width}x${spec.height}@${fps}`);
  res.json({ id });
});

router.post('/engine/job/:id/:part', wrap(async (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'No such render' });
  job.seen = Date.now();
  const hook = progressHooks.get(job.name);
  if (req.params.part === 'frame') {
    if (!job.ff.stdin.write(req.body)) await new Promise((r) => job.ff.stdin.once('drain', r));
    job.frames++;
    if (hook && job.total && job.frames % 15 === 0) hook('frames', job.frames / job.total);
    return res.json({ ok: true });
  }
  if (req.params.part === 'audio') {
    fs.writeFileSync(path.join(job.dir, 'music.wav'), req.body);
    hook?.('mixing', 1);
    return res.json({ ok: true });
  }
  if (req.params.part === 'finish') {
    job.finishing = true;
    try {
      const out = await finish(job);
      console.log(`[engine] done ${job.frames} frames -> ${path.basename(out)}`);
      return res.json({ file: path.basename(out), frames: job.frames, fps: job.fps || 30 });
    } finally {
      jobs.delete(job.id);
    }
  }
  res.status(404).json({ error: 'Unknown step' });
}));

export default router;
