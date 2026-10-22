/** Base error class for all Data Legion API errors. */
export class DataLegionError extends Error {
  /** HTTP status code returned by the API. */
  readonly statusCode: number;
  /** Machine-readable error code (e.g. `'invalid_api_key'`). */
  readonly error: string;
  /** Additional error details, if any. */
  readonly details: ErrorDetails;

  constructor(
    statusCode: number,
    error: string,
    message: string,
    details: ErrorDetails = null,
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

type ErrorDetails = Record<string, unknown> | unknown[] | null;

/** Constructor of an error class bound to one HTTP status. */
export type FixedStatusError = new (error: string, message: string, details?: ErrorDetails) => DataLegionError;

// One class per fixed status: the constructor takes no status and the name survives minifiers.
// Typed as FixedStatusError so the emitted declarations name only our own types: an inferred
// mixin type pulls in Error's Node-only members (NodeJS.CallSite), which a consumer without
// @types/node can't resolve.
const withStatus = (statusCode: number, name: string): FixedStatusError =>
  class extends DataLegionError {
    constructor(error: string, message: string, details: ErrorDetails = null) {
      super(statusCode, error, message, details);
      this.name = name;
    }
  };

/** Raised when the request is malformed, e.g. an unknown field name (HTTP 400). */
export class BadRequestError extends withStatus(400, 'BadRequestError') {}

/** Raised when the API key is missing or invalid (HTTP 401). */
export class AuthenticationError extends withStatus(401, 'AuthenticationError') {}

/** Raised when the account has insufficient credits (HTTP 402). */
export class InsufficientCreditsError extends withStatus(402, 'InsufficientCreditsError') {}

/** Raised when the key or its contract doesn't cover the endpoint (HTTP 403). */
export class PermissionDeniedError extends withStatus(403, 'PermissionDeniedError') {}

/** Raised when nothing matches, e.g. an enrich with no match (HTTP 404). No credits are used. */
export class NotFoundError extends withStatus(404, 'NotFoundError') {}

/** Raised when a search runs past the API's time limit (HTTP 408). Narrow the query or retry. */
export class RequestTimeoutError extends withStatus(408, 'RequestTimeoutError') {}

/** Raised when the request fails validation (HTTP 422). */
export class ValidationError extends withStatus(422, 'ValidationError') {}

/** Raised when the request is rate-limited (HTTP 429). */
export class RateLimitError extends withStatus(429, 'RateLimitError') {}

/** Raised for server and gateway errors (HTTP 5xx). */
export class ServerError extends DataLegionError {
  constructor(statusCode: number, error: string, message: string, details: ErrorDetails = null) {
    super(statusCode, error, message, details);
    this.name = 'ServerError';
  }
}
