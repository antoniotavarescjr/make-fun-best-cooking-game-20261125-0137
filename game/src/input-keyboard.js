// Keyboard input for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Held keys steer the chef; one-shot presses are queued as flags and taken
// once by the loop, so a press between frames is never lost or double-counted.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_RESTART = 4;
export const ACTION_CURSED = 8;

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const CONFIRM = new Set(['Space', 'Enter', 'KeyE']);
const PAUSE = new Set(['KeyP', 'Escape']);
const RESTART = new Set(['KeyR']);
const CURSED = new Set(['KeyB']);
const ORDER_KEYS = new Set(['Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3']);

export function createKeyboard() {
  const held = { left: false, right: false, up: false, down: false };
  let actions = 0;
  let orderKey = -1;
  let pantryStep = 0;

  window.addEventListener('keydown', (event) => {
    if (LEFT.has(event.code)) held.left = true;
    else if (RIGHT.has(event.code)) held.right = true;
    else if (UP.has(event.code)) held.up = true;
    else if (DOWN.has(event.code)) held.down = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (RESTART.has(event.code)) {
      if (!event.repeat) actions |= ACTION_RESTART;
    } else if (CURSED.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CURSED;
    } else if (ORDER_KEYS.has(event.code)) {
      orderKey = Number(event.code.slice(-1)) - 1;
    } else if (event.code === 'KeyQ') {
      pantryStep = -1;
    } else if (event.code === 'KeyT') {
      pantryStep = 1;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (LEFT.has(event.code)) held.left = false;
    else if (RIGHT.has(event.code)) held.right = false;
    else if (UP.has(event.code)) held.up = false;
    else if (DOWN.has(event.code)) held.down = false;
  });
  window.addEventListener('blur', () => {
    held.left = held.right = held.up = held.down = false;
  });

  return {
    direction() {
      return { x: (held.right ? 1 : 0) - (held.left ? 1 : 0), y: (held.down ? 1 : 0) - (held.up ? 1 : 0) };
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeOrderKey() {
      const key = orderKey;
      orderKey = -1;
      return key;
    },
    takePantryStep() {
      const step = pantryStep;
      pantryStep = 0;
      return step;
    },
  };
}
