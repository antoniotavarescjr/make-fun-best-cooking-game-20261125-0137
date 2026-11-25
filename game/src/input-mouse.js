// Mouse input for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Clicks on the canvas are translated to kitchen coordinates and queued:
// a pantry bin, a station counter, or plain floor (walk there). The game
// loop consumes the queue; this file never decides what a click does.
export function createMouse(canvas) {
  const clicks = [];

  function toGame(event) {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 1280;
    const y = ((event.clientY - rect.top) / rect.height) * 480;
    // Clamp to the kitchen: a click on the page chrome still lands inside.
    return { x: Math.min(1280, Math.max(0, x)), y: Math.min(480, Math.max(0, y)) };
  }

  canvas.addEventListener('pointerdown', (event) => {
    clicks.push(toGame(event));
  });

  return {
    /** All clicks since the last call, in 1280x480 kitchen coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
