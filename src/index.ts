/**
 * Tableau MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports both stateless (McpServer) and stateful (McpAgent) modes.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (PAT tokens, server URLs, etc.) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Tableau-Server-URL: Tableau Server or Cloud URL
 * - X-Tableau-PAT-Name: Personal Access Token name
 * - X-Tableau-PAT-Secret: Personal Access Token secret
 *
 * Optional Headers:
 * - X-Tableau-Site-Content-URL: Site content URL (empty for default site)
 * - X-Tableau-Auth-Token: Pre-existing auth token (skip sign-in)
 * - X-Tableau-Site-ID: Site ID (when using pre-existing auth token)
 * - X-Tableau-User-ID: User ID (when using pre-existing auth token)
 * - X-Tableau-API-Version: API version (default: 3.21)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createTableauClient } from './client.js';
import {
  registerAuthTools,
  registerDataSourceTools,
  registerFlowTools,
  registerGroupTools,
  registerPermissionTools,
  registerProjectTools,
  registerScheduleTools,
  registerSiteTools,
  registerSubscriptionTools,
  registerUserTools,
  registerViewTools,
  registerWorkbookTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-tableau';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode (Option 2) instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 */
export class TableauMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Tableau-* headers instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createTableauClient(credentials);

  // Register all tool categories
  registerAuthTools(server, client);
  registerSiteTools(server, client);
  registerProjectTools(server, client);
  registerWorkbookTools(server, client);
  registerViewTools(server, client);
  registerDataSourceTools(server, client);
  registerUserTools(server, client);
  registerGroupTools(server, client);
  registerScheduleTools(server, client);
  registerFlowTools(server, client);
  registerSubscriptionTools(server, client);
  registerPermissionTools(server, client);

  // Test connection tool
  server.tool(
    'tableau_test_connection',
    `Test the connection to Tableau Server.

This tool checks if the server is reachable and returns server info.
No authentication required - it calls the serverinfo endpoint.

Returns:
  Connection status and server version info.`,
    {},
    async () => {
      try {
        const result = await client.testConnection();
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: [
              'X-Tableau-Server-URL',
              'X-Tableau-PAT-Name and X-Tableau-PAT-Secret (or X-Tableau-Auth-Token)',
            ],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Tableau REST API MCP Server - Multi-tenant',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass Tableau credentials via request headers',
          required_headers: {
            'X-Tableau-Server-URL': 'Tableau Server or Cloud URL (e.g., https://10ax.online.tableau.com)',
          },
          credential_options: [
            {
              description: 'Personal Access Token (recommended)',
              headers: {
                'X-Tableau-PAT-Name': 'Personal Access Token name',
                'X-Tableau-PAT-Secret': 'Personal Access Token secret',
              },
            },
            {
              description: 'Pre-existing auth token',
              headers: {
                'X-Tableau-Auth-Token': 'Auth token from previous sign-in',
                'X-Tableau-Site-ID': 'Site ID',
                'X-Tableau-User-ID': 'User ID',
              },
            },
          ],
          optional_headers: {
            'X-Tableau-Site-Content-URL': 'Site content URL (empty for default site)',
            'X-Tableau-API-Version': 'API version (default: 3.21)',
          },
        },
        tools: {
          authentication: ['tableau_sign_in', 'tableau_sign_out', 'tableau_switch_site', 'tableau_test_connection'],
          sites: ['tableau_list_sites', 'tableau_get_site', 'tableau_create_site', 'tableau_update_site', 'tableau_delete_site'],
          projects: ['tableau_list_projects', 'tableau_create_project', 'tableau_update_project', 'tableau_delete_project'],
          workbooks: ['tableau_list_workbooks', 'tableau_get_workbook', 'tableau_update_workbook', 'tableau_delete_workbook', 'tableau_refresh_workbook', 'tableau_get_workbook_revisions', 'tableau_get_workbook_connections'],
          views: ['tableau_list_views', 'tableau_get_view', 'tableau_get_workbook_views', 'tableau_query_view_data', 'tableau_get_view_image', 'tableau_get_view_pdf'],
          custom_views: ['tableau_list_custom_views', 'tableau_get_custom_view', 'tableau_update_custom_view', 'tableau_delete_custom_view'],
          datasources: ['tableau_list_datasources', 'tableau_get_datasource', 'tableau_update_datasource', 'tableau_delete_datasource', 'tableau_refresh_datasource'],
          users: ['tableau_list_users', 'tableau_get_user', 'tableau_add_user_to_site', 'tableau_update_user', 'tableau_remove_user_from_site'],
          groups: ['tableau_list_groups', 'tableau_get_group', 'tableau_create_group', 'tableau_update_group', 'tableau_delete_group', 'tableau_get_group_users', 'tableau_add_user_to_group', 'tableau_remove_user_from_group'],
          schedules: ['tableau_list_schedules', 'tableau_get_schedule', 'tableau_create_schedule', 'tableau_update_schedule', 'tableau_delete_schedule'],
          jobs: ['tableau_list_jobs', 'tableau_get_job', 'tableau_cancel_job'],
          tasks: ['tableau_list_extract_refresh_tasks', 'tableau_get_extract_refresh_task', 'tableau_run_extract_refresh_task'],
          flows: ['tableau_list_flows', 'tableau_get_flow', 'tableau_update_flow', 'tableau_delete_flow', 'tableau_run_flow', 'tableau_list_flow_runs', 'tableau_get_flow_run', 'tableau_cancel_flow_run'],
          subscriptions: ['tableau_list_subscriptions', 'tableau_get_subscription', 'tableau_create_subscription', 'tableau_update_subscription', 'tableau_delete_subscription'],
          favorites: ['tableau_get_user_favorites', 'tableau_add_workbook_to_favorites', 'tableau_add_view_to_favorites', 'tableau_add_datasource_to_favorites', 'tableau_remove_workbook_from_favorites'],
          permissions: ['tableau_get_workbook_permissions', 'tableau_add_workbook_permissions', 'tableau_get_datasource_permissions', 'tableau_add_datasource_permissions', 'tableau_get_project_permissions', 'tableau_add_project_permissions'],
          tags: ['tableau_add_workbook_tags', 'tableau_delete_workbook_tag', 'tableau_add_view_tags', 'tableau_delete_view_tag', 'tableau_add_datasource_tags', 'tableau_delete_datasource_tag'],
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
