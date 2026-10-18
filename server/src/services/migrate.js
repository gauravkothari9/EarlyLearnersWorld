import fs from 'node:fs';
import path from 'node:path';
import { core, OUTPUT_DIR } from '../config.js';
import { Job } from '../models/Job.js';
import { categoryById } from './categories.js';
import { buildMetadata } from './metadata.js';

/** Schema changes between versions. Safe to run on every start. */
export async function migrate() {}

/**
 * The first account (admin) inherits videos made before accounts existed: every entry in
 * data/history.json whose MP4 is still in output/ becomes one of its Shorts.
 */
export async function claimOrphanData(userId) {
  let added = 0;
  for (const h of core.readHistory()) {
    if (h.source === 'platform' || !categoryById[h.styleId]) continue;
    for (const file of h.files || []) {
      if (!fs.existsSync(path.join(OUTPUT_DIR, file))) continue;
      const format = /-video\.mp4$/.test(file) ? 'video' : 'short';
      const yt = (h.videos || []).find((v) => v.format === format);
      const thumb = file.replace(/\.mp4$/, '.jpg');
      await Job.create({
        userId, category: h.styleId, format, seed: h.seed, fp: h.fp, video: file, autoUpload: false,
        thumbnail: fs.existsSync(path.join(OUTPUT_DIR, thumb)) ? thumb : undefined,
        status: yt ? 'published' : 'ready', progress: 1, youtubeId: yt?.id,
        publishedAt: yt ? new Date(h.publishAt || h.createdAt) : undefined,
        createdAt: h.createdAt ? new Date(h.createdAt) : undefined,
        ...buildMetadata({ category: h.styleId, format }),
        ...(yt?.title ? { title: yt.title } : {}),
      });
      added++;
    }
  }
  if (added) console.log(`[migrate] gave ${added} earlier video(s) to the admin account`);
}
