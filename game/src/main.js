// Boot and main loop for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// One fixed 1/60 s step: read input, advance the shift, drain patience,
// run the prep work, then paint the canvas and the DOM HUD from the same
// state. ?shot=<name>&seed=<n> stages a deterministic screenshot state
// instead of running the loop. The loop never decides a recipe or a score:
// orders.js, cooking.js and scoring.js own the rules.
import { createRandom } from './seeded-random.js';
import { createState, startShift, transform, endShift, addFloater } from './game-state.js';
import { SHIFT_SECONDS, TRANSFORM_AT, isNight, patienceDrain } from './clock.js';
import { createOrder, drainOrders, clearFinished, MAX_ORDERS, ORDER_EVERY_DAY, ORDER_EVERY_NIGHT } from './orders.js';
import { INGREDIENTS, recipeById } from './menu-data.js';
import { rawItem, prepNeeded, applyPrep, prepSeconds, isReady } from './ingredients.js';
import { MAX_CARRIED, addToPlate, removeFromPlate, addCursed, matchingOrder, serveDish } from './cooking.js';
import { starsFor } from './scoring.js';
import { createKitchenRenderer } from './render-kitchen.js';
import { createOrderBoard } from './render-orders.js';
import { createHud } from './render-hud.js';
import { createPlateStrip } from './render-plate.js';
import { createKeyboard, ACTION_CONFIRM, ACTION_PAUSE, ACTION_RESTART, ACTION_CURSED } from './input-keyboard.js';
import { createMouse } from './input-mouse.js';
import { createSound } from './sound.js';
import { createStorage } from './storage.js';
import { stageShot } from './shots.js';
import { stationAt, stationById, pantryBinAt, nearStation } from './stations.js';
import { steer, walkTo, setTarget, stationInReach, goToStation } from './player.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;
const MAX_FAILED = 3;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const state = createState(seed);
const random = createRandom(seed);
const storage = createStorage();
const sound = createSound();
const renderer = createKitchenRenderer(canvas);
const board = createOrderBoard(document.getElementById('orders'), onTicket);
const hud = createHud({
  timer: document.getElementById('timer'),
  clock: document.getElementById('clock'),
  score: document.getElementById('score'),
  combo: document.getElementById('combo'),
  phase: document.getElementById('phase'),
  served: document.getElementById('served'),
  message: document.getElementById('message'),
  hands: document.getElementById('hands'),
});
const plateStrip = createPlateStrip(document.getElementById('plate-strip'), onRemoveFromPlate);
state.best = storage.readBest();

function announce(message) {
  status.textContent = message;
}

function say(message, seconds) {
  state.message = message;
  state.messageT = seconds || 3;
}

function paint() {
  renderer.draw(state);
  board.render(state);
  hud.render(state);
  plateStrip.render(state);
}

/** Serve the finished dish to order `index`. Shared by mouse, keys and tickets. */
function serveTo(index) {
  if (!state.readyDish) {
    say('Nenhum prato pronto. Monte um prato primeiro!');
    return;
  }
  const order = state.orders[index];
  if (!order || order.state !== 'waiting') {
    say('Escolha um pedido do quadro.');
    return;
  }
  const plate = [...recipeById(state.readyDish.recipeId).items];
  if (state.readyDish.cursed) plate.push('pimenta');
  const result = serveDish(order, plate, state.combo);
  if (result.ok) {
    state.score += result.points;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    addFloater(state, 1120, 330, `+${result.points}${result.cursed ? ' AMALDIÇOADO!' : ''}`, '#f2c94c');
    if (result.forgiven) {
      say(`${order.clientName} comeu o ${order.recipeName} mesmo sem ser o pedido! +${result.points} pontos (metade).`);
    } else if (order.clientId === 'festeiro') {
      // The unwitting human's reaction on being served: he still thinks
      // this is all a costume party. The line alternates with the serve
      // count, so it stays deterministic.
      const reaction = state.served % 2 === 0
        ? 'A fantasia até come de verdade! Melhor festa ever!'
        : 'Gente, o monstro comeu meu lanche! Isso é real?!';
      say(`${order.clientName} adorou o ${order.recipeName}! +${result.points} pontos. "${reaction}"`);
    } else {
      say(`${order.clientName} adorou o ${order.recipeName}! +${result.points} pontos.`);
    }
    sound.serve();
  } else if (result.burned) {
    state.score = Math.max(0, state.score + result.points);
    state.combo = 0;
    state.failed += 1;
    addFloater(state, 1120, 330, 'QUEIMOU!', '#c1121f');
    say(`A Pimenta do Além queimou o pedido de ${order.clientName}! -${-result.points} pontos.`);
    sound.burn();
  } else {
    state.score = Math.max(0, state.score + result.points);
    state.combo = 0;
    addFloater(state, 1120, 330, 'ERRADO!', '#c1121f');
    say(`${order.clientName} rejeitou o prato! Prato errado para esse pedido.`);
    sound.error();
  }
  state.readyDish = null;
  state.orders = clearFinished(state.orders);
  if (state.selectedOrder >= state.orders.length) state.selectedOrder = 0;
}

