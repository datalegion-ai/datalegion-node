import { AuthenticationError, BadRequestError, DataLegionError, type FixedStatusError, InsufficientCreditsError, NotFoundError, PermissionDeniedError, RateLimitError, RequestTimeoutError, ServerError, ValidationError } from './error.js';
import { VERSION } from './version.js';
import type { BulkCompanyEnrichResponse, BulkPersonEnrichResponse, CleanParams, ClientOptions, CompanyBulkEnrichParams, CompanyEnrichParams, CompanyMatchesResponse, CompanyResponse, DataIssueReportResponse, DiscoverParams, DynamicBulkEnrichParams, DynamicBulkPersonEnrichResponse, EmailHashResponse, ErrorResponse, FieldCleanResponse, HashEmailParams, HealthResponse, PersonBulkEnrichParams, PersonEnrichParams, PersonMatchesResponse, PersonResponse, ReportParams, SearchParams, ValidateParams, ValidationResponse } from './types.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = 'https://api.datalegion.ai';
const DEFAULT_TIMEOUT = 60_000;

// Endpoints the API mirrors under /sandbox/: sample records (Jane Sandbox, Sandbox Corp), no
// credits. Everything else (utilities, reports, health, dynamic bulk) has no sandbox.
export const SANDBOX_PATHS: ReadonlySet<string> = new Set(
  ['person', 'company'].flatMap((entity) => ['enrich', 'enrich/bulk', 'search', 'discover'].map((op) => `/${entity}/${op}`)),
);

// The error class for each status with its own class; any other 5xx is a ServerError and
// anything else the base DataLegionError.
const STATUS_ERRORS: Partial<Record<number, FixedStatusError>> = {
  400: BadRequestError,
  401: AuthenticationError,
  402: InsufficientCreditsError,
  403: PermissionDeniedError,
  404: NotFoundError,
  408: RequestTimeoutError,
  422: ValidationError,
  429: RateLimitError,
};

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

/**
 * Parse a numeric response header, returning `null` for a missing, empty, or
 * non-numeric value. Numeric headers can legitimately be non-numeric — e.g.
 * `Credits-Remaining: unlimited` on an unlimited contract — and must surface as
 * `null`, not `NaN` (mirrors the Python SDK's `_safe_int`).
 */
