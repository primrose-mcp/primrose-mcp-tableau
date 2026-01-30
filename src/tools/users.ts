/**
 * User Tools
 *
 * MCP tools for Tableau user management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const SiteRoleSchema = z.enum([
  'Creator',
  'Explorer',
  'ExplorerCanPublish',
  'SiteAdministratorExplorer',
  'SiteAdministratorCreator',
  'Unlicensed',
  'Viewer',
]);

export function registerUserTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_list_users',
    `List all users on the current site.

Args:
  - pageSize: Number of users per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression (e.g., "name:eq:admin")
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of users.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100).describe('Users per page'),
      pageNumber: z.number().int().min(1).default(1).describe('Page number'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listUsers({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'users');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_user',
    `Get details for a specific user.

Args:
  - userId: User ID
  - format: Response format

Returns:
  User details including site role and last login.`,
    {
      userId: z.string().describe('User ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ userId, format }) => {
      try {
        const user = await client.getUser(userId);
        return formatResponse(user, format, 'user');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_user_to_site',
    `Add a user to the current site.

Args:
  - name: Username (required)
  - siteRole: Site role (Creator, Explorer, ExplorerCanPublish, SiteAdministratorExplorer, SiteAdministratorCreator, Viewer, Unlicensed)
  - authSetting: Authentication setting

Returns:
  Created user details.`,
    {
      name: z.string().describe('Username'),
      siteRole: SiteRoleSchema.describe('Site role'),
      authSetting: z.string().optional().describe('Auth setting'),
    },
    async (input) => {
      try {
        const user = await client.addUserToSite(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User added to site', user }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_user',
    `Update a user's settings.

Args:
  - userId: User ID to update
  - fullName: Full name
  - email: Email address
  - siteRole: New site role
  - authSetting: Authentication setting

Returns:
  Updated user details.`,
    {
      userId: z.string().describe('User ID to update'),
      fullName: z.string().optional(),
      email: z.string().email().optional(),
      siteRole: SiteRoleSchema.optional(),
      authSetting: z.string().optional(),
    },
    async ({ userId, ...input }) => {
      try {
        const user = await client.updateUser(userId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User updated', user }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_remove_user_from_site',
    `Remove a user from the current site.

Args:
  - userId: User ID to remove

Returns:
  Confirmation of removal.`,
    {
      userId: z.string().describe('User ID to remove'),
    },
    async ({ userId }) => {
      try {
        await client.removeUserFromSite(userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} removed from site` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_user_groups',
    `Get all groups a user belongs to.

Args:
  - userId: User ID
  - format: Response format

Returns:
  List of groups.`,
    {
      userId: z.string().describe('User ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ userId, format }) => {
      try {
        const groups = await client.getUserGroups(userId);
        return formatResponse(groups, format, 'groups');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
