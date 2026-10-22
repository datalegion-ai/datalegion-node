import { describe, expect, test } from 'vitest';
import { duplicateTestBodies, silentTests, swallowingTests } from './_conventions';

// The fleet's test conventions (`_conventions.ts`, a byte-identical copy of the website repository's
// __tests__/_conventions.ts): every test can fail, none swallows an error, none repeats
// another's body.
const ROOT = process.cwd();

describe('test conventions', () => {
  test('every test can fail', () => {
    expect(silentTests(ROOT)).toEqual([]);
  });

  test('no test swallows an error', () => {
    expect(swallowingTests(ROOT)).toEqual([]);
  });

  test('no two tests share a body', () => {
    expect(duplicateTestBodies(ROOT)).toEqual([]);
  });

  test('the vendored copy names its source', async () => {
    const { readFileSync } = await import('node:fs');
    const header = readFileSync(new URL('./_conventions.ts', import.meta.url), 'utf8').split('\n')[0];
    expect(header).toBe("// Vendored from the website repository's __tests__/_conventions.ts. Do not edit: re-copy it; the upgrade sweep diffs it.");
  });
});
