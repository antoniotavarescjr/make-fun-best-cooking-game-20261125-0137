// Best-score memory for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// The best shift score lives in memory for the session only: no cookies, no
// localStorage, no network. A private window or a fresh visit starts at 0,
// and the game never depends on the value.
export function createStorage() {
  let best = 0;
  return {
    readBest() { return best; },
    saveBest(value) { if (value > best) best = value; },
    reset() { best = 0; },
  };
}
