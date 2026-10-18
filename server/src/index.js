import fs from 'node:fs';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { config, OUTPUT_DIR, PUBLIC_DIR, ROOT, runner } from './config.js';
import { Job } from './models/Job.js';
import api from './routes/api.js';
import auth from './routes/auth.js';
import billing, { webhook } from './routes/billing.js';
import engine, { engineEvents } from './routes/engine.js';
import schedules from './routes/schedules.js';
import { loadUser, requireAuth } from './services/auth.js';
import { migrate } from './services/migrate.js';
import { startQueue } from './services/queue.js';
import { startScheduler } from './services/scheduler.js';

const app = express();
app.set('trust proxy', config.trustProxyHops); // real client IPs (for rate limiting) behind Caddy / Vercel
app.disable('x-powered-by');
if (config.clientUrl) app.use(cors({ origin: config.clientUrl, credentials: true }));

// Razorpay webhook needs the raw body, so it goes before the JSON parser.
app.post('/api/billing/webhook', ...webhook);

app.use(express.json({ limit: '1mb' }));
// API answers are per-user: never let a CDN (e.g. Vercel's rewrite cache) store them.
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(loadUser);

// --- media: users' own videos are private ----------------------------------------------
app.get('/media/videos/:file', requireAuth, async (req, res, next) => {
  try {
    const file = path.basename(req.params.file);
    const owns = await Job.exists({ userId: req.user._id, $or: [{ video: file }, { thumbnail: file }] });
    if (!owns && req.user.role !== 'admin') return res.status(404).end();
    res.sendFile(path.join(OUTPUT_DIR, file), { maxAge: '1h' }, (err) => err && !res.headersSent && res.status(404).end());
  } catch (err) {
    next(err);
  }
});
app.use('/media', (_req, res) => res.status(404).end());

// --- API ----------------------------------------------------------------------------
app.use('/api/auth', auth);
app.use('/api/billing', billing);
app.use('/api/schedules', schedules);
app.use('/api', engine);
app.use('/api', api);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Drawing engine + headless render page (also used by the React app for live previews).
app.use(express.static(PUBLIC_DIR, { index: false }));

// Serve the built React app (npm run build in client/)
const dist = path.join(ROOT, 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api|media).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  // API-only deployment (frontend on Vercel)
  app.get('/', (_req, res) => res.json({ name: 'Kids Shorts Studio API', ok: true }));
}

app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status < 500 || err.expose ? err.message : 'Something went wrong on our side' });
});

// A failed background task should be logged, never take the whole server down.
process.on('unhandledRejection', (e) => console.error('[unhandled]', e?.message || e));

await mongoose.connect(config.mongoUri);
await migrate();
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
runner.init(config.port, engineEvents);
app.listen(config.port, config.host, async () => {
  console.log(`Kids Shorts Studio on http://localhost:${config.port}`);
  await startQueue();
  await startScheduler();
});