/** Ticket click: serve the ready dish to that order, or just select it. */
function onTicket(index) {
  sound.unlock();
  if (state.screen !== 'playing') return;
  if (state.readyDish && state.orders[index]) {
    serveTo(index);
    return;
  }
  state.selectedOrder = index;
}

function onRemoveFromPlate(index) {
  if (state.screen !== 'playing') return;
  const removed = state.plate[index];
  if (removed === undefined) return;
  state.plate.splice(index, 1);
  say('Ingrediente tirado do prato. Sem pressa — o monstro espera (um pouco).');
}

/** Pick an ingredient from the pantry into the chef's hands. */
function pickIngredient(index) {
  if (state.carried.length >= MAX_CARRIED) {
    say('Mãos cheias! Monte o prato ou sirva antes de pegar mais.');
    sound.error();
    return;
  }
  const ingredient = INGREDIENTS[index];
  if (!ingredient) return;
  state.carried.push(rawItem(ingredient.id));
  state.pantryPick = index;
  say(`Pegou ${ingredient.name}. ${ingredient.prep === 'none' ? 'Já pode ir ao prato.' : `Leve à ${ingredient.prep === 'chop' ? 'tábua' : 'o fogão'}.`}`);
  sound.pickup();
}

/** Start prep work on the first carried item that needs `step`. */
function startWork(stationId, step) {
  if (state.work) return;
  const target = state.carried.find((item) => prepNeeded(item) === step);
  if (!target) {
    say(step === 'chop' ? 'Nada para picar nas mãos. Pegue algo cru na despensa.' : 'Nada para cozinhar nas mãos. Pegue algo cru na despensa.');
    return;
  }
  state.work = { station: stationId, item: target, t: 0, duration: prepSeconds(step) };
}

/** Use the station the chef is standing at. */
function interact() {
  const station = stationInReach(state.player);
  if (!station) {
    say('Ande até uma bancada para usá-la.');
    return;
  }
  if (station.id === 'pantry') {
    pickIngredient(state.pantryPick);
  } else if (station.id === 'chop') {
    startWork('chop', 'chop');
  } else if (station.id === 'stove') {
    startWork('stove', 'cook');
  } else if (station.id === 'plate') {
    const item = state.carried[state.carried.length - 1];
    if (!item) {
      say('Mãos vazias. Traga um ingrediente pronto da despensa, da tábua ou do fogão.');
      return;
    }
    if (!isReady(item)) {
      say('Esse ingrediente ainda precisa de preparo antes de ir ao prato.');
      sound.error();
      return;
    }
    state.carried.pop();
    if (addToPlate(state.plate, item)) {
      sound.plate();
      const match = matchingOrder(state.plate, state.orders);
      if (match) {
        state.readyDish = { recipeId: match.recipeId, cursed: state.plate.includes('pimenta') };
        state.plate = [];
        say(`Prato pronto: ${match.recipeName}! Leve à entrega ou clique no pedido.`);
        sound.ready();
      }
    }
  } else if (station.id === 'serve') {
    serveTo(state.selectedOrder);
  }
}

/** Add the forbidden ingredient to the plate (the cursed-book gamble). */
function addCursedToPlate() {
  if (state.screen !== 'playing') return;
  if (addCursed(state.plate)) {
    say('Pimenta do Além no prato! Se estiver certo, a gorjeta dobra. Se errar, o pedido queima!');
    sound.cook();
  } else {
    say('Não dá para amaldiçoar agora: prato cheio ou já amaldiçoado.');
    sound.error();
  }
}

let pendingStation = null;

function handleClick(click) {
  sound.unlock();
  if (state.screen === 'title') {
    beginShift();
    return;
  }
  if (state.screen === 'shiftEnd') {
    beginShift();
    return;
  }
  if (state.screen !== 'playing') return;
  const bin = pantryBinAt(click.x, click.y);
  if (bin >= 0 && bin < INGREDIENTS.length) {
    const pantry = stationById('pantry');
    goToStation(state.player, pantry);
    pendingStation = 'pantry';
    state.pantryPick = bin;
    return;
  }
  const station = stationAt(click.x, click.y);
  if (station) {
    goToStation(state.player, station);
    pendingStation = station.id;
    return;
  }
  setTarget(state.player, click.x, click.y);
  pendingStation = null;
}

function beginShift() {
  sound.unlock();
  state.orders = [];
  startShift(state);
  state.best = storage.readBest();
  announce('Turno começou. Sirva os humanos antes das 3:33!');
}

