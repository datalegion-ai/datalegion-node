import { afterEach, describe, expect, test, vi } from 'vitest';
import { SANDBOX_PATHS } from '../src/client';
import { AuthenticationError, BadRequestError, DataLegionError, InsufficientCreditsError, NotFoundError, PermissionDeniedError, RateLimitError, RequestTimeoutError, ServerError, ValidationError } from '../src/error';
import { DataLegion } from '../src/index';

const API_KEY = process.env.DATALEGION_API_KEY;
if (!API_KEY) {
  throw new Error('Set DATALEGION_API_KEY to run the live tests (CI reads it from the repo secret).');
}

// No real person in the code: person lookups that need a match run in sandbox mode, whose record fills
// every field and names no one; mocked tests and a bad key don't depend on the input.
const MADE_UP_PROFILE = 'https://www.linkedin.com/in/jane-exampleton-0001/';

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
    const client = new DataLegion({ apiKey: 'legion_testkey' });
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
  const client = new DataLegion({ apiKey: API_KEY });
  const sandbox = new DataLegion({ apiKey: API_KEY, sandbox: true });

  test('enrich returns expected shape', async () => {
    const response = await sandbox.person.enrich({ social_url: MADE_UP_PROFILE });

    expect(response).toBeDefined();
    expect(typeof response.legion_id).toBe('string');
    expect(response.legion_id.length).toBeGreaterThan(0);
    expect('full_name' in response).toBe(true);
    expect('first_name' in response).toBe(true);
    expect('last_name' in response).toBe(true);
  });

  test('search returns matches', { retry: 2, timeout: 30_000 }, async () => {
    const response = await client.person.search({
      limit: 1,
      query: "SELECT * FROM people WHERE job_title ILIKE '%engineer%' AND company_name ILIKE '%google%'",
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

  test('discover returns matches', { retry: 2, timeout: 30_000 }, async () => {
    const response = await client.person.discover({
      limit: 1,
      query: 'find software engineers at google',
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

  test('bulkEnrich returns results array', async () => {
    const response = await sandbox.person.bulkEnrich({
      items: [
        { social_url: MADE_UP_PROFILE },
        { email: 'jane.doe@gmail.com' },
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
// Company endpoints
// ---------------------------------------------------------------------------

describe('Company', () => {
  const client = new DataLegion({ apiKey: API_KEY });

  test('enrich returns expected shape', async () => {
    const response = await client.company.enrich({ domain: 'google.com' });
    expect(response).toBeDefined();
    expect(typeof response.legion_id).toBe('string');
  });

  test('search returns matches', { retry: 2, timeout: 30_000 }, async () => {
    const response = await client.company.search({
      limit: 1,
      query: "SELECT * FROM companies WHERE domain ILIKE '%google%'",
    });
    expect(response).toBeDefined();
    expect(Array.isArray(response.matches)).toBe(true);
  });

  test('discover returns matches', { retry: 2, timeout: 30_000 }, async () => {
    const response = await client.company.discover({
      limit: 1,
      query: 'enterprise software companies with over 1000 employees',
    });
    expect(response).toBeDefined();
    expect(Array.isArray(response.matches)).toBe(true);
  });

  test('bulkEnrich returns results array', async () => {
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
  });
});

// ---------------------------------------------------------------------------
// Utility endpoints
// ---------------------------------------------------------------------------

describe('Utility', () => {
  const client = new DataLegion({ apiKey: API_KEY });

  test('clean returns cleaned response', async () => {
    const response = await client.utility.clean({
      fields: { email: '  JOHN@EXAMPLE.COM  ' },
    });

    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(response.results.email).toBeDefined();
    expect(typeof response.results.email.original).toBe('string');
    expect('cleaned' in response.results.email).toBe(true);
  });

  test('hashEmail returns hashes', async () => {
    const response = await client.utility.hashEmail({ email: 'jane.doe@gmail.com' });

    expect(response).toBeDefined();
    expect(typeof response.email).toBe('string');
    expect(typeof response.normalized_email).toBe('string');
    expect(response.hashes).toBeDefined();
    expect(typeof response.hashes.sha256).toBe('string');
    expect(response.hashes.sha256.length).toBeGreaterThan(0);
  });

  test('validate returns validation response', async () => {
    const response = await client.utility.validate({ email: 'jane.doe@gmail.com' });

    expect(response).toBeDefined();
    expect(typeof response.valid).toBe('boolean');
    expect(Array.isArray(response.errors)).toBe(true);
    expect(Array.isArray(response.warnings)).toBe(true);
    expect(Array.isArray(response.suggestions)).toBe(true);
    expect(response.email_check?.domain).toBe('gmail.com');
    expect(response.email_check?.free).toBe(true);
  });

  test('reportPerson rejects an invalid type/level combination with 422', async () => {
    await expect(client.utility.reportPerson({
      comment: 'x',
      field: 'job_title',
      issue_level: 'field',
      issue_type: 'frankenstein',
      legion_id: 'abc',
    })).rejects.toMatchObject({ statusCode: 422 });
  });
});

// ---------------------------------------------------------------------------
// Utility report (mocked — no live API, no real reports recorded)
// ---------------------------------------------------------------------------

describe('Utility report (mocked)', () => {
  const RESPONSE = {
    created_at: '2026-06-14T00:00:00Z',
    field: 'job_title',
    issue_level: 'field',
    issue_type: 'outdated',
    legion_id: 'abc123',
    report_id: 42,
    status: 'new',
    subject_type: 'person',
  };

  test('reportPerson posts the right method, path, and body', async () => {
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = vi.spyOn(client as any, '_request').mockResolvedValue(RESPONSE);
    const result = await client.utility.reportPerson({
      correct_value: 'Chairman',
      field: 'job_title',
      issue_level: 'field',
      issue_type: 'outdated',
      legion_id: 'abc123',
    });
    expect(spy).toHaveBeenCalledWith('POST', '/utility/report/person', {
      correct_value: 'Chairman',
      field: 'job_title',
      issue_level: 'field',
      issue_type: 'outdated',
      legion_id: 'abc123',
    });
    expect(result.report_id).toBe(42);
    expect(result.status).toBe('new');
  });

  test('reportCompany posts to the company path', async () => {
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = vi.spyOn(client as any, '_request').mockResolvedValue({ ...RESPONSE, subject_type: 'company' });
    const result = await client.utility.reportCompany({
      comment: 'dupe of abc123',
      issue_level: 'record',
      issue_type: 'duplicate',
      legion_id: 'xyz',
    });
    expect(spy).toHaveBeenCalledWith('POST', '/utility/report/company', {
      comment: 'dupe of abc123',
      issue_level: 'record',
      issue_type: 'duplicate',
      legion_id: 'xyz',
    });
    expect(result.subject_type).toBe('company');
  });
});

// ---------------------------------------------------------------------------
// Dynamic bulk enrich (mocked — no live API key needed)
// ---------------------------------------------------------------------------

describe('Dynamic bulk enrich (mocked)', () => {
  // All three accepted field shapes (phones / emails / both) plus a no-match and an
  // errored item, so the response covers every per-item outcome the endpoint returns.
  const ITEMS = [
    { fields: ['phones'], metadata: { row: 'r0' }, social_url: 'https://www.linkedin.com/in/jane' },
    { fields: ['emails'], metadata: { row: 'r1' }, social_url: 'https://www.linkedin.com/in/john' },
    { fields: ['phones', 'emails'], metadata: { row: 'r2' }, social_url: 'https://www.linkedin.com/in/jim' },
    { fields: ['phones'], metadata: { row: 'r3' }, social_url: 'https://www.linkedin.com/in/nobody' },
    { fields: ['emails'], metadata: { row: 'r4' }, social_url: 'https://www.linkedin.com/in/uncovered' },
  ];
  const RESPONSE = {
    results: [
      {
        legion_id: 'L1',
        metadata: { row: 'r0' },
        mobile_phone: '+14255551234',
        phones: [{ number: '+14255551234', type: 'mobile' }],
      },
      {
        emails: [{ address: 'john@y.com' }],
        legion_id: 'L2',
        metadata: { row: 'r1' },
        work_email: 'john@y.com',
      },
      {
        emails: [{ address: 'jane@x.com' }],
        legion_id: 'L3',
        metadata: { row: 'r2' },
        mobile_phone: '+12065559999',
        phones: [{ number: '+12065559999' }],
        work_email: 'jane@x.com',
      },
      // No match: the URL resolved to nobody — null legion_id, no fields, no error.
      { legion_id: null, metadata: { row: 'r3' } },
      // Errored item: no covering pool, surfaced in its own slot with an error.
      { error: 'No contract entitles the requested fields.', legion_id: null, metadata: { row: 'r4' } },
    ],
  };

  test('dynamicBulkEnrich posts to /dynamic/person/enrich/bulk and returns results', async () => {
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spy = vi.spyOn(client as any, '_request').mockResolvedValue(RESPONSE);
    const result = await client.person.dynamicBulkEnrich({ items: ITEMS });
    expect(spy).toHaveBeenCalledWith('POST', '/dynamic/person/enrich/bulk', { items: ITEMS });
    // phones-only row
    expect(result.results[0].legion_id).toBe('L1');
    expect(result.results[0].phones?.[0].number).toBe('+14255551234');
    expect(result.results[0].mobile_phone).toBe('+14255551234');
    // emails-only row
    expect(result.results[1].legion_id).toBe('L2');
    expect(result.results[1].emails?.[0].address).toBe('john@y.com');
    expect(result.results[1].work_email).toBe('john@y.com');
    // phones + emails row (the combined group request)
    expect(result.results[2].phones?.[0].number).toBe('+12065559999');
    expect(result.results[2].emails?.[0].address).toBe('jane@x.com');
    expect(result.results[2].mobile_phone).toBe('+12065559999');
    expect(result.results[2].work_email).toBe('jane@x.com');
    // no-match row: null legion_id, no fields, no error
    expect(result.results[3].legion_id).toBeNull();
    expect(result.results[3].error).toBeUndefined();
    expect(result.results[3].phones).toBeUndefined();
    // errored row: null legion_id with an error message
    expect(result.results[4].legion_id).toBeNull();
    expect(result.results[4].error).toBe('No contract entitles the requested fields.');
  });
});

// ---------------------------------------------------------------------------
// Request core (mocked fetch — exercises _request without a live API)
// ---------------------------------------------------------------------------

describe('Request core (mocked fetch)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const jsonResponse = (status: number, body: unknown, headers: Record<string, string> = {}): Response =>
    new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json', ...headers }, status });

  test.each([
    [400, BadRequestError],
    [401, AuthenticationError],
    [402, InsufficientCreditsError],
    [403, PermissionDeniedError],
    [404, NotFoundError],
    [408, RequestTimeoutError],
    [409, DataLegionError],
    [422, ValidationError],
    [429, RateLimitError],
    [500, ServerError],
    [501, ServerError],
    [502, ServerError],
    [503, ServerError],
    [504, ServerError],
  ])('maps HTTP %i to the right error class with code/details preserved', async (status, ctor) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(status, { details: { k: 'v' }, error: 'e_code', message: 'boom' }),
    );
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    const err = (await client.health().then(() => null, (e: unknown) => e)) as DataLegionError;
    expect(err).toBeInstanceOf(ctor);
    expect(err).toBeInstanceOf(DataLegionError);
    expect(err.name).toBe(ctor.name);
    expect(err.statusCode).toBe(status);
    expect(err.error).toBe('e_code');
    expect(err.details).toEqual({ k: 'v' });
  });

  test('captures observability headers; non-numeric numeric headers become null (not NaN)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse(200, { status: 'ok' }, {
        'Credits-Remaining': 'unlimited',
        'Credits-Used': '3',
        'RateLimit-Limit': '100',
        'RateLimit-Remaining': '',
        'Request-ID': 'req_123',
        'Search-Warning': "No company_industry value matches 'x'",
        'Total-Count-Status': 'estimate',
      }),
    );
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    await client.health();
    expect(client.requestId).toBe('req_123');
    expect(client.creditsUsed).toBe(3);
    expect(client.creditsRemaining).toBeNull(); // 'unlimited' -> null, not NaN
    expect(client.rateLimitLimit).toBe(100);
    expect(client.rateLimitRemaining).toBeNull(); // '' -> null
    expect(client.totalCountStatus).toBe('estimate');
    expect(client.searchWarning).toBe("No company_industry value matches 'x'");
  });

  test('searchWarning is null without the header', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, { status: 'ok' }));
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    await client.health();
    expect(client.searchWarning).toBeNull();
  });

  test('an aborted request surfaces as a timeout error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }),
    );
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    await expect(client.health()).rejects.toMatchObject({ error: 'timeout' });
  });

  test('a network failure surfaces as a connection error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    await expect(client.health()).rejects.toMatchObject({ error: 'connection_error' });
  });

  test('an empty 200 body parses to an empty object', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }));
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    await expect(client.health()).resolves.toEqual({});
  });

  test('single enrich with an empty match set throws a clean 404 (not a TypeError)', async () => {
    const client = new DataLegion({ apiKey: 'legion_testkey' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.spyOn(client as any, '_request').mockResolvedValue({ matches: [], total: 0 });
    const err = (await client.person
      .enrich({ social_url: MADE_UP_PROFILE })
      .then(() => null, (e: unknown) => e)) as DataLegionError;
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.statusCode).toBe(404);
    expect(err.error).toBe('not_found');
  });
});

