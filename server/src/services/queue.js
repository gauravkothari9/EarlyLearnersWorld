import fs from 'node:fs';
import path from 'node:path';
import { core, OUTPUT_DIR, runner, voice } from '../config.js';
import { Job } from '../models/Job.js';
import { getSettings } from '../models/Settings.js';
import { User } from '../models/User.js';
import { makeThumbnail, onRenderProgress } from '../routes/engine.js';
import { categoryById } from './categories.js';
import { buildMetadata } from './metadata.js';
import { hasPaidAccess } from './plans.js';
import { isConfigured, uploadVideo } from './youtube.js';

let busy = false;
const voiceLabel = (id) => (voice.VOICES.find((v) => v.id === id)?.label || id || '').split(' (')[0];

async function renderJob(job) {
  const settings = await getSettings(job.userId);
  const cat = categoryById[job.category];
  if (!cat) throw new Error(`Unknown style ${job.category}`);

  // A variation (seed) of this style that has never been made, reserved in data/history.json.
  if (!job.seed) {
    const pick = core.pickRandom({ styles: [job.category] });
    core.addHistory({ fp: pick.fp, styleId: pick.styleId, styleName: pick.styleName, seed: pick.seed, formats: [job.format], status: 'rendering', source: 'platform', jobId: String(job._id) });
    Object.assign(job, { seed: pick.seed, fp: pick.fp });
  }

  job.status = 'rendering';
  job.progress = 0;
  job.error = undefined;
  await job.save();

  const outName = `${job.id}-${job.format}`;
  let lastWrite = 0;
  let writes = Promise.resolve(); // serialize progress writes so none land after the final save
  const stop = onRenderProgress(outName, (stage, p) => {
    const now = Date.now();
    if (now - lastWrite < 700 && stage === 'frames') return;
    lastWrite = now;
    // drawing frames is ~85% of the time, mixing narration + music the rest
    const update = stage === 'frames' ? { status: 'rendering', progress: p * 0.85 } : { status: 'encoding', progress: 0.9 };
    writes = writes.then(() => Job.updateOne({ _id: job._id }, update)).catch(() => {});
  });

  let result;
  try {
    [result] = await runner.renderJobs([{
      styleId: job.category, seed: job.seed, format: job.format, outName, voice: settings.voice, res: 1080, fps: 30,
      channel: settings.channel, captions: settings.captions, narration: settings.narration, outro: settings.outro,
      watermark: settings.watermark, trialMark: job.trial ? 'FREE TRIAL' : '',
    }], (m) => console.log('[render]', m));
  } finally {
    stop();
    await writes;
  }
  if (!result?.file) throw new Error('Renderer returned no video');
  // 40% in: past the intro and its fade, before the outro
  const thumb = await makeThumbnail(path.join(OUTPUT_DIR, result.file), Math.max(2, (result.duration || 10) * 0.4));

  Object.assign(job, {
    video: result.file,
    thumbnail: thumb ? path.basename(thumb) : undefined,
    duration: result.duration,
    voice: settings.narration ? voiceLabel(settings.voice) : undefined,
    progress: 1,
    status: 'ready',
    ...buildMetadata({
      category: job.category, format: job.format, channel: settings.channel,
      userTags: settings.userTags, footer: settings.descriptionFooter,
    }),
  });
  await job.save();
}

// YouTube rejects a publishAt that is too close; below this margin we just publish directly.
const MIN_PUBLISH_AT_LEAD = 5 * 60 * 1000;

const isFuture = (date, margin = 0) => Boolean(date) && date.getTime() > Date.now() + margin;
export const youtubeReady = async (userId) => isConfigured() && Boolean((await getSettings(userId)).youtube?.tokens);

// A failed upload is retried on this interval until it goes through or the attempts run out
// (48 hours: long enough to outlast YouTube's rolling 24-hour channel upload limit).
const UPLOAD_RETRY_MS = 5 * 60 * 1000;
const MAX_UPLOAD_RETRIES = (48 * 60 * 60 * 1000) / UPLOAD_RETRY_MS;

