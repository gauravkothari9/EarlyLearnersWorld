// Autopilot: keeps the YouTube channel scheduled ahead with brand-new random videos.
// Each slot gets a never-used style variant, rendered locally, uploaded with publishAt
// so YouTube publishes it at the right time even if this computer is off by then.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const core = require('./core');
const yt = require('./youtube');
const { renderJobs } = require('./runner');

const SETTINGS = path.join(core.DATA, 'autopilot.json');
const OUT = path.join(__dirname, 'output');
const DEFAULTS = {
  enabled: false, upload: true, slots: ['09:00', '17:00'], days: [0, 1, 2, 3, 4, 5, 6], daysAhead: 3, format: 'short',
  privacy: 'public', madeForKids: true, categoryId: '27', randomName: false, name: 'Leo', learningOnly: true, channel: 'EarlyLearnersWorld',
  voice: 'en-US-AnaNeural', res: 1080, fps: 30, captions: true, outro: true, styles: [],
  titleTemplate: '{style} with {name} | Learn Shapes, Colors, Numbers & Animals',
  descriptionTemplate: '{style} — learn and play with {name} the teacher! 🎈\n\n{name} teaches shapes, counting, colors, letters, animals, birds and more in every video. Fun learning cartoons for toddlers and preschoolers from {channel}.\n\n#kidslearning #toddlerlearning #preschool #learncolors #learnshapes #counting',
  tags: 'kids learning, toddler learning, preschool, learn colors, learn shapes, counting for kids, animals for kids, birds for kids, educational videos',
};
const state = { busy: false, current: null, lastError: null, pausedUntil: 0, log: [] };
const log = (m) => { const line = new Date().toLocaleString() + '  ' + m; state.log.unshift(line); state.log.length = Math.min(state.log.length, 120); console.log('[autopilot]', m); };

function settings() { let s = {}; try { s = JSON.parse(fs.readFileSync(SETTINGS, 'utf8')); } catch (e) {} return Object.assign({}, DEFAULTS, s, { name: 'Leo', randomName: false }); }
function saveSettings(patch) { const s = Object.assign(settings(), patch); fs.writeFileSync(SETTINGS, JSON.stringify(s, null, 1)); if (s.enabled) setTimeout(safeTick, 1500); return s; }

function upcomingSlots(s, from = Date.now()) {
  const out = [], now = new Date(from);
  for (let d = 0; d <= s.daysAhead; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    if (!s.days.includes(day.getDay())) continue;
    for (const hm of s.slots) { const [h, m] = hm.split(':').map(Number); const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m || 0); if (at.getTime() > from + 20 * 60 * 1000) out.push(at.toISOString()); }
  }
  return out.sort();
}
const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ''));

function thumbnail(video) {
  const jpg = video.replace(/\.mp4$/, '.jpg');
  return new Promise((res) => { const p = spawn('ffmpeg', ['-y', '-v', 'error', '-ss', '3', '-i', video, '-frames:v', '1', '-q:v', '3', jpg], { windowsHide: true }); p.on('close', (c) => res(c === 0 ? jpg : null)); p.on('error', () => res(null)); });
}

