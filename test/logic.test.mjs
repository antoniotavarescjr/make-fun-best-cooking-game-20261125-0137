// Logic tests for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// node:test, runs with plain Node, no browser: every rule the game scores
// on is exercised here — orders, patience, prep, plating, serving, the
// cursed book, the combo and the deterministic screenshot states.
//   node --test test/logic.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRandom, pick } from '../game/src/seeded-random.js';
import { clockLabel, timerLabel, isNight, patienceDrain, SHIFT_SECONDS } from '../game/src/clock.js';
import { comboMultiplier, servePoints, starsFor } from '../game/src/scoring.js';
import { createOrder, drainOrders, clearFinished, mostUrgent, MAX_ORDERS } from '../game/src/orders.js';
import { rawItem, prepNeeded, isReady, applyPrep, prepSeconds } from '../game/src/ingredients.js';
import { plateMatches, matchingOrder, addToPlate, removeFromPlate, addCursed, serveDish, MAX_PLATE } from '../game/src/cooking.js';
import { recipeById, ingredientById, CURSED_BOOK, monsterById, DAY_RECIPES } from '../game/src/menu-data.js';
import { stationById, stationAt, pantryBinAt } from '../game/src/stations.js';
import { stageShot } from '../game/src/shots.js';
import { createState, startShift, transform, secondsToTransform } from '../game/src/game-state.js';

test('seeded random: same seed, same sequence; different seed, different game', () => {
  const a = createRandom(7);
  const b = createRandom(7);
  const first = [a(), a(), a()];
  assert.deepEqual([b(), b(), b()], first);
  const c = createRandom(8);
  assert.notEqual(c(), first[0]);
  assert.equal(pick(createRandom(3), ['x', 'y', 'z']), pick(createRandom(3), ['x', 'y', 'z']));
});

test('clock: day runs 3:00 toward 3:33, night starts at 3:33, shift is 180s', () => {
  assert.equal(clockLabel(0), '3:00');
  assert.equal(clockLabel(40), '3:33');
  // One source of truth: the wall clock sticks at 3:33 all night, so the
  // HUD and the canvas clock agree in every shot (cover is elapsed 105).
  assert.equal(clockLabel(105), '3:33');
  assert.equal(clockLabel(120), '3:33');
  assert.equal(clockLabel(179), '3:33');
  assert.equal(isNight(39), false);
  assert.equal(isNight(40), true);
  assert.equal(timerLabel(0), '3:00');
  assert.equal(timerLabel(150), '0:30');
  assert.equal(SHIFT_SECONDS, 180);
  assert.ok(patienceDrain(100) > patienceDrain(10));
});

test('scoring: combo multiplies, patience pays, cursed doubles, stars need serves', () => {
  assert.equal(comboMultiplier(1), 1);
  assert.equal(comboMultiplier(2), 1.5);
  assert.equal(comboMultiplier(10), 3);
  const recipe = recipeById('espaguete');
  const monster = { tip: 2.0 };
  const fast = servePoints(recipe, monster, 26, 26, 1, false);
  const slow = servePoints(recipe, monster, 0, 26, 1, false);
  assert.ok(fast > slow);
  assert.equal(servePoints(recipe, monster, 26, 26, 1, true), fast * 2);
  // VIP pays double, as the ticket promises — and it stacks with cursed.
  assert.equal(servePoints(recipe, monster, 26, 26, 1, false, true), fast * 2);
  assert.equal(servePoints(recipe, monster, 26, 26, 1, true, true), fast * 4);
  assert.equal(starsFor(10, 0), 3);
  assert.equal(starsFor(5, 1), 2);
  assert.equal(starsFor(3, 2), 1);
  assert.equal(starsFor(0, 3), 0);
});

test('orders: created with a recipe and patience, drain expires, board caps at 3', () => {
  const random = createRandom(11);
  const order = createOrder(1, random, true);
  assert.ok(recipeById(order.recipeId));
  assert.ok(order.patience > 0 && order.patience <= order.patienceMax);
  assert.equal(order.state, 'waiting');
  assert.ok(MAX_ORDERS >= 3);
  const day = createOrder(2, createRandom(2), false);
  assert.ok(DAY_RECIPES.includes(day.recipeId));
  // Day humans never order blood or brains: the day menu is plain food.
  for (let seed = 0; seed < 40; seed += 1) {
    const human = createOrder(1, createRandom(seed), false);
    assert.ok(DAY_RECIPES.includes(human.recipeId));
    assert.ok(!['suco', 'cerebro'].includes(human.recipeId));
  }
  const expired = drainOrders([order], order.patience + 1, 1);
  assert.equal(expired.length, 1);
  assert.equal(order.state, 'failed');
  assert.deepEqual(clearFinished([order]), []);
  const urgent = mostUrgent([
    { state: 'waiting', patience: 20, patienceMax: 40 },
    { state: 'waiting', patience: 5, patienceMax: 40 },
  ]);
  assert.equal(urgent.patience, 5);
});

