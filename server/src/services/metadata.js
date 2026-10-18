import { categoryById } from './categories.js';

// Broad, high-search-volume tags added to every video.
const HIGH_VOLUME_TAGS = [
  'kids learning', 'toddler learning', 'preschool', 'learning videos for toddlers', 'educational videos',
  'kids cartoon', 'cartoon for kids', 'nursery rhymes', 'kids songs', 'learn colors', 'learn shapes',
  'counting for kids', 'animals for kids', 'baby learning', 'kindergarten',
];

const YT_TAG_LIMIT = 480; // YouTube caps tags at 500 chars total (spaced tags count their quotes)
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const hashtag = (tag) => '#' + tag.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

function normalizeTags(tags) {
  const seen = new Set();
  const out = [];
  let used = 0;
  for (const raw of tags) {
    const tag = String(raw).replace(/^#/, '').replace(/[<>,]/g, '').trim().slice(0, 60);
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    const cost = tag.length + (tag.includes(' ') ? 2 : 0) + (out.length ? 1 : 0);
    if (used + cost > YT_TAG_LIMIT) break;
    seen.add(key);
    out.push(tag);
    used += cost;
  }
  return out;
}

export function buildMetadata({ category, format = 'short', channel = 'EarlyLearnersWorld', userTags = [], footer = '' }) {
  const cat = categoryById[category];
  const name = cat.name;
  const titles = [
    `${name} with Leo | Fun Learning for Kids`,
    `${name} | Learn and Play with Leo the Teacher`,
    `${name} for Toddlers | Kids Learning Cartoon`,
    `Learn with Leo: ${name}`,
    `${name} | Preschool Learning Video`,
  ];
  const title = (pick(titles) + (format === 'short' ? ' #shorts' : '')).slice(0, 100);

  // User tags come first so they survive the length cap.
  const tags = normalizeTags([...userTags, ...cat.hashtags, ...HIGH_VOLUME_TAGS]);

  const hashtags = [
    ...new Set([...(format === 'short' ? ['#shorts'] : []), '#kidslearning', hashtag(cat.hashtags[1] || cat.hashtags[0]),
      ...userTags.slice(0, 5).map(hashtag), '#toddlerlearning', '#preschool']),
  ].filter((h) => h.length > 1).slice(0, 12);

  const description = [
    `${name}: ${cat.description}`,
    '',
    `Leo the teacher makes learning fun with bright cartoons, songs and gentle narration. Made for toddlers and preschoolers by ${channel}.`,
    'Subscribe for a new learning video every day!',
    footer ? `\n${footer}` : null,
    '',
    hashtags.join(' '),
  ]
    .filter((l) => l !== null)
    .join('\n')
    .slice(0, 4900);

  return { title, description, tags };
}
