import { describe, expect, test } from 'vitest';
import pkg from '../package.json';
import { VERSION } from '../src/version';

describe('version', () => {
  // src/version.ts is generated from package.json (scripts/gen-version.mjs) and
  // ships in the User-Agent. This guards a stale committed copy: if it fails,
  // run `npm run gen:version`.
  test('generated VERSION matches package.json', () => {
    expect(VERSION).toBe(pkg.version);
  });
});