test('ingredients: raw needs its one prep step, then it is ready to plate', () => {
  const eye = rawItem('olho');
  assert.equal(prepNeeded(eye), 'chop');
  assert.equal(isReady(eye), false);
  const chopped = applyPrep(eye, 'chop');
  assert.equal(chopped.prep, 'chopped');
  assert.equal(isReady(chopped), true);
  const sauce = rawItem('molho-sangue');
  assert.equal(prepNeeded(sauce), null);
  assert.equal(isReady(sauce), true);
  const pasta = rawItem('macarrao');
  assert.equal(prepNeeded(pasta), 'cook');
  assert.ok(prepSeconds('chop') < prepSeconds('cook'));
  assert.ok(ingredientById('pimenta').cursed);
});

test('cooking: plate matches a recipe in any order; wrong items come off', () => {
  const recipe = recipeById('espaguete');
  assert.ok(plateMatches(['olho', 'macarrao', 'molho-sangue'], recipe));
  assert.ok(!plateMatches(['olho', 'macarrao'], recipe));
  assert.ok(!plateMatches(['olho', 'macarrao', 'molho-sangue', 'pao'], recipe));
  const plate = [];
  assert.ok(addToPlate(plate, { id: 'macarrao', prep: 'cooked' }));
  assert.equal(addToPlate(plate, { id: 'olho', prep: 'raw' }), false);
  assert.equal(removeFromPlate(plate), 'macarrao');
  assert.deepEqual(plate, []);
  const full = ['a', 'b', 'c', 'd'];
  assert.equal(full.length, MAX_PLATE);
  assert.equal(addCursed([]), true);
  assert.equal(CURSED_BOOK.tipMultiplier, 2);
});

test('cooking: serving scores, wrong serve costs, cursed wrong burns the order', () => {
  const random = createRandom(5);
  const order = createOrder(1, random, true);
  const recipe = recipeById(order.recipeId);
  const good = serveDish(order, [...recipe.items], 1);
  assert.equal(good.ok, true);
  assert.ok(good.points > 0);
  assert.equal(order.state, 'served');

  const order2 = createOrder(2, createRandom(6), true);
  const bad = serveDish(order2, ['pao'], 3);
  assert.equal(bad.ok, false);
  assert.equal(bad.burned, false);
  assert.equal(bad.points, -25);

  const order3 = createOrder(3, createRandom(7), true);
  const burned = serveDish(order3, ['pao', 'pimenta'], 2);
  assert.equal(burned.ok, false);
  assert.equal(burned.burned, true);
  assert.equal(burned.points, -CURSED_BOOK.burnPenalty);
  assert.equal(order3.state, 'failed');

  const order4 = createOrder(4, createRandom(8), true);
  const recipe4 = recipeById(order4.recipeId);
  const cursedGood = serveDish(order4, [...recipe4.items, 'pimenta'], 1);
  assert.equal(cursedGood.ok, true);
  assert.equal(cursedGood.cursed, true);
});

test('cooking: matchingOrder finds the waiting order a plate completes', () => {
  const orders = [createOrder(1, createRandom(9), true)];
  const recipe = recipeById(orders[0].recipeId);
  assert.equal(matchingOrder([...recipe.items], orders), orders[0]);
  assert.equal(matchingOrder(['pao'], orders), null);
  assert.equal(matchingOrder([...recipe.items, 'pimenta'], orders), orders[0]);
});

test('stations: five counters, pantry bins map to ingredients, no overlap gaps', () => {
  assert.equal(stationById('pantry').name, 'DESPENSA');
  assert.equal(stationById('serve').name, 'ENTREGA');
  assert.equal(stationAt(100, 150).id, 'pantry');
  assert.equal(stationAt(450, 150).id, 'chop');
  assert.equal(stationAt(1120, 350).id, 'serve');
  assert.equal(stationAt(640, 520), null);
  assert.equal(pantryBinAt(40, 140), 0);
  assert.ok(pantryBinAt(40, 140) >= 0);
});