/** `retry` marks an automatic retry by the scheduler; any other call starts the retry count over. */
export async function publishJob(job, { retry = false } = {}) {
  job.retryAt = undefined;
  if (!retry) job.uploadAttempts = 0;
  const settings = await getSettings(job.userId);
  if (!isConfigured()) throw new Error('YouTube uploads are not set up on this platform yet');
  if (!settings.youtube?.tokens) throw new Error('Connect your YouTube channel first');
  if (job.trial) throw new Error('Trial Shorts can\'t be uploaded. Choose a plan to upload.');
  if (!hasPaidAccess(await User.findById(job.userId))) {
    job.error = 'Your plan is inactive, so this Short was not uploaded.';
    job.awaitingPublish = false;
    await job.save();
    return;
  }
  // Public + future slot: hand the timing to YouTube so it goes live even if this server is off.
  const publishAt = job.privacy === 'public' && isFuture(job.scheduledFor, MIN_PUBLISH_AT_LEAD) ? job.scheduledFor : null;
  job.status = 'uploading';
  job.progress = 0;
  job.error = undefined;
  job.note = undefined;
  job.awaitingPublish = false;
  await job.save();
  let writes = Promise.resolve();
  try {
    const id = await uploadVideo({
      userId: job.userId,
      file: path.join(OUTPUT_DIR, job.video),
      thumbnail: job.format === 'video' && job.thumbnail ? path.join(OUTPUT_DIR, job.thumbnail) : null,
      title: job.title,
      description: job.description,
      tags: job.tags,
      privacy: job.privacy,
      publishAt,
      categoryId: settings.categoryId,
      onProgress: (p) => {
        writes = writes.then(() => Job.updateOne({ _id: job._id }, { progress: p })).catch(() => {});
      },
    });
    Object.assign(job, { status: 'published', youtubeId: id, publishedAt: new Date(), publishAt, progress: 1 });
  } catch (err) {
    Object.assign(job, { status: 'ready', error: `Upload failed: ${err.message}` });
    if (job.uploadAttempts < MAX_UPLOAD_RETRIES) {
      job.uploadAttempts += 1;
      job.retryAt = new Date(Date.now() + UPLOAD_RETRY_MS);
      job.note = 'Retrying the upload automatically every 5 minutes.';
    } else {
      job.note = 'Automatic retries stopped. Use Retry upload to try again.';
    }
  }
  await writes;
  await job.save();
}

/** After rendering: upload now, upload with publishAt, or hold until the scheduled time. */
async function autoPublish(job) {
  if (!(await youtubeReady(job.userId))) {
    job.note = job.scheduledFor ? 'Scheduled, but YouTube is not connected.' : 'Rendered. Connect YouTube to publish.';
    await job.save();
    return;
  }
  if (job.privacy !== 'public' && isFuture(job.scheduledFor)) {
    job.awaitingPublish = true; // unlisted/private can't use publishAt: the scheduler uploads it on time
    await job.save();
    return;
  }
  await publishJob(job);
}

/** Upload held jobs whose time has come, and retry failed uploads (called by the scheduler). */
export async function publishDueJobs() {
  const now = new Date();
  const due = await Job.find({ status: 'ready', awaitingPublish: true, scheduledFor: { $lte: now } });
  for (const job of due) await publishJob(job).catch((err) => console.error('[publish]', job.id, err.message));
  const retries = await Job.find({ status: 'ready', retryAt: { $lte: now } });
  for (const job of retries) {
    await publishJob(job, { retry: true }).catch(async (err) => {
      // not retryable (YouTube disconnected, etc.): stop retrying and show why
      console.error('[publish]', job.id, err.message);
      await Job.updateOne({ _id: job._id }, { $unset: { retryAt: 1 }, error: `Upload failed: ${err.message}`, note: 'Automatic retries stopped.' });
    });
  }
}

async function processNext() {
  if (busy) return;
  busy = true;
  let job = null;
  try {
    // scheduled videos (soonest slot first), then other videos by plan priority
    job = (await Job.findOne({ status: 'queued', scheduledFor: { $ne: null } }).sort({ scheduledFor: 1 })) ||
      (await Job.findOne({ status: 'queued' }).sort({ priority: -1, createdAt: 1 }));
    if (!job) return;
    await renderJob(job);
    if (job.autoUpload) await autoPublish(job);
  } catch (err) {
    if (job) {
      job.status = 'failed';
      job.error = err.message;
      await job.save().catch(() => {});
      console.error(`[queue] job ${job.id} failed:`, err.message);
    } else console.error('[queue]', err.message);
  } finally {
    busy = false;
    if (job) setImmediate(processNext);
  }
}

export const kick = () => setImmediate(processNext);

/** Delete a job's files from output/. */
export function removeJobFiles(job) {
  for (const file of [job.video, job.thumbnail]) {
    if (file) fs.rmSync(path.join(OUTPUT_DIR, path.basename(file)), { force: true });
  }
}

export async function startQueue() {
  // recover work interrupted by a restart
  await Job.updateMany({ status: { $in: ['rendering', 'encoding'] } }, { status: 'queued', progress: 0 });
  await Job.updateMany({ status: 'uploading' }, { status: 'ready', error: 'Upload interrupted by restart' });
  setInterval(processNext, 5000).unref();
  kick();
}
