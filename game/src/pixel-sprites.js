// 8-bit pixel sprites for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Every sprite is a grid of characters in code — no image files, no network.
// One character is one pixel; '.' is transparent. Silhouette first, so each
// face still reads at 1x when the screenshot is shrunk for the judge.
export const PALETTE = {
  dayWall: '#f2e3c6', dayFloor: '#c98f5f', dayCounter: '#8a5a33', dayTrim: '#2e7d5b',
  nightWall: '#241533', nightFloor: '#3d2b52', nightCounter: '#4a2b6b', nightTrim: '#7bd747',
  text: '#1d1420', lightText: '#f5efdd', accent: '#c1121f', gold: '#f2c94c',
};

const CHEF = [
  '....hhhhhh....',
  '...hhhhhhhh...',
  '...hwwwwwwh...',
  '...hwwwwwwh...',
  '....ssssss....',
  '....seesse....',
  '....ssssss....',
  '.....s..s.....',
  '....ssssss....',
  '...ssssssss...',
  '..ssssssssss..',
  '..s.ssssss.s..',
  '....ssssss....',
  '....ss..ss....',
  '....ss..ss....',
  '...sss..sss...',
];
const CHEF_COLORS = { h: '#f5efdd', w: '#ffffff', s: '#2e7d5b', e: '#1d1420' };

const MONSTER_FACES = {
  conde: [
    '................',
    '...kk........kk..',
    '...kkk......kkk..',
    '..rrrrrrrrrrrr..',
    '..rwwwwwwwwwwr..',
    '..rwkkwwwwkkwr..',
    '..rwkkwwwwkkwr..',
    '..rwwwwwwwwwwr..',
    '..rrrrrrrrrrrr..',
    '...rrrrrrrrrr...',
    '....rwwwwwwr....',
    '....rwkwwkwr....',
    '.....rrrrrr.....',
    '....kk....kk....',
    '...kk......kk...',
    '................',
  ],
  mumia: [
    '................',
    '..bbbbbbbbbbbb..',
    '..bwwwwwwwwwwb..',
    '..bwbwbwbwbwb..',
    '..bwwwwwwwwwwb..',
    '..bwkkwwwwkkwb..',
    '..bwwwwwwwwwwb..',
    '..bwbwbwbwbwb..',
    '..bwwwwwwwwwwb..',
    '..bwwbbbbbbwwb..',
    '..bwbwkkkkwbwb..',
    '..bwwwwwwwwwwb..',
    '...bbbbbbbbbb...',
    '................',
    '................',
    '................',
  ],
  aranha: [
    '..k..........k..',
    '...k........k...',
    '....kkkkkkkkkk....',
    '...pppppppppppp...',
    '...pwwwwwwwwwwp...',
    '...pwkkwwwwkkwp...',
    '...pwwwwwwwwwwp...',
    '...ppwwwwwwwwpp...',
    '....pwwwwwwwwp....',
    '....ppkkkkkkpp....',
    '.....pwwwwwwp.....',
    '...kkpwwwwpkk...',
    '..k..pppppp..k..',
    '......k....k......',
    '................',
    '................',
  ],
  lodo: [
    '................',
    '.....gggggg.....',
    '....gggggggg....',
    '...gggggggggg...',
    '...gwwwwwwwwg...',
    '...gwkkwwkkwg...',
    '...gwwwwwwwwg...',
    '...gggggggggg...',
    '....gggggggg....',
    '....gwwkkwwg....',
    '...gggggggggg...',
    '...g.gggggg.g...',
    '....gg....gg....',
    '................',
    '................',
    '................',
  ],
  // Dona Sumida, the ghost: a white sheet with a wavy hem.
  fantasma: [
    '................',
    '.....wwwwww.....',
    '....wwwwwwww....',
    '...wwwwwwwwww...',
    '...wwkkwwkkww...',
    '...wwkkwwkkww...',
    '...wwwwwwwwww...',
    '...wwwwwwwwww...',
    '...wwwwwwwwww...',
    '...wwwwwwwwww...',
    '...wwwwwwwwww...',
    '...wwwwwwwwww...',
    '...wwwwwwwwww...',
    '...ww.ww.ww.ww..',
    '...w.w.w.w.w....',
    '................',
  ],
  // Zé Festeiro, the post-party human: party hat, human skin, confused smile.
  festeiro: [
    '................',
    '.......rr.......',
    '......rrrr......',
    '.....rrrrrr.....',
    '....hhhhhhhh....',
    '....hhhhhhhh....',
    '....hkhhhhkh....',
    '....hhhhhhhh....',
    '....hhhhhhhh....',
    '.....hhhhhh.....',
    '.....hhkkhh.....',
    '......hhhh......',
    '.....hhhhhh.....',
    '....hhhhhhhh....',
    '................',
    '................',
  ],
};
const FACE_COLORS = {
  k: '#1d1420', r: '#c1121f', w: '#ffffff', b: '#e8dcb8',
  p: '#7b2cbf', g: '#7bd747', h: '#f0c8a0',
};

/** Draw a character grid on a canvas context, scaled up, no smoothing. */
export function drawSprite(ctx, grid, colors, x, y, scale) {
  ctx.imageSmoothingEnabled = false;
  for (let row = 0; row < grid.length; row += 1) {
    const line = grid[row];
    for (let col = 0; col < line.length; col += 1) {
      const ch = line[col];
      if (ch === '.') continue;
      ctx.fillStyle = colors[ch] || '#ff00ff';
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

export function drawChef(ctx, x, y, scale) {
  drawSprite(ctx, CHEF, CHEF_COLORS, x, y, scale);
}

/** Draw a monster face by id ('conde', 'mumia', 'aranha', 'lodo'). */
export function drawMonsterFace(ctx, id, x, y, scale) {
  const grid = MONSTER_FACES[id];
  if (!grid) return;
  drawSprite(ctx, grid, FACE_COLORS, x, y, scale);
}

/** A chunky pixel icon for an ingredient: coloured blob + letter, drawn big. */
export function drawIngredientIcon(ctx, ingredient, x, y, size) {
  ctx.fillStyle = '#1d1420';
  ctx.fillRect(x - 2, y - 2, size + 4, size + 4);
  ctx.fillStyle = ingredient.color;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.55)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ingredient.icon, x + size / 2, y + size / 2 + 1);
}
