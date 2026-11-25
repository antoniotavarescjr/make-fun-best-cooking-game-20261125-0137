// Orders for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Creates, drains and retires the tickets on the order board. An order is a
// monster (or a day human), a recipe, a patience bar and a state. Nothing
// here draws or reads input; the renderer reads the returned list.
import { DAY_RECIPES, HUMANS, MONSTERS, NIGHT_RECIPES, monsterById, recipeById } from './menu-data.js';
import { pick } from './seeded-random.js';

export const MAX_ORDERS = 3;
export const ORDER_EVERY_DAY = 13;
export const ORDER_EVERY_NIGHT = 9;

/** A fresh order. `vip` orders pay double and lose patience twice as fast. */
export function createOrder(id, random, night) {
  const client = night ? pick(random, MONSTERS) : pick(random, HUMANS);
  const pool = night ? NIGHT_RECIPES : DAY_RECIPES;
  let recipeId = pick(random, pool);
  if (client.likes && random() < 0.55) recipeId = client.likes;
  const recipe = recipeById(recipeId);
  const vip = night && random() < 0.22;
  const patienceMax = vip ? client.patience * 0.55 : client.patience;
  // Clients with several confused lines (Zé Festeiro, the post-party human)
  // rotate one line per order id, deterministically — no new randomness.
  const taunt = client.confusedLines
    ? client.confusedLines[id % client.confusedLines.length]
    : (client.taunt || '');
  return {
    id, clientId: client.id, clientName: client.name, clientKind: client.kind,
    clientColor: client.color, recipeId, recipeName: recipe.name,
    recipeItems: [...recipe.items], patience: patienceMax, patienceMax,
    vip, state: 'waiting', taunt,
  };
}

/**
 * Drain every waiting order by `dt` seconds (scaled by `drain`). Returns the
 * orders whose patience just ran out; they are marked failed by the caller.
 */
export function drainOrders(orders, dt, drain) {
  const expired = [];
  for (const order of orders) {
    if (order.state !== 'waiting') continue;
    order.patience = Math.max(0, order.patience - dt * drain);
    if (order.patience <= 0) {
      order.state = 'failed';
      expired.push(order);
    }
  }
  return expired;
}

/** Remove failed and served orders from the board. */
export function clearFinished(orders) {
  return orders.filter((order) => order.state === 'waiting');
}

/** Only the orders still waiting on the board. */
export function waitingOrders(orders) {
  return orders.filter((order) => order.state === 'waiting');
}

/** The most urgent waiting order: lowest patience fraction. */
export function mostUrgent(orders) {
  let best = null;
  for (const order of orders) {
    if (order.state !== 'waiting') continue;
    if (!best || order.patience / order.patienceMax < best.patience / best.patienceMax) best = order;
  }
  return best;
}

/** Look up an order by id, or null. */
export function orderById(orders, id) {
  return orders.find((order) => order.id === id) || null;
}

/** The client record (monster or human) behind an order. */
export function clientFor(order) {
  return monsterById(order.clientId) || HUMANS.find((human) => human.id === order.clientId) || null;
}
