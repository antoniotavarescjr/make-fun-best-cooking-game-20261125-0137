// Central game state for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// One object is the single source of truth: the DOM HUD and the canvas both
// read from it every frame, and no rule writes anywhere else. Screens:
// title -> playing (day) -> transformation at 3:33 -> playing (night) ->
// shiftEnd. Paused freezes the clock on top of playing.
import { SHIFT_SECONDS, TRANSFORM_AT } from './clock.js';

export function createState(seed) {
  return {
    seed,
    screen: 'title',
    elapsed: 0,
    transformed: false,
    transformFlash: 0,
    banner: '',
    bannerT: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    failed: 0,
    orders: [],
    nextOrderId: 1,
    orderTimer: 4,
    plate: [],
    readyDish: null,
    carried: [],
    selectedOrder: 0,
    player: { x: 640, y: 450, tx: 640, ty: 450, moving: false },
    pantryPick: 0,
    work: null,
    floaters: [],
    message: '',
    messageT: 0,
    muted: false,
    best: 0,
  };
}

/** Start a fresh shift from the title screen. */
export function startShift(state) {
  state.screen = 'playing';
  state.elapsed = 0;
  state.transformed = false;
  state.transformFlash = 0;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.served = 0;
  state.failed = 0;
  state.orders = [];
  state.nextOrderId = 1;
  state.orderTimer = 4;
  state.plate = [];
  state.readyDish = null;
  state.carried = [];
  state.selectedOrder = 0;
  state.work = null;
  state.floaters = [];
  state.banner = 'TURNO NORMAL — sirva os humanos antes das 3:33!';
  state.bannerT = 3;
}

/** The 3:33 transformation: lights flicker, the palette flips, monsters arrive. */
export function transform(state) {
  state.transformed = true;
  state.transformFlash = 1.6;
  state.banner = '3:33 — OS MONSTROS CHEGARAM!';
  state.bannerT = 4;
  state.message = 'A cozinha virou cantina de monstros!';
  state.messageT = 4;
}

/** End the shift: timer out, or three monsters lost. */
export function endShift(state) {
  state.screen = 'shiftEnd';
  if (state.score > state.best) state.best = state.score;
}

/** True while the shift clock is still running. */
export function shiftRunning(state) {
  return state.screen === 'playing' && state.elapsed < SHIFT_SECONDS;
}

/** Seconds until the 3:33 transformation, for the day HUD. */
export function secondsToTransform(state) {
  return Math.max(0, TRANSFORM_AT - state.elapsed);
}

/** True once the shift has ended (clock out or three monsters lost). */
export function isShiftOver(state) {
  return state.screen === 'shiftEnd';
}

/** Add a floating score popup over the canvas. */
export function addFloater(state, x, y, text, color) {
  state.floaters.push({ x, y, text, color: color || '#f2c94c', t: 1.6 });
  if (state.floaters.length > 8) state.floaters.shift();
}
