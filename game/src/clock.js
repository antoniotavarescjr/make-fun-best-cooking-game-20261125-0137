// Shift clock for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// The shift lasts SHIFT_SECONDS. The first DAY_SECONDS are the calm human
// shift; at TRANSFORM_AT the clock strikes 3:33 and the monsters take over.
// Pure functions of elapsed seconds, so screenshots and tests agree exactly.
// The wall clock is the single source of truth: the DOM HUD (render-hud.js)
// and the canvas wall clock (render-kitchen.js) both call clockLabel, so
// they can never show different times in the same frame.
export const SHIFT_SECONDS = 180;
export const TRANSFORM_AT = 40;
export const CLOCK_START_MINUTES = 180; // 3:00
export const CLOCK_END_MINUTES = 240; // 4:00

/** Wall-clock label for an elapsed shift time: 3:00, then 3:33 at the turn. */
export function clockLabel(elapsed) {
  if (elapsed < TRANSFORM_AT) {
    const minutes = CLOCK_START_MINUTES + Math.floor((elapsed / TRANSFORM_AT) * 32);
    return `3:${String(minutes - 180).padStart(2, '0')}`;
  }
  // After the turn the wall clock sticks at 3:33: the witching hour freezes,
  // so the cover (elapsed 105) shows 3:33 in the HUD and on the canvas alike.
  return '3:33';
}

/** Seconds left in the shift, never below zero. */
export function timeLeft(elapsed) {
  return Math.max(0, SHIFT_SECONDS - elapsed);
}

/** "M:SS" display for the big shift timer. */
export function timerLabel(elapsed) {
  const left = Math.ceil(timeLeft(elapsed));
  return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
}

/** True once the 3:33 transformation has happened. */
export function isNight(elapsed) {
  return elapsed >= TRANSFORM_AT;
}

/** Patience drains faster at night: monsters are hungrier than humans. */
export function patienceDrain(elapsed) {
  return isNight(elapsed) ? 1.35 : 1.0;
}

/** Fraction of the shift already played, 0 at the start and 1 at the end. */
export function shiftProgress(elapsed) {
  return Math.min(1, Math.max(0, elapsed / SHIFT_SECONDS));
}
