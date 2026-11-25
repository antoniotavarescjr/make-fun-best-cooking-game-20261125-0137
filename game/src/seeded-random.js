// Seeded random for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// One deterministic source of randomness for the whole game: the same seed
// always spawns the same orders in the same sequence, so a screenshot query
// (?shot=...&seed=N) always paints the same frame. No Math.random anywhere
// else in the game decides anything.
export function createRandom(seed) {
  let a = seed | 0;
  return function random() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one element of `list` using the seeded random. */
export function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}

/** An integer in [0, max): the seeded way to pick an index. */
export function nextInt(random, max) {
  return Math.floor(random() * max);
}
