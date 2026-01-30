/**
 * Site Tools
 *
 * MCP tools for Tableau site management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerSiteTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_list_sites',
    `List all sites on the Tableau Server.

Args:
  - pageSize: Number of sites per page (default: 100)
  - pageNumber: Page number (default: 1)
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of sites.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100).describe('Sites per page'),
      pageNumber: z.number().int().min(1).default(1).describe('Page number'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ pageSize, pageNumber, format }) => {
      try {
        const result = await client.listSites({ pageSize, pageNumber });
        return formatResponse(result, format, 'sites');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_site',
    `Get details for a specific site.

Args:
  - siteId: Site ID (optional, defaults to current site)
  - format: Response format

Returns:
  Site details.`,
    {
      siteId: z.string().optional().describe('Site ID (defaults to current site)'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ siteId, format }) => {
      try {
        const site = await client.getSite(siteId);
        return formatResponse(site, format, 'site');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_create_site',
    `Create a new site on the Tableau Server.

Args:
  - name: Site name
  - contentUrl: Site content URL (used in site URLs)
  - adminMode: Admin mode ('ContentAndUsers' or 'ContentOnly')
  - userQuota: Maximum number of users
  - storageQuota: Storage quota in MB
  - disableSubscriptions: Disable subscriptions

Returns:
  Created site details.`,
    {
      name: z.string().describe('Site name'),
      contentUrl: z.string().describe('Site content URL'),
      adminMode: z.enum(['ContentAndUsers', 'ContentOnly']).optional(),
      userQuota: z.number().int().optional(),
      storageQuota: z.number().int().optional(),
      disableSubscriptions: z.boolean().optional(),
    },
    async (input) => {
      try {
        const site = await client.createSite(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Site created', site }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_site',
    `Update a site's settings.

Args:
  - siteId: Site ID to update
  - name: New site name
  - contentUrl: New content URL
  - adminMode: New admin mode
  - state: Site state ('Active' or 'Suspended')
  - userQuota: New user quota
  - storageQuota: New storage quota
  - disableSubscriptions: Disable subscriptions
  - revisionHistoryEnabled: Enable revision history
  - revisionLimit: Maximum revisions to keep

Returns:
  Updated site details.`,
    {
      siteId: z.string().describe('Site ID to update'),
      name: z.string().optional(),
      contentUrl: z.string().optional(),
      adminMode: z.string().optional(),
      state: z.enum(['Active', 'Suspended']).optional(),
      userQuota: z.number().int().optional(),
      storageQuota: z.number().int().optional(),
      disableSubscriptions: z.boolean().optional(),
      revisionHistoryEnabled: z.boolean().optional(),
      revisionLimit: z.number().int().optional(),
    },
    async ({ siteId, ...input }) => {
      try {
        const site = await client.updateSite(siteId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Site updated', site }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_site',
    `Delete a site from the Tableau Server.

WARNING: This permanently deletes the site and all its content.

Args:
  - siteId: Site ID to delete

Returns:
  Confirmation of deletion.`,
    {
      siteId: z.string().describe('Site ID to delete'),
    },
    async ({ siteId }) => {
      try {
        await client.deleteSite(siteId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Site ${siteId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
