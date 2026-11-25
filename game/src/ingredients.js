// Ingredients for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// One carried item is raw, chopped or cooked. Each ingredient knows its one
// prep step (or none); the prep station advances it. Pure state transitions,
// so the tests can drive a whole dish without a browser.
import { ingredientById } from './menu-data.js';

/** A carried item straight from the pantry: raw, unprepped. */
export function rawItem(ingredientId) {
  return { id: ingredientId, prep: 'raw' };
}

/** The prep step an item still needs, or null when it is ready to plate. */
export function prepNeeded(item) {
  const ingredient = ingredientById(item.id);
  if (!ingredient || ingredient.prep === 'none') return null;
  if (ingredient.prep === 'chop' && item.prep === 'raw') return 'chop';
  if (ingredient.prep === 'cook' && item.prep === 'raw') return 'cook';
  return null;
}

/** Is this item ready to go on a plate? */
export function isReady(item) {
  return prepNeeded(item) === null;
}

/** Apply one finished prep step. Chop turns raw into chopped; cook into cooked. */
export function applyPrep(item, step) {
  if (step === 'chop' && item.prep === 'raw') return { id: item.id, prep: 'chopped' };
  if (step === 'cook' && item.prep === 'raw') return { id: item.id, prep: 'cooked' };
  return item;
}

/** Seconds a prep step takes at its station. */
export function prepSeconds(step) {
  return step === 'chop' ? 1.1 : 2.2;
}

/** The station a step happens at: the chopping board or the stove. */
export function stationFor(step) {
  return step === 'chop' ? 'chop' : 'stove';
}

/** Human label for an item's current state, shown above the chef. */
export function itemLabel(item) {
  const ingredient = ingredientById(item.id);
  if (!ingredient) return '?';
  if (item.prep === 'chopped') return `${ingredient.name} picado`;
  if (item.prep === 'cooked') return `${ingredient.name} pronto`;
  const needed = prepNeeded(item);
  if (needed === 'chop') return `${ingredient.name} (picar)`;
  if (needed === 'cook') return `${ingredient.name} (cozinhar)`;
  return ingredient.name;
}

/** The station an item still needs to visit, or null when it is plate-ready. */
export function prepStationFor(item) {
  const needed = prepNeeded(item);
  return needed === null ? null : stationFor(needed);
}