// ---------------------------------------------------------------------------
// Error Handling
// ---------------------------------------------------------------------------

describe('Error handling', () => {
  test('bad API key throws AuthenticationError', async () => {
    const badClient = new DataLegion({ apiKey: 'legion_invalid_key_12345' });

    try {
      await badClient.person.enrich({ social_url: MADE_UP_PROFILE });
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
  const client = new DataLegion({ apiKey: API_KEY });

  test('requestId is set after a request', async () => {
    expect(client.requestId).toBeNull();

    await client.utility.validate({ email: 'jane.doe@gmail.com' });

    expect(client.requestId).not.toBeNull();
    expect(typeof client.requestId).toBe('string');
    expect(client.requestId!.length).toBeGreaterThan(0);
  });
});

describe('Sandbox mode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const recordPaths = (seen: string[]) =>
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const path = new URL(String(input)).pathname;
      seen.push(path);
      const body = path.endsWith('/enrich') ? { matches: [{ person: { legion_id: 'x' } }], total: 1 } : { results: {} };
      return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' }, status: 200 });
    });

  test('sends only the mirrored endpoints to /sandbox/', async () => {
    const seen: string[] = [];
    recordPaths(seen);
    const client = new DataLegion({ apiKey: 'legion_testkey', sandbox: true });
    await client.person.enrich({ email: 'jane@example.org' });
    await client.utility.clean({ fields: { email: 'a@b.co' } });
    expect(seen).toEqual(['/sandbox/person/enrich', '/utility/clean']);
  });

  test('calls the real API by default', async () => {
    const seen: string[] = [];
    recordPaths(seen);
    await new DataLegion({ apiKey: 'legion_testkey' }).person.enrich({ email: 'jane@example.org' });
    expect(seen).toEqual(['/person/enrich']);
  });

  test('mirrors enrich, bulk enrich, search and discover for both entities', () => {
    expect([...SANDBOX_PATHS].sort()).toEqual(
      ['person', 'company'].flatMap((e) => ['enrich', 'enrich/bulk', 'search', 'discover'].map((op) => `/${e}/${op}`)).sort(),
    );
  });

  test('returns sample records from the live sandbox', async () => {
    const client = new DataLegion({ apiKey: API_KEY!, sandbox: true });
    expect((await client.person.enrich({ email: 'anyone@example.org' })).legion_id).toMatch(/^sandbox_/);
    expect((await client.company.enrich({ domain: 'example.org' })).legion_id).toMatch(/^sandbox_/);
  });
});
