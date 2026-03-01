/** Base error class for all Data Legion API errors. */
export class DataLegionError extends Error {
  /** HTTP status code returned by the API. */
  readonly statusCode: number;
  /** Machine-readable error code (e.g. `'invalid_api_key'`). */
  readonly error: string;
  /** Additional error details, if any. */
  readonly details: Record<string, unknown> | unknown[] | null;

  constructor(
    statusCode: number,
    error: string,
    message: string,
    details: Record<string, unknown> | unknown[] | null = null,
  ) {
    super(message);
    this.name = 'DataLegionError';
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;

    // Maintain proper prototype chain for instanceof checks.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Raised when the API key is missing or invalid (HTTP 401). */
export class AuthenticationError extends DataLegionError {
  constructor(error: string, message: string, details: Record<string, unknown> | unknown[] | null = null) {
    super(401, error, message, details);
    this.name = 'AuthenticationError';
  }
}

/** Raised when the account has insufficient credits (HTTP 402). */
export class InsufficientCreditsError extends DataLegionError {
  constructor(error: string, message: string, details: Record<string, unknown> | unknown[] | null = null) {
    super(402, error, message, details);
    this.name = 'InsufficientCreditsError';
  }
}

/** Raised when the request fails validation (HTTP 422). */
export class ValidationError extends DataLegionError {
  constructor(error: string, message: string, details: Record<string, unknown> | unknown[] | null = null) {
    super(422, error, message, details);
    this.name = 'ValidationError';
  }
}

/** Raised when the request is rate-limited (HTTP 429). */
export class RateLimitError extends DataLegionError {
  constructor(error: string, message: string, details: Record<string, unknown> | unknown[] | null = null) {
    super(429, error, message, details);
    this.name = 'RateLimitError';
  }
}
