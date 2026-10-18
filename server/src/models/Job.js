import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['video'], default: 'video' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    trial: { type: Boolean, default: false }, // free watermarked Short; can't be uploaded
    priority: { type: Number, default: 0 }, // render order: Pro/Max 1, Basic 0, trial -1
    category: { type: String, required: true }, // style id
    format: { type: String, enum: ['short', 'video'], default: 'short' },
    status: {
      type: String,
      enum: ['queued', 'rendering', 'encoding', 'ready', 'uploading', 'published', 'failed'],
      default: 'queued',
    },
    progress: { type: Number, default: 0 },
    autoUpload: { type: Boolean, default: true },
    privacy: { type: String, enum: ['public', 'unlisted', 'private'], default: 'public' },
    seed: Number, // variation number: picks the content, colours and music
    fp: String, // fingerprint of the variation, so it is never made twice
    duration: Number,
    voice: String, // narrator label
    video: String, // file name in output/
    thumbnail: String,
    title: String,
    description: String,
    tags: [String],
    youtubeId: String,
    publishedAt: Date,
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
    scheduledFor: Date, // when the Short should go live
    publishAt: Date, // set when YouTube itself will flip the video public at scheduledFor
    awaitingPublish: { type: Boolean, default: false }, // rendered, held here until scheduledFor
    retryAt: Date, // upload failed: the scheduler tries again at this time
    uploadAttempts: { type: Number, default: 0 }, // automatic upload retries so far
    note: String,
    error: String,
  },
  { timestamps: true },
);

jobSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.fp;
    if (ret.video) ret.videoUrl = `/media/videos/${encodeURIComponent(ret.video)}`;
    if (ret.thumbnail) ret.thumbnailUrl = `/media/videos/${encodeURIComponent(ret.thumbnail)}`;
    if (ret.youtubeId) ret.youtubeUrl = ret.format === 'video' ? `https://youtu.be/${ret.youtubeId}` : `https://youtube.com/shorts/${ret.youtubeId}`;
    return ret;
  },
});

export const Job = mongoose.model('Job', jobSchema);
