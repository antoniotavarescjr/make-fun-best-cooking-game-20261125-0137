// Cooking rules for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// The plate pipeline: add a ready item to the plate, check whether the plate
// matches a waiting order, and serve the finished dish. A wrong item never
// blocks the game: it can be taken off the plate, and a wrong serve costs
// points and the combo, not the run. The cursed ingredient is the gamble:
// it doubles the tip on a correct dish and burns the order on a wrong one.
import { CURSED_BOOK, RECIPES, recipeById, ingredientById } from './menu-data.js';
import { isReady } from './ingredients.js';
import { servePoints } from './scoring.js';
import { clientFor } from './orders.js';

export const MAX_CARRIED = 3;
export const MAX_PLATE = 4;

/** Same items, any order: the plate matches the recipe exactly. */
export function plateMatches(plate, recipe) {
  if (plate.length !== recipe.items.length) return false;
  const wanted = [...recipe.items].sort();
  const have = [...plate].sort();
  return wanted.every((item, index) => item === have[index]);
}

/**
 * Which waiting order, if any, does this plate (without the cursed item)
 * complete? Returns the order or null.
 */
export function matchingOrder(plate, orders) {
  const plain = plate.filter((id) => id !== CURSED_BOOK.ingredient);
  for (const order of orders) {
    if (order.state !== 'waiting') continue;
    if (plateMatches(plain, recipeById(order.recipeId))) return order;
  }
  return null;
}

/** Add a carried item to the plate. Returns false when the plate is full. */
export function addToPlate(plate, item) {
  if (plate.length >= MAX_PLATE || !isReady(item)) return false;
  plate.push(item.id);
  return true;
}

/** Take the last item back off the plate (fixing a mistake costs time, not the run). */
export function removeFromPlate(plate) {
  return plate.pop() || null;
}

/** Add the forbidden ingredient to the plate, if there is room. */
export function addCursed(plate) {
  if (plate.length >= MAX_PLATE || plate.includes(CURSED_BOOK.ingredient)) return false;
  plate.push(CURSED_BOOK.ingredient);
  return true;
}

/** The plate as a readable list of names, for the HUD and the tests. */
export function plateSummary(plate) {
  return plate.map((id) => {
    const ingredient = ingredientById(id);
    return ingredient ? ingredient.name : id;
  }).join(' + ');
}

/**
 * Serve the finished dish to `order`. Returns { ok, points, cursed, burned, forgiven }.
 * A correct dish scores (VIP doubles it, see scoring.js); a cursed correct
 * dish scores double and a cursed wrong dish burns the order (failed at
 * once, penalty points). A forgiving client (Zé Múmia, like candidate C's
 * zombie) eats the wrong dish anyway for half the points of the dish served
 * — the combo does not break, but he pays half.
 */
export function serveDish(order, plate, combo) {
  const cursed = plate.includes(CURSED_BOOK.ingredient);
  const recipe = recipeById(order.recipeId);
  const plain = plate.filter((id) => id !== CURSED_BOOK.ingredient);
  const correct = plateMatches(plain, recipe);
  const client = clientFor(order);
  if (correct) {
    const points = servePoints(recipe, client, order.patience, order.patienceMax, combo, cursed, order.vip);
    order.state = 'served';
    return { ok: true, points, cursed, burned: false, forgiven: false };
  }
  if (cursed) {
    order.state = 'failed';
    return { ok: false, points: -CURSED_BOOK.burnPenalty, cursed: true, burned: true, forgiven: false };
  }
  if (client && client.forgiving) {
    const servedRecipe = RECIPES.find((candidate) => plateMatches(plain, candidate));
    if (servedRecipe) {
      const points = Math.round(servePoints(servedRecipe, client, order.patience, order.patienceMax, combo, false, order.vip) / 2);
      order.state = 'served';
      return { ok: true, points, cursed: false, burned: false, forgiven: true };
    }
  }
  return { ok: false, points: -25, cursed: false, burned: false, forgiven: false };
}
