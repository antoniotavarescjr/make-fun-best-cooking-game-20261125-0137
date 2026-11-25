// Kitchen renderer for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Draws only: the room, the counters, the monsters waiting, the chef, the
// plate and the finished dish. Reads state, never writes it. Day palette is
// warm cream; after 3:33 the room flips to purple and toxic green, and while
// the transformation flickers the lights strobe between the two.
import { INGREDIENTS, ingredientById, recipeById } from './menu-data.js';
import { clockLabel } from './clock.js';
import { PALETTE, drawChef, drawIngredientIcon, drawMonsterFace } from './pixel-sprites.js';
import { STATIONS, pantryBinRect } from './stations.js';
import { itemLabel } from './ingredients.js';

export const VIEW = { width: 1280, height: 480 };

export function createKitchenRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(VIEW.width * ratio);
    canvas.height = Math.round(VIEW.height * ratio);
    canvas.style.width = `${VIEW.width}px`;
    canvas.style.height = `${VIEW.height}px`;
  }

  function night(state) {
    return state.transformed;
  }

  function flicker(state) {
    if (state.transformFlash <= 0) return false;
    return Math.floor(state.elapsed * 8) % 2 === 0;
  }

  function drawRoom(state) {
    const isNight = night(state) && !flicker(state);
    ctx.fillStyle = isNight ? PALETTE.nightWall : PALETTE.dayWall;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = isNight ? PALETTE.nightFloor : PALETTE.dayFloor;
    ctx.fillRect(0, 260, VIEW.width, 220);
    ctx.fillStyle = isNight ? '#1a0f2a' : '#b5763f';
    for (let x = 0; x < VIEW.width; x += 64) ctx.fillRect(x, 260, 32, 220);
    ctx.fillStyle = isNight ? PALETTE.nightTrim : PALETTE.dayTrim;
    ctx.fillRect(0, 252, VIEW.width, 8);
    // Wall clock: the same clockLabel() the DOM HUD uses, so both clocks
    // always agree — 3:33 all night long, 3:00 before the turn.
    ctx.fillStyle = '#f5efdd';
    ctx.beginPath();
    ctx.arc(1180, 52, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d1420';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(clockLabel(state.elapsed), 1180, 54);
    // Cobweb in the corner once the monsters own the place.
    if (isNight) {
      ctx.strokeStyle = '#c9b8e8';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(40 + i * 18, 70 - i * 14);
        ctx.stroke();
      }
    }
    // Sign over the door.
    ctx.fillStyle = isNight ? '#7bd747' : '#c1121f';
    ctx.font = 'bold 26px monospace';
    ctx.fillText(isNight ? 'CANTINA DOS MONSTROS' : 'BISTRÔ DAS 3:33', 640, 40);
  }

  function drawCounters(state) {
    const isNight = night(state) && !flicker(state);
    for (const station of STATIONS) {
      const hot = state.work && state.work.station === station.id;
      ctx.fillStyle = '#1d1420';
      ctx.fillRect(station.x - 4, station.y - 4, station.w + 8, station.h + 8);
      ctx.fillStyle = isNight ? PALETTE.nightCounter : PALETTE.dayCounter;
      ctx.fillRect(station.x, station.y, station.w, station.h);
      ctx.fillStyle = hot ? '#f2c94c' : '#f5efdd';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(station.name, station.x + station.w / 2, station.y + 26);
      ctx.fillStyle = '#d8cbb0';
      ctx.font = '15px monospace';
      ctx.fillText(station.hint, station.x + station.w / 2, station.y + station.h - 10);
    }
    // Pantry bins: every ingredient, labelled by colour and letter.
    INGREDIENTS.forEach((ingredient, index) => {
      const rect = pantryBinRect(index);
      drawIngredientIcon(ctx, ingredient, rect.x, rect.y, rect.w);
      if (state.pantryPick === index) {
        ctx.strokeStyle = '#f2c94c';
        ctx.lineWidth = 3;
        ctx.strokeRect(rect.x - 3, rect.y - 3, rect.w + 6, rect.h + 6);
      }
    });
    // Work progress on the chop board / stove.
    if (state.work) {
      const station = STATIONS.find((s) => s.id === state.work.station);
      const done = state.work.t / state.work.duration;
      ctx.fillStyle = '#1d1420';
      ctx.fillRect(station.x + 10, station.y + station.h - 34, station.w - 20, 16);
      ctx.fillStyle = '#f2c94c';
      ctx.fillRect(station.x + 12, station.y + station.h - 32, (station.w - 24) * done, 12);
    }
  }

  function drawPlateAndDish(state) {
    const plate = STATIONS.find((s) => s.id === 'plate');
    const cx = plate.x + plate.w / 2;
    // Plate: a white disc with the items already on it, empty slots dashed.
    ctx.fillStyle = '#f5efdd';
    ctx.beginPath();
    ctx.ellipse(cx, plate.y + 78, 92, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1d1420';
    ctx.lineWidth = 3;
    ctx.stroke();
    state.plate.forEach((id, i) => {
      const ingredient = ingredientById(id);
      if (ingredient) drawIngredientIcon(ctx, ingredient, cx - 76 + i * 44, plate.y + 58, 36);
    });
    for (let i = state.plate.length; i < 3; i += 1) {
      ctx.strokeStyle = '#9a8f7a';
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(cx - 76 + i * 44, plate.y + 58, 36, 36);
      ctx.setLineDash([]);
    }
    // Finished dish on the serving hatch, glowing when ready to serve.
    const serve = STATIONS.find((s) => s.id === 'serve');
    if (state.readyDish) {
      const recipe = recipeById(state.readyDish.recipeId);
      const glow = 0.5 + 0.5 * Math.sin(state.elapsed * 6);
      ctx.fillStyle = `rgba(242, 201, 76, ${0.25 + glow * 0.45})`;
      ctx.fillRect(serve.x + 8, serve.y + 34, serve.w - 16, 84);
      ctx.fillStyle = '#f5efdd';
      ctx.beginPath();
      ctx.ellipse(serve.x + serve.w / 2, serve.y + 78, 84, 46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f2c94c';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#1d1420';
      ctx.font = 'bold 19px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRONTO! SIRVA!', serve.x + serve.w / 2, serve.y + 136);
      ctx.font = 'bold 16px monospace';
      ctx.fillText(recipe.name, serve.x + serve.w / 2, serve.y + 82);
    }
  }

  function drawMonsters(state) {
    // Waiting clients queue along the top-right, faces big enough to read.
    const waiting = state.orders.filter((o) => o.state === 'waiting');
    waiting.forEach((order, i) => {
      const x = 830 + i * 130;
      // Raised so the patience bar (y+86..y+96) stays inside the 480 px
      // canvas: at y=382 the bar ends at 478, with 2 px to spare.
      const y = 382;
      const monster = order.clientId;
      drawMonsterFace(ctx, monster, x, y, 4);
      ctx.fillStyle = '#1d1420';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(order.clientName, x + 32, y + 78);
      const frac = order.patience / order.patienceMax;
      ctx.fillStyle = '#1d1420';
      ctx.fillRect(x, y + 86, 64, 10);
      ctx.fillStyle = frac > 0.5 ? '#7bd747' : frac > 0.25 ? '#f2c94c' : '#c1121f';
      ctx.fillRect(x + 1, y + 87, 62 * frac, 8);
    });
  }

  function drawChefAndHands(state) {
    const p = state.player;
    drawChef(ctx, p.x - 28, p.y - 56, 4);
    // Carried items stacked above the chef's head.
    state.carried.forEach((item, i) => {
      const ingredient = ingredientById(item.id);
      if (ingredient) drawIngredientIcon(ctx, ingredient, p.x - 30 + i * 34, p.y - 92, 28);
    });
    if (state.carried.length > 0) {
      ctx.fillStyle = '#1d1420';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(itemLabel(state.carried[state.carried.length - 1]), p.x, p.y - 98);
    }
    // Floating score popups.
    ctx.textAlign = 'center';
    for (const floater of state.floaters) {
      ctx.globalAlpha = Math.min(1, floater.t);
      ctx.fillStyle = floater.color;
      ctx.font = 'bold 26px monospace';
      ctx.fillText(floater.text, floater.x, floater.y - (1.6 - floater.t) * 40);
      ctx.globalAlpha = 1;
    }
    // Banner across the room for the transformation and the shift start.
    if (state.bannerT > 0 && state.banner) {
      ctx.fillStyle = 'rgba(29, 20, 32, 0.88)';
      ctx.fillRect(140, 210, 1000, 64);
      ctx.fillStyle = '#f2c94c';
      ctx.font = 'bold 30px monospace';
      ctx.fillText(state.banner, 640, 252);
    }
  }

  function drawTitle(state) {
    drawRoom(state);
    ctx.fillStyle = 'rgba(29, 20, 32, 0.85)';
    ctx.fillRect(240, 120, 800, 320);
    ctx.fillStyle = '#f2c94c';
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BISTRÔ DAS 3:33', 640, 190);
    ctx.fillStyle = '#f5efdd';
    ctx.font = '20px monospace';
    ctx.fillText('De dia, um restaurante normal. Às 3:33, os monstros chegam', 640, 240);
    ctx.fillText('com fome — e com pedidos muito esquisitos.', 640, 270);
    ctx.fillStyle = '#7bd747';
    ctx.fillText('WASD/setas andam · E ou clique usa a bancada · 1-3 escolhe o pedido', 640, 320);
    ctx.fillText('B põe Pimenta do Além no prato: dobra a gorjeta ou queima o pedido!', 640, 350);
    ctx.fillStyle = '#f2c94c';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('Espaço ou clique para começar', 640, 410);
  }

  function drawEnd(state) {
    drawRoom(state);
    ctx.fillStyle = 'rgba(29, 20, 32, 0.88)';
    ctx.fillRect(280, 110, 720, 340);
    ctx.fillStyle = '#f2c94c';
    ctx.font = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FIM DO TURNO', 640, 170);
    ctx.fillStyle = '#f5efdd';
    ctx.font = '22px monospace';
    ctx.fillText(`Pratos servidos: ${state.served}   Perdidos: ${state.failed}`, 640, 230);
    ctx.fillText(`Melhor combo: x${state.bestCombo}   Pontos: ${state.score}`, 640, 268);
    ctx.fillStyle = '#f2c94c';
    ctx.font = 'bold 30px monospace';
    const stars = state._stars || 0;
    ctx.fillText('★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 320);
    ctx.fillStyle = '#f5efdd';
    ctx.font = '20px monospace';
    ctx.fillText(stars >= 3 ? 'O restaurante sobreviveu à noite!' : 'A noite foi dura. Tente de novo!', 640, 360);
    ctx.fillStyle = '#f2c94c';
    ctx.fillText('Pressione R ou clique para jogar de novo', 640, 410);
  }

  function draw(state) {
    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (state.screen === 'title') {
      drawTitle(state);
      return;
    }
    drawRoom(state);
    drawCounters(state);
    drawPlateAndDish(state);
    drawMonsters(state);
    drawChefAndHands(state);
    if (state.screen === 'shiftEnd') drawEnd(state);
    if (state.screen === 'paused') {
      ctx.fillStyle = 'rgba(29, 20, 32, 0.7)';
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
      ctx.fillStyle = '#f5efdd';
      ctx.font = 'bold 40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSADO — P para continuar', 640, 280);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw, resize };
}
