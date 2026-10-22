// Inline package.json's version into src/version.ts so the User-Agent has a
// single source of truth. Run automatically before build and on `npm version`.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const out = `// AUTO-GENERATED from package.json by scripts/gen-version.mjs — do not edit by hand.
// Regenerated on \`npm version\` and before every build; bump package.json only.
export const VERSION = '${version}';
`;
writeFileSync(join(root, 'src', 'version.ts'), out);
console.log(`gen-version: wrote src/version.ts (${version})`);
