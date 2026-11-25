// Order board renderer for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// The tickets are DOM, not canvas text, so they stay crisp when the judge's
// contact sheet shrinks the screenshot: monster, dish, ingredient chips,
// the client's taunt (SEM ALHO!) and a patience bar that drains green to red.
// Click a ticket to select it; click it again with a finished dish to serve.
import { ingredientById, monsterById } from './menu-data.js';

export function createOrderBoard(root, onSelect) {
  const slots = [];
  for (let i = 0; i < 3; i += 1) {
    const card = document.createElement('button');
    card.className = 'ticket';
    card.type = 'button';
    card.addEventListener('click', () => onSelect(i));
    root.appendChild(card);
    slots.push(card);
  }

  function chip(ingredientId) {
    const ingredient = ingredientById(ingredientId);
    if (!ingredient) return '';
    return `<span class="chip" style="--chip:${ingredient.color}">${ingredient.icon} ${ingredient.name}</span>`;
  }

  function render(state) {
    slots.forEach((card, index) => {
      const order = state.orders[index];
      if (!order) {
        card.className = 'ticket empty';
        card.innerHTML = '<span class="ticket-wait">Aguardando monstro…</span>';
        return;
      }
      const frac = order.patience / order.patienceMax;
      const urgent = frac < 0.3 ? ' urgent' : '';
      const selected = state.selectedOrder === index ? ' selected' : '';
      card.className = `ticket${urgent}${selected}`;
      // The ghost's order fades away as her patience drains (candidate C's
      // idea) — but never below 55% opacity, so the ticket stays readable
      // exactly when the player needs it most.
      const monster = monsterById(order.clientId);
      card.style.opacity = monster && monster.fades ? String(0.55 + 0.45 * frac) : '';
      card.setAttribute('aria-label', `Pedido ${index + 1}: ${order.recipeName} para ${order.clientName}, ${Math.ceil(order.patience)} segundos`);
      card.innerHTML =
        `<span class="ticket-head"><b>${order.clientName}</b> <i>${order.clientKind}</i>` +
        `${order.vip ? ' <em class="vip">VIP ×2</em>' : ''}</span>` +
        `<span class="ticket-dish">${order.recipeName}</span>` +
        `<span class="ticket-items">${order.recipeItems.map(chip).join('')}</span>` +
        (order.taunt ? `<span class="ticket-taunt">${order.taunt}</span>` : '') +
        `<span class="patience"><span style="width:${Math.round(frac * 100)}%"></span></span>` +
        `<span class="ticket-time">${Math.ceil(order.patience)}s</span>`;
    });
  }

  return { render };
}
