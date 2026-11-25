// HUD renderer for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// The big numbers live in DOM: the shift timer, the wall clock (3:33),
// score, combo and the cursed-book button. Updated only when a value
// changes, so the HUD never flickers between frames.
import { clockLabel, timerLabel } from './clock.js';
import { comboMultiplier } from './scoring.js';

export function createHud(els) {
  const seen = {};
  function set(key, el, text) {
    if (seen[key] !== text) {
      seen[key] = text;
      el.textContent = text;
    }
  }

  function render(state) {
    set('timer', els.timer, `TEMPO ${timerLabel(state.elapsed)}`);
    set('clock', els.clock, `RELÓGIO ${clockLabel(state.elapsed)}`);
    set('score', els.score, `Pontos ${state.score}`);
    set('combo', els.combo, state.combo > 1 ? `COMBO ×${comboMultiplier(state.combo).toFixed(1)} (${state.combo})` : 'COMBO ×1');
    els.combo.classList.toggle('hot', state.combo >= 3);
    set('phase', els.phase, state.transformed ? 'NOITE DOS MONSTROS' : 'TURNO NORMAL');
    els.phase.classList.toggle('night', state.transformed);
    set('served', els.served, `Servidos ${state.served} · Perdidos ${state.failed}`);
    set('msg', els.message, state.messageT > 0 ? state.message : '');
    set('hands', els.hands, state.carried.length === 0 ? 'Mãos vazias — pegue na despensa' : `Nas mãos: ${state.carried.length}/3`);
  }

  return { render };
}