// Make one random video (both formats if asked). publishAt: ISO string to schedule, null to publish now.
async function produce({ publishAt = null, upload = null, format = null } = {}) {
  const s = settings();
  upload = upload ?? s.upload;
  const pick = core.pickRandom({ styles: s.styles, learningOnly: s.learningOnly });
  const name = s.name;
  const formats = (format || s.format) === 'both' ? ['short', 'video'] : [format || s.format];
  const stamp = new Date().toISOString().slice(0, 10);
  const entry = core.addHistory({ fp: pick.fp, styleId: pick.styleId, styleName: pick.styleName, seed: pick.seed, name, formats, status: 'rendering', publishAt, source: 'autopilot', files: [], videos: [] });
  state.current = `${pick.styleName} (variant ${pick.seed})`;
  log(`picked ${pick.styleName} #${pick.seed} with ${name}${publishAt ? ' for ' + new Date(publishAt).toLocaleString() : ''}`);
  try {
    const jobs = formats.map((f) => ({ styleId: pick.styleId, seed: pick.seed, format: f, name, voice: s.voice, res: s.res, fps: s.fps, channel: s.channel, captions: s.captions, outro: s.outro, outName: `${stamp}-${pick.styleId}-${pick.seed}-${f}`, record: false }));
    const results = await renderJobs(jobs, log);
    const files = results.map((r) => r.file);
    core.updateHistory(entry.id, { files, status: upload ? 'uploading' : 'rendered' });
    log(`rendered ${files.join(', ')}`);
    if (!upload) return core.updateHistory(entry.id, { status: 'rendered' });
    const videos = [];
    for (const r of results) {
      const isShort = r.format === 'short';
      const vars = { style: pick.styleName, name, channel: s.channel };
      const title = fill(s.titleTemplate, vars) + (isShort && !/#shorts/i.test(s.titleTemplate) ? ' #shorts' : '');
      const id = await yt.upload(path.join(OUT, r.file), { title, description: fill(s.descriptionTemplate, vars), tags: s.tags.split(',').map((x) => x.trim()).filter(Boolean), categoryId: s.categoryId, privacyStatus: s.privacy, publishAt, madeForKids: s.madeForKids });
      videos.push({ format: r.format, id, url: (isShort ? 'https://youtube.com/shorts/' : 'https://youtu.be/') + id, title });
      log(`uploaded ${r.file} -> ${id}${publishAt ? ' (scheduled)' : ''}`);
      if (!isShort) { const jpg = await thumbnail(path.join(OUT, r.file)); if (jpg) try { await yt.setThumbnail(id, jpg); } catch (e) { log('thumbnail skipped: ' + e.message.slice(0, 120)); } }
    }
    return core.updateHistory(entry.id, { videos, status: publishAt ? 'scheduled' : 'published' });
  } catch (e) {
    core.updateHistory(entry.id, { status: 'failed', error: e.message });
    if (/quota/i.test(e.message) || e.reason === 'quotaExceeded' || e.reason === 'uploadLimitExceeded') { state.pausedUntil = Date.now() + 6 * 3600 * 1000; log('YouTube daily limit reached — pausing for 6 hours'); }
    throw e;
  } finally { state.current = null; }
}

// One video at a time. Work waits its turn in this queue instead of failing with "busy".
let chain = Promise.resolve();
state.queued = 0;
function enqueue(fn) {
  state.queued++;
  const p = chain.then(async () => {
    state.queued--; state.busy = true; state.lastError = null;
    try { return await fn(); } catch (e) { state.lastError = e.message; log('ERROR ' + e.message); } finally { state.busy = false; }
  });
  chain = p.catch(() => {});
  return p;
}
const takenSlots = () => new Set(core.readHistory().filter((h) => h.publishAt && h.status !== 'failed').map((h) => h.publishAt));

async function tick() {
  const s = settings();
  // Manual requests go first: the schedule only fills slots when nothing else is waiting.
  if (!s.enabled || state.busy || state.queued || Date.now() < state.pausedUntil) return;
  if (s.upload) { const st = await yt.status(); if (!st.connected) return; }
  const slot = upcomingSlots(s).find((x) => !takenSlots().has(x));
  if (!slot) return;
  await enqueue(() => produce({ publishAt: slot }));
}
const safeTick = () => tick().catch((e) => log('ERROR ' + e.message));

// Manual run. mode: draft (save MP4 only) | now (one video, uploaded and public right away) |
// schedule (next free slots). Returns at once; the work runs in the queue.
function runNow({ count = 1, mode = 'draft', format = null } = {}) {
  if (mode === 'now') { count = 1; if (format === 'both') format = 'short'; }
  const ahead = state.queued + (state.busy ? 1 : 0);
  enqueue(async () => {
    const s = settings();
    for (let i = 0; i < Math.min(10, Math.max(1, +count || 1)); i++) {
      const publishAt = mode === 'schedule' ? upcomingSlots(Object.assign({}, s, { daysAhead: 30 })).find((x) => !takenSlots().has(x)) || null : null;
      if (mode === 'schedule' && !publishAt) throw new Error('No free slot in the next 30 days. Add publish times or days.');
      await produce({ publishAt, upload: mode !== 'draft', format });
    }
  });
  return { started: true, ahead };
}

// Entries left at rendering/uploading by a restart would block their slot forever: mark them failed.
function clearInterrupted() {
  for (const h of core.readHistory()) {
    if (h.status === 'rendering' || h.status === 'uploading') core.updateHistory(h.id, { status: 'failed', error: 'Interrupted (server restarted)' });
  }
}

function start() { clearInterrupted(); setInterval(safeTick, 60 * 1000); setTimeout(safeTick, 5000); }

async function statusReport() {
  const s = settings(), hist = core.readHistory();
  const taken = {}; hist.filter((h) => h.publishAt && h.status !== 'failed').forEach((h) => (taken[h.publishAt] = h));
  return {
    settings: s, busy: state.busy, queued: state.queued, current: state.current, lastError: state.lastError, pausedUntil: state.pausedUntil, log: state.log.slice(0, 60),
    youtube: await yt.status(), slots: upcomingSlots(s).map((at) => ({ at, entry: taken[at] || null })),
    history: hist.slice(-80).reverse(), totals: { all: hist.length, published: hist.filter((h) => h.status === 'published' || h.status === 'scheduled').length },
  };
}

module.exports = { settings, saveSettings, start, runNow, statusReport, upcomingSlots };
