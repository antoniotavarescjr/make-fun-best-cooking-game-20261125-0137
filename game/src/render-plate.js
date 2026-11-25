// Plate strip renderer for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// The DOM strip under the kitchen mirrors the plate on the canvas: the items
// already on it, the empty slots still missing, and the cursed ingredient
// glowing red when the dish is possessed. Click a chip to take it back off.
import { CURSED_BOOK, ingredientById } from './menu-data.js';

export function createPlateStrip(root, onRemove) {
  function render(state) {
    const slots = [];
    for (let i = 0; i < 3; i += 1) {
      const id = state.plate[i];
      if (id) {
        const ingredient = ingredientById(id);
        const cursed = id === CURSED_BOOK.ingredient ? ' cursed' : '';
        slots.push(`<button type="button" class="plate-chip${cursed}" data-i="${i}">${ingredient.icon} ${ingredient.name}</button>`);
      } else {
        slots.push('<span class="plate-slot">vazio</span>');
      }
    }
    const dish = state.readyDish
      ? `<span class="ready-badge">PRONTO: ${state.readyDish.recipeId.toUpperCase()}${state.readyDish.cursed ? ' (AMALDIÇOADO!)' : ''} — clique no pedido para servir!</span>`
      : '<span class="ready-badge off">Nenhum prato pronto</span>';
    root.innerHTML = `<span class="plate-label">PRATO:</span>${slots.join('')}${dish}`;
    root.querySelectorAll('.plate-chip').forEach((button) => {
      button.addEventListener('click', () => onRemove(Number(button.dataset.i)));
    });
  }
  return { render };
}
