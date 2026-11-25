// The chef for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// The chef walks the kitchen floor toward a target point (arrow keys / WASD
// steer directly, a mouse click sets the target). No rules live here: this
// file only moves the cook and reports which station is in reach.
import { STATIONS, nearStation, stationCentre } from './stations.js';

export const CHEF_SPEED = 420;
export const FLOOR = { x: 20, y: 260, w: 1240, h: 280 };

/** Steer with a held direction (-1/0/1 on each axis) for `dt` seconds. */
export function steer(player, dx, dy, dt) {
  const len = Math.hypot(dx, dy);
  if (len === 0) return;
  player.x += (dx / len) * CHEF_SPEED * dt;
  player.y += (dy / len) * CHEF_SPEED * dt;
  player.moving = true;
  clampFloor(player);
}

/** Walk toward the click target; returns true while still walking. */
export function walkTo(player, dt) {
  const dx = player.tx - player.x;
  const dy = player.ty - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 6) {
    player.moving = false;
    return false;
  }
  const step = Math.min(dist, CHEF_SPEED * dt);
  player.x += (dx / dist) * step;
  player.y += (dy / dist) * step;
  player.moving = true;
  clampFloor(player);
  return true;
}

function clampFloor(player) {
  player.x = Math.min(FLOOR.x + FLOOR.w, Math.max(FLOOR.x, player.x));
  player.y = Math.min(FLOOR.y + FLOOR.h, Math.max(FLOOR.y, player.y));
}

/** Set a walk target (mouse click on the kitchen floor). */
export function setTarget(player, x, y) {
  player.tx = Math.min(FLOOR.x + FLOOR.w, Math.max(FLOOR.x, x));
  player.ty = Math.min(FLOOR.y + FLOOR.h, Math.max(FLOOR.y, y));
}

/** Stop the chef where he stands: no walk target, no motion. */
export function stopMoving(player) {
  player.tx = player.x;
  player.ty = player.y;
  player.moving = false;
}

/** The station the chef can work right now, or null. */
export function stationInReach(player) {
  for (const station of STATIONS) {
    if (nearStation(player.x, player.y, station)) return station;
  }
  return null;
}

/** Walk target for a station: the spot in front of its counter. */
export function goToStation(player, station) {
  const c = stationCentre(station);
  setTarget(player, c.x, c.y);
}
