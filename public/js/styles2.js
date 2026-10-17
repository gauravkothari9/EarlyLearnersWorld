/* Styles 13–52. Most are built from reusable kits (intro, item cards, quiz, counting, cheer)
   with a `pick(rng)` that chooses different content for every seed, so random videos differ. */
(function () {
  const K = window.KS;
  const { G, seg, ease, lerp, rnd, TAU } = K;
  const RB = ['#ff4d4d', '#ff9a1f', '#f5c400', '#2fbf4a', '#3b8cff', '#9b4dde', '#ff6fa8'];
  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const cap1 = (w) => w[0].toUpperCase() + w.slice(1).toLowerCase();
  const art = (w) => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  const pl = (w) => (/sheep|fish|cherries|peas|grapes|maracas|corn/i.test(w) ? w : /[^aeiou]y$/i.test(w) ? w.slice(0, -1) + 'ies' : /(s|ch|sh|x)$/i.test(w) ? w + 'es' : w + 's');
  const lc = (w) => w.toLowerCase();
  const popIn = (t, a = 0.05, b = 0.5) => ease.back(seg(t, a, b));
  const wave = (g) => 2.4 + Math.sin(g.T * 9) * 0.3;

  const studio = (a, b) => (g) => K.bgStudio(g, g.T, a, b);
  const B = {
    park: (g) => K.bgPark(g, g.T), farm: (g) => K.bgFarm(g, g.T), barn: (g) => K.bgFarm(g, g.T, { barn: true, barnX: 0 }),
    garden: (g) => K.bgGarden(g, g.T), jungle: (g) => K.bgJungle(g, g.T), beach: (g) => K.bgBeach(g, g.T), snow: (g) => K.bgSnow(g, g.T),
    rainy: (g) => K.bgRainy(g, g.T), clear: (g) => K.bgRainy(g, g.T, { clear: true }), street: (g) => K.bgStreet(g, g.T, 0),
    space: (g) => K.bgSpace(g, g.T), stage: (g) => K.bgStage(g, g.T), sea: (g) => K.bgSea(g, g.T), bath: (g) => K.bgBath(g, g.T),
    room: (g) => K.bgRoom(g, g.T, '#e6f3ff', '#e7b67c', { window: true, windowX: 180 }),
    night: (g) => K.bgNight(g, g.T, { moonX: 200, moonY: -420, moonR: 70 }),
    sky: (g) => { K.sky(g, '#3ab8f5', '#e3f7ff', 640); K.clouds(g, g.T, -300, 30, 1.3); K.clouds(g, g.T * 1.4 + 40, 260, 30, 1.0); },
  };

  function bigWord(g, word, t, col, y = -360, size = 130) {
    const a = ease.back(seg(t, 0.05, 0.4)); if (a <= 0) return;
    const c = g.c; c.save(); c.translate(0, y + Math.sin(g.T * 4) * 6); c.scale(a, a);
    const s = Math.min(size, (g.hw * 1.8) / Math.max(1, word.length * 0.62));
    K.text(c, word, 0, 0, s, { fill: col, stroke: '#ffffff', sw: s * 0.16 });
    c.restore();
  }
  function silhouette(c, fn) { c.save(); c.filter = 'brightness(0) opacity(0.85)'; fn(); c.restore(); }

  // ---------- kits ----------
  function intro(bg, cap, say, o = {}) {
    return { d: o.d || 2.4, cap, say, sfx: [[0.15, o.sfx || 'whoosh']], cam: [[1.15, 0, 140], [1.25, 0, 140]],
      draw(g, t) { bg(g); if (o.extra) o.extra(g, t); g.baby(0, G, 1.4, Object.assign({ armR: wave(g), mood: 'open', talk: true }, o.baby || {})); } };
  }
  function cheer(bg, cap, say, o = {}) {
    return { d: 2.4, cap, say, sfx: [[0.1, 'tada'], [0.3, 'cheer']], cam: [[1.1, 0, 120], [1.15, 0, 120]],
      draw(g, t) {
        bg(g);
        const items = o.items || [];
        items.forEach((id, i) => { const n = items.length, x = (i - (n - 1) / 2) * Math.min(150, 640 / n); K.drawItem(g.c, id, x, -190 - Math.abs(Math.sin(g.T * 5 + i)) * 30, 0.4, g.T + i); });
        if (o.extra) o.extra(g, t);
        g.baby(0, G, 1.25, Object.assign({ jump: Math.abs(Math.sin(t * 6)) * 45, armL: 2.6, armR: 2.6, mood: 'grin', happyEyes: true }, o.baby || {}));
        K.confetti(g, t, 80, o.seed || 5);
      } };
  }
  // A big item card: pops (or slides) in, word on top, optional sound + talking mouth.
  function card(bg, id, o = {}) {
    const it = K.ITEMS[id], word = o.word || it.word;
    const sfx = [[0.1, o.slide ? 'whoosh' : 'pop']]; if (o.sfx) sfx.push([0.7, o.sfx]);
    return {
      d: o.d || 2.4, cap: o.cap || null, say: o.say || `${word}!`, sfx, cam: o.cam || [[1, 0, 0], [1.05, 0, 10]],
      draw(g, t) {
        (o.bgFn ? o.bgFn(it) : bg)(g);
        if (o.under) o.under(g, t);
        const c = g.c, y = (o.y ?? 60) + Math.sin(g.T * 4) * 8;
        c.save();
        if (o.slide) c.translate(lerp(o.slide * (g.hw + 380), 0, ease.out(seg(t, 0, 0.9))), y);
        else { const b = popIn(t, 0.05, 0.5); c.translate(0, y); c.scale(b, b); }
        K.drawItem(c, id, 0, 0, o.scale || 1.15, g.T, { talk: o.sfx ? t > 0.65 && t < 1.7 : false, happyEyes: t > 1.8 });
        c.restore();
        bigWord(g, (o.big || word).toUpperCase(), t - (o.slide ? 0.5 : 0), o.col || '#ff4d4d', -380, o.bigSize || 120);
        if (o.over) o.over(g, t);
      },
    };
  }
  function flashStyle(def) {
    return {
      id: def.id, name: def.name, tag: def.tag || 'Learning', color: def.color, song: def.song, songs: def.songs, desc: def.desc, thumbT: def.thumbT || 4.2, indoor: def.indoor,
      pick: (r, classic) => ({ items: classic ? def.pool.slice(0, def.n) : r.sample(def.pool, def.n) }),
      build: (v) => [
        intro(def.bg, def.titleCap, def.titleSay, { extra: def.introExtra }),
        ...v.data.items.map((id, i) => { const it = K.ITEMS[id]; return card(def.bg, id, Object.assign({ col: RB[i % RB.length], say: def.say(it), sfx: def.sound ? it.sfx : null }, def.card ? def.card(it, i) : {})); }),
        cheer(def.bg, def.endCap, def.endSay, { items: v.data.items }),
      ],
    };
  }
  function quizStyle(def) {
    return {
      id: def.id, name: def.name, tag: 'Quiz', color: def.color, song: def.song, desc: def.desc, thumbT: 1.2, indoor: def.indoor,
      pick: (r, classic) => ({ items: classic ? def.pool.slice(0, def.n || 4) : r.sample(def.pool, def.n || 4) }),
      build: (v) => [
        ...v.data.items.flatMap((id) => {
          const it = K.ITEMS[id], snd = it.sound;
          return [
            { d: 2.0, cap: def.q ? def.q(it) : `Who says *${snd}?*`, say: def.qs ? def.qs(it) : `Who says ${lc(snd)}?`, sfx: [[0.1, 'whoosh'], [0.8, it.sfx]], cam: [[1.05, 0, 60], [1.1, 0, 60]],
              draw(g, t) { def.bg(g); silhouette(g.c, () => K.drawItem(g.c, id, 0, 100, 1.15, g.T)); const a = popIn(t, 0.2, 0.6); g.c.save(); g.c.translate(0, -180); g.c.rotate(Math.sin(g.T * 5) * 0.15); g.c.scale(a, a); K.text(g.c, '?', 0, 0, 200, { fill: '#ffe23d', stroke: '#2b1d4e', sw: 24 }); g.c.restore(); } },
            { d: 2.0, cap: `It's the *${lc(it.word)}!*`, say: `It's the ${lc(it.word)}! ${cap1(snd)}!`, sfx: [[0.15, 'tada'], [0.6, it.sfx]], cam: [[1.1, 0, 60], [1.2, 0, 50]],
              draw(g, t) { def.bg(g); K.drawItem(g.c, id, 0, 100, 1.15, g.T, { talk: t > 0.55 && t < 1.5, happyEyes: t > 1.5 }); K.sparkles(g, g.T, 16, 3, [-300, -300, 600, 500]); } },
          ];
        }),
        cheer(def.bg, 'Great *job!*', 'Great job! You got them all!', { items: v.data.items }),
      ],
    };
  }

  const S = [];

  // 13 Fruit Friends
  S.push(flashStyle({ id: 'fruits', name: 'Fruit Friends', color: '#ff6b5a', song: 'mary', desc: 'Yummy fruits pop in one by one.',
    pool: ['apple', 'banana', 'orange', 'grapes', 'strawberry', 'watermelon', 'pear', 'cherries', 'lemon'], n: 6, bg: studio('#fff1e6', '#ffb38a'),
    titleCap: 'Yummy *fruits!*', titleSay: "Let's eat yummy fruits!", say: (it) => `${it.word}! Yummy ${lc(it.word)}!`, endCap: 'Yum yum *fruits!*', endSay: 'Yum, yum! I love fruits!' }));

  // 14 Veggie Garden
  S.push(flashStyle({ id: 'veggies', name: 'Veggie Garden', color: '#3fae49', song: 'mulberry', desc: 'Vegetables pop up out of the garden soil.',
    pool: ['carrot', 'broccoli', 'tomato', 'corn', 'pumpkin', 'peas'], n: 5, bg: B.garden,
    titleCap: "Let's pick *veggies!*", titleSay: "Let's pick veggies in the garden!", say: (it) => `Pop! ${cap1(art(lc(it.word)))}!`,
    card: () => ({ y: 120, under: (g) => { K.blob(g.c, 0, 330, 220, 60, '#8a5a33'); }, over: (g, t) => { if (t < 0.7) K.sparkles(g, g.T, 8, 2, [-150, 150, 300, 150]); } }),
    endCap: 'Veggies make us *strong!*', endSay: 'Veggies make us big and strong!' }));

  // 15 Things That Go
  const placeBg = (it) => (it.place === 'sky' ? B.sky : it.place === 'water' ? B.beach : B.street);
  S.push(flashStyle({ id: 'vehicles', name: 'Things That Go', tag: 'Learning', color: '#3b8cff', song: 'yankee', desc: 'Cars, trains, trucks and planes zoom in with their sounds.',
    pool: ['car', 'bus', 'train', 'firetruck', 'tractor', 'airplane', 'helicopter', 'boat', 'rocket'], n: 5, bg: B.street, sound: true,
    titleCap: 'Things that *go!*', titleSay: "Let's see things that go!", say: (it) => `${it.word}! ${cap1(it.sound)}!`,
    card: (it) => ({ slide: -1, bgFn: placeBg, y: it.place === 'road' ? 300 : it.place === 'water' ? 230 : -20, scale: it.place === 'road' ? 1.25 : 1.2 }),
    endCap: 'Zoom zoom *zoom!*', endSay: 'Zoom, zoom, zoom!' }));

  // 16 Beep Beep Quiz
  S.push(quizStyle({ id: 'vehiclequiz', name: 'Beep Beep Quiz', color: '#ff9a1f', song: 'bingo', desc: 'Guess the vehicle from its sound and shadow.', bg: studio('#e6f6ff', '#7fc4ff'),
    pool: ['car', 'train', 'firetruck', 'airplane', 'boat', 'helicopter', 'tractor', 'rocket', 'bus'], q: (it) => `What goes *${it.sound}?*`, qs: (it) => `What goes ${lc(it.sound)}?` }));

  // 17 Opposites
  const OPP = {
    bigsmall: ['Big', 'Small', (g, s, t) => K.beachBall(g.c, 0, 0, s ? 46 : 120, g.T * 2)],
    updown: ['Up', 'Down', (g, s, t) => (s ? K.beachBall(g.c, 0, 220 - Math.abs(Math.sin(g.T * 5)) * 80, 50, g.T) : K.balloon(g.c, 0, -120 - ((g.T * 40) % 60), 60, '#ff4d6d', { t: g.T }))],
    happysad: ['Happy', 'Sad', (g, s) => g.babyHead(0, 0, { mood: s ? 'sad' : 'grin', happyEyes: !s })],
    fastslow: ['Fast', 'Slow', (g, s) => (s ? K.snail(g.c, Math.sin(g.T * 0.5) * 20, 80, 1.0, { t: g.T }) : K.car(g.c, Math.sin(g.T * 9) * 60, 120, 0.5, { t: g.T, roll: g.T * 20 }))],
    hotcold: ['Hot', 'Cold', (g, s) => (s ? K.snowman(g.c, 0, 220, 0.6, { t: g.T }) : K.sun(g.c, 0, 0, 90, g.T))],
    openclosed: ['Open', 'Closed', (g, s) => K.present(g.c, 0, 120, 170, '#3b9cff', '#ffd23f', s ? 0 : 60 + Math.sin(g.T * 4) * 10)],
  };
  S.push({ id: 'opposites', name: 'Opposites', tag: 'Learning', color: '#7c5cff', song: 'hotcross', desc: 'Big and small, up and down, fast and slow, side by side.', thumbT: 4.5,
    pick: (r, classic) => ({ pairs: classic ? ['bigsmall', 'updown', 'happysad', 'fastslow'] : r.sample(Object.keys(OPP), 4) }),
    build: (v) => [
      intro(studio('#f1ebff', '#a993ff'), "Let's learn *opposites!*", "Let's learn opposites!"),
      ...v.data.pairs.map((k, i) => { const [a, b, draw] = OPP[k]; return {
        d: 3.0, cap: `*${a}* and *${b}*`, says: [[0.15, `${a}!`], [1.4, `${b}!`]], sfx: [[0.15, 'pop'], [1.4, 'pop']], cam: [[1, 0, 0], [1.04, 0, 0]],
        draw(g, t) {
          K.bgStudio(g, g.T, '#f1ebff', '#a993ff');
          const w = Math.min(190, g.hw * 0.5);
          [[0, -w, 0.15], [1, w, 1.4]].forEach(([s, x, tp]) => { const k2 = popIn(t, tp, tp + 0.4); if (k2 <= 0) return; g.c.save(); K.rrect(g.c, x - w * 0.92, -260, w * 1.84, 560, 40); g.c.fillStyle = 'rgba(255,255,255,.55)'; g.c.fill(); g.c.translate(x, 40); g.c.scale(k2 * 0.9, k2 * 0.9); draw(g, s, t); g.c.restore(); K.text(g.c, s ? b : a, x, 260, 64, { fill: RB[(i * 2 + s) % RB.length], stroke: '#fff', sw: 10 }); });
        } }; }),
      cheer(studio('#f1ebff', '#a993ff'), 'Opposites are *fun!*', 'Opposites are fun!'),
    ] });

  // 18 Feelings
  const MOODS = {
    happy: ['Happy', { mood: 'grin', happyEyes: true }, 'giggle', '#fff3a6', '#ffcf3f'],
    sad: ['Sad', { mood: 'sad', look: [0, 0.4] }, 'sad', '#d6e8ff', '#7fa8e8'],
    surprised: ['Surprised', { mood: 'o', look: [0, -0.6] }, 'boing', '#ffe0f0', '#ff8fc4'],
    sleepy: ['Sleepy', { mood: 'o', sleepy: true, closedEyes: true }, 'yawn', '#e3dcff', '#9b8bff'],
    silly: ['Silly', { mood: 'grin', look: [0.8, -0.5] }, 'boing', '#dcffe9', '#5fd39a'],
    excited: ['Excited', { mood: 'grin', happyEyes: true }, 'tada', '#ffe8d1', '#ff9a4d'],
  };
  S.push({ id: 'feelings', name: 'My Feelings', tag: 'Learning', color: '#ffcf3f', song: 'happy', desc: 'Happy, sad, surprised, sleepy, silly — big close-up faces.', thumbT: 3.6, indoor: true,
    pick: (r, classic) => ({ moods: classic ? ['happy', 'sad', 'surprised', 'sleepy', 'silly'] : r.sample(Object.keys(MOODS), 5) }),
    build: (v) => [
      intro(studio('#fff3a6', '#ffcf3f'), 'How do you *feel?*', 'How do you feel today?'),
      ...v.data.moods.map((k, i) => { const [w, face, sfx, c1, c2] = MOODS[k]; return {
        d: 2.4, cap: `I feel *${lc(w)}!*`, say: `${w}! I feel ${lc(w)}!`, sfx: [[0.3, sfx]], cam: [[1, 0, 0], [1.05, 0, 0]],
        draw(g, t) { K.bgStudio(g, g.T, c1, c2); const wob = k === 'silly' ? Math.sin(g.T * 8) * 0.2 : k === 'excited' ? Math.sin(g.T * 14) * 0.06 : 0; g.c.save(); g.c.translate(0, 80 - (k === 'excited' ? Math.abs(Math.sin(t * 7)) * 40 : 0)); g.c.scale(2.3, 2.3); g.babyHead(0, 0, Object.assign({ headTilt: wob }, face)); g.c.restore(); if (k === 'excited') K.confetti(g, t, 40, i); if (k === 'sleepy') { for (let z = 0; z < 3; z++) { const sp = (g.T * 0.5 + z / 3) % 1; g.c.globalAlpha = 1 - sp; K.text(g.c, 'Z', 180 + sp * 60, -150 - sp * 200, 50 + sp * 40, { fill: '#fff', stroke: '#6b5bd6', sw: 8 }); } g.c.globalAlpha = 1; } } }; }),
      cheer(studio('#fff3a6', '#ffcf3f'), 'All feelings are *okay!*', 'All feelings are okay!'),
    ] });

  // 19 Weather
  const WEATHER = {
    sunny: ['Sunny', (g, t) => { K.bgGarden(g); K.sun(g.c, 0, -330, 120, g.T); g.baby(0, G, 1.35, { mood: 'grin', armL: 2.4, armR: 2.4 }); }, 'sparkle'],
    rainy: ['Rainy', (g, t) => { K.bgRainy(g, g.T); g.baby(0, G, 1.35, { mood: 'smile', armR: 0.9, hold: (c) => K.umbrella(c, -20, -180, 150, '#ff4d6d') }); K.puddle(g.c, 160, G + 30, 110, g.T); }, 'thunder'],
    snowy: ['Snowy', (g, t) => { K.bgSnow(g, g.T); K.snowman(g.c, 190, G, 0.55, { t: g.T }); g.baby(-90, G, 1.3, { mood: 'grin', outfit: '#ff5a5a', nightcap: true, armL: 2.2, armR: 2.2 }); }, 'sparkle'],
    windy: ['Windy', (g, t) => { K.bgGarden(g); K.windLines(g, g.T); K.kite(g.c, 150, -260, 0.9, '#3b8cff', g.T); g.baby(-60, G, 1.35, { mood: 'o', armR: 2.0, tilt: Math.sin(g.T * 3) * 0.08 }); }, 'whoosh'],
    cloudy: ['Cloudy', (g, t) => { K.bgGarden(g); g.c.fillStyle = 'rgba(120,130,150,.35)'; g.c.fillRect(-g.hw * 2, -g.hh * 2, g.hw * 4, g.hh * 4); for (let i = -3; i <= 3; i++) K.cloud(g.c, i * 220 + ((g.T * 25) % 220), -360 + (i % 2) * 70, 1.7); g.baby(0, G, 1.35, { look: [0, -0.8], mood: 'o' }); }, 'whoosh'],
    rainbow: ['Rainbow', (g, t) => { K.bgGarden(g); K.rainbow(g.c, 0, -40, 330, 36, ease.out(seg(t, 0.1, 1.2))); g.baby(0, G, 1.35, { mood: 'grin', happyEyes: true, armL: 2.6, armR: 2.6 }); }, 'sparkle'],
  };
  S.push({ id: 'weather', name: 'Weather Song', tag: 'Learning', color: '#3bb3ff', song: 'rainrain', desc: 'Sunny, rainy, snowy, windy, cloudy and rainbow days.', thumbT: 4.5,
    pick: (r, classic) => ({ w: classic ? ['sunny', 'rainy', 'windy', 'snowy', 'rainbow'] : r.sample(Object.keys(WEATHER), 5) }),
    build: (v) => [
      intro(B.garden, "What's the *weather?*", "What's the weather like today?"),
      ...v.data.w.map((k) => { const [w, draw, sfx] = WEATHER[k]; return { d: 2.6, cap: `It's *${lc(w)}!*`, say: `It's ${lc(w)} today!`, sfx: [[0.3, sfx]], cam: [[1.05, 0, 60], [1.12, 0, 60]], draw }; }),
      cheer(B.clear, 'I love every *day!*', 'I love every kind of day!'),
    ] });

  // 20 Four Seasons
  S.push({ id: 'seasons', name: 'Four Seasons', tag: 'Learning', color: '#ff9a1f', song: 'skip', desc: 'Spring flowers, summer beach, autumn leaves, winter snow.', thumbT: 7,
    scenes: [
      intro(B.garden, 'The four *seasons!*', "Let's sing the four seasons!"),
      { d: 2.8, cap: '*Spring* flowers!', say: 'Spring! Flowers grow!', sfx: [[0.3, 'sparkle']], draw(g, t) { K.bgGarden(g); for (let i = -2; i <= 2; i++) K.flower(g.c, i * 130, G + 60, 0.9, RB[(i + 6) % 7], seg(t, 0.1 + (i + 2) * 0.15, 1.2 + (i + 2) * 0.15), g.T); K.butterfly(g.c, 120, -150, 0.9, { t: g.T }); g.baby(-200, G, 0.9, { mood: 'grin', armR: wave(g) }); } },
      { d: 2.8, cap: '*Summer* sun!', say: 'Summer! Sunny beach!', sfx: [[0.3, 'splash']], draw(g, t) { K.bgBeach(g, g.T); K.sandcastle(g.c, 170, G + 30, 0.6, 1); g.baby(-80, G, 1.3, { mood: 'grin', armR: 1.2, hold: (c) => K.iceCream(c, 0, -20, 40) }); } },
      { d: 2.8, cap: '*Autumn* leaves!', say: 'Autumn! Leaves fall down!', sfx: [[0.3, 'whoosh']], draw(g, t) { K.bgFarm(g, g.T); g.c.fillStyle = 'rgba(255,140,40,.18)'; g.c.fillRect(-g.hw * 2, -g.hh * 2, g.hw * 4, g.hh * 4); K.fallingLeaves(g, g.T); g.baby(0, G, 1.35, { mood: 'o', look: [0, -0.7], armL: 2.4, armR: 2.4 }); } },
      { d: 2.8, cap: '*Winter* snow!', say: 'Winter! Snowy and cold!', sfx: [[0.3, 'sparkle']], draw(g, t) { K.bgSnow(g, g.T); K.snowman(g.c, 170, G, 0.6, { t: g.T }); g.baby(-90, G, 1.3, { mood: 'grin', outfit: '#ff5a5a', nightcap: true, armL: 2.2 }); } },
      cheer(B.garden, 'Round and round the *year!*', 'Round and round the year!'),
    ] });

  // 21 My Body
  const PARTS = {
    eyes: ['Eyes', 'I can see!', 2.3, [0, 85], { look: [0.8, 0] }], nose: ['Nose', 'Sniff, sniff!', 2.6, [0, 113], { mood: 'smile' }],
    mouth: ['Mouth', 'I can talk!', 2.5, [0, 135], { mood: 'open', talk: true }], ears: ['Ears', 'I can hear!', 2.2, [0, 90], { mood: 'o' }],
    hands: ['Hands', 'Clap, clap!', 1.5, [0, 150], { clap: true }], feet: ['Feet', 'Stomp, stomp!', 1.4, [0, 350], { stomp: true }],
    tummy: ['Tummy', 'Pat your tummy!', 1.6, [0, 250], { pat: true }],
  };
  S.push({ id: 'body', name: 'My Body', tag: 'Learning', color: '#ff8fb1', song: 'london', desc: 'Eyes, nose, mouth, ears, hands, feet — point and play.', thumbT: 4.4, indoor: true,
    pick: (r, classic) => ({ parts: classic ? ['eyes', 'nose', 'mouth', 'hands', 'feet'] : r.sample(Object.keys(PARTS), 5) }),
    build: (v) => [
      intro(studio('#ffeef5', '#ff9ec4'), 'This is *me!*', "Let's learn about my body!"),
      ...v.data.parts.map((k) => { const [w, line, z, [fx, fy], o] = PARTS[k]; return {
        d: 2.4, cap: `My *${lc(w)}*`, say: `My ${lc(w)}! ${line}`, sfx: [[0.3, k === 'hands' ? 'clap' : k === 'feet' ? 'stomp' : 'ding']], cam: [[z * 0.8, fx, fy], [z, fx, fy]],
        draw(g, t) {
          K.bgStudio(g, g.T, '#ffeef5', '#ff9ec4');
          const cl = Math.abs(Math.sin(g.T * 7));
          const bo = Object.assign({ mood: 'grin' }, o);
          if (o.clap) Object.assign(bo, { armL: -0.45 - cl * 0.5, armR: -0.45 - cl * 0.5 });
          if (o.stomp) bo.jump = Math.abs(Math.sin(g.T * 6)) * 20;
          if (o.pat) Object.assign(bo, { armL: -0.3 - cl * 0.2, armR: -0.3 - cl * 0.2 });
          if (k === 'ears') bo.headTilt = Math.sin(g.T * 6) * 0.12;
          g.baby(0, G, 1.5, bo);
          const pulse = 1 + Math.sin(g.T * 8) * 0.08;
          g.c.save(); g.c.strokeStyle = '#ffe23d'; g.c.lineWidth = 8 / z; g.c.setLineDash([16 / z, 12 / z]); g.c.lineDashOffset = -g.T * 40;
          const rx = (k === 'eyes' ? 80 : k === 'ears' ? 140 : k === 'feet' ? 90 : k === 'hands' ? 90 : 50) * pulse, ry = (k === 'eyes' ? 45 : k === 'ears' ? 70 : k === 'feet' ? 40 : 50) * pulse;
          K.oval(g.c, fx, fy, rx, ry); g.c.stroke(); g.c.restore();
        } }; }),
      cheer(studio('#ffeef5', '#ff9ec4'), 'I love my *body!*', 'I love my body!'),
    ] });

  // 22 Days of the Week
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const ACTS = ['ball', 'kite', 'cake', 'icecream', 'drum', 'teddy', 'balloon', 'flower', 'guitar', 'sandwich', 'yoyo', 'present', 'star', 'bus', 'train'];
  S.push({ id: 'days', name: 'Days of the Week', tag: 'Learning', color: '#4cd964', song: 'muffin', desc: 'Seven days, seven colours, a fun thing for each day.', thumbT: 5,
    pick: (r, classic) => ({ acts: classic ? ACTS.slice(0, 7) : r.sample(ACTS, 7) }),
    build: (v) => [
      intro(studio('#e9fff0', '#6fdc8c'), 'Days of the *week!*', "Let's sing the days of the week!"),
      ...DAYS.map((d, i) => ({ d: 1.8, say: `${d}!`, sfx: [[0.1, 'pop']], cam: [[1, 0, 0], [1.04, 0, 0]],
        draw(g, t) { K.bgStudio(g, g.T, '#e9fff0', '#6fdc8c'); K.block(g.c, 0, lerp(-900, -230, ease.bounce(seg(t, 0, 0.55))), 220, RB[i % RB.length], d.slice(0, 3).toUpperCase(), Math.sin(g.T * 2) * 0.05); bigWord(g, d.toUpperCase(), t - 0.3, RB[i % RB.length], -470, 100); const b = popIn(t, 0.5, 0.9); g.c.save(); g.c.translate(0, 230); g.c.scale(b, b); K.drawItem(g.c, v.data.acts[i], 0, 0, 0.75, g.T); g.c.restore(); } })),
      cheer(studio('#e9fff0', '#6fdc8c'), 'Seven *days!*', 'Seven days in a week!'),
    ] });

  // 23 Count the Animals
  const FARM5 = ['cow', 'pig', 'sheep', 'chick', 'duck', 'goat', 'hen', 'cat', 'dog', 'bunny', 'frog', 'horse'];
  S.push({ id: 'countanimals', name: 'Count the Animals', tag: 'Learning', color: '#8fd16b', song: 'bingo', desc: 'One cow, two pigs, three sheep… count the farm animals.', thumbT: 8,
    pick: (r, classic) => ({ a: classic ? ['cow', 'pig', 'sheep', 'chick', 'duck'] : r.sample(FARM5, 5) }),
    build: (v) => [
      intro(B.barn, "Let's count *animals!*", "Let's count the animals on the farm!"),
      ...v.data.a.map((id, i) => { const n = i + 1, it = K.ITEMS[id], word = n === 1 ? lc(it.word) : pl(lc(it.word)); return {
        d: 2.4, cap: `*${n}* ${word}`, say: `${cap1(NUM[n])} ${word}!`, sfx: [[0.2, 'pop'], [0.7, it.sfx]], cam: [[1, 0, 60], [1.04, 0, 60]],
        draw(g, t) {
          K.bgFarm(g, g.T);
          const a = ease.elastic(seg(t, 0.05, 0.6)); g.c.save(); g.c.translate(0, -200); g.c.scale(a, a); K.text(g.c, String(n), 0, 0, 200, { fill: RB[i], stroke: '#fff', sw: 24 }); g.c.restore();
          const sc = n <= 2 ? 1.0 : n <= 3 ? 0.8 : 0.66, gap = Math.min(240, (g.hw * 1.8) / n);
          for (let k = 0; k < n; k++) { const b = popIn(t, 0.2 + k * 0.12, 0.6 + k * 0.12); if (b <= 0) continue; g.c.save(); g.c.translate((k - (n - 1) / 2) * gap, 150 + (k % 2) * 70); g.c.scale(b, b); K.drawItem(g.c, id, 0, 0, sc, g.T + k * 0.7, { talk: t > 0.7 && t < 1.4 }); g.c.restore(); }
        } }; }),
      cheer(B.barn, 'Great *counting!*', 'One, two, three, four, five! Great counting!'),
    ] });

  // 24 Alphabet Balloons
  const ABCX = { A: 'apple', B: 'bee', C: 'cake', D: 'drum', E: 'elephant', F: 'frog', G: 'guitar', H: 'house', I: 'icecream', J: 'jellyfish', K: 'kite', L: 'lion', M: 'monkey', N: 'nest', O: 'owl', P: 'penguin', Q: 'queen', R: 'rocket', S: 'snail', T: 'tiger', U: 'umbrella', V: 'volcano', W: 'whale', X: 'xylophone', Y: 'yoyo', Z: 'zebra' };
  const LET = Object.keys(ABCX);
  S.push({ id: 'abcballoons', name: 'Alphabet Balloons', tag: 'Learning', color: '#ff4d6d', song: 'twinkle', desc: 'Letter balloons pop to reveal a word for each letter.', thumbT: 3.8,
    pick: (r, classic) => ({ L: classic ? ['A', 'E', 'I', 'O', 'U'] : r.sample(LET, 5).sort() }),
    build: (v) => [
      intro(B.park, 'Pop the *letters!*', "Let's pop the letter balloons!", { extra: (g) => v.data.L.forEach((L, i) => K.balloon(g.c, (i - 2) * 130, -280 + Math.sin(g.T * 2 + i) * 14, 56, RB[i], { t: g.T, seed: i, label: L })) }),
      ...v.data.L.map((L, i) => { const id = ABCX[L], it = K.ITEMS[id]; return {
        d: 2.4, cap: `*${L}* is for ${it.word}`, say: `${L}! ${L} is for ${lc(it.word)}!`, sfx: [[0.75, 'pop'], [0.85, 'sparkle']], cam: [[1, 0, 0], [1.05, 0, 0]],
        draw(g, t) { K.bgPark(g, g.T); if (t < 0.75) K.balloon(g.c, 0, 0 + Math.sin(g.T * 2) * 14, 150 * (1 + seg(t, 0.55, 0.75) * 0.15), RB[i], { t: g.T, label: L }); else { const b = popIn(t, 0.75, 1.15); g.c.save(); g.c.translate(0, 60); g.c.scale(b, b); K.drawItem(g.c, id, 0, 0, 1.1, g.T); g.c.restore(); K.text(g.c, L, -g.hw * 0.6, -200, 150, { fill: RB[i], stroke: '#fff', sw: 20 }); if (t < 1.1) K.sparkles(g, g.T, 16, i, [-250, -250, 500, 500]); } } }; }),
      cheer(B.park, `*${v.data.L.join(' ')}!*`, `${v.data.L.join(', ')}!`, { items: v.data.L.map((L) => ABCX[L]) }),
    ] });

  // 25 Letter Sounds (phonics)
  const PH = { A: 'ah', B: 'buh', C: 'kuh', D: 'duh', E: 'eh', F: 'fff', G: 'guh', H: 'hhh', I: 'ih', J: 'juh', K: 'kuh', L: 'lll', M: 'mmm', N: 'nnn', O: 'oh', P: 'puh', Q: 'kwuh', R: 'rrr', S: 'sss', T: 'tuh', U: 'uh', V: 'vvv', W: 'wuh', X: 'ks', Y: 'yuh', Z: 'zzz' };
  S.push({ id: 'phonics', name: 'Letter Sounds', tag: 'Learning', color: '#00b8a9', song: 'hickory', desc: 'Phonics: what sound does each letter make?', thumbT: 4,
    pick: (r, classic) => ({ L: classic ? ['B', 'M', 'S', 'T', 'P'] : r.sample(['B', 'C', 'D', 'F', 'G', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'Z'], 5) }),
    build: (v) => [
      intro(studio('#e0fffb', '#3fd3c0'), 'Letter *sounds!*', "What sound does it make?"),
      ...v.data.L.map((L, i) => { const id = ABCX[L], it = K.ITEMS[id]; return {
        d: 2.6, cap: `*${L}* says ${PH[L]}`, say: `${L} says ${PH[L]}, ${PH[L]}, ${lc(it.word)}!`, sfx: [[0.1, 'boing']], cam: [[1, 0, 0], [1.05, 0, 0]],
        draw(g, t) { K.bgStudio(g, g.T, '#e0fffb', '#3fd3c0'); const sq = 1 + Math.max(0, Math.sin(t * 12)) * 0.06 * (t < 1.4 ? 1 : 0); K.block(g.c, -g.hw * 0.45 * (g.hw > 400 ? 0.6 : 1), -200, 220 * sq, RB[i], L, Math.sin(g.T * 2) * 0.06); const b = popIn(t, 0.8, 1.2); g.c.save(); g.c.translate(g.hw > 400 ? 260 : 90, 180); g.c.scale(b * 0.85, b * 0.85); K.drawItem(g.c, id, 0, 0, 1, g.T); g.c.restore(); bigWord(g, PH[L].toUpperCase() + '!', t - 0.2, RB[i], 420, 110); } }; }),
      cheer(studio('#e0fffb', '#3fd3c0'), 'Super *sounds!*', 'Super sounds! Well done!'),
    ] });

  // 26 Shape Hunt
  const HUNT = { circle: ['Circle', ['ball', 'orange', 'sun', 'tomato']], square: ['Square', ['present']], star: ['Star', ['star']], heart: ['Heart', ['heart']], diamond: ['Diamond', ['kite']], rectangle: ['Rectangle', ['bus', 'house']] };
  function outline(c, k, r) { c.beginPath(); if (k === 'circle') c.arc(0, 0, r, 0, TAU); else if (k === 'square') c.rect(-r, -r, r * 2, r * 2); else if (k === 'star') K.starPath(c, 0, 0, r * 1.15, 0); else if (k === 'heart') K.heartPath(c, 0, 0, r); else if (k === 'diamond') { c.moveTo(0, -r * 1.2); c.lineTo(r * 0.8, 0); c.lineTo(0, r * 1.2); c.lineTo(-r * 0.8, 0); c.closePath(); } else c.rect(-r * 1.4, -r * 0.8, r * 2.8, r * 1.6); }
  S.push({ id: 'shapehunt', name: 'Shape Hunt', tag: 'Learning', color: '#ffb21f', song: 'yankee', desc: 'Find the circle, square, star and more hiding in everyday things.', thumbT: 4.4,
    pick: (r, classic) => { const ks = classic ? ['circle', 'square', 'star', 'heart'] : r.sample(Object.keys(HUNT), 4); return { h: ks.map((k) => [k, classic ? HUNT[k][1][0] : r.pick(HUNT[k][1])]) }; },
    build: (v) => [
      intro(studio('#fff6dc', '#ffc94d'), "Let's hunt for *shapes!*", "Let's go on a shape hunt!"),
      ...v.data.h.map(([k, id], i) => { const [w] = HUNT[k], it = K.ITEMS[id]; return {
        d: 2.8, say: `Look! The ${lc(it.word)} is a ${lc(w)}!`, sfx: [[0.2, 'pop'], [1.1, 'sparkle']], cam: [[1, 0, 0], [1.05, 0, 0]],
        draw(g, t) { K.bgStudio(g, g.T, '#fff6dc', '#ffc94d'); const b = popIn(t, 0.1, 0.5); g.c.save(); g.c.translate(0, 60); g.c.scale(b, b); K.drawItem(g.c, id, 0, 0, 1.1, g.T); g.c.restore(); if (t > 1.0) { const k2 = ease.out(seg(t, 1.0, 1.5)); g.c.save(); g.c.translate(0, 60); g.c.scale(k2, k2); g.c.lineWidth = 12; g.c.strokeStyle = RB[i]; g.c.setLineDash([26, 16]); g.c.lineDashOffset = -g.T * 60; outline(g.c, k, k === 'rectangle' ? 140 : 170); g.c.stroke(); g.c.restore(); bigWord(g, w.toUpperCase(), t - 1.0, RB[i], -400, 120); } } }; }),
      cheer(studio('#fff6dc', '#ffc94d'), 'Shapes are *everywhere!*', 'Shapes are everywhere!'),
    ] });

  // 27 Mix the Colors
  const MIX = [['Red', '#ff3b3b', 'Yellow', '#ffd23f', 'Orange', '#ff9a1f'], ['Blue', '#3b8cff', 'Yellow', '#ffd23f', 'Green', '#2fbf4a'], ['Red', '#ff3b3b', 'Blue', '#3b8cff', 'Purple', '#9b4dde'], ['Red', '#ff3b3b', 'White', '#ffffff', 'Pink', '#ff8fc4'], ['Blue', '#3b8cff', 'White', '#ffffff', 'Light blue', '#9fd3ff']];
  S.push({ id: 'colormix', name: 'Mix the Colors', tag: 'Learning', color: '#9b4dde', song: 'london', desc: 'Two paint splashes mix into a brand new colour.', thumbT: 4.4, indoor: true,
    pick: (r, classic) => ({ m: classic ? [0, 1, 2] : r.sample([0, 1, 2, 3, 4], 3) }),
    build: (v) => [
      intro(studio('#ffffff', '#e8e0ff'), "Let's mix *colors!*", "Let's mix colors!"),
      ...v.data.m.map((mi, i) => { const [a, ca, b, cb, r2, cr] = MIX[mi]; return {
        d: 3.2, say: `${a} and ${lc(b)} make ${lc(r2)}!`, sfx: [[0.2, 'splash'], [0.6, 'splash'], [1.5, 'sparkle']], cam: [[1, 0, 0], [1.04, 0, 0]],
        draw(g, t) {
          K.bgStudio(g, g.T, '#ffffff', '#e8e0ff');
          const m = ease.inOut(seg(t, 0.9, 1.5)), d = lerp(Math.min(200, g.hw * 0.55), 0, m);
          if (m < 1) { g.c.globalAlpha = 1 - seg(t, 1.3, 1.5); K.splat(g.c, -d, 60, 140 * popIn(t, 0.1, 0.4), ca, 3); K.splat(g.c, d, 60, 140 * popIn(t, 0.5, 0.8), cb, 9); g.c.globalAlpha = 1; }
          if (t > 1.3) { K.splat(g.c, 0, 60, 210 * ease.elastic(seg(t, 1.3, 2.0)), cr, 17); K.sparkles(g, g.T, 14, i, [-260, -150, 520, 420]); }
          K.text(g.c, a, -Math.min(200, g.hw * 0.55), 300, 54, { fill: ca === '#ffffff' ? '#bbb' : ca, stroke: '#fff', sw: 8 }); K.text(g.c, b, Math.min(200, g.hw * 0.55), 300, 54, { fill: cb === '#ffffff' ? '#bbb' : cb, stroke: '#fff', sw: 8 });
          if (t > 1.5) bigWord(g, r2.toUpperCase() + '!', t - 1.5, cr, -380, 120);
        } }; }),
      cheer(studio('#ffffff', '#e8e0ff'), 'Colors are *magic!*', 'Colors are magic!'),
    ] });

  // 28 Big and Small
  S.push({ id: 'bigsmall', name: 'Big and Small', tag: 'Learning', color: '#00a6ff', song: 'hotcross', desc: 'A big one and a small one — compare sizes.', thumbT: 4.4,
    pick: (r, classic) => ({ items: classic ? ['ball', 'star', 'fish', 'apple'] : r.sample(['ball', 'star', 'fish', 'apple', 'teddy', 'duck', 'cake', 'balloon', 'strawberry', 'elephant', 'car', 'chick'], 4) }),
    build: (v) => [
      intro(studio('#e6f6ff', '#7fc4ff'), 'Big and *small!*', "Let's find big and small!"),
      ...v.data.items.map((id, i) => { const w = lc(K.ITEMS[id].word); return {
        d: 2.8, cap: `*Big* ${w}, *small* ${w}`, says: [[0.15, `Big ${w}!`], [1.4, `Small ${w}!`]], sfx: [[0.15, 'boing'], [1.4, 'pop']], cam: [[1, 0, 0], [1.04, 0, 0]],
        draw(g, t) { K.bgStudio(g, g.T, '#e6f6ff', '#7fc4ff'); const x = Math.min(170, g.hw * 0.48); const a = popIn(t, 0.15, 0.55), b = popIn(t, 1.4, 1.8); if (a > 0) { g.c.save(); g.c.translate(-x, 40); g.c.scale(a, a); K.drawItem(g.c, id, 0, 0, 0.95, g.T); g.c.restore(); K.text(g.c, 'BIG', -x, 330, 70, { fill: RB[i], stroke: '#fff', sw: 10 }); } if (b > 0) { g.c.save(); g.c.translate(x, 130); g.c.scale(b, b); K.drawItem(g.c, id, 0, 0, 0.38, g.T + 1); g.c.restore(); K.text(g.c, 'small', x, 330, 54, { fill: RB[(i + 3) % 7], stroke: '#fff', sw: 8 }); } } }; }),
      cheer(studio('#e6f6ff', '#7fc4ff'), 'Big and small, I *love them all!*', 'Big and small, I love them all!'),
    ] });

  // 29 Pattern Game
  const PAT = ['apple', 'banana', 'star', 'heart', 'duck', 'ball', 'strawberry', 'moon', 'carrot', 'fish', 'lemon', 'icecream'];
  S.push({ id: 'patterns', name: 'Pattern Game', tag: 'Quiz', color: '#ff6fa8', song: 'weasel', desc: 'What comes next? Guess the pattern.', thumbT: 5,
    pick: (r, classic) => ({ p: classic ? [['apple', 'banana'], ['star', 'heart'], ['duck', 'ball']] : [0, 1, 2].map(() => r.sample(PAT, 2)) }),
    build: (v) => [
      intro(studio('#fff0f6', '#ff9ec4'), "What comes *next?*", "Let's play the pattern game!"),
      ...v.data.p.map(([a, b], i) => { const wa = lc(K.ITEMS[a].word), wb = lc(K.ITEMS[b].word); return {
        d: 5.0, cap: 'What comes *next?*', says: [[0.15, `${wa}, ${wb}, ${wa}, ${wb}, ${wa}... what's next?`], [3.8, `${cap1(wb)}!`]], sfx: [[3.8, 'tada']], cam: [[1, 0, 0], [1.03, 0, 0]],
        draw(g, t) { K.bgStudio(g, g.T, '#fff0f6', '#ff9ec4'); const n = 6, gap = Math.min(118, (g.hw * 1.8) / n); for (let k = 0; k < n; k++) { const x = (k - (n - 1) / 2) * gap, y = 80; if (k < 5) { const p = popIn(t, 0.15 + k * 0.4, 0.5 + k * 0.4); if (p > 0) { g.c.save(); g.c.translate(x, y - (Math.floor(g.beat) % 5 === k ? 20 : 0)); g.c.scale(p, p); K.drawItem(g.c, k % 2 ? b : a, 0, 0, gap / 230, g.T + k); g.c.restore(); } } else if (t < 3.8) { K.text(g.c, '?', x, y, 130, { fill: '#ffe23d', stroke: '#2b1d4e', sw: 14 }); } else { const p = ease.elastic(seg(t, 3.8, 4.4)); g.c.save(); g.c.translate(x, y); g.c.scale(p, p); K.drawItem(g.c, b, 0, 0, gap / 210, g.T); g.c.restore(); K.sparkles(g, g.T, 10, i, [x - 80, y - 80, 160, 160]); } } } }; }),
      cheer(studio('#fff0f6', '#ff9ec4'), 'Pattern *pro!*', "You're a pattern pro!"),
    ] });

  // 30 Rocket Countdown
  S.push({ id: 'countdown', name: 'Rocket Countdown', tag: 'Learning', color: '#e8463f', song: 'weasel', desc: 'Count down from ten and blast off into space!', thumbT: 9,
    scenes: [
      { d: 2.4, cap: "Let's go to *space!*", say: "Let's go to space! Ready?", sfx: [[0.2, 'whoosh']], cam: [[1.1, 0, 0], [1.15, 0, 0]], draw(g, t) { B.night(g); K.rocket(g.c, 0, G, 1.2, { t: g.T, flame: false, inside: (c) => { c.save(); c.translate(0, -164); c.scale(0.25, 0.25); g.babyHead(0, 0, { mood: 'grin' }); c.restore(); } }); } },
      { d: 7.6, says: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n, i) => [0.2 + i * 0.72, cap1(NUM[n]) + '!']), sfx: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n, i) => [0.2 + i * 0.72, 'click']), cam: [[1, 0, 0], [1.08, 0, 40]],
        draw(g, t) { B.night(g); K.rocket(g.c, Math.sin(g.T * 30) * Math.min(4, t), G, 1.2, { t: g.T, flame: t > 6.5, inside: (c) => { c.save(); c.translate(0, -164); c.scale(0.25, 0.25); g.babyHead(0, 0, { mood: 'o' }); c.restore(); } }); const k = Math.min(9, Math.floor(Math.max(0, t - 0.2) / 0.72)), n = 10 - k, lt = (t - 0.2) - k * 0.72; const a = ease.elastic(seg(lt, 0, 0.4)); g.c.save(); g.c.translate(0, -330); g.c.scale(a, a); K.text(g.c, String(n), 0, 0, 260, { fill: RB[n % 7], stroke: '#fff', sw: 28 }); g.c.restore(); } },
      { d: 2.6, cap: '*Blast off!*', say: 'Blast off!', sfx: [[0.1, 'blastoff']], cam: [[1, 0, 0], [0.9, 0, -200]],
        draw(g, t) { B.night(g); const y = G - ease.in(seg(t, 0.2, 2.4)) * 1800; for (let i = 0; i < 14; i++) { const sp = (t * 1.5 + i / 14) % 1; K.circle(g.c, Math.sin(i * 2.3) * 160 * sp, G + 40 - sp * 60, 40 + sp * 60); g.c.fillStyle = `rgba(230,230,240,${0.8 * (1 - sp)})`; g.c.fill(); } K.rocket(g.c, 0, y, 1.2, { t: g.T }); } },
      { d: 2.8, cap: 'Zooming past *planets!*', say: 'Zooming past the planets!', sfx: [[0.3, 'whoosh']], draw(g, t) { B.space(g); K.planet(g.c, -220, -320, 90, '#ff9a4d', { t: g.T, ring: true }); K.planet(g.c, 230, 260, 70, '#3b8cff', { t: g.T, earth: true, seed: 2 }); K.rocket(g.c, lerp(-200, 200, t / 2.8), lerp(300, -100, t / 2.8), 0.8, { t: g.T, tilt: 0.8 }); } },
      cheer(B.space, 'We made it to *space!*', 'We made it to space! Hooray!'),
    ] });

  // 31 Hello Planets
  const PLAN = [['Mercury', '#b7a99a', 'is closest to the sun', {}], ['Venus', '#f2c56b', 'is very, very hot', {}], ['Earth', '#3b8cff', 'is our home', { earth: true }], ['Mars', '#e2583e', 'is the red planet', {}], ['Jupiter', '#e0a96d', 'is the biggest planet', { bands: true }], ['Saturn', '#f1d39a', 'has pretty rings', { ring: true }], ['Uranus', '#8fe3e8', 'spins on its side', { ring: true, ringCol: '#cdeff2' }], ['Neptune', '#3d63e0', 'is cold and windy', {}]];
  S.push({ id: 'planets', name: 'Hello Planets', tag: 'Explore', color: '#3d63e0', song: 'twinkle', desc: 'Say hello to the planets, each with a fun fact.', thumbT: 7, indoor: true,
    pick: (r, classic) => ({ p: classic ? [2, 3, 4, 5, 7] : r.sample([0, 1, 2, 3, 4, 5, 6, 7], 5).sort((a, b) => a - b) }),
    build: (v) => [
      { d: 2.6, cap: 'Hello, *planets!*', say: "Let's say hello to the planets!", sfx: [[0.2, 'sparkle']], draw(g, t) { B.space(g); K.sun(g.c, 0, -100, 160 * popIn(t, 0.1, 0.6), g.T); g.baby(0, G + 60, 0.9, { armR: wave(g), mood: 'open', talk: true }); } },
      ...v.data.p.map((pi, i) => { const [n, col, fact, o] = PLAN[pi]; return {
        d: 2.8, say: `${n}! ${n} ${fact}!`, sfx: [[0.2, 'sparkle']], cam: [[1, 0, 0], [1.08, 0, 0]],
        draw(g, t) { B.space(g); const a = popIn(t, 0.05, 0.6); K.planet(g.c, 0, 40, (pi === 4 ? 210 : pi === 0 ? 120 : 165) * a, col, Object.assign({ t: g.T, seed: pi, talk: t > 0.3 && t < 1.8 }, o)); bigWord(g, n.toUpperCase(), t - 0.2, col, -400, 120); K.text(g.c, `${n} ${fact}!`, 0, 380, 46, { fill: '#ffffff', stroke: '#2b1d4e', sw: 9 }); } }; }),
      cheer(B.space, 'Goodnight, *planets!*', 'Goodnight, planets!'),
    ] });

  // 32 Jungle Friends
  S.push(flashStyle({ id: 'jungle', name: 'Jungle Friends', tag: 'Animals', color: '#2f9e44', song: 'skip', desc: 'Lion, elephant, monkey, zebra and friends say hello.',
    pool: ['lion', 'elephant', 'monkey', 'zebra', 'giraffe', 'tiger', 'hippo', 'frog'], n: 5, bg: B.jungle, sound: true,
    titleCap: 'Into the *jungle!*', titleSay: "Let's go into the jungle!", say: (it) => `The ${lc(it.word)} says ${lc(it.sound)}!`,
    card: (it) => ({ y: it.id === 'giraffe' ? 80 : 120, scale: it.id === 'giraffe' ? 1.05 : 1.2 }), endCap: 'Jungle *friends!*', endSay: 'Bye bye, jungle friends!' }));

  // 33 Jungle Sounds Quiz
  S.push(quizStyle({ id: 'junglequiz', name: "Who's in the Jungle?", color: '#5a8a34', song: 'dell', desc: 'Guess the jungle animal from its sound.', bg: B.jungle,
    pool: ['lion', 'elephant', 'monkey', 'frog', 'zebra', 'tiger', 'owl', 'hippo'] }));

  // 34 My Pets
  S.push(flashStyle({ id: 'pets', name: 'My Pets', tag: 'Animals', color: '#ff9a4d', song: 'bingo', desc: 'Puppy, kitty, bunny, fish and bird — pets at home.', indoor: true,
    pool: ['dog', 'cat', 'bunny', 'fish', 'bird', 'duck', 'chick'], n: 5, bg: B.room, sound: true,
    titleCap: 'Meet my *pets!*', titleSay: 'Come and meet my pets!', say: (it) => `My ${lc(it.word)}! ${cap1(it.sound)}!`, card: () => ({ y: 130 }),
    endCap: 'I love my *pets!*', endSay: 'I love my pets!' }));

  // 35 Bugs in the Garden
  S.push(flashStyle({ id: 'bugs', name: 'Bugs in the Garden', tag: 'Animals', color: '#e8322e', song: 'itsy', desc: 'Bee, butterfly, ladybug, snail and more tiny friends.',
    pool: ['bee', 'butterfly', 'ladybug', 'snail', 'caterpillar', 'ant'], n: 5, bg: B.garden, sound: true,
    titleCap: 'Tiny *bugs!*', titleSay: "Let's find tiny bugs in the garden!", say: (it) => `${cap1(art(lc(it.word)))}! ${cap1(it.sound)}!`, card: () => ({ y: 100 }),
    endCap: 'Bye bye, *bugs!*', endSay: 'Bye bye, little bugs!' }));

  // 36 Up in the Sky
  S.push(flashStyle({ id: 'skyfriends', name: 'Up in the Sky', tag: 'Explore', color: '#4fb7ff', song: 'mary', desc: 'Things that fly: birds, planes, kites, balloons and more.',
    pool: ['bird', 'butterfly', 'airplane', 'helicopter', 'kite', 'balloon', 'bee', 'rocket'], n: 5, bg: B.sky,
    titleCap: 'Look up in the *sky!*', titleSay: 'Look up in the sky!', say: (it) => `${cap1(art(lc(it.word)))} can fly!`, card: () => ({ slide: 1, y: -20 }),
    endCap: 'Fly high, *fly high!*', endSay: 'Fly high, fly high!' }));

  // 37 Dino Stomp
  S.push(flashStyle({ id: 'dinos', name: 'Dino Stomp', tag: 'Animals', color: '#5cc94a', song: 'weasel', desc: 'Friendly dinosaurs stomp and roar.',
    pool: ['trex', 'longneck', 'trike', 'stego'], n: 4, bg: B.jungle, sound: true,
    titleCap: 'Dino *stomp!*', titleSay: "Stomp, stomp! Let's meet the dinosaurs!", say: (it) => `${it.word}! ${cap1(it.sound)}!`, card: () => ({ y: 40, scale: 1.55 }),
    endCap: 'Stomp stomp *roar!*', endSay: 'Stomp, stomp, roar!' }));

  // 38 Music Time
  S.push(flashStyle({ id: 'music', name: 'Music Time', tag: 'Music', color: '#c8251c', song: 'yankee', desc: 'Drum, guitar, piano, trumpet, xylophone and maracas play.', indoor: true,
    pool: ['drum', 'guitar', 'piano', 'trumpet', 'xylophone', 'maracas'], n: 5, bg: B.stage, sound: true,
    titleCap: "It's *music time!*", titleSay: "It's music time! Let's play!", say: (it) => `The ${lc(it.word)}! ${cap1(it.sound)}!`,
    endCap: 'Let\'s make *music!*', endSay: "Let's make music together!" }));

  // 39 Brush Your Teeth
  S.push({ id: 'teeth', name: 'Brush Your Teeth', tag: 'Routine', color: '#3bc9ff', song: 'mulberry', indoor: true, desc: 'Toothpaste, brush up and down, rinse, sparkly smile.', thumbT: 4,
    scenes: [
      intro(B.bath, 'Brush your *teeth!*', "It's time to brush our teeth!", { baby: { armR: 1.6, hold: (c) => K.toothbrush(c, 0, -10, 60, -1.2) } }),
      { d: 2.4, cap: 'A little *toothpaste*', say: 'A little bit of toothpaste!', sfx: [[0.6, 'pop']], cam: [[1.8, 0, 160], [1.9, 0, 160]], draw(g, t) { B.bath(g); g.baby(0, G, 1.4, { mood: 'o', look: [0.6, 0.5], armR: 1.4, hold: (c) => K.toothbrush(c, 0, -10, 60, -0.3, t > 0.6) }); } },
      { d: 2.4, cap: 'Brush *side to side!*', say: 'Brush, brush, side to side!', sfx: [[0.2, 'brush'], [1.0, 'brush']], cam: [[2.4, 0, 130], [2.4, 0, 130]], draw(g, t) { B.bath(g); g.baby(0, G, 1.4, { mood: 'grin', armR: 2.2 }); K.toothbrush(g.c, -20 + Math.sin(g.T * 14) * 30, 130, 80, 0); for (let i = 0; i < 6; i++) K.ball(g.c, -30 + i * 12 + Math.sin(g.T * 5 + i) * 5, 140 + Math.cos(i) * 5, 8, '#ffffff'); } },
      { d: 2.4, cap: 'Brush *up and down!*', say: 'Up and down, up and down!', sfx: [[0.2, 'brush'], [1.0, 'brush']], cam: [[2.4, 0, 130], [2.4, 0, 130]], draw(g, t) { B.bath(g); g.baby(0, G, 1.4, { mood: 'grin', armR: 2.2 }); K.toothbrush(g.c, -10, 130 + Math.sin(g.T * 14) * 18, 80, 0); for (let i = 0; i < 6; i++) K.ball(g.c, -30 + i * 12, 140 + Math.sin(g.T * 7 + i) * 6, 8, '#ffffff'); } },
      { d: 2.4, cap: 'Rinse and *spit!*', say: 'Rinse and spit!', sfx: [[0.6, 'splash']], cam: [[1.4, 0, 180], [1.5, 0, 180]], draw(g, t) { B.bath(g); K.sink(g.c, 0, G + 120, 0.9, { t: g.T, water: true }); g.baby(0, G - 40, 1.1, { noLegs: true, noShadow: true, mood: t > 0.6 ? 'puff' : 'smile' }); } },
      cheer(B.bath, 'Sparkly *smile!*', 'Look! A sparkly smile!', { extra: (g) => K.sparkles(g, g.T, 20, 3, [-200, -100, 400, 300]) }),
    ] });

  // 40 Good Morning Routine
  S.push({ id: 'morning', name: 'Good Morning Routine', tag: 'Routine', color: '#ffb21f', song: 'muffin', indoor: true, desc: 'Wake up, stretch, wash, get dressed, breakfast, off we go!', thumbT: 4,
    pick: (r, classic) => ({ outfit: classic ? '#ff5a5a' : r.pick(['#ff5a5a', '#3b8cff', '#7bd88f', '#b98bff', '#ff9a4d']) }),
    build: (v) => [
      { d: 2.6, cap: 'Good *morning!*', say: 'Good morning! Time to wake up!', sfx: [[0.2, 'ding']], cam: [[1.2, -60, 180], [1.3, -60, 180]], draw(g, t) { K.bgRoom(g, g.T, '#fff4d6', '#e7b67c', { window: true, windowX: 200 }); K.sun(g.c, 200, lerp(-180, -320, t / 2.6), 50, g.T, false); K.bed(g.c, 0, G + 40, 1, {}); g.babyHead(-150, G - 150, { closedEyes: t < 1.2, mood: t < 1.2 ? 'smile' : 'o', headTilt: -1.2 }); } },
      { d: 2.4, cap: 'Big *stretch!*', say: 'Stretch up high!', sfx: [[0.2, 'yawn']], draw(g, t) { K.bgRoom(g, g.T, '#fff4d6', '#e7b67c', { window: true, windowX: 200 }); g.baby(0, G, 1.4, { armL: 2.9, armR: 2.9, mood: 'o', closedEyes: true, outfit: '#a9c8ff', jump: Math.sin(t * 2) * 10 }); } },
      { d: 2.4, cap: 'Wash my *face!*', say: 'Splash, splash! Wash my face!', sfx: [[0.3, 'splash']], cam: [[1.4, 0, 180], [1.5, 0, 180]], draw(g, t) { B.bath(g); K.sink(g.c, 0, G + 120, 0.9, { t: g.T, water: true }); g.baby(0, G - 40, 1.1, { noLegs: true, noShadow: true, mood: 'grin', happyEyes: true, outfit: '#a9c8ff', armL: 2.3 + Math.sin(g.T * 10) * 0.3, armR: 2.3 + Math.cos(g.T * 10) * 0.3 }); } },
      { d: 2.4, cap: 'Get *dressed!*', say: 'Time to get dressed!', sfx: [[0.9, 'sparkle']], draw(g, t) { K.bgRoom(g, g.T, '#fff4d6', '#e7b67c', { window: true, windowX: 200 }); const sw = t > 0.9; g.baby(0, G, 1.4, { outfit: sw ? v.data.outfit : '#a9c8ff', mood: 'grin', armR: sw ? wave(g) : 0.3 }); if (t > 0.7 && t < 1.4) K.sparkles(g, g.T, 20, 2, [-200, -100, 400, 500]); } },
      { d: 2.4, cap: 'Yummy *breakfast!*', say: 'Yummy breakfast!', sfx: [[0.4, 'crunch'], [1.2, 'crunch']], cam: [[1.5, 0, 180], [1.55, 0, 180]], draw(g, t) { K.bgRoom(g, g.T, '#fff4d6', '#e7b67c'); g.baby(0, G, 1.4, { outfit: v.data.outfit, mood: Math.sin(g.T * 8) > 0 ? 'o' : 'smile', armR: 1.2 }); K.rrect(g.c, -g.hw * 2, G - 80, g.hw * 4, 400, 0); g.c.fillStyle = '#c99a62'; g.c.fill(); K.bowl(g.c, 0, G - 70, 90); } },
      { d: 2.6, cap: 'Bye bye! *Off we go!*', say: 'Bye bye! Off we go!', sfx: [[0.3, 'honk']], draw(g, t) { K.bgStreet(g, g.T, 0); K.bus(g.c, lerp(g.hw + 300, 200, ease.out(seg(t, 0, 1.2))), G + 60, 0.7, { t: g.T }); g.baby(-150, G + 60, 1.2, { outfit: v.data.outfit, mood: 'grin', armR: wave(g) }); } },
    ] });

  // 41 Wash Your Hands
  const HANDS = (g, foam, o = {}) => { const c = g.c, sk = g.hero.skin; K.hand(c, -150 + (o.rub ? Math.sin(g.T * 14) * 30 : 0), 100, 1.0, 0.2, sk); c.save(); c.scale(-1, 1); K.hand(c, -150 - (o.rub ? Math.sin(g.T * 14) * 30 : 0), 130, 1.0, 0.2, sk); c.restore(); if (foam) for (let i = 0; i < 16; i++) K.bubble(c, -120 + rnd(i) * 240, 40 + rnd(i * 3) * 140 + Math.sin(g.T * 3 + i) * 6, 14 + rnd(i * 5) * 16); };
  S.push({ id: 'handwash', name: 'Wash Your Hands', tag: 'Routine', color: '#4dd0c4', song: 'rowboat', indoor: true, desc: 'Water, soap, scrub-scrub, rinse and dry — clean hands!', thumbT: 5,
    scenes: [
      intro(B.bath, 'Wash your *hands!*', "Let's wash our hands!"),
      { d: 2.4, cap: 'Water *on!*', say: 'Turn the water on!', sfx: [[0.3, 'splash']], cam: [[1.4, 0, 160], [1.45, 0, 160]], draw(g, t) { B.bath(g); K.sink(g.c, 0, G + 120, 0.9, { t: g.T, water: true }); HANDS(g, false); } },
      { d: 2.4, cap: 'Soap and *bubbles!*', say: 'Soap and bubbles!', sfx: [[0.3, 'bubble'], [1.0, 'bubble']], cam: [[1.4, 0, 160], [1.45, 0, 160]], draw(g, t) { B.bath(g); K.sink(g.c, 0, G + 120, 0.9, { t: g.T }); HANDS(g, true); K.risingBubbles(g, g.T, 10, 4, -200, 400); } },
      { d: 2.6, cap: '*Scrub, scrub, scrub!*', say: 'Scrub, scrub, scrub! Count to ten!', sfx: [[0.2, 'brush'], [1.0, 'brush']], cam: [[1.6, 0, 140], [1.6, 0, 140]], draw(g, t) { B.bath(g); K.sink(g.c, 0, G + 120, 0.9, { t: g.T }); HANDS(g, true, { rub: true }); } },
      { d: 2.4, cap: 'Rinse and *dry!*', say: 'Rinse it off, and dry!', sfx: [[0.3, 'splash'], [1.4, 'whoosh']], cam: [[1.4, 0, 160], [1.45, 0, 160]], draw(g, t) { B.bath(g); K.sink(g.c, 0, G + 120, 0.9, { t: g.T, water: t < 1.2 }); HANDS(g, t < 0.6); if (t > 1.2) { K.rrect(g.c, -160, 20 + Math.sin(g.T * 8) * 20, 320, 160, 20); g.c.fillStyle = '#ff9ec4'; g.c.fill(); } } },
      cheer(B.bath, 'Clean *hands!*', 'Yay! Clean hands!', { extra: (g) => K.sparkles(g, g.T, 20, 6, [-260, -100, 520, 400]) }),
    ] });

  // 42 Teddy's Picnic
  S.push({ id: 'picnic', name: "Teddy's Picnic", tag: 'Story', color: '#7bd84a', song: 'skip', desc: 'A picnic with Teddy, then marching ants sneak a snack.', thumbT: 7,
    scenes: [
      intro(B.garden, "Picnic *time!*", "It's picnic time with Teddy!", { extra: (g) => K.bear(g.c, 200, G, 1.0, { t: g.T, armL: wave(g) }) }),
      { d: 2.6, cap: 'Yummy *sandwiches!*', say: 'Yummy sandwiches for everyone!', sfx: [[0.4, 'pop']], cam: [[1.1, 0, 200], [1.2, 0, 200]], draw(g, t) { B.garden(g); K.oval(g.c, 0, G + 40, 300, 70); g.c.fillStyle = '#ff6b6b'; g.c.fill(); g.baby(-150, G, 1.1, { mood: 'grin', armR: 1.4, hold: (c) => K.sandwich(c, 0, -20, 40) }); K.bear(g.c, 160, G, 1.0, { t: g.T, armL: 1.4, mood: 'open', talk: true }); K.sandwich(g.c, 0, G + 20, 70); } },
      { d: 2.6, cap: 'Who is *that?*', say: 'Who is that? Ants!', sfx: [[0.3, 'click'], [0.8, 'click']], cam: [[1.8, 0, G + 20], [1.9, 0, G + 20]], draw(g, t) { B.garden(g); K.oval(g.c, 0, G + 40, 300, 70); g.c.fillStyle = '#ff6b6b'; g.c.fill(); K.sandwich(g.c, 0, G + 20, 70); for (let i = 0; i < 5; i++) K.ant(g.c, lerp(-g.hw - 60, -60, seg(t, 0, 2.2)) - i * 50, G + 80, 1.2, { t: g.T + i }); } },
      { d: 2.6, cap: 'The ants *march away!*', say: 'The ants march away with a snack!', sfx: [[0.3, 'giggle']], cam: [[1.4, 0, G], [1.4, 60, G]], draw(g, t) { B.garden(g); for (let i = 0; i < 5; i++) K.ant(g.c, lerp(-40, g.hw + 100, seg(t, 0, 2.6)) - i * 50, G + 80, 1.2, { t: g.T + i, carry: i === 1 ? (c) => K.sandwich(c, 0, -20, 26) : null }); g.baby(-120, G - 20, 0.9, { mood: 'grin', happyEyes: true, armL: 2.4, armR: 2.4 }); } },
      cheer(B.garden, 'Sharing is *caring!*', 'Sharing is caring! Bye bye, ants!', { extra: (g) => K.bear(g.c, 220, G, 0.9, { t: g.T, armR: 2.6, happyEyes: true }) }),
    ] });

  // 43 Puddle Jumping
  S.push({ id: 'puddles', name: 'Puddle Jumping', tag: 'Story', color: '#5b7fe0', song: 'rainrain', desc: 'Rain, umbrella, big puddle splash, then a rainbow.', thumbT: 5.6,
    pick: (r, classic) => ({ umb: classic ? '#ffd23f' : r.pick(['#ffd23f', '#ff4d6d', '#3b8cff', '#7bd88f', '#b98bff']) }),
    build: (v) => [
      { d: 2.6, cap: "It's *raining!*", say: "Pitter, patter! It's raining!", sfx: [[0.2, 'thunder']], draw(g, t) { B.rainy(g); g.baby(0, G, 1.35, { mood: 'o', look: [0, -0.8], armR: 0.9, hold: (c) => K.umbrella(c, -20, -180, 150, v.data.umb) }); } },
      { d: 2.4, cap: 'A big *puddle!*', say: 'Look! A big puddle!', sfx: [[0.3, 'ding']], cam: [[1.2, 0, 300], [1.3, 0, 300]], draw(g, t) { B.rainy(g); K.puddle(g.c, 60, G + 40, 180, g.T); g.baby(-150, G, 1.2, { mood: 'grin', armR: 0.9, hold: (c) => K.umbrella(c, -20, -180, 150, v.data.umb) }); } },
      { d: 2.6, cap: '*Splash!*', say: 'Jump! Splash!', sfx: [[0.6, 'splash']], cam: [[1.1, 0, 220], [1.05, 0, 220]], draw(g, t) { B.rainy(g); const j = Math.sin(seg(t, 0, 0.6) * Math.PI) * 140; K.puddle(g.c, 60, G + 40, 180, g.T, seg(t, 0.6, 1.4)); g.baby(lerp(-150, 60, seg(t, 0, 0.6)), G + 20, 1.2, { jump: j, mood: 'grin', happyEyes: t > 0.6, armL: 2.4, armR: 0.9, hold: (c) => K.umbrella(c, -20, -180, 150, v.data.umb) }); } },
      { d: 2.6, cap: 'The rain *stops...*', say: 'The rain stops... and look!', sfx: [[0.6, 'sparkle']], draw(g, t) { B.clear(g); K.sun(g.c, 0, -360, 90, g.T); g.baby(0, G, 1.35, { mood: 'o', look: [0, -0.8] }); } },
      cheer(B.clear, 'A *rainbow!*', 'A rainbow! Hooray!', { extra: (g, t) => K.rainbow(g.c, 0, -60, 330, 36, 1) }),
    ] });

  // 44 Snowy Day
  S.push({ id: 'snowday', name: 'Snowy Day', tag: 'Story', color: '#9fc8f0', song: 'jingle', desc: 'Snowflakes, build a snowman, carrot nose, sledding fun.', thumbT: 6,
    scenes: [
      { d: 2.6, cap: "It's *snowing!*", say: "It's snowing! Let's play!", sfx: [[0.2, 'sparkle']], draw(g, t) { B.snow(g); g.baby(0, G, 1.35, { mood: 'grin', outfit: '#ff5a5a', nightcap: true, look: [0, -0.8], armL: 2.4, armR: 2.4 }); } },
      { d: 3.0, cap: 'Roll, roll, *roll!*', say: 'Roll the snow! One, two, three!', sfx: [[0.3, 'pop'], [1.1, 'pop'], [1.9, 'pop']], cam: [[1.1, 80, 200], [1.15, 80, 200]], draw(g, t) { B.snow(g); K.snowman(g.c, 150, G, 0.62, { t: g.T, parts: 1 + Math.floor(seg(t, 0.3, 2.3) * 2.99), nose: false }); g.baby(-160, G, 1.15, { mood: 'grin', outfit: '#ff5a5a', nightcap: true, armR: 1.4 + Math.sin(g.T * 6) * 0.3 }); } },
      { d: 2.4, cap: 'A carrot *nose!*', say: 'And a carrot nose!', sfx: [[0.8, 'ding']], cam: [[1.6, 150, 200], [1.7, 150, 200]], draw(g, t) { B.snow(g); K.snowman(g.c, 150, G, 0.62, { t: g.T, nose: t > 0.8 }); if (t < 0.8) K.carrot(g.c, lerp(-100, 150, t / 0.8), lerp(250, G - 196, t / 0.8), 30); g.baby(-160, G, 1.15, { mood: 'grin', outfit: '#ff5a5a', nightcap: true, armR: 2.0 }); } },
      { d: 2.6, cap: '*Wheee!*', say: 'Wheee! Sledding down the hill!', sfx: [[0.2, 'whoosh'], [0.4, 'giggle']], draw(g, t) { B.snow(g); const x = lerp(-g.hw - 100, g.hw + 100, seg(t, 0, 2.4)), y = lerp(150, 380, seg(t, 0, 2.4)); g.c.save(); g.c.translate(x, y); g.c.rotate(0.25); K.rrect(g.c, -140, -10, 280, 30, 15); g.c.fillStyle = '#e8463f'; g.c.fill(); g.baby(0, 0, 1.0, { noLegs: true, noShadow: true, mood: 'grin', happyEyes: true, outfit: '#ff5a5a', nightcap: true, armL: 2.6, armR: 2.6 }); g.c.restore(); } },
      cheer(B.snow, 'Snow day *fun!*', 'Snow day fun!', { baby: { outfit: '#ff5a5a', nightcap: true }, extra: (g) => K.snowman(g.c, 210, G, 0.45, { t: g.T }) }),
    ] });

  // 45 Beach Day
  S.push({ id: 'beachday', name: 'Beach Day', tag: 'Story', color: '#26b6f7', song: 'yankee', desc: 'Sandcastle, crab hello, splashing waves and ice cream.', thumbT: 4.4,
    pick: (r, classic) => ({ scoops: classic ? ['#ffb3cf', '#fff3d6', '#9be8b0'] : r.sample(['#ffb3cf', '#fff3d6', '#9be8b0', '#c8a2ff', '#ffd27a', '#8a5a33'], 3) }),
    build: (v) => [
      intro(B.beach, 'Beach *day!*', "Hooray! It's a beach day!"),
      { d: 3.0, cap: 'Build a *sandcastle!*', say: "Let's build a sandcastle!", sfx: [[0.4, 'pop'], [1.2, 'pop'], [2.0, 'pop']], cam: [[1.1, 80, 220], [1.15, 80, 220]], draw(g, t) { B.beach(g); K.sandcastle(g.c, 170, G + 40, 0.7, seg(t, 0.3, 2.4)); g.baby(-110, G, 1.15, { mood: 'grin', armR: 1.2 + Math.sin(g.T * 8) * 0.3 }); } },
      { d: 2.4, cap: 'Hello, *crab!*', say: 'Hello, crab! Click, clack!', sfx: [[0.4, 'click'], [0.8, 'click']], cam: [[1.5, 0, 330], [1.55, 0, 330]], draw(g, t) { B.beach(g); K.crab(g.c, Math.sin(t * 3) * 80, G + 60, 1.4, { t: g.T }); } },
      { d: 2.4, cap: '*Splash* in the waves!', say: 'Splash, splash in the waves!', sfx: [[0.4, 'splash']], draw(g, t) { B.beach(g); g.baby(0, G - 40, 1.3, { mood: 'grin', happyEyes: true, armL: 2.5, armR: 2.5, jump: Math.abs(Math.sin(t * 5)) * 30 }); for (let i = 0; i < 26; i++) { const tt = (t * 0.8 + rnd(i)) % 1; K.oval(g.c, (rnd(i * 3) - 0.5) * 500, G + 60 - Math.sin(tt * Math.PI) * 260, 10, 14); g.c.fillStyle = 'rgba(120,200,255,.85)'; g.c.fill(); } } },
      { d: 2.4, cap: 'Ice cream *time!*', say: 'Ice cream time! Yum!', sfx: [[0.3, 'ding']], cam: [[1.5, 40, 180], [1.6, 40, 180]], draw(g, t) { B.beach(g); g.baby(0, G, 1.35, { mood: t > 0.8 ? 'o' : 'grin', armR: 1.3, hold: (c) => K.iceCream(c, 0, -30, 45, v.data.scoops) }); } },
      cheer(B.beach, 'Best beach *day!*', 'Best beach day ever!'),
    ] });

  // 46 Little Seed
  S.push({ id: 'seed', name: 'Little Seed', tag: 'Story', color: '#3fae49', song: 'mary', desc: 'Plant a seed, water it, sunshine, and watch a flower grow.', thumbT: 9,
    pick: (r, classic) => ({ col: classic ? '#ff6fa8' : r.pick(['#ff6fa8', '#ff4d4d', '#ffd23f', '#b26bff', '#ff9a1f', '#3b8cff']) }),
    build: (v) => [
      intro(B.garden, 'A little *seed*', 'I have a little seed!', { baby: { armR: 1.4, hold: (c) => K.ball(c, 0, -10, 10, '#8a5a33') } }),
      { d: 2.4, cap: 'Plant it in the *ground*', say: 'Plant it in the ground.', sfx: [[0.6, 'pop']], cam: [[1.4, 0, 330], [1.5, 0, 330]], draw(g, t) { B.garden(g); K.blob(g.c, 0, G + 50, 150, 40, '#8a5a33'); if (t < 0.6) K.ball(g.c, 0, lerp(150, G + 30, t / 0.6), 10, '#5a3a1e'); g.baby(-170, G, 1.0, { mood: 'smile', armR: 0.8 }); } },
      { d: 2.4, cap: 'Water it, *drip drop*', say: 'Water it, drip, drop!', sfx: [[0.3, 'splash']], cam: [[1.4, 0, 300], [1.45, 0, 300]], draw(g, t) { B.garden(g); K.blob(g.c, 0, G + 50, 150, 40, '#6b4426'); K.wateringCan(g.c, -120, 120, 80, 0.4); for (let i = 0; i < 10; i++) { const sp = (g.T * 1.5 + i / 10) % 1; K.oval(g.c, -10 + Math.sin(i) * 20, 80 + sp * 260, 6, 9); g.c.fillStyle = 'rgba(100,180,255,.85)'; g.c.fill(); } } },
      { d: 2.4, cap: 'Sunshine *warm*', say: 'The sunshine makes it warm.', sfx: [[0.3, 'sparkle']], draw(g, t) { B.garden(g); K.sun(g.c, 0, -300, 110 * popIn(t, 0.1, 0.6), g.T); K.blob(g.c, 0, G + 50, 150, 40, '#6b4426'); K.flower(g.c, 0, G + 30, 1.2, v.data.col, seg(t, 0.4, 2.4) * 0.45, g.T); } },
      { d: 2.8, cap: 'Look! A *flower!*', say: 'Look! A beautiful flower!', sfx: [[0.6, 'tada']], cam: [[1.2, 0, 160], [1.3, 0, 150]], draw(g, t) { B.garden(g); K.blob(g.c, 0, G + 50, 150, 40, '#6b4426'); K.flower(g.c, 0, G + 30, 1.5, v.data.col, lerp(0.45, 1, seg(t, 0, 1.2)), g.T); if (t > 1.2) K.butterfly(g.c, 140, -120, 0.8, { t: g.T }); } },
      cheer(B.garden, 'Grow, flower, *grow!*', 'Grow, flower, grow!', { extra: (g) => K.flower(g.c, 230, G + 20, 0.8, v.data.col, 1, g.T) }),
    ] });

  // 47 Fire Truck Rescue
  S.push({ id: 'firetruck', name: 'Fire Truck Rescue', tag: 'Story', color: '#e8322e', song: 'wheels', desc: 'Kitty is stuck in a tree — the fire truck saves the day.', thumbT: 7,
    scenes: [
      { d: 2.6, cap: 'Kitty is *stuck!*', say: 'Oh no! Kitty is stuck in the tree!', sfx: [[0.3, 'meow'], [1.6, 'meow']], cam: [[1.2, 160, -40], [1.3, 160, -60]], draw(g, t) { B.park(g); K.tree(g.c, 180, G, 3.0, '#3fae49'); K.critter(g.c, 170, -130, 0.55, 'cat', { t: g.T, talk: true }); g.baby(-160, G, 1.1, { mood: 'o', look: [0.6, -0.8] }); } },
      { d: 2.6, cap: '*Wee-oo* wee-oo!', say: 'Wee-oo, wee-oo! Here comes the fire truck!', sfx: [[0.1, 'siren']], draw(g, t) { B.street(g); K.fireTruck(g.c, lerp(-g.hw - 300, 0, ease.out(seg(t, 0, 1.6))), G + 60, 0.9, { t: g.T, siren: true, roll: g.T * 6 }); } },
      { d: 2.8, cap: 'Up goes the *ladder!*', say: 'Up, up goes the ladder!', sfx: [[0.3, 'whoosh']], cam: [[1, 60, 0], [1.1, 80, -60]], draw(g, t) { B.park(g); K.tree(g.c, 180, G, 3.0, '#3fae49'); K.critter(g.c, 170, -130, 0.55, 'cat', { t: g.T }); K.fireTruck(g.c, -140, G + 60, 0.9, { t: g.T, ladder: ease.inOut(seg(t, 0.2, 2.2)) * 0.62 }); } },
      { d: 2.6, cap: 'Kitty is *safe!*', say: 'Hooray! Kitty is safe!', sfx: [[0.2, 'meow'], [0.6, 'tada']], cam: [[1.2, 0, 160], [1.25, 0, 160]], draw(g, t) { B.park(g); g.baby(-120, G, 1.2, { mood: 'grin', happyEyes: true, armL: 2.5, armR: 2.5 }); K.critter(g.c, 130, G, 0.8, 'cat', { t: g.T, happyEyes: true, jump: Math.abs(Math.sin(t * 6)) * 30 }); } },
      cheer(B.street, 'Thank you, *firefighters!*', 'Thank you, firefighters!', { extra: (g) => K.fireTruck(g.c, 0, G - 60, 0.5, { t: g.T, siren: true }) }),
    ] });

  // 48 Trip to the Moon
  S.push({ id: 'moontrip', name: 'Trip to the Moon', tag: 'Explore', color: '#5b4bd6', song: 'twinkle', desc: 'Blast off in a rocket, fly through stars, land on the moon.', thumbT: 7,
    scenes: [
      { d: 2.6, cap: 'Ready for *space?*', say: 'Ready for a trip to the moon?', sfx: [[0.2, 'ding']], draw(g, t) { B.night(g); K.rocket(g.c, 140, G, 1.0, { t: g.T, flame: false }); g.baby(-140, G, 1.2, { mood: 'grin', armR: wave(g) }); } },
      { d: 2.4, cap: '3, 2, 1... *blast off!*', says: [[0.1, 'Three, two, one... blast off!']], sfx: [[1.4, 'blastoff']], cam: [[1, 0, 0], [0.9, 0, -200]], draw(g, t) { B.night(g); const y = G - ease.in(seg(t, 1.4, 2.4)) * 1500; K.rocket(g.c, 0, y, 1.1, { t: g.T, flame: t > 1.3, inside: (c) => { c.save(); c.translate(0, -164); c.scale(0.25, 0.25); g.babyHead(0, 0, { mood: 'grin' }); c.restore(); } }); } },
      { d: 2.6, cap: 'Flying through the *stars!*', say: 'Flying through the stars!', sfx: [[0.3, 'whoosh']], draw(g, t) { B.space(g); g.c.save(); g.c.strokeStyle = 'rgba(255,255,255,.7)'; g.c.lineWidth = 3; for (let i = 0; i < 40; i++) { const y = ((rnd(i) * 1400 + g.T * 900) % 1400) - 700, x = (rnd(i * 3) * 2 - 1) * g.hw; g.c.beginPath(); g.c.moveTo(x, y); g.c.lineTo(x, y - 60); g.c.stroke(); } g.c.restore(); K.rocket(g.c, Math.sin(g.T * 2) * 40, 300, 1.0, { t: g.T, inside: (c) => { c.save(); c.translate(0, -164); c.scale(0.25, 0.25); g.babyHead(0, 0, { mood: 'grin', happyEyes: true }); c.restore(); } }); } },
      { d: 2.8, cap: 'We landed on the *moon!*', say: 'We landed on the moon!', sfx: [[0.4, 'tada']], draw(g, t) { B.space(g); K.planet(g.c, 0, 1250, 1100, '#e8e4d8', { face: false }); K.planet(g.c, -220, -380, 70, '#3b8cff', { t: g.T, earth: true }); g.baby(0, 200, 1.2, { mood: 'grin', happyEyes: true, armL: 2.5, armR: 2.5, jump: Math.abs(Math.sin(t * 3)) * 80 }); } },
      cheer(B.space, 'Hello from the *moon!*', 'Hello from the moon! Bye bye, Earth!'),
    ] });

  // 49 Hide and Seek
  const HIDERS = ['bunny', 'bear', 'cat', 'dog', 'monkey', 'panda', 'duck', 'pig', 'frog'];
  const SPOTS = [['bush', (g) => { K.blob(g.c, 0, G - 40, 220, 130, '#3aa547'); K.blob(g.c, -100, G - 20, 120, 90, '#46b64f'); K.blob(g.c, 110, G - 20, 120, 90, '#46b64f'); }], ['tree', (g) => K.tree(g.c, 0, G + 20, 2.4, '#3fae49')], ['box', (g) => K.present(g.c, 0, G + 40, 300, '#c99a62', '#a8743f')]];
  S.push({ id: 'hideseek', name: 'Hide and Seek', tag: 'Story', color: '#46b64f', song: 'weasel', desc: 'Count to three, then find the friends hiding in the park.', thumbT: 6.5,
    pick: (r, classic) => ({ h: classic ? ['bunny', 'bear', 'cat'] : r.sample(HIDERS, 3) }),
    build: (v) => [
      { d: 3.0, cap: '1, 2, 3... *ready or not!*', say: 'One, two, three... ready or not, here I come!', sfx: [[0.2, 'click'], [0.8, 'click'], [1.4, 'click']], cam: [[1.4, 0, 160], [1.5, 0, 160]], draw(g, t) { B.park(g); g.baby(0, G, 1.35, { armL: -0.9, armR: -0.9, closedEyes: t < 2.2, mood: 'smile' }); } },
      ...v.data.h.map((id, i) => { const [where, drawSpot] = SPOTS[i]; const it = K.ITEMS[id]; return {
        d: 2.8, cap: `Behind the ${where}... *${lc(it.word)}!*`, says: [[0.1, `Is anyone behind the ${where}?`], [1.6, `Peekaboo! It's ${art(lc(it.word))}!`]], sfx: [[1.4, 'pop'], [1.6, 'giggle']], cam: [[1.1, 0, 140], [1.15, 0, 140]],
        draw(g, t) { B.park(g); const up = ease.back(seg(t, 1.4, 1.9)); const shake = t < 1.4 ? Math.sin(g.T * 30) * 6 * seg(t, 0.6, 1.4) : 0; if (up > 0) { const pos = where === 'tree' ? [140, G] : [0, G - 120 * up + 120]; K.drawItem(g.c, id, pos[0] + (where === 'tree' ? 0 : 0), pos[1] - (where === 'box' ? 140 : 100) * up, 0.8, g.T, { happyEyes: true }); } g.c.save(); g.c.translate(shake, 0); drawSpot(g); g.c.restore(); } }; }),
      cheer(B.park, 'Found you *all!*', 'I found you all!', { extra: (g) => v.data.h.forEach((id, i) => K.drawItem(g.c, id, (i - 1) * Math.min(230, g.hw * 0.6), 120, 0.5, g.T + i, { happyEyes: true })) }),
    ] });

  // 50 The Lost Balloon
  S.push({ id: 'balloon', name: 'The Lost Balloon', tag: 'Story', color: '#ff4d6d', song: 'hickory', desc: 'The wind takes the balloon away — a kind bird brings it back.', thumbT: 7,
    pick: (r, classic) => ({ col: classic ? '#ff4d6d' : r.pick(['#ff4d6d', '#3b8cff', '#ffd23f', '#7bd88f', '#b26bff', '#ff9a1f']) }),
    build: (v) => [
      { d: 2.6, cap: 'My *balloon!*', say: 'I love my balloon!', sfx: [[0.3, 'ding']], cam: [[1.2, 0, 60], [1.3, 0, 60]], draw(g, t) { B.park(g); K.balloon(g.c, 60, -170, 70, v.data.col, { t: g.T }); g.baby(0, G, 1.35, { mood: 'grin', armR: 2.0 }); } },
      { d: 2.6, cap: '*Whoosh!* The wind!', say: 'Whoosh! The wind blows it away!', sfx: [[0.2, 'whoosh']], cam: [[1, 0, 0], [1, 0, -100]], draw(g, t) { B.park(g); K.windLines(g, g.T); const k = ease.in(seg(t, 0.3, 2.6)); K.balloon(g.c, 60 + k * 260, -170 - k * 600, 70, v.data.col, { t: g.T }); g.baby(0, G, 1.35, { mood: 'o', look: [0.6, -0.9], armR: 2.8 }); } },
      { d: 2.4, cap: 'Oh *no...*', say: 'Oh no... my balloon.', sfx: [[0.2, 'sad']], cam: [[1.9, 0, 110], [2.0, 0, 110]], draw(g, t) { B.park(g); g.baby(0, G, 1.35, { mood: 'sad', look: [0, -0.5] }); } },
      { d: 2.8, cap: 'A kind *bird* helps!', say: 'Tweet tweet! A kind bird helps!', sfx: [[0.3, 'tweet'], [1.6, 'tweet']], draw(g, t) { B.sky(g); const x = lerp(g.hw + 100, -40, ease.inOut(seg(t, 0, 2.6))); K.bird(g.c, x, -80 + Math.sin(g.T * 3) * 20, 1.6, { t: g.T, fly: true, dir: -1, hold: t > 1.0 ? (c) => { c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -60); c.stroke(); K.balloon(c, 0, -150, 60, v.data.col, { t: g.T }); } : null }); if (t <= 1.0) K.balloon(g.c, -100, -240, 60, v.data.col, { t: g.T }); } },
      { d: 2.6, cap: 'My balloon is *back!*', say: 'My balloon is back! Thank you, bird!', sfx: [[0.3, 'tada']], draw(g, t) { B.park(g); K.balloon(g.c, 60, -170, 70, v.data.col, { t: g.T }); K.bird(g.c, -150, -60, 1.2, { t: g.T, fly: true }); g.baby(0, G, 1.35, { mood: 'grin', happyEyes: true, armR: 2.0, jump: Math.abs(Math.sin(t * 5)) * 30 }); } },
      cheer(B.park, 'Friends *help friends!*', 'Friends help friends!'),
    ] });

  // 51 Move and Freeze
  const MOVES = {
    clap: ['Clap your hands!', (g, b) => ({ armL: -0.45 - Math.abs(Math.sin(b)) * 0.5, armR: -0.45 - Math.abs(Math.sin(b)) * 0.5 }), 'clap'],
    jump: ['Jump up high!', (g, b) => ({ jump: Math.abs(Math.sin(b)) * 90, armL: 2.6, armR: 2.6 }), 'boing'],
    stomp: ['Stomp your feet!', (g, b) => ({ jump: Math.abs(Math.sin(b)) * 20, tilt: Math.sin(b) * 0.1 }), 'stomp'],
    wave: ['Wave hello!', (g, b) => ({ armR: 2.4 + Math.sin(b * 2) * 0.4, armL: 2.4 - Math.sin(b * 2) * 0.4 }), 'ding'],
    wiggle: ['Wiggle wiggle!', (g, b) => ({ tilt: Math.sin(b * 2) * 0.2, armL: 1.4, armR: 1.4 }), 'giggle'],
    spin: ['Spin around!', null, 'whoosh'],
    reach: ['Reach for the sky!', (g, b) => ({ armL: 2.9, armR: 2.9, jump: Math.abs(Math.sin(b * 0.5)) * 30 }), 'sparkle'],
  };
  S.push({ id: 'moves', name: 'Move and Freeze', tag: 'Music', color: '#ff6f3c', song: 'dance', indoor: true, desc: 'Clap, jump, stomp, spin… and FREEZE!', thumbT: 3,
    pick: (r, classic) => ({ m: classic ? ['clap', 'jump', 'stomp', 'spin'] : r.sample(Object.keys(MOVES), 4), bg: classic ? 0 : r.int(0, 3) }),
    build: (v) => {
      const bgs = [(g) => K.bgDisco(g, g.T, g.beat), studio('#ffe8d1', '#ff9a4d'), B.park, studio('#e3fff0', '#3fcf9a')];
      const bg = bgs[v.data.bg];
      const out = [intro(bg, "Let's *move!*", "Let's move and freeze!")];
      v.data.m.forEach((k, i) => {
        const [line, pose, sfx] = MOVES[k];
        out.push({ d: 2.2, cap: `*${line}*`, say: line, sfx: [[0.3, sfx]], cam: [[1.15, 0, 140], [1.2, 0, 140]], draw(g, t) { bg(g); const b = g.beat * Math.PI; if (!pose) { g.c.save(); g.c.translate(0, G); g.c.scale(Math.cos(t * 8), 1); g.baby(0, 0, 1.4, { armL: 1.5, armR: 1.5, mood: 'grin' }); g.c.restore(); } else g.baby(0, G, 1.4, Object.assign({ mood: 'grin' }, pose(g, b))); } });
        if (i % 2 === 1) out.push({ d: 1.8, say: 'Freeze!', sfx: [[0.1, 'pop']], trans: 'punch', cam: [[1.3, 0, 150], [1.3, 0, 150]], draw(g, t) { bg(g); g.c.save(); g.c.filter = 'saturate(0.4)'; g.baby(0, G, 1.4, { armL: 2.8, armR: 0.6, mood: 'o', blink: 0, tilt: 0.1, t: 0 }); g.c.restore(); K.text(g.c, 'FREEZE!', 0, -360, 120, { fill: '#7cf0ff', stroke: '#2b1d4e', sw: 18 }); } });
      });
      out.push(cheer(bg, 'Great *moves!*', 'Great moves, everybody!'));
      return out;
    } });

  // 52 Peekaboo
  S.push({ id: 'peekaboo', name: 'Peekaboo!', tag: 'Baby', color: '#ff9ec4', song: 'hotcross', indoor: true, desc: 'Hands cover, hands open — peekaboo! Who is it?', thumbT: 3.6,
    pick: (r, classic) => ({ a: classic ? ['bunny', 'cow', 'lion', 'duck', 'panda'] : r.sample(['bunny', 'cow', 'lion', 'duck', 'panda', 'monkey', 'pig', 'cat', 'dog', 'frog', 'owl', 'penguin', 'elephant', 'chick', 'teddy'], 5) }),
    build: (v) => [
      { d: 2.6, cap: "Let's play *peekaboo!*", say: "Let's play peekaboo!", sfx: [[0.2, 'giggle']], cam: [[1.6, 0, 120], [1.7, 0, 120]], draw(g, t) { K.bgStudio(g, g.T, '#fff0f6', '#ff9ec4'); const cover = Math.sin(seg(t, 0.3, 2.3) * Math.PI) > 0.5; g.baby(0, G, 1.4, { armL: cover ? -0.95 : 2.4, armR: cover ? -0.95 : 2.4, mood: cover ? 'smile' : 'grin', happyEyes: !cover }); } },
      ...v.data.a.map((id, i) => { const it = K.ITEMS[id]; return {
        d: 2.6, cap: `Peekaboo! *${it.word}!*`, says: [[0.1, 'Where is it?'], [1.1, `Peekaboo! ${cap1(art(lc(it.word)))}!`]], sfx: [[1.0, 'pop'], [1.2, 'giggle'], [1.6, it.sfx || 'boing']], cam: [[1, 0, 40], [1.05, 0, 40]],
        draw(g, t) {
          K.bgStudio(g, g.T, ['#fff0f6', '#e6f6ff', '#fff6dc', '#e3fff0', '#f1ebff'][i % 5], ['#ff9ec4', '#7fc4ff', '#ffc94d', '#3fcf9a', '#a993ff'][i % 5]);
          K.drawItem(g.c, id, 0, 80, 1.25, g.T, { talk: t > 1.4 && t < 2.1, happyEyes: t > 2.1 });
          const open = ease.out(seg(t, 1.0, 1.35)), sk = g.hero.skin;
          for (const sd of [-1, 1]) { g.c.save(); g.c.translate(sd * (110 + open * g.hw * 1.1), 40); g.c.rotate(sd * (Math.PI / 2 + 0.15)); g.c.scale(sd, 1); K.hand(g.c, 0, 0, 1.6, 0, sk); g.c.restore(); }
          if (t > 1.1 && t < 1.8) K.sparkles(g, g.T, 16, i, [-260, -200, 520, 500]);
        } }; }),
      cheer(studio('#fff0f6', '#ff9ec4'), 'Peekaboo, *I see you!*', 'Peekaboo! I see you!'),
    ] });

  K.STYLES.push(...S);
  // Shared kits so later style files (styles3.js) can build lessons the same way.
  K.KIT = { intro, cheer, card, flashStyle, quizStyle, B, studio, bigWord, RB, NUM, cap1, art, pl, lc, popIn };
})();
