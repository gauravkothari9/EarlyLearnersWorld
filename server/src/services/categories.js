import crypto from 'node:crypto';
import { core } from '../config.js';

// Search tags for each style group. The style's own name is added as a tag too.
const GROUP_TAGS = {
  Learning: ['kids learning', 'toddler learning', 'preschool learning', 'educational videos for kids'],
  Story: ['kids stories', 'cartoon for kids', 'story time for kids'],
  Animals: ['animals for kids', 'animal sounds', 'learn animals'],
  Explore: ['kids adventure', 'learning for kids', 'preschool'],
  Music: ['nursery rhymes', 'kids songs', 'music for kids'],
  Quiz: ['kids quiz', 'guessing game for kids', 'learn and play'],
  Routine: ['daily routine for kids', 'healthy habits for kids', 'toddler routine'],
  Baby: ['baby songs', 'baby sensory', 'peekaboo'],
  Calm: ['lullaby', 'bedtime songs', 'calm music for kids'],
  Celebration: ['birthday song', 'party songs for kids', 'kids celebration'],
};

/** The 56 styles from the drawing engine, shaped like Stick Reels categories. Read once at startup. */
export const categories = core.styleList().map((s) => ({
  id: s.id,
  name: s.name,
  group: s.tag,
  description: s.desc,
  lesson: s.lesson,
  index: s.index,
  hashtags: [s.name.toLowerCase(), ...(GROUP_TAGS[s.tag] || ['kids learning'])],
}));

export const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

/** A random style. Learning lessons only unless `lessonsOnly` is false. */
export function randomCategory(lessonsOnly = true) {
  const pool = categories.filter((c) => !lessonsOnly || c.lesson);
  return pool[crypto.randomInt(pool.length)].id;
}
