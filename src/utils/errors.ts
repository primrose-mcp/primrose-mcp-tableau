/**
 * Error Handling Utilities
 *
 * Custom error classes and error handling helpers for Tableau API.
 */

/**
 * Base Tableau API error
 */
export class TableauApiError extends Error {
  public statusCode?: number;
  public code: string;
  public retryable: boolean;
  public details?: unknown;

  constructor(message: string, statusCode?: number, code?: string, retryable = false, details?: unknown) {
    super(message);
    this.name = 'TableauApiError';
    this.statusCode = statusCode;
    this.code = code || 'TABLEAU_ERROR';
    this.retryable = retryable;
    this.details = details;
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends TableauApiError {
  public retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends TableauApiError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_FAILED', false);
    this.name = 'AuthenticationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends TableauApiError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with ID '${id}' not found`, 404, 'NOT_FOUND', false);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends TableauApiError {
  public validationDetails: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message, 400, 'VALIDATION_ERROR', false);
    this.name = 'ValidationError';
    this.validationDetails = details;
  }
}

/**
 * Permission denied error
 */
export class PermissionDeniedError extends TableauApiError {
  constructor(message: string) {
    super(message, 403, 'PERMISSION_DENIED', false);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Not signed in error
 */
export class NotSignedInError extends TableauApiError {
  constructor() {
    super('Not signed in. Call tableau_sign_in first or provide X-Tableau-Auth-Token header.', 401, 'NOT_SIGNED_IN', false);
    this.name = 'NotSignedInError';
  }
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof TableauApiError) {
    return error.retryable;
  }
  if (error instanceof Error) {
    // Network errors are typically retryable
    return (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNRESET')
    );
  }
  return false;
}

/**
 * Format an error for logging
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof TableauApiError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
      details: error.details,
      ...(error instanceof RateLimitError && { retryAfterSeconds: error.retryAfterSeconds }),
      ...(error instanceof ValidationError && { validationDetails: error.validationDetails }),
    };
  }
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}

/**
 * Parse Tableau API error response
 */
export function parseTableauError(response: Response, body: string): TableauApiError {
  try {
    const parsed = JSON.parse(body);
    const error = parsed.error;

    if (error) {
      const message = error.summary || error.detail || error.message || 'Unknown error';
      const code = error.code || 'UNKNOWN';

      if (response.status === 401) {
        return new AuthenticationError(message);
      }
      if (response.status === 403) {
        return new PermissionDeniedError(message);
      }
      if (response.status === 404) {
        return new NotFoundError('Resource', 'unknown');
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        return new RateLimitError(message, retryAfter ? Number.parseInt(retryAfter, 10) : 60);
      }

      return new TableauApiError(message, response.status, code, false, error);
    }
  } catch {
    // Could not parse as JSON
  }

  return new TableauApiError(
    `Tableau API error: ${response.status} ${response.statusText}`,
    response.status,
    'API_ERROR',
    response.status >= 500
  );
}
