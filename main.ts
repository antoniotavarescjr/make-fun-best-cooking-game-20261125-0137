// Bistrô das 3:33 (~/workspace/make-fun/best-cooking-game-20261125-0137/repo/).
// Node 22 entrypoint, standard library only. It hands the game in: it copies
// game/ and screenshots/ from beside this file into /output (or
// MAKEFUN_OUTPUT_DIR outside the grader) and writes /output/dossier.json
// with buildDossier from the kit's vendored library, unchanged. It creates
// nothing, reorders nothing and reads no clock: two runs over the same
// repository write byte-identical output.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fresh output directory, then the two plain copies and the dossier.
// The copy is recursive and verbatim: file bytes, names and order are the
// repository's own, so the dossier the grader rebuilds matches byte for byte.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's caps, as the kit documents them: the dossier text is capped
// at 160 KiB, at most 4 screenshots of 256 KiB each, game/ at most 993
// entries and 48 MiB, and no game path over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
