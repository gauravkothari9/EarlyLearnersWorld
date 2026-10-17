/* The 12 video styles. Each scene: d (seconds), cap (caption, *word* = highlight),
   say (narration line), says ([[t, text]]), sfx ([[t, type]]), cam ([[zoom,x,y],[zoom,x,y]]), draw(g, t, p). */
(function () {
  const K = window.KS;
  const { G, seg, ease, lerp, rnd, TAU } = K;
  const NUM = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
  const RAINBOW = ['#ff4d4d', '#ff9a1f', '#ffd23f', '#4cd964', '#3b9cff', '#9b4dde'];

  // ---------- shared helpers ----------
  function carWithKid(g, x, s, o = {}) {
    K.car(g.c, x, G, s, Object.assign({ t: g.T }, o, {
      driver: (c) => g.baby(0, 0, 0.78, Object.assign({ noShadow: true, noLegs: true, hat: true, armR: 1.2, armL: 1.1 }, o.kid || {})),
    }));
  }
  function ballPit(g, front, seed = 0) {
    const c = g.c, n = Math.ceil(g.hw / 4);
    for (let i = 0; i < n; i++) {
      const y = G - 50 + rnd(i * 3 + seed) * 190;
      if (front !== y > G + 20) continue;
      K.ball(c, (rnd(i + seed) * 2 - 1) * g.hw, y, 17 + rnd(i * 5) * 5, K.rgba ? ['#ff4d4d', '#3bc9ff', '#ffd23f', '#7bd88f', '#ff6fa8', '#b26bff'][i % 6] : '#f00');
    }
  }
  function bigWord(g, word, t, col, y = -330, size = 150) {
    const a = ease.back(seg(t, 0.05, 0.4));
    if (a <= 0) return;
    const c = g.c; c.save(); c.translate(0, y + Math.sin(g.T * 4) * 6); c.scale(a, a);
    K.text(c, word, 0, 0, size, { fill: col, stroke: '#ffffff', sw: size * 0.16 });
    c.restore();
  }
  function popIn(t, a = 0.05, b = 0.5) { return ease.back(seg(t, a, b)); }
  function block(c, x, y, size, col, letter, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot);
    K.rrect(c, -size / 2, -size / 2, size, size, size * 0.14); c.fillStyle = K.vgrad(c, -size / 2, size / 2, K.shade(col, 0.15), K.shade(col, -0.2)); c.fill();
    K.rrect(c, -size * 0.4, -size * 0.4, size * 0.8, size * 0.8, size * 0.1); c.fillStyle = '#fffaf0'; c.fill();
    K.text(c, letter, 0, size * 0.04, size * 0.62, { fill: col, stroke: K.shade(col, -0.35), sw: size * 0.05, shadow: false });
    c.restore();
  }
  function rainbow(c, x, y, r, w = 34, prog = 1) {
    for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(x, y, r - i * w, Math.PI, Math.PI + Math.PI * prog); c.lineWidth = w + 1; c.strokeStyle = RAINBOW[i]; c.stroke(); }
    K.cloud(c, x - r + w * 3, y + 10, 0.9); K.cloud(c, x + r - w * 3, y + 10, 0.9);
  }
  function grid(n, cols, w, h, cx, cy) {
    const out = []; const rows = Math.ceil(n / cols);
    for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), inRow = Math.min(cols, n - r * cols), col = i % cols; out.push([cx + (col - (inRow - 1) / 2) * w, cy + (r - (rows - 1) / 2) * h]); }
    return out;
  }
  function silhouette(c, fn) { c.save(); c.filter = 'brightness(0) opacity(0.85)'; fn(); c.restore(); }
  function zzz(g, x, y, t) {
    for (let i = 0; i < 3; i++) { const sp = (t * 0.5 + i / 3) % 1; g.c.globalAlpha = 1 - sp; K.text(g.c, 'Z', x + sp * 80 + Math.sin(sp * 6) * 14, y - sp * 200, 40 + sp * 40, { fill: '#cfe0ff', stroke: '#3b4a8f', sw: 8, shadow: false }); }
    g.c.globalAlpha = 1;
  }
  function animalAny(g, kind, x, y, s, o) { K.animal(g.c, kind, x, y, s, Object.assign({ t: g.T }, o)); }

  const S = [];
  const item = (id, sc = 0.36) => (g, i = 0) => K.drawItem(g.c, id, 0, 0, sc, g.T + i * 0.37);
  const COUNT_OBJS = ['apple', 'balloon', 'star', 'duck', 'fish', 'strawberry', 'chick', 'ball', 'heart', 'cherries', 'bee', 'ladybug', 'carrot', 'icecream', 'cake'];
  const COLORS = [
    { word: 'RED', col: '#ff4d4d', light: '#ffd6d6', items: ['apple', 'strawberry', 'cherries', 'tomato', 'ladybug', 'firetruck'] },
    { word: 'ORANGE', col: '#ff9a1f', light: '#ffe3c2', items: ['orange', 'carrot', 'pumpkin', 'fish'] },
    { word: 'YELLOW', col: '#f5c400', light: '#fff6c2', items: ['duck', 'banana', 'lemon', 'star', 'sun', 'corn', 'chick'] },
    { word: 'GREEN', col: '#2fbf4a', light: '#d4f7da', items: ['leaf', 'frog', 'broccoli', 'pear', 'peas', 'tractor'] },
    { word: 'BLUE', col: '#3b8cff', light: '#d6e8ff', items: ['fishblue', 'whale', 'bird'] },
    { word: 'PURPLE', col: '#9b4dde', light: '#eadbff', items: ['grapes', 'hippo'] },
    { word: 'PINK', col: '#ff6fa8', light: '#ffe0ee', items: ['heart', 'pig', 'flower', 'icecream'] },
    { word: 'BROWN', col: '#9b6234', light: '#f3e2d2', items: ['teddy', 'monkey', 'horse'] },
  ];
  const ABC = {
    A: ['apple'], B: ['ball', 'banana', 'bus', 'bee', 'bear'], C: ['cat', 'car', 'cake', 'carrot', 'cow'], D: ['duck', 'dog', 'drum'], E: ['egg', 'elephant'], F: ['fish', 'frog', 'flower'],
    G: ['goat', 'grapes', 'guitar', 'giraffe'], H: ['hen', 'heart', 'house', 'hippo', 'helicopter'], I: ['icecream'], J: ['jellyfish'], K: ['kite'], L: ['lion', 'lemon', 'leaf', 'ladybug'],
    M: ['moon', 'monkey'], N: ['nest'], O: ['orange', 'octopus', 'owl'], P: ['pig', 'pear', 'pumpkin', 'panda', 'penguin', 'piano', 'peas'], Q: ['queen'], R: ['rocket', 'rainbow'],
    S: ['sun', 'star', 'snail', 'snowman', 'sheep', 'strawberry'], T: ['train', 'tomato', 'tiger', 'trumpet', 'tractor'], U: ['umbrella'], V: ['volcano'], W: ['watermelon', 'whale'], X: ['xylophone'], Y: ['yoyo'], Z: ['zebra'],
  };
  const LETTERS = Object.keys(ABC);
  const QUIZ_ANIMALS = ['cow', 'pig', 'sheep', 'hen', 'duck', 'dog', 'cat', 'goat', 'horse', 'frog', 'owl', 'lion', 'elephant', 'monkey'];

  // 1 ─ Wheels Adventure (inspired by reference clip 1)
  S.push({
    id: 'wheels', name: 'Wheels Adventure', tag: 'Story', color: '#ffd21f', song: 'wheels', thumbT: 6.0,
    desc: 'Kid drives a smiley car, a wheel pops off, Teddy finds it in the ball pit.',
    hero: { hairStyle: 'curly', hair: '#f2c14e', outfit: '#6ec6ff' },
    scenes: [
      { d: 2.6, cap: 'Vroom vroom! {name} goes for a *drive!*', say: 'Vroom vroom! {name} goes for a drive!', sfx: [[0.1, 'whoosh']], cam: [[1, 0, 60], [1.08, 0, 80]],
        draw(g, t) { K.bgPark(g, g.T); const x = lerp(-g.hw - 300, 0, ease.out(seg(t, 0, 1.7))); carWithKid(g, x, 1.15, { roll: x / 40, bounce: Math.abs(Math.sin(t * 16)) * 4 * (1 - seg(t, 1.5, 1.8)), kid: { mood: 'grin' } }); } },
      { d: 2.0, cap: 'Bumpy *bump!*', say: 'Bumpy, bumpy, bump!', sfx: [[0.3, 'boing'], [1.0, 'boing']], cam: [[1.9, -46, 140], [2.0, -46, 140]],
        draw(g, t) { K.bgPark(g, g.T); carWithKid(g, 0, 1.15, { roll: g.T * 4, bounce: Math.abs(Math.sin(t * 9)) * 22, kid: { mood: 'open', talk: true, look: [0.5, -0.3] } }); } },
      { d: 2.3, cap: 'Oh no! The *wheel!*', say: 'Oh no! The wheel!', sfx: [[0.3, 'pop'], [0.5, 'boing']], cam: [[1.05, 0, 60], [1.1, -40, 60]],
        draw(g, t) {
          K.bgPark(g, g.T);
          const off = t > 0.3, k = seg(t, 0.3, 0.6);
          carWithKid(g, 0, 1.15, { roll: 0, missing: off ? 'rear' : null, tilt: -0.1 * ease.out(k), kid: { mood: off ? 'o' : 'smile', look: [-0.8, 0.2] } });
          if (off) { const tt = t - 0.3, x = -115 - tt * 420; K.wheel(g.c, x, G - 46 - Math.abs(Math.sin(tt * 8)) * 60 * Math.exp(-tt * 2), 46, -x / 46, '#b25cf0'); }
        } },
      { d: 2.0, cap: '{name} is *sad...*', say: 'Oh no...', sfx: [[0.2, 'sad']], cam: [[2.0, -46, 150], [2.15, -46, 150]],
        draw(g, t) { K.bgPark(g, g.T); carWithKid(g, 0, 1.15, { missing: 'rear', tilt: -0.1, mood: 'sad', kid: { mood: 'sad', look: [0, 0.4], headTilt: -0.08 } }); } },
      { d: 2.6, cap: 'Teddy found the *wheel!*', say: 'Look! Teddy found the wheel!', sfx: [[0.9, 'ding'], [1.0, 'sparkle']], cam: [[1.15, 0, 120], [1.25, 0, 100]],
        draw(g, t) {
          K.bgPark(g, g.T); ballPit(g, false, 3);
          const up = ease.back(seg(t, 0.4, 1.0)), hold = t > 1.0;
          if (!hold) K.wheel(g.c, 110, lerp(G + 70, G - 60, up), 46, t * 2, '#b25cf0');
          K.bear(g.c, 0, G, 1.3, { t: g.T, headTilt: hold ? 0 : 0.15, happyEyes: hold, mood: hold ? 'open' : 'smile', armR: hold ? 2.5 : 0.6, hold: hold ? (c) => K.wheel(c, 0, -20, 40, g.T * 3, '#b25cf0') : null, hat: true });
          ballPit(g, true, 3);
          if (hold) K.sparkles(g, g.T, 14, 5, [-200, -260, 400, 300]);
        } },
      { d: 2.4, cap: 'Click! All *fixed!*', say: 'Click! All fixed!', sfx: [[1.5, 'click'], [1.6, 'ding']], cam: [[1, 0, 60], [1.05, 0, 60]],
        draw(g, t) {
          K.bgPark(g, g.T);
          const bx = lerp(-g.hw - 160, -200, ease.out(seg(t, 0, 1.1)));
          const fixed = t > 1.5, wk = ease.inOut(seg(t, 1.1, 1.5));
          carWithKid(g, 90, 1.0, { missing: 'rear', tilt: fixed ? -0.1 * (1 - ease.out(seg(t, 1.5, 1.8))) : -0.1, mood: fixed ? 'smile' : 'sad', kid: { mood: fixed ? 'grin' : 'o' } });
          if (t > 1.1) K.wheel(g.c, lerp(bx + 90, -10, wk), lerp(G - 150, G - 40, wk), 40, wk * 6, '#b25cf0');
          K.bear(g.c, bx, G, 1.05, { t: g.T, walk: t < 1.1 ? g.T * 2 : null, hat: true, armR: t < 1.1 ? 1.3 : 0.4, hold: t < 1.1 ? (c) => K.wheel(c, 0, -10, 40, 0, '#b25cf0') : null, happyEyes: fixed });
          if (fixed) K.sparkles(g, g.T, 10, 9, [-120, 200, 240, 200]);
        } },
      { d: 2.6, cap: 'Thank you, *Teddy!*', say: 'Yay! Thank you, Teddy!', sfx: [[0.1, 'tada'], [0.3, 'cheer']], cam: [[1.1, 0, 120], [1.18, 0, 120]],
        draw(g, t) {
          K.bgPark(g, g.T);
          const j = Math.abs(Math.sin(t * 6)) * 50;
          g.baby(-120, G, 1.25, { jump: j, armL: 2.6, armR: 2.6, mood: 'grin', happyEyes: true, hat: true });
          K.bear(g.c, 140, G, 1.2, { t: g.T, armR: 2.4 + Math.sin(g.T * 10) * 0.3, mood: 'open', happyEyes: true, hat: true });
          K.confetti(g, t, 90, 1);
        } },
    ],
  });

  // 2 ─ Farm Friends (inspired by reference clip 2)
  S.push({
    id: 'farm', name: 'Farm Friends', tag: 'Story', color: '#7bd88f', song: 'macdonald', thumbT: 12,
    desc: 'Baby feeds the chickens, shares an apple with a goat, all the animals say hi.',
    scenes: [
      { d: 2.4, cap: 'Good morning, *farm!*', say: 'Good morning, farm!', sfx: [[0.2, 'whoosh']], cam: [[1.25, 0, 160], [1.4, 0, 150]],
        draw(g, t) { K.bgFarm(g, g.T); g.baby(0, G, 1.4, { walk: g.T * 1.6, closedEyes: true, mood: 'smile', armR: 0.5, hold: (c) => K.bag(c, 0, 20, 0.8), headTilt: Math.sin(g.T * 3) * 0.08 }); } },
      { d: 2.1, cap: 'Cluck cluck! *Chickens!*', say: 'Cluck, cluck! Chickens!', sfx: [[0.2, 'cluck'], [1.2, 'cluck'], [0.6, 'peep']], cam: [[1.1, 0, 200], [1.2, 0, 220]],
        draw(g, t) {
          K.bgFarm(g, g.T, { coop: true, coopX: 0 });
          K.hen(g.c, -120, G + 20, 1.35, { t: g.T, flap: t > 1.1 && t < 1.6, dir: 1 });
          [[40, G + 40, 0, 1], [130, G + 10, 1, -1], [210, G + 50, 2, -1], [-260, G + 60, 3, 1]].forEach(([x, y, s, d]) => K.chick(g.c, x, y, 1.1, { t: g.T, seed: s, dir: d }));
        } },
      { d: 2.4, cap: 'Yummy *seeds!*', say: 'Here are some yummy seeds!', sfx: [[0.3, 'shake'], [0.9, 'peep'], [1.5, 'cluck']], cam: [[1.35, 0, 250], [1.45, 0, 260]],
        draw(g, t) {
          K.bgFarm(g, g.T, { noFence: false });
          const c = g.c;
          for (let i = 0; i < 40; i++) {
            const t0 = 0.15 + rnd(i) * 0.6, tt = t - t0; if (tt < 0) continue;
            const vx = 120 + rnd(i * 3) * 300, x = -150 + vx * Math.min(tt, 0.7), land = G + 20 + rnd(i * 7) * 70;
            const y = Math.min(land, 130 + -200 * tt + 900 * tt * tt);
            K.oval(c, x, y, 6, 4.5, rnd(i) * 3); c.fillStyle = '#7a4f24'; c.fill();
          }
          K.hand(c, -200, 160, 0.8, -0.5 + Math.sin(seg(t, 0.1, 0.5) * Math.PI) * 0.4);
          K.hen(c, 210, G + 30, 1.1, { t: g.T, dir: -1, peck: t > 0.9 ? Math.abs(Math.sin(t * 8)) : 0 });
          [[-60, G + 60, 0], [30, G + 30, 1], [110, G + 90, 2]].forEach(([x, y, s]) => K.chick(c, x, y, 1.15, { t: g.T, seed: s, hop: 2, peck: t > 0.7 ? Math.abs(Math.sin(t * 9 + s)) : 0, dir: s % 2 ? -1 : 1 }));
        } },
      { d: 2.2, cap: 'An *apple* for...', say: 'An apple for...', sfx: [[0.2, 'ding']], cam: [[1.4, 0, 150], [1.5, 0, 140]],
        draw(g, t) { K.bgFarm(g, g.T, { barn: true, barnX: -220 }); g.baby(0, G, 1.4, { armR: 1.5, hold: (c) => K.apple(c, 0, -10, 26), look: [0.8, 0], mood: t > 1 ? 'open' : 'smile', talk: t > 1 }); } },
      { d: 2.6, cap: 'Mr. *Goat!* Crunch crunch!', say: 'Mister Goat! Crunch, crunch!', sfx: [[0.2, 'baa'], [1.1, 'crunch'], [1.5, 'crunch']], cam: [[1.05, 0, 160], [1.15, 30, 160]],
        draw(g, t) {
          K.bgFarm(g, g.T, { barn: true, barnX: -260 });
          const give = ease.out(seg(t, 0.2, 0.8)), bites = Math.floor(seg(t, 1.0, 2.0) * 3);
          g.baby(-150, G, 1.25, { armR: lerp(0.4, 1.5, give), hold: t < 0.9 ? (c) => K.apple(c, 0, -10, 24) : null, mood: 'grin', happyEyes: t > 1 });
          K.critter(g.c, 150, G, 1.2, 'goat', { t: g.T, dir: -1, talk: t > 1, happyEyes: t > 1.8 });
          if (t >= 0.9 && bites < 3) K.apple(g.c, 150, G - 170, 22 * (1 - bites * 0.3));
        } },
      { d: 2.8, cap: 'Hello, *farm friends!*', say: 'Hello, farm friends!', sfx: [[0.2, 'moo'], [0.9, 'oink'], [1.5, 'baa'], [2.0, 'meow']], cam: [[1, 0, 140], [1.08, 0, 150]],
        draw(g, t) {
          K.bgFarm(g, g.T, { barn: true, barnX: 0 });
          const kinds = ['cow', 'goat', 'pig', 'sheep', 'cat'];
          kinds.forEach((k, i) => K.critter(g.c, (i - 2) * 124 * Math.min(1.6, g.hw / 360), G + (i % 2) * 40, 0.72, k, { t: g.T + i, seed: i, dance: 1.5, talk: Math.floor(t * 1.8) % 5 === i }));
        } },
    ],
  });

  // 3 ─ Count to Ten
  function countScene(nums, draw1, sfxType = 'pop') {
    return {
      d: 0.3 + nums.length * 0.9, says: nums.map((n, i) => [0.2 + i * 0.9, NUM[n].toLowerCase() + '!']), sfx: nums.map((n, i) => [0.2 + i * 0.9, sfxType]), cam: [[1, 0, 0], [1.04, 0, 0]],
      draw(g, t) {
        K.bgStudio(g, g.T, '#fff3a6', '#ffb347');
        const shown = nums.filter((n, i) => t >= 0.2 + i * 0.9);
        const cur = shown.length ? shown[shown.length - 1] : nums[0] - 1;
        if (cur > 0) {
          const local = t - (0.2 + (shown.length - 1) * 0.9);
          const a = ease.elastic(seg(local, 0, 0.6));
          g.c.save(); g.c.translate(0, -300); g.c.scale(a, a); K.text(g.c, String(cur), 0, 0, 260, { fill: RAINBOW[cur % 6], stroke: '#ffffff', sw: 30 }); g.c.restore();
          K.text(g.c, NUM[cur], 0, -130, 80, { fill: '#ffffff', stroke: '#2b1d4e', sw: 14 });
        }
        const pos = grid(Math.max(cur, 0), 5, 130, 150, 0, 150);
        pos.forEach(([x, y], i) => { const born = 0.2 + (i - (nums[0] - 1)) * 0.9; const a = i < nums[0] - 1 ? 1 : ease.back(seg(t, born, born + 0.35)); if (a > 0) { g.c.save(); g.c.translate(x, y); g.c.scale(a, a); draw1(g, i); g.c.restore(); } });
      },
    };
  }
  S.push({
    id: 'numbers', name: 'Count to Ten', tag: 'Learning', color: '#ffb347', song: 'oldman', thumbT: 6.5,
    desc: 'Big bouncy numbers 1–10 with things to count (different objects every time).',
    pick: (r, classic) => ({ objs: classic ? ['apple', 'balloon', 'star'] : r.sample(COUNT_OBJS, 3) }),
    build: (v) => [
      { d: 2.4, cap: "Let's count to *ten!*", say: "Let's count to ten!", sfx: [[0.2, 'whoosh']], cam: [[1.1, 0, 120], [1.2, 0, 130]],
        draw(g, t) { K.bgStudio(g, g.T, '#fff3a6', '#ffb347'); for (let i = 0; i < 5; i++) K.balloon(g.c, (i - 2) * 140, -70 - (i % 2) * 70 + Math.sin(g.T * 2 + i) * 10, 52, RAINBOW[i], { t: g.T, seed: i, label: i + 1 }); g.baby(0, G, 1.4, { armR: 2.5 + Math.sin(g.T * 9) * 0.3, mood: 'open', talk: true }); } },
      countScene([1, 2, 3], item(v.data.objs[0])),
      countScene([4, 5, 6], item(v.data.objs[1])),
      countScene([7, 8, 9], item(v.data.objs[2])),
      { d: 2.6, cap: '*TEN!* We did it!', say: 'Ten! We did it!', sfx: [[0.1, 'tada']], cam: [[1, 0, 0], [1.05, 0, 0]],
        draw(g, t) {
          K.bgStudio(g, g.T, '#fff3a6', '#ffb347');
          for (let i = 0; i < 10; i++) { const y = lerp(500, -200 - (i % 3) * 120, ease.out(seg(t, i * 0.05, 1.2 + i * 0.05))); K.balloon(g.c, (i - 4.5) * 74 * Math.min(1.6, g.hw / 360), y, 44, RAINBOW[i % 6], { t: g.T, seed: i, label: i + 1 }); }
          const a = ease.elastic(seg(t, 0.2, 0.9)); g.c.save(); g.c.translate(0, 180); g.c.scale(a, a); K.text(g.c, '10', 0, 0, 300, { fill: '#ff4d6d', stroke: '#fff', sw: 34 }); g.c.restore();
        } },
      { d: 2.2, cap: 'Great *counting!*', say: 'Yay! Great counting!', sfx: [[0.1, 'cheer']], cam: [[1.2, 0, 150], [1.3, 0, 150]],
        draw(g, t) { K.bgStudio(g, g.T, '#fff3a6', '#ffb347'); g.baby(0, G, 1.4, { jump: Math.abs(Math.sin(t * 6)) * 50, armL: 2.6, armR: 2.6, mood: 'grin', happyEyes: true }); K.confetti(g, t, 90, 4); } },
    ],
  });

  // 4 ─ Rainbow Colors
  function colorScene(word, col, light, drawObj, say) {
    return {
      d: 2.2, say, sfx: [[0.1, 'splash'], [0.5, 'pop']], cam: [[1, 0, 0], [1.06, 0, 20]],
      draw(g, t) {
        K.bgStudio(g, g.T, light, col);
        const a = ease.elastic(seg(t, 0, 0.5)); g.c.save(); g.c.scale(a, a); K.splat(g.c, 0, 80, 230, '#ffffff', word.length * 7); g.c.restore();
        const b = popIn(t, 0.3, 0.75); g.c.save(); g.c.translate(0, 80 + Math.sin(g.T * 5) * 10); g.c.scale(b, b); drawObj(g); g.c.restore();
        bigWord(g, word, t, col);
      },
    };
  }
  S.push({
    id: 'colors', name: 'Rainbow Colors', tag: 'Learning', color: '#ff6fa8', song: 'london', thumbT: 5.0,
    desc: 'Paint splashes reveal colourful things (different colours and objects every time).',
    pick: (r, classic) => classic
      ? { colors: [[0, 'apple'], [1, 'orange'], [2, 'duck'], [3, 'leaf'], [4, 'fishblue'], [5, 'grapes']] }
      : { colors: r.sample([0, 1, 2, 3, 4, 5, 6, 7], 6).sort((a, b) => a - b).map((i) => [i, r.pick(COLORS[i].items)]) },
    build: (v) => [
      { d: 2.4, cap: "Let's learn *colors!*", say: "Let's learn colors!", sfx: [[0.2, 'sparkle']], cam: [[1.1, 0, 100], [1.2, 0, 110]],
        draw(g, t) { K.bgStudio(g, g.T, '#fff6fb', '#ffc2dd'); rainbow(g.c, 0, -40, 300, 34, ease.out(seg(t, 0, 1.2))); g.baby(0, G, 1.35, { armR: 2.4 + Math.sin(g.T * 8) * 0.3, mood: 'open', talk: true }); } },
      ...v.data.colors.map(([ci, id]) => { const C = COLORS[ci], it = K.ITEMS[id]; return colorScene(C.word, C.col, C.light, (g) => K.drawItem(g.c, id, 0, 0, 1.05, g.T), `${C.word[0] + C.word.slice(1).toLowerCase()}! ${C.word[0] + C.word.slice(1).toLowerCase()} ${it.word.toLowerCase()}!`); }),
      { d: 2.6, cap: 'Rainbow *colors!*', say: 'Rainbow colors! Yay!', sfx: [[0.1, 'tada']], cam: [[1, 0, 60], [1.06, 0, 60]],
        draw(g, t) { K.bgStudio(g, g.T, '#fff6fb', '#ffc2dd'); rainbow(g.c, 0, -60, 340, 38, 1); g.baby(0, G, 1.3, { jump: Math.abs(Math.sin(t * 6)) * 40, armL: 2.6, armR: 2.6, mood: 'grin', happyEyes: true }); K.confetti(g, t, 70, 8); } },
    ],
  });

  // 5 ─ ABC Letters
  function letterScene(L, col, word, drawObj) {
    return {
      d: 2.2, cap: `*${L}* is for ${word}`, say: `${L} is for ${word.toLowerCase()}!`, sfx: [[0.1, 'boing'], [0.6, 'pop']], cam: [[1, 0, 0], [1.05, 0, 10]],
      draw(g, t) {
        K.bgStudio(g, g.T, '#e6f6ff', '#8fa8ff');
        const drop = ease.bounce(seg(t, 0, 0.6));
        block(g.c, 0, lerp(-900, -180, drop), 230, col, L, Math.sin(g.T * 2) * 0.05);
        const b = popIn(t, 0.45, 0.9); g.c.save(); g.c.translate(0, 230); g.c.scale(b, b); drawObj(g); g.c.restore();
      },
    };
  }
  S.push({
    id: 'abc', name: 'ABC Letters', tag: 'Learning', color: '#7f8cff', song: 'twinkle', thumbT: 3.4,
    desc: 'Toy blocks drop in with a word for each letter (a different run of letters every time).',
    pick: (r, classic) => { if (classic) return { letters: [['A', 'apple'], ['B', 'ball'], ['C', 'cat'], ['D', 'duck'], ['E', 'egg'], ['F', 'fish']] }; const st = r.int(0, 20); return { letters: LETTERS.slice(st, st + 6).map((L) => [L, r.pick(ABC[L])]) }; },
    build: (v) => [
      { d: 2.4, cap: `${v.data.letters.slice(0, 3).map((x) => x[0]).join(' ')} with *{name}!*`, say: `${v.data.letters.slice(0, 3).map((x) => x[0]).join(', ')}, with {name}!`, sfx: [[0.2, 'boing'], [0.5, 'boing'], [0.8, 'boing']], cam: [[1.05, 0, 60], [1.12, 0, 70]],
        draw(g, t) { K.bgStudio(g, g.T, '#e6f6ff', '#8fa8ff'); v.data.letters.slice(0, 3).map((x) => x[0]).forEach((L, i) => block(g.c, (i - 1) * 190, lerp(-900, -160, ease.bounce(seg(t, i * 0.25, i * 0.25 + 0.6))), 160, RAINBOW[i * 2], L, (i - 1) * 0.12)); g.baby(0, G, 1.3, { armR: 2.4 + Math.sin(g.T * 8) * 0.3, mood: 'open', talk: true }); } },
      ...v.data.letters.map(([L, id], i) => letterScene(L, RAINBOW[i], K.ITEMS[id].word, (g) => K.drawItem(g.c, id, 0, -10, 0.85, g.T))),
      { d: 2.4, cap: `Yay! *${v.data.letters.map((x) => x[0]).join(' ')}!*`, say: `Yay! ${v.data.letters.map((x) => x[0]).join(', ')}!`, sfx: [[0.1, 'tada']], cam: [[1, 0, 0], [1.04, 0, 0]],
        draw(g, t) { K.bgStudio(g, g.T, '#e6f6ff', '#8fa8ff'); v.data.letters.map((x) => x[0]).forEach((L, i) => block(g.c, ((i % 3) - 1) * 200, -260 + Math.floor(i / 3) * 210 - Math.abs(Math.sin(g.T * 5 + i)) * 30, 170, RAINBOW[i], L)); g.baby(0, G + 40, 1.0, { jump: Math.abs(Math.sin(t * 6)) * 40, armL: 2.6, armR: 2.6, mood: 'grin', happyEyes: true }); K.confetti(g, t, 60, 2); } },
    ],
  });

  // 6 ─ Shapes Party
  function shapeScene(kind, name, col, line) {
    return {
      d: 2.2, say: line, sfx: [[0.35, 'boing']], cam: [[1, 0, 0], [1.06, 0, 0]],
      draw(g, t) {
        K.bgStudio(g, g.T, '#e3fff0', '#3fcf9a');
        const fall = seg(t, 0, 0.45), y = lerp(-900, 60, ease.in(fall));
        const sq = t > 0.45 ? Math.exp(-(t - 0.45) * 6) * Math.sin((t - 0.45) * 22) * 0.25 : 0;
        K.shadow(g.c, 0, 300, 160 * (0.5 + fall * 0.5));
        K.shapeChar(g.c, kind, 0, y + Math.sin(g.T * 4) * 8, 170, col, { t: g.T, squash: sq, talk: t > 0.6 && t < 1.6 });
        bigWord(g, name.toUpperCase(), t - 0.2, col, -400, 130);
      },
    };
  }
  S.push({
    id: 'shapes', name: 'Shapes Party', tag: 'Learning', color: '#3fcf9a', song: 'happy', thumbT: 3.9,
    desc: 'Smiling circle, square, triangle, star and heart bounce in and dance.',
    pick: (r, classic) => { const base = [['circle', 'Circle', 'Circle! Round and round!'], ['square', 'Square', 'Square! Four sides!'], ['triangle', 'Triangle', 'Triangle! Three sides!'], ['star', 'Star', 'Star! Twinkle, twinkle!'], ['heart', 'Heart', 'Heart! I love you!']]; const cols = classic ? ['#ff4d4d', '#3b8cff', '#f5c400', '#ff9a1f', '#ff6fa8'] : r.shuffle(['#ff4d4d', '#3b8cff', '#f5c400', '#ff9a1f', '#ff6fa8', '#2fbf4a', '#9b4dde']); return { shapes: (classic ? base : r.shuffle(base)).map((b, i) => b.concat(cols[i])) }; },
    build: (v) => [
      { d: 2.4, cap: 'Shapes *party!*', say: "Let's meet the shapes!", sfx: [[0.2, 'sparkle']], cam: [[1.1, 0, 120], [1.18, 0, 130]],
        draw(g, t) { K.bgStudio(g, g.T, '#e3fff0', '#3fcf9a'); const kinds = ['circle', 'square', 'triangle', 'star', 'heart']; kinds.forEach((k, i) => { const a = g.T * 1.2 + (i / 5) * TAU; K.shapeChar(g.c, k, Math.cos(a) * 260, -140 + Math.sin(a) * 90, 56, RAINBOW[i], { t: g.T, seed: i }); }); g.baby(0, G, 1.35, { armR: 2.4 + Math.sin(g.T * 8) * 0.3, mood: 'open', talk: true }); } },
      ...v.data.shapes.map(([k, n, line, col]) => shapeScene(k, n, col, line)),
      { d: 2.6, cap: 'Dance, *shapes!*', say: 'Dance, shapes, dance!', sfx: [[0.1, 'tada']], cam: [[1, 0, 0], [1.05, 0, 0]],
        draw(g, t) { K.bgStudio(g, g.T, '#e3fff0', '#3fcf9a'); ['circle', 'square', 'triangle', 'star', 'heart'].forEach((k, i) => { const x = (i - 2) * 140, y = 40 - Math.abs(Math.sin(g.beat * Math.PI + i)) * 80; K.shapeChar(g.c, k, x, y, 62, RAINBOW[i], { t: g.T, seed: i, happy: true, squash: Math.sin(g.beat * TAU + i) * 0.08 }); }); g.baby(0, G, 1.0, { jump: Math.abs(Math.sin(g.beat * Math.PI)) * 30, armL: 1.6 + Math.sin(g.beat * Math.PI) * 1, armR: 1.6 - Math.sin(g.beat * Math.PI) * 1, mood: 'grin' }); K.confetti(g, t, 50, 6); } },
    ],
  });

  // 7 ─ Bedtime Lullaby
  S.push({
    id: 'lullaby', calm: true, name: 'Bedtime Lullaby', tag: 'Calm', color: '#5b6bd6', song: 'brahms', thumbT: 9.5,
    desc: 'Sleepy moon, twinkling stars, a yawn and a cozy crib with Teddy.',
    hero: { outfit: '#a9c8ff' },
    scenes: [
      { d: 2.8, cap: 'Goodnight, *moon*', say: 'Goodnight, moon.', sfx: [[0.3, 'sparkle']], trans: 'none', cam: [[1, 0, 0], [1.15, 0, -150]],
        draw(g, t) { K.bgNight(g, g.T, { moonY: -150, moonR: 150 }); } },
      { d: 2.8, cap: 'Twinkle, little *stars*', say: 'Twinkle, twinkle, little stars.', sfx: [[0.3, 'sparkle'], [1.4, 'sparkle']], cam: [[1.1, 0, -60], [1, 0, -40]],
        draw(g, t) { K.bgNight(g, g.T, { moonX: 230, moonY: -430, moonR: 70 }); for (let i = 0; i < 5; i++) K.star(g.c, (i - 2) * 140, -150 + Math.sin(g.T * 1.5 + i) * 40 + (i % 2) * 90, 58 + Math.sin(g.T * 3 + i) * 6, '#ffe46b', { face: true, t: g.T, seed: i, rot: Math.sin(g.T + i) * 0.2 }); } },
      { d: 2.8, cap: '{name} is *sleepy...*', say: '{name} is sleepy...', sfx: [[0.4, 'yawn']], cam: [[1.2, 0, 150], [1.35, 0, 130]],
        draw(g, t) { K.bgRoom(g, g.T, '#3b4a8f', '#6a5a8a', { window: true, night: true, windowX: 170, rug: '#9fb4ff' }); const y = seg(t, 0.3, 1.6); const yawn = Math.sin(y * Math.PI); g.baby(-40, G, 1.4, { mood: yawn > 0.2 ? 'o' : 'smile', closedEyes: yawn > 0.3, sleepy: true, armL: 0.25 + yawn * 2.4, armR: 0.25 + yawn * 2.4, nightcap: true, emblem: false }); } },
      { d: 3.0, cap: 'Hug Teddy... *night night*', say: 'Hug your teddy. Night, night.', cam: [[1.2, 0, 160], [1.3, 0, 170]],
        draw(g, t) { K.bgRoom(g, g.T, '#3b4a8f', '#6a5a8a', { window: true, night: true, windowX: -200, rug: false }); K.crib(g.c, 0, G + 60, 1, false); g.baby(-40, G - 130, 1.15, { noLegs: true, noShadow: true, closedEyes: true, mood: 'smile', armR: -0.6, nightcap: true, emblem: false, headTilt: -0.12 }); K.bear(g.c, 90, G - 140, 0.8, { t: g.T, happyEyes: true, armL: -0.4 }); K.rrect(g.c, -230, G - 160, 460, 200, 30); g.c.fillStyle = K.vgrad(g.c, G - 160, G + 40, '#ffd6e8', '#f7a8c8'); g.c.fill(); K.crib(g.c, 0, G + 60, 1, true); zzz(g, 160, 110, g.T); } },
      { d: 2.8, cap: 'Sweet *dreams!*', say: 'Sweet dreams.', sfx: [[0.3, 'sparkle']], cam: [[1.1, 0, -150], [1.3, 0, -150]],
        draw(g, t) { K.bgNight(g, g.T, { moonY: -150, moonR: 150, sleep: true }); zzz(g, 140, -260, g.T); } },
    ],
  });

  // 8 ─ Animal Sounds Quiz
  function quiz(kind, sound, name, sfx) {
    return [
      { d: 1.9, cap: `Who says *${sound}?*`, say: `Who says ${sound.toLowerCase()}?`, sfx: [[0.1, 'whoosh']], cam: [[1.1, 0, 180], [1.15, 0, 180]],
        draw(g, t) { K.bgFarm(g, g.T); silhouette(g.c, () => animalAny(g, kind, 0, G, 1.4, {})); const a = popIn(t, 0.2, 0.6); g.c.save(); g.c.translate(0, -60); g.c.rotate(Math.sin(g.T * 5) * 0.15); g.c.scale(a, a); K.text(g.c, '?', 0, 0, 220, { fill: '#ffe23d', stroke: '#2b1d4e', sw: 26 }); g.c.restore(); } },
      { d: 1.9, cap: `The *${name}* says ${sound}!`, say: `The ${name} says ${sound.toLowerCase()}!`, sfx: [[0.15, 'tada'], [0.4, sfx]], cam: [[1.15, 0, 180], [1.25, 0, 170]],
        draw(g, t) { K.bgFarm(g, g.T); animalAny(g, kind, 0, G, 1.4, { talk: t > 0.35 && t < 1.4, flap: true, happyEyes: t > 1.4 }); K.sparkles(g, g.T, 16, 3, [-300, -300, 600, 500]); } },
    ];
  }
  S.push({
    id: 'animals', name: 'Animal Sounds Quiz', tag: 'Quiz', color: '#e8463f', song: 'dell', thumbT: 2.5,
    desc: 'Guess the silhouette, then the animal reveals its sound (different animals every time).',
    pick: (r, classic) => ({ animals: classic ? ['cow', 'pig', 'sheep', 'hen'] : r.sample(QUIZ_ANIMALS, 4) }),
    build: (v) => [
      ...v.data.animals.flatMap((k) => { const it = K.ITEMS[k]; return quiz(k, it.sound, it.word.toLowerCase(), it.sfx); }),
      { d: 2.2, cap: 'Great *job!*', say: 'Great job, friends!', sfx: [[0.1, 'cheer']], cam: [[1, 0, 140], [1.05, 0, 140]],
        draw(g, t) { K.bgFarm(g, g.T, { barn: true, barnX: 0 }); ['cow', 'pig', 'sheep'].forEach((k, i) => K.critter(g.c, (i - 1) * 200, G - 20, 0.8, k, { t: g.T + i, seed: i, dance: 2, happyEyes: true })); g.baby(-60, G + 120, 0.9, { jump: Math.abs(Math.sin(t * 6)) * 30, armL: 2.6, armR: 2.6, mood: 'grin', happyEyes: true }); K.hen(g.c, 130, G + 120, 0.9, { t: g.T, flap: true, hop: true }); K.confetti(g, t, 70, 7); } },
    ],
  });

  // 9 ─ Bath Time
  function bathBase(g, babyO = {}, extra) {
    K.bgBath(g, g.T);
    K.tub(g.c, 0, G + 60, 1, false);
    g.baby(-30, G - 75, 1.25, Object.assign({ noLegs: true, noShadow: true, emblem: false, outfit: g.hero.skin }, babyO));
    if (extra) extra();
    K.duck(g.c, 170, G - 160 + Math.sin(g.T * 3) * 6, 1.1, { t: g.T, dir: -1 });
    K.tub(g.c, 0, G + 60, 1, true);
  }
  S.push({
    id: 'bath', indoor: true, name: 'Bath Time Bubbles', tag: 'Routine', color: '#3bc9ff', song: 'rowboat', thumbT: 4.2,
    desc: 'Bubbles, a squeaky duck, scrub-a-dub and a big splash.',
    scenes: [
      { d: 2.4, cap: 'Bath time for *{name}!*', say: 'Bath time for {name}!', sfx: [[0.2, 'splash']], cam: [[1.1, 0, 120], [1.2, 0, 120]],
        draw(g, t) { bathBase(g, { armR: 2.4 + Math.sin(g.T * 8) * 0.3, mood: 'open', talk: true }); K.risingBubbles(g, g.T, 10, 1, -300, 600); } },
      { d: 2.2, cap: 'Quack quack, *ducky!*', say: 'Quack, quack, ducky!', sfx: [[0.3, 'quack'], [1.2, 'quack']], cam: [[2.0, 190, 225], [2.2, 195, 220]],
        draw(g, t) { bathBase(g, { look: [1, 0.3], mood: 'grin' }); } },
      { d: 2.4, cap: 'Pop! Pop! *Pop!*', say: 'Pop! Pop! Pop!', sfx: [[0.5, 'pop'], [1.0, 'pop'], [1.5, 'pop']], cam: [[1.1, 0, 60], [1.15, 0, 60]],
        draw(g, t) {
          bathBase(g, { armR: 2.2 + Math.sin(t * 12) * 0.4, armL: 2.0, mood: 'grin', look: [0.4, -1] });
          [[180, -150, 0.5], [-200, -260, 1.0], [60, -360, 1.5]].forEach(([x, y, tp]) => { if (t < tp) K.bubble(g.c, x, y + Math.sin(g.T * 2 + x) * 10, 70); else if (t < tp + 0.25) { const k = seg(t, tp, tp + 0.25); g.c.globalAlpha = 1 - k; K.starPath(g.c, x, y, 50 + k * 60, 0, 8, 0.4); g.c.fillStyle = '#ffffff'; g.c.fill(); g.c.globalAlpha = 1; } });
          K.risingBubbles(g, g.T, 12, 2, -300, 600);
        } },
      { d: 2.2, cap: '*Scrub-a-dub-dub!*', say: 'Scrub a dub dub!', sfx: [[0.2, 'bubble'], [1.0, 'bubble']], cam: [[1.6, -30, 60], [1.7, -30, 60]],
        draw(g, t) { bathBase(g, { foam: true, armL: 2.7 + Math.sin(g.T * 14) * 0.25, armR: 2.7 + Math.cos(g.T * 14) * 0.25, mood: 'grin', happyEyes: true }); } },
      { d: 2.0, cap: '*Splash!*', say: 'Splash!', sfx: [[0.15, 'splash']], cam: [[1.1, 0, 100], [1.0, 0, 80]],
        draw(g, t) {
          bathBase(g, { armL: 2.4, armR: 2.4, mood: 'grin', happyEyes: true, jump: Math.abs(Math.sin(t * 7)) * 10 }, null);
          for (let i = 0; i < 40; i++) { const tt = t - 0.1 - rnd(i) * 0.3; if (tt < 0) continue; const vx = (rnd(i * 3) - 0.5) * 900, vy = -700 - rnd(i * 5) * 600; const x = vx * tt, y = 180 + vy * tt + 1400 * tt * tt; if (y > 300) continue; K.oval(g.c, x, y, 11, 15); g.c.fillStyle = 'rgba(120,210,255,.85)'; g.c.fill(); }
        } },
      { d: 2.4, cap: 'All clean! *Sparkly!*', say: 'All clean! Sparkly!', sfx: [[0.2, 'sparkle'], [0.6, 'ding']], cam: [[1.15, 0, 160], [1.25, 0, 150]],
        draw(g, t) { K.bgBath(g, g.T); K.oval(g.c, 0, G + 10, 200, 40); g.c.fillStyle = '#ffb3cf'; g.c.fill(); g.baby(0, G, 1.4, { outfit: '#ffffff', emblem: false, mood: 'grin', happyEyes: true, armL: 2.5, armR: 2.5, jump: Math.abs(Math.sin(t * 5)) * 20 }); K.sparkles(g, g.T, 22, 4, [-320, -400, 640, 700]); } },
    ],
  });

  // 10 ─ Dance Party
  function dancer(g, t, o = {}) {
    const b = g.beat * Math.PI;
    return Object.assign({ jump: Math.abs(Math.sin(b)) * 26, armL: 1.4 + Math.sin(b) * 1.2, armR: 1.4 - Math.sin(b) * 1.2, tilt: Math.sin(b) * 0.08, mood: 'grin' }, o);
  }
  S.push({
    id: 'dance', indoor: true, name: 'Dance Party', tag: 'Music', color: '#b26bff', song: 'dance', thumbT: 1.2,
    desc: 'Disco lights, beat-synced moves, claps, jumps and spins.',
    scenes: [
      { d: 2.2, cap: "It's a *dance party!*", say: "It's a dance party!", sfx: [[0.1, 'whoosh']], cam: [[1.2, 0, 140], [1.3, 0, 140]],
        draw(g, t) { K.bgDisco(g, g.T, g.beat); g.baby(0, G, 1.4, dancer(g, t, { hat: true })); } },
      { d: 2.0, cap: 'Teddy *spins!*', say: 'Teddy spins!', sfx: [[0.2, 'whoosh']], cam: [[1.2, 0, 150], [1.25, 0, 150]],
        draw(g, t) { K.bgDisco(g, g.T, g.beat); g.c.save(); g.c.translate(0, G); g.c.scale(Math.cos(t * 7), 1); K.bear(g.c, 0, 0, 1.4, { t: g.T, armL: 2.6, armR: 2.6, mood: 'open', happyEyes: true, hat: true }); g.c.restore(); } },
      { d: 2.0, cap: 'Everybody *dance!*', say: 'Everybody dance!', cam: [[1, 0, 150], [1.05, 0, 150]],
        draw(g, t) { K.bgDisco(g, g.T, g.beat); ['pig', 'cow', 'cat', 'sheep'].forEach((k, i) => K.critter(g.c, (i - 1.5) * 170, G + (i % 2) * 30, 0.8, k, { t: g.T, seed: i, dance: 124 / 60, lean: Math.sin(g.beat * Math.PI + i) * 0.12, happyEyes: true })); } },
      { d: 2.0, cap: 'Clap, clap, *clap!*', say: 'Clap, clap, clap!', sfx: [[0.24, 'clap'], [0.72, 'clap'], [1.21, 'clap'], [1.69, 'clap']], cam: [[1.4, 0, 120], [1.45, 0, 120]],
        draw(g, t) { K.bgDisco(g, g.T, g.beat); const cl = Math.abs(Math.sin(g.beat * Math.PI)); g.baby(0, G, 1.4, { armL: -0.45 - cl * 0.5, armR: -0.45 - cl * 0.5, mood: 'grin', happyEyes: cl > 0.8, hat: true }); } },
      { d: 2.0, cap: 'Jump, jump, *jump!*', say: 'Jump! Jump! Jump!', sfx: [[0.3, 'boing'], [1.2, 'boing']], cam: [[1, 0, 120], [1.05, 0, 120]],
        draw(g, t) { K.bgDisco(g, g.T, g.beat); const j = Math.abs(Math.sin(g.beat * Math.PI)) * 90; g.baby(-130, G, 1.15, { jump: j, armL: 2.6, armR: 2.6, mood: 'grin', hat: true }); K.bear(g.c, 140, G, 1.1, { t: g.T, jump: Math.abs(Math.sin(g.beat * Math.PI + 1)) * 90, armL: 2.6, armR: 2.6, mood: 'open', hat: true }); } },
      { d: 2.0, cap: 'Spin *around!*', say: 'Spin around!', sfx: [[0.2, 'whoosh']], cam: [[1.3, 0, 140], [1.35, 0, 140]],
        draw(g, t) { K.bgDisco(g, g.T, g.beat); g.c.save(); g.c.translate(0, G); g.c.scale(Math.cos(t * 8), 1); g.baby(0, 0, 1.4, { armL: 1.5, armR: 1.5, mood: 'grin', happyEyes: true, hat: true }); g.c.restore(); } },
      { d: 2.4, cap: '*Yeah!* Dance party!', say: 'Yeah!', sfx: [[0.1, 'tada'], [0.3, 'cheer']], cam: [[1.15, 0, 120], [1.2, 0, 120]],
        draw(g, t) { K.bgDisco(g, g.T, g.beat); g.baby(-110, G, 1.2, { armL: 2.8, armR: 0.9, mood: 'grin', happyEyes: true, hat: true, tilt: -0.1 }); K.bear(g.c, 130, G, 1.15, { t: g.T, armL: 0.9, armR: 2.8, happyEyes: true, mood: 'open', hat: true }); K.confetti(g, t, 100, 3); } },
    ],
  });

  // 11 ─ Under the Sea
  S.push({
    id: 'sea', name: 'Under the Sea', tag: 'Explore', color: '#1e90ff', song: 'jacques', thumbT: 5.2,
    desc: 'Fish family, a waving octopus, a sidestepping crab and a treasure chest.',
    scenes: [
      { d: 2.4, cap: "Let's go *under the sea!*", say: "Let's go under the sea!", sfx: [[0.1, 'splash'], [0.6, 'bubble']], cam: [[1, 0, 0], [1.06, 0, 20]],
        draw(g, t) { K.bgSea(g, g.T); [['#ff7a3d', -100, 0.9, 260], ['#ffd23f', 120, 0.7, 340], ['#ff6fa8', 260, 1.1, 200]].forEach(([col, y, s, sp], i) => { const span = g.hw * 2 + 400; const x = ((t * sp + i * 300) % span) - span / 2; K.fish(g.c, x, y, s, col, { t: g.T, seed: i }); }); } },
      { d: 2.2, cap: 'Blub blub, *fishies!*', say: 'Blub, blub, fishies!', sfx: [[0.3, 'bubble'], [1.2, 'bubble']], cam: [[1.1, 0, 60], [1.2, 0, 60]],
        draw(g, t) { K.bgSea(g, g.T); K.fish(g.c, 0, 40, 2.0, '#ff7a3d', { t: g.T }); K.fish(g.c, -170, -150, 1.0, '#ffd23f', { t: g.T, seed: 2 }); K.fish(g.c, 180, -200, 0.9, '#ff6fa8', { t: g.T, seed: 4, dir: -1 }); K.risingBubbles(g, g.T, 10, 9, 60, 80); } },
      { d: 2.2, cap: 'Hi, *Octopus!*', say: 'Hi, Octopus!', sfx: [[0.3, 'boing']], cam: [[1.15, 0, 80], [1.25, 0, 80]],
        draw(g, t) { K.bgSea(g, g.T); K.octopus(g.c, 0, 200, 1.6, { t: g.T, wave: true, talk: t > 0.3 && t < 1.3 }); } },
      { d: 2.2, cap: 'Click clack, *crab!*', say: 'Click, clack, crab!', sfx: [[0.3, 'click'], [0.6, 'click'], [1.2, 'click'], [1.5, 'click']], cam: [[1.4, 0, 280], [1.45, 0, 280]],
        draw(g, t) { K.bgSea(g, g.T); K.crab(g.c, Math.sin(t * 3) * 110, G + 20, 1.5, { t: g.T }); } },
      { d: 2.4, cap: 'Wow! *Treasure!*', say: 'Wow! Treasure!', sfx: [[0.5, 'ding'], [0.6, 'sparkle']], cam: [[1.4, 0, 260], [1.3, 0, 230]],
        draw(g, t) { K.bgSea(g, g.T); K.chest(g.c, 0, G + 40, 1.4, ease.back(seg(t, 0.4, 1.2)), g.T); if (t > 0.6) K.sparkles(g, g.T, 20, 5, [-240, -100, 480, 380]); K.fish(g.c, 220, 0, 0.8, '#ffd23f', { t: g.T, dir: -1 }); } },
      { d: 2.6, cap: 'Bye bye, *sea friends!*', say: 'Bye bye, sea friends!', sfx: [[0.2, 'bubble']], cam: [[1.1, 0, 60], [1.15, 30, 60]],
        draw(g, t) { K.bgSea(g, g.T); K.submarine(g.c, lerp(-60, 60, t / 2.6), 160, 1.35, g.T, (c) => { c.save(); c.translate(0, -34); c.scale(0.62, 0.62); K.babyHead(c, 0, 0, Object.assign({ t: g.T }, g.hero, { mood: 'grin', happyEyes: true })); c.restore(); }); K.fish(g.c, -220, -220, 0.8, '#ff6fa8', { t: g.T }); K.octopus(g.c, 230, -120, 0.6, { t: g.T, wave: true }); K.risingBubbles(g, g.T, 8, 11, -300, 120); } },
    ],
  });

  // 12 ─ Birthday Surprise
  S.push({
    id: 'birthday', indoor: true, name: 'Birthday Surprise', tag: 'Celebration', color: '#ff4d6d', song: 'birthday', thumbT: 6.6,
    desc: 'Party hats, friends arrive, make a wish, blow the candles, open presents.',
    scenes: [
      { d: 2.4, cap: "It's {name}'s *birthday!*", say: "It's {name}'s birthday!", sfx: [[0.1, 'tada']], cam: [[1.2, 0, 150], [1.3, 0, 140]],
        draw(g, t) { K.bgParty(g, g.T); g.baby(0, G, 1.4, { hat: true, armR: 2.4 + Math.sin(g.T * 9) * 0.3, armL: 0.3, mood: 'grin', talk: true }); } },
      { d: 2.4, cap: 'Friends are *here!*', say: 'Friends are here!', sfx: [[0.3, 'whoosh'], [1.0, 'meow']], cam: [[1, 0, 120], [1.05, 0, 120]],
        draw(g, t) { K.bgParty(g, g.T); const k = ease.out(seg(t, 0, 1.2)); K.bear(g.c, lerp(-g.hw - 150, -190, k), G, 1.0, { t: g.T, walk: k < 1 ? g.T * 2 : null, hat: true, armL: k >= 1 ? 2.4 : 0.3, happyEyes: k >= 1 }); K.critter(g.c, lerp(g.hw + 150, 200, k), G, 0.85, 'cat', { t: g.T, hat: true, happyEyes: k >= 1, talk: t > 1 && t < 1.6 }); g.baby(0, G + 30, 1.1, { hat: true, mood: 'grin', armL: 2.4, armR: 2.4, jump: k >= 1 ? Math.abs(Math.sin(t * 6)) * 30 : 0 }); } },
      { d: 2.2, cap: 'Make a *wish...*', say: 'Make a wish...', sfx: [[0.2, 'sparkle']], cam: [[1.2, 0, 160], [1.4, 0, 120]],
        draw(g, t) { K.bgParty(g, g.T); K.rrect(g.c, -g.hw * 2, G + 20, g.hw * 4, 400, 0); g.c.fillStyle = '#fff6f9'; g.c.fill(); K.cake(g.c, 0, G + 40, 1.3, { t: g.T, candles: 3 }); K.sparkles(g, g.T, 12, 6, [-240, -200, 480, 300]); } },
      { d: 2.2, cap: '*Whoooo!*', say: 'Whooooo!', sfx: [[0.3, 'blow']], cam: [[1.1, 0, 150], [1.12, 0, 150]],
        draw(g, t) { K.bgParty(g, g.T); const blow = t > 0.25 && t < 1.1, out = t > 0.9; g.baby(-180, G + 10, 1.3, { hat: true, mood: blow ? 'puff' : 'grin', happyEyes: out, armL: 0.3, armR: 0.3 }); K.rrect(g.c, -g.hw * 2, G - 10, g.hw * 4, 400, 0); g.c.fillStyle = '#fff6f9'; g.c.fill(); K.cake(g.c, 130, G + 40, 1.0, { t: g.T, candles: 3, lit: !out, smoke: out ? t - 0.9 : 0 }); if (blow) for (let i = 0; i < 5; i++) { const sp = (t * 2 + i / 5) % 1; g.c.strokeStyle = `rgba(160,210,255,${0.8 * (1 - sp)})`; g.c.lineWidth = 6; g.c.beginPath(); g.c.moveTo(-100 + sp * 160, 150 + i * 14); g.c.lineTo(-60 + sp * 160, 150 + i * 14); g.c.stroke(); } } },
      { d: 2.4, cap: 'Happy *birthday!*', say: 'Happy birthday!', sfx: [[0.1, 'cheer'], [0.2, 'tada']], cam: [[1.05, 0, 120], [1.1, 0, 120]],
        draw(g, t) { K.bgParty(g, g.T); K.bear(g.c, -200, G, 0.95, { t: g.T, hat: true, jump: Math.abs(Math.sin(t * 6 + 1)) * 40, armL: 2.6, armR: 2.6, happyEyes: true, mood: 'open' }); K.critter(g.c, 200, G, 0.8, 'cat', { t: g.T, hat: true, jump: Math.abs(Math.sin(t * 6 + 2)) * 40, happyEyes: true }); g.baby(0, G + 40, 1.2, { hat: true, jump: Math.abs(Math.sin(t * 6)) * 50, armL: 2.6, armR: 2.6, mood: 'grin', happyEyes: true }); K.confetti(g, t, 110, 12); } },
      { d: 2.4, cap: '*Presents!* Yay!', say: 'Presents! Yay!', sfx: [[0.4, 'pop'], [0.9, 'pop'], [1.4, 'pop'], [1.5, 'sparkle']], cam: [[1.2, 0, 220], [1.25, 0, 220]],
        draw(g, t) { K.bgParty(g, g.T); [['#ff4d6d', -200, 0.4], ['#3b9cff', 0, 0.9], ['#7bd88f', 200, 1.4]].forEach(([col, x, tp]) => { const lid = ease.out(seg(t, tp, tp + 0.3)) * 80; if (lid > 0) { K.star(g.c, x, G - 150 - lid * 0.6, 40 * Math.min(1, lid / 80), '#ffd23f', { rot: g.T }); } K.present(g.c, x, G + 60, 160, col, '#fff3a6', lid); }); if (t > 1.4) K.sparkles(g, g.T, 16, 2, [-320, -150, 640, 400]); } },
    ],
  });

  // Optional outro appended to every style.
  K.OUTRO = {
    d: 2.4, cap: 'Subscribe to *{channel}!*', say: 'See you next time!', sfx: [[0.2, 'ding'], [1.0, 'sparkle']], cam: [[1, 0, 60], [1.05, 0, 60]],
    draw(g, t) {
      K.bgStudio(g, g.T, '#ffe0ef', '#ff7aa8');
      const a = ease.elastic(seg(t, 0.1, 0.8)), c = g.c;
      c.save(); c.translate(0, -140); c.scale(a * (1 + Math.sin(g.T * 8) * 0.03), a);
      K.rrect(c, -230, -70, 460, 140, 70); c.fillStyle = K.vgrad(c, -70, 70, '#ff4d4d', '#d81f2a'); c.fill();
      K.text(c, 'SUBSCRIBE', 0, 4, 66, { fill: '#ffffff', stroke: '#9b0f18', sw: 8 });
      c.restore();
      g.baby(-120, G, 1.1, { armR: 2.4 + Math.sin(g.T * 9) * 0.35, mood: 'grin' });
      K.bear(c, 130, G, 1.05, { t: g.T, armL: 2.4 + Math.sin(g.T * 9 + 1) * 0.35, mood: 'open', happyEyes: true });
    },
  };

  K.STYLES = S;
})();
