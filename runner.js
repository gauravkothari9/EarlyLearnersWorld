// Renders jobs by opening the studio page in headless Chrome/Edge (one batch at a time).
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BROWSERS = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const findBrowser = () => BROWSERS.find((p) => fs.existsSync(p));

let PORT = null, EVENTS = null, chain = Promise.resolve();
function init(port, events) { PORT = port; EVENTS = events; }

// jobs: [{ styleId, seed, format, name, outName, voice, res, fps, channel, captions, outro }]
function renderJobs(jobs, onLog = () => {}) {
  const run = () => new Promise((resolve, reject) => {
    const browser = findBrowser();
    if (!browser) return reject(new Error('Chrome or Edge is needed for rendering (set CHROME_PATH).'));
    const batchId = crypto.randomBytes(6).toString('hex');
    const url = `http://127.0.0.1:${PORT}/?batch=1&batchId=${batchId}&jobs=${encodeURIComponent(JSON.stringify(jobs))}`;
    const profile = path.join(__dirname, '.tmp', 'chrome-runner');
    const proc = spawn(browser, ['--headless=new', '--disable-gpu', '--mute-audio', '--no-first-run', '--no-default-browser-check', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', `--user-data-dir=${profile}`, '--window-size=1280,900', url], { stdio: 'ignore' });
    let done = false;
    const finish = (err, val) => { if (done) return; done = true; clearTimeout(timer); EVENTS.off('batch-done', onDone); try { proc.kill(); } catch (e) {} err ? reject(err) : resolve(val); };
    const onDone = (p) => { if (!p || p.batchId !== batchId) return; if (p.error) finish(new Error(p.error)); else finish(null, p.results || []); };
    EVENTS.on('batch-done', onDone);
    const timer = setTimeout(() => finish(new Error('Render timed out')), 45 * 60 * 1000);
    proc.on('exit', () => setTimeout(() => finish(new Error('Browser closed before rendering finished')), 2000));
    onLog(`rendering ${jobs.length} file(s) in ${path.basename(browser)}`);
  });
  const p = chain.then(run, run);
  chain = p.catch(() => {});
  return p;
}

module.exports = { init, renderJobs, findBrowser };
