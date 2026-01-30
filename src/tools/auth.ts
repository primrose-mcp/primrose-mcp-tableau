/**
 * Authentication Tools
 *
 * MCP tools for Tableau authentication.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerAuthTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_sign_in',
    `Sign in to Tableau Server using Personal Access Token (PAT).

This must be called first before using any other Tableau tools (unless you provide X-Tableau-Auth-Token header).
After signing in, the auth token is stored for subsequent requests in this session.

Args:
  - siteContentUrl: Site content URL (leave empty for default site)

Returns:
  Auth token, site ID, and user ID.`,
    {
      siteContentUrl: z.string().optional().describe('Site content URL (empty for default site)'),
    },
    async ({ siteContentUrl }) => {
      try {
        const result = await client.signIn(siteContentUrl);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Successfully signed in to Tableau',
                  siteId: result.credentials.site.id,
                  userId: result.credentials.user.id,
                  siteContentUrl: result.credentials.site.contentUrl,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_sign_out',
    `Sign out from Tableau Server.

Invalidates the current auth token.

Returns:
  Confirmation of sign out.`,
    {},
    async () => {
      try {
        await client.signOut();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Successfully signed out' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_switch_site',
    `Switch to a different site on the same Tableau Server.

Args:
  - siteContentUrl: Site content URL to switch to

Returns:
  New auth token and site info.`,
    {
      siteContentUrl: z.string().describe('Site content URL to switch to'),
    },
    async ({ siteContentUrl }) => {
      try {
        const result = await client.switchSite(siteContentUrl);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Successfully switched site',
                  siteId: result.credentials.site.id,
                  siteContentUrl: result.credentials.site.contentUrl,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_list_personal_access_tokens',
    `List personal access tokens for a user (Tableau Cloud only).

Args:
  - userId: User ID

Returns:
  List of personal access tokens.`,
    {
      userId: z.string().describe('User ID'),
    },
    async ({ userId }) => {
      try {
        const tokens = await client.listPersonalAccessTokens(userId);
        return formatResponse(tokens, 'json', 'tokens');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_revoke_personal_access_token',
    `Revoke a personal access token (Tableau Cloud only).

Args:
  - userId: User ID
  - tokenName: Name of the token to revoke

Returns:
  Confirmation of revocation.`,
    {
      userId: z.string().describe('User ID'),
      tokenName: z.string().describe('Token name to revoke'),
    },
    async ({ userId, tokenName }) => {
      try {
        await client.revokePersonalAccessToken(userId, tokenName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Token '${tokenName}' revoked` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