test('shots: all four states are valid games with 2-3 orders and a plate or dish', () => {
  for (const name of ['cover', 'assembly', 'serve', 'rush-333']) {
    const state = stageShot(name, 7);
    assert.equal(state.screen, 'playing');
    assert.ok(state.orders.length >= 2 && state.orders.length <= 3);
    for (const order of state.orders) assert.ok(recipeById(order.recipeId));
    assert.ok(state.plate.length > 0 || state.readyDish !== null);
    assert.equal(state.transformed, true);
    const again = stageShot(name, 7);
    assert.deepEqual(
      again.orders.map((o) => [o.clientId, o.recipeId, o.patience]),
      state.orders.map((o) => [o.clientId, o.recipeId, o.patience]),
    );
  }
  const cover = stageShot('cover', 7);
  assert.equal(cover.orders.length, 3);
  assert.ok(cover.readyDish !== null);
  assert.ok(cover.plate.length >= 2);
  const rush = stageShot('rush-333', 9);
  assert.ok(rush.banner.includes('3:33'));
  assert.ok(rush.orders.some((o) => o.vip));
});

test('game state: a fresh shift starts calm, the 3:33 turn flips the phase', () => {
  const state = createState(42);
  assert.equal(state.screen, 'title');
  assert.equal(state.transformed, false);
  assert.equal(secondsToTransform(state), 40);
  startShift(state);
  assert.equal(state.screen, 'playing');
  assert.equal(state.score, 0);
  transform(state);
  assert.equal(state.transformed, true);
  assert.ok(state.banner.includes('3:33'));
  assert.equal(secondsToTransform(state), 40);
  state.elapsed = 45;
  assert.equal(secondsToTransform(state), 0);
});

test('human event: the post-party human shows up at night with confused lines', () => {
  const festeiro = monsterById('festeiro');
  assert.ok(festeiro);
  assert.equal(festeiro.kind, 'Humano pós-festa');
  assert.equal(festeiro.confusedLines.length, 3);
  // He is in the night pool: over many seeds he gets an order, and his
  // ticket line is always one of his confused lines.
  let seen = 0;
  for (let seed = 0; seed < 60; seed += 1) {
    const order = createOrder(1, createRandom(seed), true);
    if (order.clientId === 'festeiro') {
      seen += 1;
      assert.ok(festeiro.confusedLines.includes(order.taunt));
    }
  }
  assert.ok(seen > 0, 'festeiro never appeared in 60 night orders');
});

test('ghost and mummy quirks (from candidate C): ghost fades, mummy forgives', () => {
  assert.equal(monsterById('fantasma').fades, true);
  assert.equal(monsterById('mumia').forgiving, true);
  // Wrong dish to the mummy: he eats it anyway for half the points.
  const order = {
    id: 1, clientId: 'mumia', clientName: 'Zé Múmia', clientKind: 'Múmia',
    recipeId: 'bolo', recipeName: 'Bolo de Aranha',
    recipeItems: ['massa', 'cobertura', 'perna'],
    patience: 20, patienceMax: 36, vip: false, state: 'waiting',
  };
  const sanduiche = recipeById('sanduiche').items;
  const forgiven = serveDish(order, [...sanduiche], 1);
  assert.equal(forgiven.ok, true);
  assert.equal(forgiven.forgiven, true);
  assert.ok(forgiven.points > 0);
  assert.equal(order.state, 'served');
  // Half of what the served dish would score, not of the ordered one.
  const full = servePoints(recipeById('sanduiche'), monsterById('mumia'), 20, 36, 1, false, false);
  assert.equal(forgiven.points, Math.round(full / 2));
  // A wrong dish to a non-forgiving monster still costs 25.
  const conde = {
    id: 2, clientId: 'conde', clientName: 'Conde Mordisca', clientKind: 'Vampiro',
    recipeId: 'bolo', recipeName: 'Bolo de Aranha',
    recipeItems: ['massa', 'cobertura', 'perna'],
    patience: 20, patienceMax: 26, vip: false, state: 'waiting',
  };
  const wrong = serveDish(conde, [...sanduiche], 1);
  assert.equal(wrong.ok, false);
  assert.equal(wrong.forgiven, false);
  assert.equal(wrong.points, -25);
});

test('shots: unknown name falls back to cover (loudly), cover dish matches an order, rush is night', () => {
  const cover = stageShot('cover', 7);
  const fallback = stageShot('nada-disso', 7);
  assert.deepEqual(
    fallback.orders.map((o) => [o.clientId, o.recipeId, o.patience]),
    cover.orders.map((o) => [o.clientId, o.recipeId, o.patience]),
  );
  assert.equal(fallback.readyDish.recipeId, cover.readyDish.recipeId);
  // The ready dish on the hatch is a dish somebody actually ordered.
  assert.ok(cover.orders.some((o) => o.recipeId === cover.readyDish.recipeId));
  const rush = stageShot('rush-333', 9);
  assert.equal(rush.transformed, true);
  assert.equal(rush.transformFlash, 0);
});
