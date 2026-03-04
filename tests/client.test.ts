import { describe, expect, test } from 'vitest';
import { DataLegion } from '../src/index';
import { AuthenticationError, DataLegionError } from '../src/error';

const API_KEY = process.env.DATALEGION_API_KEY;
const hasApiKey = !!API_KEY;

const LINKEDIN_URL = 'https://www.linkedin.com/in/jfarza1/';

// ---------------------------------------------------------------------------
// Client Initialization
// ---------------------------------------------------------------------------

describe('Client initialization', () => {
  test('throws DataLegionError when no API key is provided', () => {
    const saved = process.env.DATALEGION_API_KEY;
    delete process.env.DATALEGION_API_KEY;

    try {
      expect(() => new DataLegion()).toThrow(DataLegionError);
    } finally {
      if (saved !== undefined) {
        process.env.DATALEGION_API_KEY = saved;
      }
    }
  });

  test('accepts an explicit API key', () => {
    const client = new DataLegion({ apiKey: 'legion_test_key' });
    expect(client).toBeInstanceOf(DataLegion);
    expect(client.person).toBeDefined();
    expect(client.company).toBeDefined();
    expect(client.utility).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Person endpoints
// ---------------------------------------------------------------------------

describe('Person', () => {
  const client = hasApiKey ? new DataLegion({ apiKey: API_KEY }) : (null as unknown as DataLegion);

  test.skipIf(!hasApiKey)('enrich returns expected shape', async () => {
    const response = await client.person.enrich({ social_url: LINKEDIN_URL });

    expect(response).toBeDefined();
    expect(typeof response.legion_id).toBe('string');
    expect(response.legion_id.length).toBeGreaterThan(0);
    expect('full_name' in response).toBe(true);
    expect('first_name' in response).toBe(true);
    expect('last_name' in response).toBe(true);
  });

  test.skipIf(!hasApiKey)('search returns matches', async () => {
    const response = await client.person.search({
      query: "SELECT * FROM people WHERE job_title ILIKE '%engineer%' AND company_name ILIKE '%google%'",
      limit: 1,
    });

    expect(response).toBeDefined();
    expect(Array.isArray(response.matches)).toBe(true);
    expect(typeof response.total).toBe('number');
    if (response.matches.length > 0) {
      const match = response.matches[0];
      expect(match.person).toBeDefined();
      expect(typeof match.person.legion_id).toBe('string');
    }
  });

  test.skipIf(!hasApiKey)('discover returns matches', async () => {
    const response = await client.person.discover({
      query: 'find software engineers at google',
      limit: 1,
    });

    expect(response).toBeDefined();
    expect(Array.isArray(response.matches)).toBe(true);
    expect(typeof response.total).toBe('number');
    if (response.matches.length > 0) {
      const match = response.matches[0];
      expect(match.person).toBeDefined();
      expect(typeof match.person.legion_id).toBe('string');
    }
  }, 30_000);

  test.skipIf(!hasApiKey)('bulkEnrich returns results array', async () => {
    const response = await client.person.bulkEnrich({
      items: [
        { social_url: LINKEDIN_URL },
        { email: 'jon@datalegion.ai' },
      ],
    });

    expect(response).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBe(2);
    for (const result of response.results) {
      expect('matches' in result || 'error' in result).toBe(true);
    }
  }, 30_000);
});

// ---------------------------------------------------------------------------
// Company endpoints (skipped — not yet available)
// ---------------------------------------------------------------------------

describe.skip('Company', () => {
  const client = hasApiKey ? new DataLegion({ apiKey: API_KEY }) : (null as unknown as DataLegion);

  test.skipIf(!hasApiKey)('enrich returns expected shape', async () => {
    const response = await client.company.enrich({ domain: 'google.com' });
    expect(response).toBeDefined();
    expect(typeof response.legion_id).toBe('string');
  });

  test.skipIf(!hasApiKey)('search returns matches', async () => {
    const response = await client.company.search({
      query: "SELECT * FROM companies WHERE name ILIKE '%google%'",
      limit: 1,
    });
    expect(response).toBeDefined();
    expect(Array.isArray(response.matches)).toBe(true);
  });

  test.skipIf(!hasApiKey)('discover returns matches', async () => {
    const response = await client.company.discover({
      query: 'find tech companies',
      limit: 1,
    });
    expect(response).toBeDefined();
    expect(Array.isArray(response.matches)).toBe(true);
  });

  test.skipIf(!hasApiKey)('bulkEnrich returns results array', async () => {
    const response = await client.company.bulkEnrich({
      items: [
        { domain: 'google.com' },
        { domain: 'datalegion.ai' },
      ],
    });

    expect(response).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBe(2);
    for (const result of response.results) {
      expect('matches' in result || 'error' in result).toBe(true);
    }
  }, 30_000);
});

// ---------------------------------------------------------------------------
// Utility endpoints
// ---------------------------------------------------------------------------

describe('Utility', () => {
  const client = hasApiKey ? new DataLegion({ apiKey: API_KEY }) : (null as unknown as DataLegion);

  test.skipIf(!hasApiKey)('clean returns cleaned response', async () => {
    const response = await client.utility.clean({
      fields: { email: '  JOHN@EXAMPLE.COM  ' },
    });

    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(response.results.email).toBeDefined();
    expect(typeof response.results.email.original).toBe('string');
    expect('cleaned' in response.results.email).toBe(true);
  });

  test.skipIf(!hasApiKey)('hashEmail returns hashes', async () => {
    const response = await client.utility.hashEmail({ email: 'jon@datalegion.ai' });

    expect(response).toBeDefined();
    expect(typeof response.email).toBe('string');
    expect(typeof response.normalized_email).toBe('string');
    expect(response.hashes).toBeDefined();
    expect(typeof response.hashes.sha256).toBe('string');
    expect(response.hashes.sha256.length).toBeGreaterThan(0);
  });

  test.skipIf(!hasApiKey)('validate returns validation response', async () => {
    const response = await client.utility.validate({ email: 'jon@datalegion.ai' });

    expect(response).toBeDefined();
    expect(typeof response.valid).toBe('boolean');
    expect(Array.isArray(response.errors)).toBe(true);
    expect(Array.isArray(response.warnings)).toBe(true);
    expect(Array.isArray(response.suggestions)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

describe('Error handling', () => {
  test('bad API key throws AuthenticationError', async () => {
    const badClient = new DataLegion({ apiKey: 'legion_invalid_key_12345' });

    try {
      await badClient.person.enrich({ social_url: LINKEDIN_URL });
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(AuthenticationError);
      expect(err).toBeInstanceOf(DataLegionError);
      expect((err as AuthenticationError).statusCode).toBe(401);
    }
  });
});

// ---------------------------------------------------------------------------
// Response Headers
// ---------------------------------------------------------------------------

describe('Response headers', () => {
  const client = hasApiKey ? new DataLegion({ apiKey: API_KEY }) : (null as unknown as DataLegion);

  test.skipIf(!hasApiKey)('requestId is set after a request', async () => {
    expect(client.requestId).toBeNull();

    await client.utility.validate({ email: 'jon@datalegion.ai' });

    expect(client.requestId).not.toBeNull();
    expect(typeof client.requestId).toBe('string');
    expect(client.requestId!.length).toBeGreaterThan(0);
  });
});