function step(dt) {
  if (state.screen !== 'playing') return;
  state.elapsed += dt;

  // The 3:33 transformation, once.
  if (!state.transformed && state.elapsed >= TRANSFORM_AT) {
    transform(state);
    sound.transform();
    state.orderTimer = 1;
    announce('3:33! Os monstros chegaram!');
  }

  // New orders arrive on a timer; never more than three on the board.
  state.orderTimer -= dt;
  if (state.orderTimer <= 0) {
    const waiting = state.orders.filter((o) => o.state === 'waiting').length;
    if (waiting < MAX_ORDERS) {
      state.orders.push(createOrder(state.nextOrderId, random, isNight(state.elapsed)));
      state.nextOrderId += 1;
    }
    state.orderTimer = isNight(state.elapsed) ? ORDER_EVERY_NIGHT : ORDER_EVERY_DAY;
  }

  // Patience drains; a monster that waits too long storms out.
  const expired = drainOrders(state.orders, dt, patienceDrain(state.elapsed));
  for (const order of expired) {
    state.failed += 1;
    state.combo = 0;
    say(`${order.clientName} foi embora bravo! Pedido perdido.`);
    sound.error();
  }
  state.orders = clearFinished(state.orders);
  if (state.selectedOrder >= state.orders.length) state.selectedOrder = 0;

  // Prep work only advances while the chef stays at that station.
  if (state.work) {
    const station = stationById(state.work.station);
    if (nearStation(state.player.x, state.player.y, station)) {
      state.work.t += dt;
      if (state.work.t >= state.work.duration) {
        const index = state.carried.indexOf(state.work.item);
        if (index >= 0) state.carried[index] = applyPrep(state.work.item, prepNeeded(state.work.item));
        say('Pronto! Leve ao prato de montagem.');
        sound.cook();
        state.work = null;
      }
    }
  }

  // Timers: banner, message, transformation flicker, floating scores.
  if (state.bannerT > 0) state.bannerT -= dt;
  if (state.messageT > 0) state.messageT -= dt;
  if (state.transformFlash > 0) state.transformFlash -= dt;
  for (const floater of state.floaters) floater.t -= dt;
  state.floaters = state.floaters.filter((f) => f.t > 0);

  // End of shift: clock out, or three monsters lost.
  if (state.elapsed >= SHIFT_SECONDS || state.failed >= MAX_FAILED) {
    state._stars = starsFor(state.served, state.failed);
    endShift(state);
    storage.saveBest(state.score);
    announce(`Fim do turno. ${state.served} pratos servidos, ${state.score} pontos.`);
  }
}

function runShot(name) {
  const shotState = stageShot(name, seed);
  Object.assign(state, shotState);
  state.best = 0;
  let painted = 0;
  function paint() {
    renderer.draw(state);
    board.render(state);
    hud.render(state);
    plateStrip.render(state);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const keyboard = createKeyboard();
  const mouse = createMouse(canvas);
  let accumulator = 0;
  let last = performance.now();

  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyM') {
      const muted = sound.toggleMute();
      say(muted ? 'Som desligado (M para ligar).' : 'Som ligado.');
    }
  });

  document.getElementById('cursed-btn').addEventListener('click', () => {
    sound.unlock();
    addCursedToPlate();
  });
  document.getElementById('start-btn').addEventListener('click', () => {
    if (state.screen === 'title' || state.screen === 'shiftEnd') beginShift();
  });

  function handleActions() {
    const actions = keyboard.takeActions();
    const orderKey = keyboard.takeOrderKey();
    const pantryStep = keyboard.takePantryStep();
    if (orderKey >= 0 && orderKey < state.orders.length) state.selectedOrder = orderKey;
    if (pantryStep !== 0) {
      state.pantryPick = (state.pantryPick + pantryStep + INGREDIENTS.length) % INGREDIENTS.length;
    }
    if (actions & ACTION_CURSED) addCursedToPlate();
    if (actions & ACTION_RESTART && state.screen === 'shiftEnd') beginShift();
    else if (actions & ACTION_CONFIRM && (state.screen === 'title' || state.screen === 'shiftEnd')) beginShift();
    else if (actions & ACTION_PAUSE && state.screen === 'playing') {
      state.screen = 'paused';
      announce('Pausado.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && state.screen === 'paused') {
      state.screen = 'playing';
      announce('Jogando.');
    } else if (actions & ACTION_CONFIRM && state.screen === 'playing') {
      interact();
    }
    for (const click of mouse.takeClicks()) handleClick(click);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (state.screen === 'playing') {
      while (accumulator >= STEP && state.screen === 'playing') {
        // Steer first, then step: the chef walks while the shift runs.
        const dir = keyboard.direction();
        if (dir.x !== 0 || dir.y !== 0) {
          steer(state.player, dir.x, dir.y, STEP);
          pendingStation = null;
        } else if (pendingStation) {
          const walking = walkTo(state.player, STEP);
          if (!walking) {
            const station = stationById(pendingStation);
            pendingStation = null;
            if (station && stationInReach(state.player)) {
              if (station.id === 'pantry') pickIngredient(state.pantryPick);
              else interact();
            }
          }
        } else {
          walkTo(state.player, STEP);
        }
        step(STEP);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
      for (const click of mouse.takeClicks()) handleClick(click);
    }
    paint();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === 'playing') state.screen = 'paused';
  });

  announce('Bistrô das 3:33. Espaço ou clique para começar.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
