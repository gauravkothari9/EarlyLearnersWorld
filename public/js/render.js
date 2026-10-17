/* Variants (seeds), timeline + frame renderer shared by the preview player and the exporter.
   seed 0 = the "classic" version of a style. Any other seed gives a different hero look, sky,
   music key/tempo/instrument, highlight colour and — for styles with a `pick` — different content.
   Every variant has a fingerprint (v.fp) used to make sure published videos never repeat. */
(function () {
  const K = window.KS;

  // Leo: the one teacher character who hosts every video. His look never changes between videos.
  K.HOST = 'Leo';
  const DEFAULT_HERO = { skin: '#ffd3b4', outfit: '#3b8cff', hair: '#c0602a', hairStyle: 'curly' };
  const HERO_LOOKS = [
    { hairStyle: 'tuft', hair: '#8b5a3c' }, { hairStyle: 'curly', hair: '#f2c14e' }, { hairStyle: 'short', hair: '#3b2a20' },
    { hairStyle: 'pigtails', hair: '#6b3e26' }, { hairStyle: 'pigtails', hair: '#f2c14e' }, { hairStyle: 'curly', hair: '#2b1d14' },
    { hairStyle: 'short', hair: '#c0602a' }, { hairStyle: 'tuft', hair: '#2b1d14' },
  ];
  const OUTFITS = ['#ffe34f', '#6ec6ff', '#ff8fb1', '#7bd88f', '#b98bff', '#ff9a4d', '#ff5a5a', '#4dd0c4'];
  const SKINS = ['#ffd3b4', '#f1b98c', '#c98b5e', '#8d5a3b'];
  const HILITES = ['#ffe23d', '#7cf0ff', '#ff9ad5', '#a6ff7a', '#ffb84d'];
  K.NAMES = [K.HOST];
  // Lessons = styles that teach something (shapes, counting, colours, animals, birds, letters...).
  // Story and Baby styles are left out of random/autopilot picks by default.
  K.isLesson = (s) => !['Story', 'Baby'].includes(s.tag);

  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  K.hashStr = hashStr;
  K.rng = function (seed) {
    let a = seed >>> 0 || 1;
    const f = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const shuffle = (arr) => { const b = arr.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
    return { f, int: (lo, hi) => lo + Math.floor(f() * (hi - lo + 1)), pick: (arr) => arr[Math.floor(f() * arr.length)], shuffle, sample: (arr, n) => shuffle(arr).slice(0, n) };
  };

  const vcache = new Map();
  K.variant = function (style, seed) {
    seed = Math.abs(seed | 0);
    const key = style.id + '#' + seed;
    if (vcache.has(key)) return vcache.get(key);
    let v;
    if (!seed) {
      v = { seed: 0, classic: true, sky: 'day', hi: '#ffe23d', music: { shift: 0, tempo: 1, inst: null }, hero: null, ids: null };
      v.data = style.pick ? style.pick(K.rng(hashStr(style.id)), true) : null;
    } else {
      const r = K.rng(hashStr(style.id) ^ Math.imul(seed, 2654435761));
      const ids = [r.int(0, HERO_LOOKS.length - 1), r.int(0, OUTFITS.length - 1), r.int(0, SKINS.length - 1)];
      v = {
        seed, ids,
        sky: style.indoor ? 'day' : r.pick(['day', 'day', 'sunset', 'morning']),
        hi: r.pick(HILITES),
        music: { shift: r.int(-2, 3), tempo: +(0.94 + r.f() * 0.14).toFixed(3), inst: style.calm ? null : r.pick([null, 'bell', 'toy', 'pluck']) },
        hero: null, // Leo always looks the same
      };
      if (style.songs) v.song = r.pick(style.songs);
      v.data = style.pick ? style.pick(r, false) : null;
    }
    v.scenes = teach(style.build ? style.build(v) : style.scenes);
    v.fp = style.id + ':' + hashStr(JSON.stringify([v.data, v.ids, v.sky, v.music, v.song || null])).toString(36);
    vcache.set(key, v);
    if (vcache.size > 400) vcache.delete(vcache.keys().next().value);
    return v;
  };
  // Leo greets the kids at the start and wraps up the lesson at the end of every video.
  function teach(scenes) {
    if (!scenes || !scenes.length) return scenes;
    const out = scenes.slice(), first = out[0], last = out[out.length - 1];
    const hi = 'Hi friends! I am {name}!';
    if (first.say) out[0] = Object.assign({}, first, { say: `${hi} ${first.say}` });
    else if (first.says && first.says.length) out[0] = Object.assign({}, first, { says: [[first.says[0][0], `${hi} ${first.says[0][1]}`]].concat(first.says.slice(1)) });
    else out[0] = Object.assign({}, first, { say: hi });
    if (out.length > 1 && last.say && !last.says) out[out.length - 1] = Object.assign({}, last, { say: `${last.say} Learning is fun with {name}!` });
    return out;
  }
  K.songOf = (style, opts = {}) => K.variant(style, opts.seed).song || style.song;

  K.fmt = (s, o) => (s ? s.replace(/\{name\}/g, o.name || K.HOST).replace(/\{channel\}/g, o.channel || 'EarlyLearnersWorld') : s);

  K.timeline = function (style, opts = {}) {
    const v = K.variant(style, opts.seed);
    const scenes = v.scenes.slice();
    if (opts.outro && K.OUTRO) scenes.push(K.OUTRO);
    // opts.voiceDur = { "spoken text": seconds }. Scenes stretch so their narration fits.
    const vd = opts.narration !== false && opts.voiceDur;
    let t = 0;
    const list = scenes.map((s, i) => {
      let d = s.d;
      if (vd) {
        const cues = [];
        if (s.say) cues.push([0.12, K.fmt(s.say, opts)]);
        for (const [tt, txt] of s.says || []) cues.push([tt, K.fmt(txt, opts)]);
        for (const [off, txt] of cues) if (vd[txt]) d = Math.max(d, off + vd[txt] + 0.6);
      }
      const o = Object.assign({}, s, { d, start: t, index: i }); t += d; return o;
    });
    return { scenes: list, total: t, v };
  };

  K.voiceLines = function (style, opts = {}) {
    const out = [];
    for (const s of K.timeline(style, opts).scenes) {
      if (s.say) out.push({ t: s.start + 0.12, text: K.fmt(s.say, opts) });
      if (s.says) for (const [tt, txt] of s.says) out.push({ t: s.start + tt, text: K.fmt(txt, opts) });
    }
    return out;
  };

  K.sfxEvents = function (style, opts = {}) {
    const out = [];
    for (const s of K.timeline(style, opts).scenes) for (const [tt, type] of s.sfx || []) out.push({ t: s.start + tt, type });
    return out;
  };

  K.heroFor = function (style, opts = {}, v) {
    const h = Object.assign({}, DEFAULT_HERO);
    if (opts.skin) h.skin = opts.skin;
    if (opts.outfit) h.outfit = opts.outfit;
    if (opts.hair) h.hair = opts.hair;
    if (opts.hairStyle) h.hairStyle = opts.hairStyle;
    return h;
  };

  function talking(sc, t, opts) {
    const cues = [];
    if (sc.say) cues.push([0.12, K.fmt(sc.say, opts)]);
    for (const [tt, txt] of sc.says || []) cues.push([tt, K.fmt(txt, opts)]);
    const vd = opts.voiceDur || {};
    return cues.some(([at, txt]) => t >= at && t <= at + (vd[txt] || txt.split(/s+/).length * 0.38));
  }
  function drawHost(g, sc, t, opts) {
    const c = g.c, x = -g.hw + 120, y = g.hh - 30;
    const inn = K.ease.back(K.seg(t, 0, 0.35)), talk = talking(sc, t, opts);
    c.save(); c.translate(x, y); c.scale(inn, inn);
    g.baby(0, 0, 0.7, { armR: talk ? 2.2 + Math.sin(g.T * 7) * 0.35 : 1.0, mood: talk ? 'open' : 'smile', talk, look: [0.4, 0] });
    c.restore();
  }

  K.renderFrame = function (c, W, H, style, time, opts = {}) {
    const tl = opts._tl || K.timeline(style, opts);
    const v = tl.v || K.variant(style, opts.seed);
    const S = Math.min(W, (H * 9) / 16) / 720;
    let sc = tl.scenes[tl.scenes.length - 1];
    for (const s of tl.scenes) if (time < s.start + s.d) { sc = s; break; }
    const t = Math.max(0, time - sc.start), p = K.clamp(t / sc.d, 0, 1);

    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.translate(W / 2, H / 2); c.scale(S, S);
    const hero = K.heroFor(style, opts, v);
    const song = K.SONGS && K.SONGS[v.song || style.song];
    const g = {
      c, hw: W / 2 / S, hh: H / 2 / S, T: time, opts, hero, style, v,
      beat: (time * ((song && song.bpm) || 120) * (v.music.tempo || 1)) / 60,
    };
    g.baby = (x, y, s, o = {}) => { g.hostShown = true; K.baby(c, x, y, s, Object.assign({ t: time }, hero, o)); };
    g.babyHead = (x, y, o = {}) => K.babyHead(c, x, y, Object.assign({ t: time }, hero, o));

    // camera
    const cam = sc.cam || [[1, 0, 0], [1.05, 0, 0]];
    const ce = K.ease.inOut(p);
    const z = K.lerp(cam[0][0], cam[1][0], ce), fx = K.lerp(cam[0][1], cam[1][1], ce), fy = K.lerp(cam[0][2], cam[1][2], ce);
    const k = K.seg(t, 0, 0.22);
    const punch = sc.index > 0 && sc.trans !== 'none' ? 1 + 0.07 * (1 - K.ease.out(k)) : 1;
    c.save();
    c.scale(z * punch, z * punch); c.translate(-fx, -fy);
    sc.draw(g, t, p);
    c.restore();
    // Leo stays on screen as the teacher: when a scene doesn't show him, he presents from the corner.
    if (!g.hostShown && opts.host !== false) drawHost(g, sc, t, opts);

    if (sc.index > 0 && sc.trans !== 'none' && k < 1) { c.fillStyle = `rgba(255,255,255,${0.5 * (1 - k)})`; c.fillRect(-g.hw, -g.hh, g.hw * 2, g.hh * 2); }
    if (opts.captions !== false && sc.cap) K.caption(g, K.fmt(sc.cap, opts), t, { y: sc.capY });
    if (opts.watermark !== false) {
      c.save(); c.globalAlpha = 0.75;
      K.text(c, opts.channel || 'EarlyLearnersWorld', g.hw - 28, g.hh - 48, 30, { align: 'right', sw: 6, shadow: false });
      c.restore();
    }
    // fade in / out
    const fadeIn = K.seg(time, 0, 0.25), fadeOut = K.seg(tl.total - time, 0, 0.35);
    const fade = Math.min(fadeIn, fadeOut);
    if (fade < 1) { c.fillStyle = `rgba(0,0,0,${1 - fade})`; c.fillRect(-g.hw, -g.hh, g.hw * 2, g.hh * 2); }
    c.restore();
  };
})();
