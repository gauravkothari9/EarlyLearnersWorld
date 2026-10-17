// Server-side access to the style library (same JS the browser runs, loaded in a VM),
// plus the history file that guarantees random videos never repeat.
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
fs.mkdirSync(DATA, { recursive: true });
const HISTORY = path.join(DATA, 'history.json');
const FILES = ['engine', 'props', 'render', 'styles', 'styles2', 'styles3', 'audio'];

let cached = null, cachedStamp = '';
function loadKS() {
  const stamp = FILES.map((f) => fs.statSync(path.join(ROOT, 'public', 'js', f + '.js')).mtimeMs).join('|');
  if (cached && stamp === cachedStamp) return cached;
  const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, 'public', 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
  cached = ctx.KS; cachedStamp = stamp;
  return cached;
}

function readHistory() { try { return JSON.parse(fs.readFileSync(HISTORY, 'utf8')); } catch (e) { return []; } }
function writeHistory(h) { fs.writeFileSync(HISTORY + '.tmp', JSON.stringify(h, null, 1)); fs.renameSync(HISTORY + '.tmp', HISTORY); }
function addHistory(entry) { const h = readHistory(); h.push(Object.assign({ id: crypto.randomUUID(), createdAt: new Date().toISOString() }, entry)); writeHistory(h); return h[h.length - 1]; }
function updateHistory(id, patch) { const h = readHistory(); const e = h.find((x) => x.id === id); if (e) Object.assign(e, patch); writeHistory(h); return e; }

const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Pick a style + seed whose fingerprint has never been used. Prefers the least-used styles
// and avoids the most recent ones so the channel keeps rotating through all 52.
function pickRandom(o = {}) {
  const KS = loadKS(), hist = readHistory();
  const used = new Set(hist.map((h) => h.fp).concat(o.reserved || []));
  const counts = {}; hist.forEach((h) => (counts[h.styleId] = (counts[h.styleId] || 0) + 1));
  const recent = hist.slice(-(o.avoidRecent ?? 8)).map((h) => h.styleId);
  let pool = KS.STYLES.filter((s) => (!o.styles || !o.styles.length || o.styles.includes(s.id)) && (o.learningOnly === false || (o.styles && o.styles.length) || KS.isLesson(s)));
  const fresh = pool.filter((s) => !recent.includes(s.id)); if (fresh.length) pool = fresh;
  const min = Math.min(...pool.map((s) => counts[s.id] || 0));
  const order = shuffle(pool.filter((s) => (counts[s.id] || 0) === min)).concat(shuffle(pool.filter((s) => (counts[s.id] || 0) !== min)));
  for (const st of order) {
    for (let i = 0; i < 80; i++) {
      const seed = 1 + crypto.randomInt(2147483000);
      const fp = KS.variant(st, seed).fp;
      if (!used.has(fp)) return { styleId: st.id, styleName: st.name, styleIndex: KS.STYLES.indexOf(st) + 1, seed, fp, name: KS.HOST };
    }
  }
  throw new Error('Every variant has been used — add more styles.');
}

function styleList() { const KS = loadKS(); return KS.STYLES.map((s, i) => ({ id: s.id, name: s.name, tag: s.tag, index: i + 1, random: !!s.pick, lesson: KS.isLesson(s) })); }
function fingerprint(styleId, seed) { const KS = loadKS(); const st = KS.STYLES.find((s) => s.id === styleId); return st ? KS.variant(st, seed | 0).fp : null; }

module.exports = { loadKS, readHistory, writeHistory, addHistory, updateHistory, pickRandom, styleList, fingerprint, DATA };
