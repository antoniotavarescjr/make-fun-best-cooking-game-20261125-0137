// Kitchen stations for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Where everything is and what each counter does. The route between them is
// the game: pantry on the left, chopping board and stove in the middle,
// plating in the centre and the serving hatch on the right. Positions are in
// the 1280x480 canvas, matching the renderer exactly.
export const STATIONS = [
  { id: 'pantry', name: 'DESPENSA', hint: 'Pegue ingredientes', x: 20, y: 90, w: 300, h: 150 },
  { id: 'chop', name: 'TÁBUA DE CORTE', hint: 'Pique aqui', x: 350, y: 90, w: 200, h: 150 },
  { id: 'stove', name: 'FOGÃO', hint: 'Cozinhe aqui', x: 580, y: 90, w: 200, h: 150 },
  { id: 'plate', name: 'MONTAGEM', hint: 'Monte o prato', x: 440, y: 300, w: 260, h: 150 },
  { id: 'serve', name: 'ENTREGA', hint: 'Sirva o prato pronto', x: 980, y: 300, w: 280, h: 150 },
];

export function stationById(id) {
  return STATIONS.find((station) => station.id === id) || null;
}

/** Every station id, in the order the chef walks them. */
export const ALL_STATION_IDS = STATIONS.map((station) => station.id);

/** Centre of a station, where the chef stands to use it. */
export function stationCentre(station) {
  return { x: station.x + station.w / 2, y: station.y + station.h + 36 };
}

/** The station whose counter contains point (x, y), or null. */
export function stationAt(x, y) {
  return STATIONS.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) || null;
}

/** True when the chef at (x, y) is close enough to work a station. */
export function nearStation(x, y, station) {
  const c = stationCentre(station);
  return Math.abs(x - c.x) < station.w / 2 + 60 && Math.abs(y - c.y) < 90;
}

// The pantry bins: 13 ingredients in two rows inside the pantry counter.
export const PANTRY_COLS = 7;
export const PANTRY_BIN = 40;

export function pantryBinAt(x, y) {
  const pantry = stationById('pantry');
  const bx = Math.floor((x - pantry.x - 8) / (PANTRY_BIN + 2));
  const by = Math.floor((y - pantry.y - 34) / (PANTRY_BIN + 2));
  if (bx < 0 || by < 0 || bx >= PANTRY_COLS || by > 1) return -1;
  return by * PANTRY_COLS + bx;
}

export function pantryBinRect(index) {
  const pantry = stationById('pantry');
  const col = index % PANTRY_COLS;
  const row = Math.floor(index / PANTRY_COLS);
  return {
    x: pantry.x + 8 + col * (PANTRY_BIN + 2),
    y: pantry.y + 34 + row * (PANTRY_BIN + 2),
    w: PANTRY_BIN, h: PANTRY_BIN,
  };
}
