// Narration voices. Neural voices ("...Neural") come from Microsoft Edge's online read-aloud
// service via msedge-tts and sound natural. If that fails (offline), we fall back to the
// built-in Windows voice. Every line is trimmed of silence and cached as a 44.1 kHz mono WAV.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const ROOT = __dirname;
const CACHE = path.join(ROOT, '.tmp', 'tts-cache');
fs.mkdirSync(CACHE, { recursive: true });

const VOICES = [
  { id: 'en-US-AnaNeural', label: 'Ana — child (natural, slow)', rate: '-15%', pitch: '+0Hz' },
  { id: 'en-US-JennyNeural', label: 'Jenny — warm female (natural)', rate: '-15%', pitch: '+0Hz' },
  { id: 'en-US-AriaNeural', label: 'Aria — bright female (natural)', rate: '-15%', pitch: '+0Hz' },
  { id: 'en-US-AvaNeural', label: 'Ava — soft female (natural)', rate: '-15%', pitch: '+0Hz' },
  { id: 'en-US-GuyNeural', label: 'Guy — friendly male (natural)', rate: '-15%', pitch: '+0Hz' },
  { id: 'en-US-AndrewNeural', label: 'Andrew — calm male (natural)', rate: '-15%', pitch: '+0Hz' },
  { id: 'Microsoft Zira Desktop', label: 'Zira — offline (robotic)', sapi: true },
  { id: 'Microsoft David Desktop', label: 'David — offline (robotic)', sapi: true },
];
const DEFAULT_VOICE = VOICES[0].id;

function run(cmd, args) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { windowsHide: true });
    let err = '';
    p.stderr.on('data', (d) => { err += d; if (err.length > 20000) err = err.slice(-8000); });
    p.on('error', rej);
    p.on('close', (code) => (code === 0 ? res() : rej(new Error(`${cmd} exited ${code}: ${err.slice(-400)}`))));
  });
}

// Trim leading/trailing silence and normalise format. Robotic voices get a small pitch lift.
async function clean(src, dest, pitchUp) {
  const trim = 'silenceremove=start_periods=1:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_threshold=-48dB,areverse';
  const lift = pitchUp ? `,aresample=44100,asetrate=${Math.round(44100 * 1.1)},aresample=44100,atempo=${(1 / 1.1).toFixed(4)}` : '';
  await run('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', trim + lift + ',aresample=44100', '-ac', '1', '-c:a', 'pcm_s16le', dest]);
}

let queue = Promise.resolve();
const serial = (fn) => { const p = queue.then(fn, fn); queue = p.catch(() => {}); return p; };

async function edgeTTS(text, v, outDir) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(v.id, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
    const r = await Promise.race([
      tts.toFile(outDir, text, { rate: v.rate, pitch: v.pitch }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('edge tts timeout')), 20000)),
    ]);
    return r.audioFilePath;
  } finally { try { tts.close(); } catch (e) {} }
}

async function sapiTTS(text, voiceId, outDir) {
  const file = path.join(outDir, 'sapi.wav'), list = path.join(outDir, 'sapi.json');
  fs.writeFileSync(list, JSON.stringify({ voice: voiceId, rate: -1, items: [{ text, file }] }));
  await run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(ROOT, 'tts.ps1'), list]);
  return file;
}

// Returns path to a cached, trimmed WAV for this line.
async function speechFile(text, voiceId = DEFAULT_VOICE) {
  const v = VOICES.find((x) => x.id === voiceId) || VOICES[0];
  const key = crypto.createHash('sha1').update(`${v.id}|${v.rate}|${v.pitch}|${text}`).digest('hex').slice(0, 20);
  const dest = path.join(CACHE, key + '.wav');
  if (fs.existsSync(dest)) return dest;
  return serial(async () => {
    if (fs.existsSync(dest)) return dest;
    const work = path.join(CACHE, key + '_work'); fs.mkdirSync(work, { recursive: true });
    try {
      if (!v.sapi) {
        try { await clean(await edgeTTS(text, v, work), dest, false); return dest; }
        catch (e) { console.warn(`[voice] neural voice failed (${e.message}); using offline voice`); }
        if (process.platform !== 'win32') throw new Error('no offline voice available');
        const fb = path.join(CACHE, key + '_fallback.wav');
        await clean(await sapiTTS(text, 'Microsoft Zira Desktop', work), fb, true);
        return fb; // not cached under the neural key, so it is retried next time
      }
      await clean(await sapiTTS(text, v.id, work), dest, true);
      return dest;
    } finally { fs.rmSync(work, { recursive: true, force: true }); }
  });
}

function wavDuration(file) {
  const b = fs.readFileSync(file);
  const byteRate = b.readUInt32LE(28);
  let o = 12;
  while (o < b.length - 8) { const id = b.toString('ascii', o, o + 4), size = b.readUInt32LE(o + 4); if (id === 'data') return Math.min(size, b.length - o - 8) / byteRate; o += 8 + size; }
  return 0;
}

// Same rule the browser preview uses: a line starts at its cue, or just after the previous line ends.
function schedule(lines) {
  let prevEnd = -1;
  return lines.map((l) => { const t = Math.max(l.t, prevEnd + 0.3); prevEnd = t + l.dur; return Object.assign({}, l, { t }); });
}

module.exports = { VOICES, DEFAULT_VOICE, speechFile, wavDuration, schedule };
