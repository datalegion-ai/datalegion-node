import { describe, expect, test } from 'vitest';
import pkg from '../package.json';

describe('published package', () => {
  // npm publishes only what `files` allows (plus package.json, README and LICENSE), so repo
  // tooling such as .claude/, .github/ and tests never reaches the registry. Widen this only
  // with something customers need at runtime.
  test('ships the build output only', () => {
    expect(pkg.files).toEqual(['dist']);
  });

  test('has no runtime dependencies (the client uses built-in fetch)', () => {
    expect((pkg as { dependencies?: Record<string, string> }).dependencies ?? {}).toEqual({});
  });
});
