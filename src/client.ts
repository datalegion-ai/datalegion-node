import { AuthenticationError, DataLegionError, InsufficientCreditsError, RateLimitError, ValidationError } from './error';
import type { CleanParams, ClientOptions, CompanyEnrichParams, CompanyMatchesResponse, CompanyResponse, DiscoverParams, EmailHashResponse, ErrorResponse, FieldCleanResponse, HashEmailParams, HealthResponse, PersonEnrichParams, PersonMatchesResponse, PersonResponse, SearchParams, ValidateParams, ValidationResponse } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = 'https://api.datalegion.ai';
const DEFAULT_TIMEOUT = 60_000;
const PACKAGE_VERSION = '0.1.0';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strip `undefined` values from an object so they are not serialised as JSON
 * `null`.  This keeps request payloads clean.
 */
const stripUndefined = (obj: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
};

// ---------------------------------------------------------------------------
// Resource namespaces
// ---------------------------------------------------------------------------

/** Person-related API methods. */
export class PersonResource {
  /** @internal */
  private _client: DataLegion;

  /** @internal */
  constructor(client: DataLegion) {
    this._client = client;
  }

  /**
   * Enrich a person by email, phone, social URL, name+location, or other
   * identifiers.
   *
   * When `multiple_results` is `true` the return type is
   * `PersonMatchesResponse`; otherwise a single `PersonResponse` is returned.
   */
  async enrich(params: PersonEnrichParams & { multiple_results: true }): Promise<PersonMatchesResponse>;
  async enrich(params: PersonEnrichParams & { multiple_results?: false }): Promise<PersonResponse>;
  async enrich(params: PersonEnrichParams): Promise<PersonResponse | PersonMatchesResponse>;
  async enrich(params: PersonEnrichParams): Promise<PersonResponse | PersonMatchesResponse> {
    const data = await this._client._request<PersonMatchesResponse>('POST', '/person/enrich', params);
    if (params.multiple_results) {
      return data;
    }
    return data.matches[0].person;
  }

  /** Search for people using a SQL query. */
  async search(params: SearchParams): Promise<PersonMatchesResponse> {
    return this._client._request<PersonMatchesResponse>('POST', '/person/search', params);
  }

  /** Discover people using a natural language query. */
  async discover(params: DiscoverParams): Promise<PersonMatchesResponse> {
    return this._client._request<PersonMatchesResponse>('POST', '/person/discover', params);
  }
}

/** Company-related API methods. */
export class CompanyResource {
  /** @internal */
  private _client: DataLegion;

  /** @internal */
  constructor(client: DataLegion) {
    this._client = client;
  }

  /**
   * Enrich a company by domain, name, LinkedIn ID, social URL, or ticker.
   *
   * When `multiple_results` is `true` the return type is
   * `CompanyMatchesResponse`; otherwise a single `CompanyResponse` is returned.
   */
  async enrich(params: CompanyEnrichParams & { multiple_results: true }): Promise<CompanyMatchesResponse>;
  async enrich(params: CompanyEnrichParams & { multiple_results?: false }): Promise<CompanyResponse>;
  async enrich(params: CompanyEnrichParams): Promise<CompanyResponse | CompanyMatchesResponse>;
  async enrich(params: CompanyEnrichParams): Promise<CompanyResponse | CompanyMatchesResponse> {
    const data = await this._client._request<CompanyMatchesResponse>('POST', '/company/enrich', params);
    if (params.multiple_results) {
      return data;
    }
    return data.matches[0].company;
  }

  /** Search for companies using a SQL query. */
  async search(params: SearchParams): Promise<CompanyMatchesResponse> {
    return this._client._request<CompanyMatchesResponse>('POST', '/company/search', params);
  }

  /** Discover companies using a natural language query. */
  async discover(params: DiscoverParams): Promise<CompanyMatchesResponse> {
    return this._client._request<CompanyMatchesResponse>('POST', '/company/discover', params);
  }
}

/** Utility API methods. */
export class UtilityResource {
  /** @internal */
  private _client: DataLegion;

  /** @internal */
  constructor(client: DataLegion) {
    this._client = client;
  }

  /** Clean and normalise one or more fields. */
  async clean(params: CleanParams): Promise<FieldCleanResponse> {
    return this._client._request<FieldCleanResponse>('POST', '/utility/clean', params);
  }

  /** Hash an email address (SHA-256, SHA-1, MD5). */
  async hashEmail(params: HashEmailParams): Promise<EmailHashResponse> {
    return this._client._request<EmailHashResponse>('POST', '/utility/hash/email', params);
  }

  /** Validate input data and receive errors, warnings, and suggestions. */
  async validate(params: ValidateParams): Promise<ValidationResponse> {
    return this._client._request<ValidationResponse>('POST', '/utility/validate', params);
  }
}

// ---------------------------------------------------------------------------
// Main Client
// ---------------------------------------------------------------------------

/** TypeScript client for the Data Legion API. */
export class DataLegion {
  /** Person enrichment, search, and discovery. */
  readonly person: PersonResource;

  /** Company enrichment, search, and discovery. */
  readonly company: CompanyResource;

  /** Data cleaning, hashing, and validation utilities. */
  readonly utility: UtilityResource;

  /** `Request-ID` header from the most recent API response. */
  requestId: string | null = null;

  /** `Credits-Used` header from the most recent API response. */
  creditsUsed: number | null = null;

  /** `Credits-Remaining` header from the most recent API response. */
  creditsRemaining: number | null = null;

  /** `Contract-ID` header from the most recent API response. */
  contractId: string | null = null;

  /** `RateLimit-Limit` header — requests quota in the current time window. */
  rateLimitLimit: number | null = null;

