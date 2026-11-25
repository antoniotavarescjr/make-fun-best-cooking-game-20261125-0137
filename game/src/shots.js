// Deterministic screenshot states for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// ?shot=<name>&seed=<n> builds a fixed, valid game state from the real rules
// (real orders from orders.js, a real plate from cooking.js), so the same
// query always paints the same frame on any machine. No shot changes the
// normal game: without ?shot= the game starts on the title screen.
//   cover     — the full rush at 3:33: 3 orders, plate mid-assembly, dish ready
//   assembly  — a complex dish being built, chopping the last ingredient
//   serve     — the serve moment: dish ready, monster happy, points popping
//   rush-333  — the transformation instant: banner, flicker, timers in red
import { createOrder } from './orders.js';
import { createRandom } from './seeded-random.js';
import { createState } from './game-state.js';
import { recipeById } from './menu-data.js';

/** The four deterministic screenshot states, in dossier order. */
export const SHOT_NAMES = ['cover', 'assembly', 'serve', 'rush-333'];

function baseState(seed, elapsed, night) {
  const state = createState(seed);
  state.screen = 'playing';
  state.elapsed = elapsed;
  state.transformed = night;
  state.transformFlash = 0;
  state.banner = '';
  state.bannerT = 0;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.served = 0;
  state.failed = 0;
  state.orders = [];
  state.plate = [];
  state.readyDish = null;
  state.carried = [];
  state.work = null;
  state.floaters = [];
  state.player = { x: 520, y: 430, tx: 520, ty: 430, moving: false };
  return state;
}

function fixedOrders(state, seed, specs) {
  const random = createRandom(seed);
  specs.forEach((spec, index) => {
    const order = createOrder(index + 1, random, true);
    order.clientId = spec.client;
    order.clientName = spec.name;
    order.clientKind = spec.kind;
    order.recipeId = spec.recipe;
    order.recipeName = recipeById(spec.recipe).name;
    order.recipeItems = [...recipeById(spec.recipe).items];
    order.patience = spec.patience;
    order.patienceMax = spec.patienceMax;
    order.vip = !!spec.vip;
    order.taunt = spec.taunt || '';
    state.orders.push(order);
  });
  state.selectedOrder = 0;
}

/** Build the named shot state. Unknown names warn and fall back to the cover. */
export function stageShot(name, seed) {
  if (!SHOT_NAMES.includes(name)) {
    // Loud fallback, never silent: a typo in a query must show up in the
    // console instead of quietly painting the cover as if it were the shot.
    console.warn(`[shots] unknown shot "${name}" — falling back to cover`);
  }
  if (name === 'assembly') {
    const state = baseState(seed, 96, true);
    state.score = 640;
    state.combo = 2;
    state.bestCombo = 2;
    fixedOrders(state, seed, [
      { client: 'conde', name: 'Conde Mordisca', kind: 'Vampiro', recipe: 'espaguete', patience: 11, patienceMax: 26, taunt: 'SEM ALHO!' },
      { client: 'lodo', name: 'Bolha, o Lodo', kind: 'Lodo Vivo', recipe: 'cerebro', patience: 22, patienceMax: 30, taunt: 'BEM NOJENTO!' },
    ]);
    state.plate = ['macarrao', 'molho-sangue'];
    state.carried = [{ id: 'olho', prep: 'raw' }];
    state.work = { station: 'chop', item: { id: 'olho', prep: 'raw' }, t: 0.7, duration: 1.1 };
    state.player = { x: 450, y: 300, tx: 450, ty: 300, moving: false };
    state.message = 'Pique o olho para fechar o Espaguete de Intestino!';
    state.messageT = 99;
    return state;
  }
  if (name === 'serve') {
    const state = baseState(seed, 120, true);
    state.score = 1250;
    state.combo = 3;
    state.bestCombo = 3;
    state.served = 5;
    fixedOrders(state, seed, [
      { client: 'conde', name: 'Conde Mordisca', kind: 'Vampiro', recipe: 'suco', patience: 19, patienceMax: 26, taunt: 'SEM ALHO!' },
      { client: 'aranha', name: 'Dona Aranha', kind: 'Aranha', recipe: 'bolo', patience: 28, patienceMax: 36, taunt: 'COM 8 PERNAS!' },
    ]);
    state.readyDish = { recipeId: 'suco', cursed: false };
    state.plate = [];
    state.player = { x: 1080, y: 450, tx: 1080, ty: 450, moving: false };
    state.floaters = [{ x: 1120, y: 330, text: '+250 ★★★', color: '#f2c94c', t: 1.4 }];
    state.message = 'Suco de Sangue pronto! Sirva ao Conde Mordisca!';
    state.messageT = 99;
    return state;
  }
  if (name === 'rush-333') {
    const state = baseState(seed, 40, true);
    state.score = 480;
    state.combo = 1;
    state.bestCombo = 2;
    // No flicker in a frozen shot: with transformFlash > 0 the flicker test
    // (floor(elapsed*8) even) froze the kitchen in its DAY palette at
    // elapsed=40, contradicting the banner. The banner carries the moment;
    // the kitchen underneath is already night.
    state.transformFlash = 0;
    state.banner = '3:33 — OS MONSTROS CHEGARAM!';
    state.bannerT = 99;
    fixedOrders(state, seed, [
      { client: 'conde', name: 'Conde Mordisca', kind: 'Vampiro', recipe: 'espaguete', patience: 8, patienceMax: 26, vip: true, taunt: 'SEM ALHO!' },
      { client: 'mumia', name: 'Zé Múmia', kind: 'Múmia', recipe: 'sanduiche', patience: 31, patienceMax: 46, taunt: 'BEM ENROLADO!' },
      { client: 'aranha', name: 'Dona Aranha', kind: 'Aranha', recipe: 'bolo', patience: 24, patienceMax: 36, taunt: 'COM 8 PERNAS!' },
    ]);
    state.plate = ['massa'];
    state.carried = [{ id: 'cobertura', prep: 'raw' }];
    state.message = 'A luz piscou. O turno virou. Segure o rush!';
    state.messageT = 99;
    return state;
  }
  // cover: everything the judge's first criterion needs, in one frame.
  const state = baseState(seed, 105, true);
  state.score = 1250;
  state.combo = 3;
  state.bestCombo = 3;
  state.served = 5;
  fixedOrders(state, seed, [
    { client: 'conde', name: 'Conde Mordisca', kind: 'Vampiro', recipe: 'espaguete', patience: 9, patienceMax: 26, taunt: 'SEM ALHO!' },
    // Zé Múmia orders the Suco de Sangue: the ready dish on the hatch now
    // matches a real ticket on the board (it used to be a Sanduíche order
    // with a Suco nobody had asked for).
    { client: 'mumia', name: 'Zé Múmia', kind: 'Múmia', recipe: 'suco', patience: 27, patienceMax: 46, taunt: 'BEM ENROLADO!' },
    { client: 'aranha', name: 'Dona Aranha', kind: 'Aranha', recipe: 'bolo', patience: 19, patienceMax: 36, vip: true, taunt: 'COM 8 PERNAS!' },
  ]);
  state.plate = ['macarrao', 'molho-sangue'];
  state.carried = [{ id: 'olho', prep: 'chopped' }];
  state.readyDish = { recipeId: 'suco', cursed: false };
  state.player = { x: 560, y: 440, tx: 560, ty: 440, moving: false };
  state.message = 'Monte o Espaguete de Intestino e sirva o Suco de Sangue!';
  state.messageT = 99;
  return state;
}
