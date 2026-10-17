/* Styles 53+: extra learning lessons that Leo teaches (birds, colours, counting).
   Built from the kits in styles2.js (K.KIT). */
(function () {
  const K = window.KS;
  const { seg, ease } = K;
  const { intro, cheer, flashStyle, quizStyle, B, studio, RB, NUM, cap1, pl, lc, popIn } = K.KIT;
  const S = [];

  // Extra birds (same bird drawing, different colours).
  for (const [id, word, col, sound] of [['parrot', 'Parrot', '#2fbf4a', 'SQUAWK'], ['robin', 'Robin', '#c0602a', 'CHIRP'], ['bluebird', 'Bluebird', '#3b8cff', 'TWEET'], ['canary', 'Canary', '#ffd23f', 'TRILL'], ['flamingo', 'Flamingo', '#ff8fc4', 'WAK WAK']])
    K.ITEMS[id] = { id, word, sound, sfx: 'tweet', draw: (c, t) => K.bird(c, 0, 0, 2.0, { t, fly: true, color: col }) };

  const BIRDFACT = {
    parrot: 'Parrots can learn to talk!', robin: 'Robins sing in the morning!', bluebird: 'Bluebirds eat little bugs!', canary: 'Canaries sing pretty songs!',
    flamingo: 'Flamingos can stand on one leg!', owl: 'Owls stay awake at night!', penguin: 'Penguins swim, but they cannot fly!', duck: 'Ducks love to swim!',
    hen: 'Hens lay eggs!', chick: 'Chicks hatch from eggs!', bird: 'Birds have feathers and wings!',
  };
  const BIRDS = Object.keys(BIRDFACT);

  // 53 Beautiful Birds
  S.push(flashStyle({ id: 'birds', name: 'Beautiful Birds', tag: 'Animals', color: '#4fb7ff', song: 'mary', desc: 'Bird names, sounds and a fun fact for each bird.',
    pool: BIRDS, n: 5, bg: B.park, sound: true,
    titleCap: "Let's learn *birds!*", titleSay: "Let's learn about birds!",
    say: (it) => `${it.word}! The ${lc(it.word)} says ${lc(it.sound)}! ${BIRDFACT[it.id]}`,
    card: (it) => ({ d: 3.6, y: it.animal ? 120 : 40 }),
    endCap: 'Birds are *awesome!*', endSay: 'Bye bye, birds!' }));

  // 54 Guess the Bird
  S.push(quizStyle({ id: 'birdquiz', name: 'Guess the Bird', color: '#2fbf4a', song: 'dell', desc: 'Guess the bird from its shadow and sound.', bg: B.park,
    pool: BIRDS.filter((b) => b !== 'bird'), q: () => 'Guess the *bird!*', qs: (it) => `Guess the bird! It says ${lc(it.sound)}!` }));

  // 55 What Color Is It?
  const COLOROF = {
    apple: ['Red', '#ff3b3b'], strawberry: ['Red', '#ff3b3b'], cherries: ['Red', '#ff3b3b'], tomato: ['Red', '#ff3b3b'],
    banana: ['Yellow', '#f5c400'], lemon: ['Yellow', '#f5c400'], sun: ['Yellow', '#f5c400'], canary: ['Yellow', '#f5c400'],
    orange: ['Orange', '#ff9a1f'], carrot: ['Orange', '#ff9a1f'], pumpkin: ['Orange', '#ff9a1f'],
    broccoli: ['Green', '#2fbf4a'], pear: ['Green', '#2fbf4a'], frog: ['Green', '#2fbf4a'], parrot: ['Green', '#2fbf4a'],
    grapes: ['Purple', '#9b4dde'], bluebird: ['Blue', '#3b8cff'], fishblue: ['Blue', '#3b8cff'], heart: ['Pink', '#ff6fa8'], flamingo: ['Pink', '#ff6fa8'],
  };
  S.push(flashStyle({ id: 'colorquiz', name: 'What Color Is It?', tag: 'Learning', color: '#ff4d4d', song: 'london', desc: 'Everyday things and the name of their colour.',
    pool: Object.keys(COLOROF), n: 6, bg: studio('#ffffff', '#ffe0ef'),
    titleCap: 'What *color* is it?', titleSay: "Let's learn colors! What color is it?",
    say: (it) => `The ${lc(it.word)} ${/(cherries|grapes)/.test(it.id) ? 'are' : 'is'} ${lc(COLOROF[it.id][0])}!`,
    card: (it) => ({ big: COLOROF[it.id][0], col: COLOROF[it.id][1], y: it.animal ? 120 : 60 }),
    endCap: 'Colors are *everywhere!*', endSay: 'Red, yellow, green and blue. Colors are everywhere!' }));

  // 56 Count with Leo
  const COUNTSETS = [['apple', 'banana', 'strawberry', 'orange', 'pear'], ['bee', 'ladybug', 'butterfly', 'snail', 'ant'], ['star', 'heart', 'balloon', 'ball', 'flower'],
    ['parrot', 'bluebird', 'canary', 'robin', 'duck'], ['car', 'bus', 'boat', 'airplane', 'train'], ['fish', 'crab', 'octopus', 'jellyfish', 'whale']];
  const cbg = studio('#fff6dc', '#ffc94d');
  S.push({ id: 'countfun', name: 'Count with Leo', tag: 'Learning', color: '#ffb347', song: 'oldman', desc: 'Count from one to five with fruits, bugs, birds, toys and more.', thumbT: 8,
    pick: (r, classic) => ({ a: classic ? COUNTSETS[0] : r.shuffle(r.pick(COUNTSETS)) }),
    build: (v) => [
      intro(cbg, "Let's *count!*", "Let's count together! Ready?"),
      ...v.data.a.map((id, i) => {
        const n = i + 1, it = K.ITEMS[id], word = n === 1 ? lc(it.word) : pl(lc(it.word));
        return {
          d: 2.6, cap: `*${n}* ${word}`, say: `${cap1(NUM[n])} ${word}!`, sfx: [[0.2, 'pop']], cam: [[1, 0, 60], [1.04, 0, 60]],
          draw(g, t) {
            cbg(g);
            const a = ease.elastic(seg(t, 0.05, 0.6)); g.c.save(); g.c.translate(0, -230); g.c.scale(a, a); K.text(g.c, String(n), 0, 0, 200, { fill: RB[i], stroke: '#fff', sw: 24 }); g.c.restore();
            const sc = n <= 2 ? 0.8 : n <= 3 ? 0.62 : 0.5, gap = Math.min(220, (g.hw * 1.8) / n);
            for (let k = 0; k < n; k++) { const b = popIn(t, 0.2 + k * 0.12, 0.6 + k * 0.12); if (b <= 0) continue; g.c.save(); g.c.translate((k - (n - 1) / 2) * gap, 80 + (k % 2) * 70); g.c.scale(b, b); K.drawItem(g.c, id, 0, 0, sc, g.T + k * 0.7); g.c.restore(); }
          },
        };
      }),
      cheer(cbg, 'Great *counting!*', 'One, two, three, four, five! Great counting!'),
    ] });

  K.STYLES.push(...S);
})();