  /** `RateLimit-Remaining` header — remaining requests in the current window. */
  rateLimitRemaining: number | null = null;

  /** `RateLimit-Reset` header — Unix timestamp when the current window resets. */
  rateLimitReset: number | null = null;

  /** `RateLimit-Policy` header — the rate limit policy string. */
  rateLimitPolicy: string | null = null;

  /** `Retry-After` header — seconds to wait before retrying (set on 429 responses). */
  retryAfter: number | null = null;

  /** `Generated-Query` header — SQL query generated by discover endpoints. */
  generatedQuery: string | null = null;

  /** `Correlation-ID` header — echoed back when sent by the client. */
  correlationId: string | null = null;

  /** @internal */
  private _apiKey: string;

  /** @internal */
  private _baseURL: string;

  /** @internal */
  private _timeout: number;

  /** @internal */
  private _defaultHeaders: Record<string, string>;

  /**
   * Create a new Data Legion client.
   *
   * ```ts
   * const client = new DataLegion({ apiKey: 'legion_live_...' });
   * ```
   *
   * If `apiKey` is omitted the client reads `DATALEGION_API_KEY` from the
   * environment (Node.js only).
   */
  constructor(options: ClientOptions = {}) {
    const apiKey = options.apiKey ?? process.env.DATALEGION_API_KEY;

    if (!apiKey) {
      throw new DataLegionError(
        0,
        'missing_api_key',
        'An API key must be provided via the `apiKey` option or the DATALEGION_API_KEY environment variable.',
      );
    }

    this._apiKey = apiKey;
    this._baseURL = (options.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this._timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this._defaultHeaders = options.defaultHeaders ?? {};

    this.company = new CompanyResource(this);
    this.person = new PersonResource(this);
    this.utility = new UtilityResource(this);
  }

  /**
   * Check API health.
   *
   * This is the only endpoint that does not require authentication.
   */
  async health(): Promise<HealthResponse> {
    return this._request<HealthResponse>('GET', '/health');
  }

  // -------------------------------------------------------------------------
  // Internal request helper
  // -------------------------------------------------------------------------

  /**
   * Send a request to the Data Legion API and return the parsed JSON body.
   *
   * @internal - consumers should use the resource methods instead.
   */
  async _request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: object,
  ): Promise<T> {
    const url = `${this._baseURL}${path}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'API-Key': this._apiKey,
      'User-Agent': `datalegion-node/${PACKAGE_VERSION}`,
      ...this._defaultHeaders,
    };

    const init: RequestInit = { headers, method };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(stripUndefined(body as Record<string, unknown>));
    }

    // AbortController for timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this._timeout);
    init.signal = controller.signal;

    let response: Response;
    try {
      response = await fetch(url, init);
    } catch (err: unknown) {
      clearTimeout(timer);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new DataLegionError(
          0,
          'timeout',
          `Request to ${method} ${path} timed out after ${this._timeout}ms`,
        );
      }
      throw new DataLegionError(
        0,
        'connection_error',
        `Failed to connect to ${url}: ${(err as Error).message}`,
      );
    } finally {
      clearTimeout(timer);
    }

    // Capture response headers
    this.requestId = response.headers.get('Request-ID') ?? response.headers.get('request-id');
    const creditsUsed = response.headers.get('Credits-Used') ?? response.headers.get('credits-used');
    const creditsRemaining = response.headers.get('Credits-Remaining') ?? response.headers.get('credits-remaining');
    this.creditsUsed = creditsUsed !== null ? Number(creditsUsed) : null;
    this.creditsRemaining = creditsRemaining !== null ? Number(creditsRemaining) : null;
    this.contractId = response.headers.get('Contract-ID') ?? response.headers.get('contract-id');
    const rlLimit = response.headers.get('RateLimit-Limit') ?? response.headers.get('ratelimit-limit');
    const rlRemaining = response.headers.get('RateLimit-Remaining') ?? response.headers.get('ratelimit-remaining');
    const rlReset = response.headers.get('RateLimit-Reset') ?? response.headers.get('ratelimit-reset');
    this.rateLimitLimit = rlLimit !== null ? Number(rlLimit) : null;
    this.rateLimitRemaining = rlRemaining !== null ? Number(rlRemaining) : null;
    this.rateLimitReset = rlReset !== null ? Number(rlReset) : null;
    this.rateLimitPolicy = response.headers.get('RateLimit-Policy') ?? response.headers.get('ratelimit-policy');
    const retryAfter = response.headers.get('Retry-After') ?? response.headers.get('retry-after');
    this.retryAfter = retryAfter !== null ? Number(retryAfter) : null;
    this.generatedQuery = response.headers.get('Generated-Query') ?? response.headers.get('generated-query');
    this.correlationId = response.headers.get('Correlation-ID') ?? response.headers.get('correlation-id');

    // Parse response body
    let data: unknown;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: 'unknown', message: text };
      }
    }

    // Success
    if (response.ok) {
      return data as T;
    }

    // Error handling
    const errorBody = data as ErrorResponse;
    const errorCode = errorBody?.error ?? 'api_error';
    const errorMessage = errorBody?.message ?? `API request failed with status ${response.status}`;
    const errorDetails = (errorBody?.details as Record<string, unknown> | unknown[] | null) ?? null;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(errorCode, errorMessage, errorDetails);
      case 402:
        throw new InsufficientCreditsError(errorCode, errorMessage, errorDetails);
      case 422:
        throw new ValidationError(errorCode, errorMessage, errorDetails);
      case 429:
        throw new RateLimitError(errorCode, errorMessage, errorDetails);
      default:
        throw new DataLegionError(response.status, errorCode, errorMessage, errorDetails);
    }
  }
}