const numHeader = (headers: Headers, name: string): number | null => {
  const value = headers.get(name);
  if (value === null || value.trim() === '') {
    return null;
  }
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
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
    // Defensive: the API 404s on no match (thrown in _request before here), so a
    // 200 always has a match. Guard the invariant to avoid an opaque TypeError.
    const first = data.matches?.[0];
    if (!first) {
      throw new NotFoundError('not_found', 'No person found matching the provided parameters.');
    }
    return first.person;
  }

  /** Search for people using a SQL query. */
  async search(params: SearchParams): Promise<PersonMatchesResponse> {
    return this._client._request<PersonMatchesResponse>('POST', '/person/search', params);
  }

  /** Discover people using a natural language query. */
  async discover(params: DiscoverParams): Promise<PersonMatchesResponse> {
    const data = await this._client._request<PersonMatchesResponse & { generated_query?: string }>('POST', '/person/discover', params);
    this._client.generatedQuery = data.generated_query ?? null;
    return data;
  }

  /** Enrich multiple people in a single request (1-50 items). */
  async bulkEnrich(params: PersonBulkEnrichParams): Promise<BulkPersonEnrichResponse> {
    return this._client._request<BulkPersonEnrichResponse>('POST', '/person/enrich/bulk', params);
  }

  /**
   * Bulk-enrich people by LinkedIn URL, returning only phones/emails (1-50 items).
   *
   * A focused, high-throughput contact-enrichment endpoint. Each item is
   * `{ social_url, fields, metadata? }` where `fields` accepts ONLY the contact
   * groups `"phones"` and/or `"emails"`; `metadata` is echoed back. Each item is
   * billed to the credit pool entitling its requested group(s).
   */
  async dynamicBulkEnrich(params: DynamicBulkEnrichParams): Promise<DynamicBulkPersonEnrichResponse> {
    return this._client._request<DynamicBulkPersonEnrichResponse>('POST', '/dynamic/person/enrich/bulk', params);
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
    // Defensive: the API 404s on no match (thrown in _request before here), so a
    // 200 always has a match. Guard the invariant to avoid an opaque TypeError.
    const first = data.matches?.[0];
    if (!first) {
      throw new NotFoundError('not_found', 'No company found matching the provided parameters.');
    }
    return first.company;
  }

  /** Search for companies using a SQL query. */
  async search(params: SearchParams): Promise<CompanyMatchesResponse> {
    return this._client._request<CompanyMatchesResponse>('POST', '/company/search', params);
  }

  /** Discover companies using a natural language query. */
  async discover(params: DiscoverParams): Promise<CompanyMatchesResponse> {
    const data = await this._client._request<CompanyMatchesResponse & { generated_query?: string }>('POST', '/company/discover', params);
    this._client.generatedQuery = data.generated_query ?? null;
    return data;
  }

  /** Enrich multiple companies in a single request (1-50 items). */
  async bulkEnrich(params: CompanyBulkEnrichParams): Promise<BulkCompanyEnrichResponse> {
    return this._client._request<BulkCompanyEnrichResponse>('POST', '/company/enrich/bulk', params);
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

  /** Report a data-quality issue with a person record. */
  async reportPerson(params: ReportParams): Promise<DataIssueReportResponse> {
    return this._client._request<DataIssueReportResponse>('POST', '/utility/report/person', params);
  }

  /** Report a data-quality issue with a company record. */
  async reportCompany(params: ReportParams): Promise<DataIssueReportResponse> {
    return this._client._request<DataIssueReportResponse>('POST', '/utility/report/company', params);
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

  /** Data cleaning, hashing, validation, and data-issue reporting utilities. */
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

  /** SQL query generated by discover endpoints. */
  generatedQuery: string | null = null;

  /** `Correlation-ID` header — echoed back when sent by the client. */
  correlationId: string | null = null;

  /**
   * `Total-Count-Status` header (search/discover only): how the response
   * `total` was derived — `"exact"`, `"estimate"` (broad-query planner
   * estimate, treat as a magnitude), or `"page"` (count unavailable).
   */
  totalCountStatus: string | null = null;

  /**
   * `Search-Warning` header (search/discover only): why a filter was flagged
   * (for example an industry name no stored value matches) and what to change.
   * `null` when the search had nothing to say.
   */
  searchWarning: string | null = null;

  /** @internal */
  private _apiKey: string;

  /** @internal */
  private _baseURL: string;

  /** @internal */
  private _timeout: number;

  /** @internal */
  private _defaultHeaders: Record<string, string>;

  /** @internal */
  private _sandbox: boolean;

  /**
   * Create a new Data Legion client.
   *
   * ```ts
   * const client = new DataLegion({ apiKey: 'legion_...' });
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
    this._baseURL = (options.baseURL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this._timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this._defaultHeaders = options.defaultHeaders ?? {};
    this._sandbox = options.sandbox ?? false;

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
   * Capture the observability headers from a response onto the client.
   * `Headers.get()` is case-insensitive per the fetch spec.
   *
   * @internal
   */
  private _captureHeaders(headers: Headers): void {
    this.requestId = headers.get('Request-ID');
    this.creditsUsed = numHeader(headers, 'Credits-Used');
    this.creditsRemaining = numHeader(headers, 'Credits-Remaining');
    this.contractId = headers.get('Contract-ID');
    this.rateLimitLimit = numHeader(headers, 'RateLimit-Limit');
    this.rateLimitRemaining = numHeader(headers, 'RateLimit-Remaining');
    this.rateLimitReset = numHeader(headers, 'RateLimit-Reset');
    this.rateLimitPolicy = headers.get('RateLimit-Policy');
    this.retryAfter = numHeader(headers, 'Retry-After');
    this.correlationId = headers.get('Correlation-ID');
    this.totalCountStatus = headers.get('Total-Count-Status');
    this.searchWarning = headers.get('Search-Warning');
  }

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
    const url = `${this._baseURL}${this._sandbox && SANDBOX_PATHS.has(path) ? `/sandbox${path}` : path}`;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'API-Key': this._apiKey,
      'User-Agent': `datalegion-node/${VERSION}`,
      ...this._defaultHeaders,
    };

    const init: RequestInit = { headers, method };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(stripUndefined(body as Record<string, unknown>));
    }

    // Abort the request once the timeout elapses. The signal stays attached
    // through the body read below, so a response that streams its headers and
    // then stalls the body is still bounded by the timeout.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this._timeout);
    init.signal = controller.signal;

    let response: Response;
    let rawBody: string;
    try {
      response = await fetch(url, init);
      // Capture headers, then read the body — both under the same timeout.
      this._captureHeaders(response.headers);
      rawBody = await response.text();
    } catch (err: unknown) {
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

    // Parse the body as JSON, falling back to a raw-text error shape (covers an
    // empty body or a malformed body sent with a JSON content-type).
    let data: unknown;
    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      data = { error: 'unknown', message: rawBody };
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

    const ErrorClass = STATUS_ERRORS[response.status];
    if (ErrorClass) {
      throw new ErrorClass(errorCode, errorMessage, errorDetails);
    }
    if (response.status >= 500) {
      throw new ServerError(response.status, errorCode, errorMessage, errorDetails);
    }
    throw new DataLegionError(response.status, errorCode, errorMessage, errorDetails);
  }
}
