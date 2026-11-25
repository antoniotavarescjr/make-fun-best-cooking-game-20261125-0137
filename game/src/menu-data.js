// Menu data for Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Pure data only: monsters, ingredients, recipes and the cursed book.
// No logic, no drawing. Every name here is invented for this game.
export const INGREDIENTS = [
  { id: 'macarrao', name: 'Macarrão', color: '#f2d38a', prep: 'cook', prepName: 'Cozinhar', icon: '≈' },
  { id: 'molho-sangue', name: 'Molho de Sangue', color: '#c1121f', prep: 'none', prepName: 'Pronto', icon: '●' },
  { id: 'olho', name: 'Olho', color: '#eef1f5', prep: 'chop', prepName: 'Picar', icon: '◎' },
  { id: 'sangue', name: 'Sangue Fresco', color: '#8d0801', prep: 'none', prepName: 'Pronto', icon: '♦' },
  { id: 'copo', name: 'Copo', color: '#9fd8ef', prep: 'none', prepName: 'Pronto', icon: '▯' },
  { id: 'pao', name: 'Pão de Cripta', color: '#d9a066', prep: 'none', prepName: 'Pronto', icon: '▬' },
  { id: 'dedo', name: 'Dedo', color: '#f0c8a0', prep: 'chop', prepName: 'Picar', icon: '╱' },
  { id: 'molho-verde', name: 'Molho Verde', color: '#7bd747', prep: 'none', prepName: 'Pronto', icon: '●' },
  { id: 'cerebro', name: 'Cérebro', color: '#f2a0b5', prep: 'cook', prepName: 'Cozinhar', icon: '§' },
  { id: 'massa', name: 'Massa', color: '#e8c890', prep: 'cook', prepName: 'Assar', icon: '▤' },
  { id: 'cobertura', name: 'Cobertura', color: '#b388eb', prep: 'none', prepName: 'Pronto', icon: '✿' },
  { id: 'perna', name: 'Perna de Aranha', color: '#5a189a', prep: 'chop', prepName: 'Picar', icon: '✕' },
  { id: 'pimenta', name: 'Pimenta do Além', color: '#ff5400', prep: 'none', prepName: 'Proibido', icon: '☠', cursed: true },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id) || null;
}

export const RECIPES = [
  { id: 'espaguete', name: 'Espaguete de Intestino', items: ['macarrao', 'molho-sangue', 'olho'], base: 120 },
  { id: 'suco', name: 'Suco de Sangue', items: ['copo', 'sangue'], base: 80 },
  { id: 'sanduiche', name: 'Sanduíche de Dedo', items: ['pao', 'dedo', 'molho-verde'], base: 110 },
  { id: 'cerebro', name: 'Cérebro na Chapa', items: ['cerebro', 'olho'], base: 100 },
  { id: 'bolo', name: 'Bolo de Aranha', items: ['massa', 'cobertura', 'perna'], base: 130 },
  { id: 'torta', name: 'Torta de Olho', items: ['massa', 'olho', 'cobertura'], base: 120 },
  // Day-only dishes for the normal human shift: plain food, no blood, no
  // brains — humans must never order Suco de Sangue or Cérebro na Chapa.
  { id: 'macarrao-casa', name: 'Macarrão da Casa', items: ['macarrao', 'molho-verde'], base: 70 },
  { id: 'sanduiche-casa', name: 'Sanduíche da Casa', items: ['pao', 'molho-verde'], base: 60 },
];

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) || null;
}

/** The recipe pool for the current phase: simple dishes by day, all of them at night. */
export function recipesFor(night) {
  const pool = night ? NIGHT_RECIPES : DAY_RECIPES;
  return pool.map((id) => recipeById(id));
}

// Day customers are ordinary humans who only order the two simplest dishes.
export const DAY_RECIPES = ['macarrao-casa', 'sanduiche-casa'];
export const NIGHT_RECIPES = ['espaguete', 'suco', 'sanduiche', 'cerebro', 'bolo', 'torta'];

export const MONSTERS = [
  { id: 'conde', name: 'Conde Mordisca', kind: 'Vampiro', color: '#c1121f', skin: '#e8e0f0', patience: 26, tip: 2.0, likes: 'suco', hates: 'alho', taunt: 'SEM ALHO!' },
  // The mummy forgives: like candidate C's zombie, he eats the wrong dish
  // anyway, for half the points (see cooking.js serveDish).
  { id: 'mumia', name: 'Zé Múmia', kind: 'Múmia', color: '#d9c9a3', skin: '#e8dcb8', patience: 46, tip: 1.0, likes: 'sanduiche', hates: 'sal', taunt: 'BEM ENROLADO!', forgiving: true },
  { id: 'aranha', name: 'Dona Aranha', kind: 'Aranha', color: '#7b2cbf', skin: '#9d4edd', patience: 36, tip: 1.5, likes: 'bolo', hates: 'vassoura', taunt: 'COM 8 PERNAS!' },
  { id: 'lodo', name: 'Bolha, o Lodo', kind: 'Lodo Vivo', color: '#7bd747', skin: '#90e070', patience: 30, tip: 1.2, likes: 'cerebro', hates: 'sabão', taunt: 'BEM NOJENTO!' },
  // The ghost fades away: like candidate C's ghost, her ticket grows more
  // transparent as her patience drains (see render-orders.js) — never below
  // 55% opacity, so the order stays readable when it matters most.
  { id: 'fantasma', name: 'Dona Sumida', kind: 'Fantasma', color: '#c9b8e8', skin: '#ffffff', patience: 20, tip: 1.3, likes: 'suco', hates: '', taunt: 'SUMINDO…!', fades: true },
  // The unwitting human (Antônio's idea): a post-party human who wanders in
  // after 3:33, thinks the monsters are people in costume and the food is
  // fake, and says so out loud. He reuses the normal order system — no new
  // mechanics — and his confused lines rotate one per order (orders.js).
  { id: 'festeiro', name: 'Zé Festeiro', kind: 'Humano pós-festa', color: '#ff5400', skin: '#f0c8a0', patience: 40, tip: 1.0, likes: 'torta', hates: '', taunt: 'QUE FANTASIA MASSA!', confusedLines: ['QUE FANTASIA MASSA!', 'ESSE SUCO É DE MENTIRA, NÉ?', 'GENTE, O GARÇOM É UM VAMPIRO DE VERDADE?'] },
];

export function monsterById(id) {
  return MONSTERS.find((monster) => monster.id === id) || null;
}

export const HUMANS = [
  { id: 'humana-1', name: 'Dona Célia', kind: 'Cliente', color: '#4a6fa5', skin: '#f0c8a0', patience: 50, tip: 1.0, likes: 'macarrao-casa', hates: '', taunt: '' },
  { id: 'humano-2', name: 'Seu Osmar', kind: 'Cliente', color: '#6b705c', skin: '#d9a066', patience: 50, tip: 1.0, likes: 'sanduiche-casa', hates: '', taunt: '' },
];

// The Cursed Recipe Book: one forbidden ingredient, one gamble. Adding it to
// an otherwise correct dish doubles the tip; adding it to a wrong dish burns
// the whole order on the spot.
export const CURSED_BOOK = {
  ingredient: 'pimenta',
  tipMultiplier: 2,
  burnPenalty: 50,
  title: 'Livro de Receitas Amaldiçoado',
  rule: 'Pimenta do Além: dobra a gorjeta se o prato estiver certo, queima o pedido se estiver errado.',
};
