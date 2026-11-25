// Scoring for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Pure arithmetic: base price + patience bonus, times monster tip, times the
// visible combo multiplier, doubled again by the cursed book when it pays off,
// and doubled again for a VIP order — the "VIP ×2" on the ticket is real now.
export const COMBO_STEP = 0.5;
export const COMBO_MAX = 3;

/** Combo multiplier for a streak of `combo` correct serves in a row. */
export function comboMultiplier(combo) {
  return Math.min(COMBO_MAX, 1 + COMBO_STEP * Math.max(0, combo - 1));
}

/**
 * Points for serving `recipe` to `monster` with `patienceLeft` of
 * `patienceMax` seconds left. `cursed` doubles the tip when the dish was
 * possessed and correct; `vip` doubles the whole score — a VIP order pays
 * double, as the ticket promises ("VIP ×2").
 */
export function servePoints(recipe, monster, patienceLeft, patienceMax, combo, cursed, vip) {
  const patienceBonus = Math.round(50 * Math.max(0, patienceLeft / patienceMax));
  const tip = monster ? monster.tip : 1;
  let raw = (recipe.base + patienceBonus) * tip * comboMultiplier(combo);
  if (vip) raw *= 2;
  return Math.round(cursed ? raw * 2 : raw);
}

/** Stars for the end-of-shift board, from dishes served and dishes failed. */
export function starsFor(served, failed) {
  if (served >= 10 && failed === 0) return 3;
  if (served >= 7) return 3;
  if (served >= 5) return 2;
  if (served >= 3) return 1;
  return 0;
}

/** Coins earned are the score in coins: one coin per point, shown on the board. */
export function coinsFor(score) {
  return score;
}

/** The combo label the HUD shows: the multiplier and the streak behind it. */
export function comboLabel(combo) {
  return combo > 1 ? `COMBO ×${comboMultiplier(combo).toFixed(1)} (${combo})` : 'COMBO ×1';
}
