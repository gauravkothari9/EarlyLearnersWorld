// Batch-render every style to MP4 using headless Chrome/Edge driving the studio page.
// Usage: node render-all.js [--formats short,video] [--res 1080] [--fps 30] [--styles wheels,farm] [--name Leo] [--voice en-US-AnaNeural]
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { startServer } = require('./server');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => { if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1]]); return acc; }, []));
const BROWSERS = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

(async () => {
  const browser = BROWSERS.find((p) => fs.existsSync(p));
  if (!browser) { console.error('No Chrome/Edge found. Set CHROME_PATH.'); process.exit(1); }
  const { port, events } = await startServer(+args.port || 5199);
  const q = new URLSearchParams({ batch: '1', formats: args.formats || 'short,video', res: args.res || '1080', fps: args.fps || '30', styles: args.styles || 'all', name: args.name || 'Leo', voice: args.voice || 'en-US-AnaNeural' });
  const url = `http://127.0.0.1:${port}/?${q}`;
  console.log('Rendering via', path.basename(browser), url);
  const profile = path.join(__dirname, '.tmp', 'chrome-profile');
  const proc = spawn(browser, ['--headless=new', '--disable-gpu', '--mute-audio', '--no-first-run', '--no-default-browser-check', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', `--user-data-dir=${profile}`, '--window-size=1280,900', url], { stdio: 'ignore' });
  const t0 = Date.now();
  events.on('batch-done', () => { console.log(`All done in ${((Date.now() - t0) / 60000).toFixed(1)} min. Files in ./output`); proc.kill(); setTimeout(() => process.exit(0), 300); });
  proc.on('exit', (c) => { console.log('browser exited', c); });
})();
