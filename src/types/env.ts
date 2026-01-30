/**
 * Environment Bindings
 *
 * Type definitions for Cloudflare Worker environment variables and bindings.
 *
 * MULTI-TENANT ARCHITECTURE:
 * This server supports multiple tenants. Tenant-specific credentials (PAT tokens,
 * server URLs, etc.) are passed via request headers, NOT stored in wrangler
 * secrets. This allows a single server instance to serve multiple customers.
 *
 * Request Headers:
 * - X-Tableau-Server-URL: Tableau Server or Cloud URL
 * - X-Tableau-PAT-Name: Personal Access Token name
 * - X-Tableau-PAT-Secret: Personal Access Token secret
 * - X-Tableau-Site-Content-URL: Site content URL (optional, empty for default site)
 * - X-Tableau-Auth-Token: Pre-existing auth token (optional, alternative to PAT)
 * - X-Tableau-API-Version: API version (optional, defaults to 3.21)
 */

// =============================================================================
// Tenant Credentials (parsed from request headers)
// =============================================================================

export interface TenantCredentials {
  /** Tableau Server or Cloud URL (from X-Tableau-Server-URL header) */
  serverUrl?: string;

  /** Personal Access Token name (from X-Tableau-PAT-Name header) */
  patName?: string;

  /** Personal Access Token secret (from X-Tableau-PAT-Secret header) */
  patSecret?: string;

  /** Site content URL (from X-Tableau-Site-Content-URL header) */
  siteContentUrl?: string;

  /** Pre-existing auth token (from X-Tableau-Auth-Token header) */
  authToken?: string;

  /** Site ID when already authenticated */
  siteId?: string;

  /** User ID when already authenticated */
  userId?: string;

  /** API version (from X-Tableau-API-Version header) */
  apiVersion?: string;
}

/**
 * Parse tenant credentials from request headers
 */
export function parseTenantCredentials(request: Request): TenantCredentials {
  const headers = request.headers;

  return {
    serverUrl: headers.get('X-Tableau-Server-URL') || undefined,
    patName: headers.get('X-Tableau-PAT-Name') || undefined,
    patSecret: headers.get('X-Tableau-PAT-Secret') || undefined,
    siteContentUrl: headers.get('X-Tableau-Site-Content-URL') || undefined,
    authToken: headers.get('X-Tableau-Auth-Token') || undefined,
    siteId: headers.get('X-Tableau-Site-ID') || undefined,
    userId: headers.get('X-Tableau-User-ID') || undefined,
    apiVersion: headers.get('X-Tableau-API-Version') || undefined,
  };
}

/**
 * Validate that required credentials are present
 */
export function validateCredentials(credentials: TenantCredentials): void {
  if (!credentials.serverUrl) {
    throw new Error('Missing X-Tableau-Server-URL header.');
  }

  // Need either auth token or PAT credentials
  if (!credentials.authToken && (!credentials.patName || !credentials.patSecret)) {
    throw new Error(
      'Missing credentials. Provide either X-Tableau-Auth-Token or both X-Tableau-PAT-Name and X-Tableau-PAT-Secret headers.'
    );
  }
}

// =============================================================================
// Environment Configuration (from wrangler.jsonc vars and bindings)
// =============================================================================

export interface Env {
  // ===========================================================================
  // Environment Variables (from wrangler.jsonc vars)
  // ===========================================================================

  /** Maximum character limit for responses */
  CHARACTER_LIMIT: string;

  /** Default page size for list operations */
  DEFAULT_PAGE_SIZE: string;

  /** Maximum page size allowed */
  MAX_PAGE_SIZE: string;

  /** Default Tableau API version */
  DEFAULT_API_VERSION: string;

  // ===========================================================================
  // Bindings
  // ===========================================================================

  /** KV namespace for session token caching */
  AUTH_KV?: KVNamespace;

  /** Durable Object namespace for MCP sessions */
  MCP_SESSIONS?: DurableObjectNamespace;

  /** Cloudflare AI binding (optional) */
  AI?: Ai;
}

// ===========================================================================
// Helper Functions
// ===========================================================================

/**
 * Get a numeric environment value with a default
 */
export function getEnvNumber(env: Env, key: keyof Env, defaultValue: number): number {
  const value = env[key];
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

/**
 * Get the character limit from environment
 */
export function getCharacterLimit(env: Env): number {
  return getEnvNumber(env, 'CHARACTER_LIMIT', 50000);
}

/**
 * Get the default page size from environment
 */
export function getDefaultPageSize(env: Env): number {
  return getEnvNumber(env, 'DEFAULT_PAGE_SIZE', 100);
}

/**
 * Get the maximum page size from environment
 */
export function getMaxPageSize(env: Env): number {
  return getEnvNumber(env, 'MAX_PAGE_SIZE', 1000);
}

/**
 * Get the default API version from environment
 */
export function getDefaultApiVersion(env: Env): string {
  const value = env.DEFAULT_API_VERSION;
  return typeof value === 'string' ? value : '3.21';
}
