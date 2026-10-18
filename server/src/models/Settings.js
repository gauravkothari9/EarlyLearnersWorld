import mongoose from 'mongoose';
import { config, voice } from '../config.js';

// One settings document per user: tags, video defaults, and their YouTube connection.
const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  userTags: { type: [String], default: [] },
  privacy: { type: String, enum: ['public', 'unlisted', 'private'], default: 'public' },
  format: { type: String, enum: ['short', 'video'], default: 'short' }, // Short 9:16 or Video 16:9
  voice: { type: String, default: voice.DEFAULT_VOICE },
  channel: { type: String, default: 'EarlyLearnersWorld', maxlength: 30 }, // watermark + outro
  captions: { type: Boolean, default: true },
  narration: { type: Boolean, default: true },
  outro: { type: Boolean, default: true },
  watermark: { type: Boolean, default: true },
  learningOnly: { type: Boolean, default: true }, // "Surprise me" and "Any style" pick lessons only
  madeForKids: { type: Boolean, default: true }, // YouTube "Made for kids" (COPPA)
  categoryId: { type: String, default: '27' }, // YouTube "Education"
  descriptionFooter: { type: String, default: '' },
  youtube: {
    tokens: { type: Object, default: null },
    channelId: String,
    channelTitle: String,
  },
});

export const Settings = mongoose.model('Settings', settingsSchema);

export async function getSettings(userId) {
  if (!userId) throw new Error('getSettings needs a userId');
  return Settings.findOneAndUpdate({ userId }, {}, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true });
}

export function publicSettings(s, { isAdmin = false, redirectUri } = {}) {
  const { youtube, ...rest } = s.toObject();
  delete rest._id;
  delete rest.__v;
  delete rest.userId;
  const { clientId, clientSecret } = config.google;
  const out = {
    ...rest,
    youtube: {
      configured: Boolean(clientId && clientSecret),
      connected: Boolean(youtube?.tokens),
      channelTitle: youtube?.channelTitle || null,
    },
  };
  if (isAdmin) {
    // Platform OAuth app details are only for the admin. The secret never leaves the server.
    Object.assign(out.youtube, {
      clientId: clientId || null,
      secretHint: clientSecret ? `••••${clientSecret.slice(-4)}` : null,
      redirectUri,
    });
  }
  return out;
}
