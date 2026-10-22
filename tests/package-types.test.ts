import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

// Type-checks the packed tarball the way a customer's project would: installed from npm, with
// skipLibCheck off and no @types/node, once as an ES module and once as CommonJS.
const root = resolve(__dirname, '..');
const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const usage = `const client = new DataLegion({ apiKey: 'k' });
const notFound: DataLegionError = new NotFoundError('not_found', 'No match');
export const checks = [client.person, notFound.statusCode];
`;

let work: string;

const project = (name: string, type: 'commonjs' | 'module', source: string): string => {
  const dir = join(work, name);
  mkdirSync(join(dir, 'node_modules', 'datalegion'), { recursive: true });
  execFileSync('tar', ['-xzf', join(work, 'datalegion.tgz'), '-C', join(dir, 'node_modules', 'datalegion'), '--strip-components=1']);
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ type }));
  writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      lib: ['ES2022', 'DOM'], module: 'nodenext', moduleResolution: 'nodenext', noEmit: true, skipLibCheck: false, strict: true, target: 'ES2022', types: [],
    },
    files: ['index.ts'],
  }));
  writeFileSync(join(dir, 'index.ts'), source);
  return dir;
};

const typecheck = (dir: string): string => {
  try {
    execFileSync(process.execPath, [tsc, '-p', dir], { encoding: 'utf8' });
    return '';
  } catch (err) {
    return String((err as { stdout?: string }).stdout ?? err);
  }
};

describe('published types', () => {
  beforeAll(() => {
    work = mkdtempSync(join(tmpdir(), 'datalegion-types-'));
    execFileSync('bun', ['run', 'build'], { cwd: root, stdio: 'ignore' });
    execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', work], { cwd: root, stdio: 'ignore' });
    // Read the tarball from the fresh directory, not npm's output: npm 10 (Node 22) runs the
    // prepare script even with --ignore-scripts, and its log lines come before any JSON.
    const tarball = readdirSync(work).find((f) => f.endsWith('.tgz'));
    if (!tarball) { throw new Error('npm pack wrote no tarball'); }
    renameSync(join(work, tarball), join(work, 'datalegion.tgz'));
  });

  afterAll(() => {
    rmSync(work, { force: true, recursive: true });
  });

  test('an ES module project gets the ESM declarations, and the default export constructs', () => {
    const dir = project('esm', 'module', `import DataLegion, { DataLegionError, NotFoundError } from 'datalegion';\n${usage}`);
    expect(typecheck(dir)).toBe('');
  });

  test('a CommonJS project type-checks without @types/node', () => {
    const dir = project('cjs', 'commonjs', `import { DataLegion, DataLegionError, NotFoundError } from 'datalegion';\n${usage}`);
    expect(typecheck(dir)).toBe('');
  });
});
