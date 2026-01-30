/**
 * Group Tools
 *
 * MCP tools for Tableau group management.
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

export function registerGroupTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_list_groups',
    `List all groups on the current site.

Args:
  - pageSize: Number of groups per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression (e.g., "name:eq:Admins")
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of groups.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100).describe('Groups per page'),
      pageNumber: z.number().int().min(1).default(1).describe('Page number'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listGroups({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'groups');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_group',
    `Get details for a specific group.

Args:
  - groupId: Group ID
  - format: Response format

Returns:
  Group details.`,
    {
      groupId: z.string().describe('Group ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ groupId, format }) => {
      try {
        const group = await client.getGroup(groupId);
        return formatResponse(group, format, 'group');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_create_group',
    `Create a new group on the current site.

Args:
  - name: Group name (required)
  - minimumSiteRole: Minimum site role for group members

Returns:
  Created group details.`,
    {
      name: z.string().describe('Group name'),
      minimumSiteRole: SiteRoleSchema.optional().describe('Minimum site role'),
    },
    async (input) => {
      try {
        const group = await client.createGroup(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Group created', group }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_group',
    `Update a group's settings.

Args:
  - groupId: Group ID to update
  - name: New group name
  - minimumSiteRole: New minimum site role

Returns:
  Updated group details.`,
    {
      groupId: z.string().describe('Group ID to update'),
      name: z.string().optional(),
      minimumSiteRole: SiteRoleSchema.optional(),
    },
    async ({ groupId, ...input }) => {
      try {
        const group = await client.updateGroup(groupId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Group updated', group }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_group',
    `Delete a group.

Args:
  - groupId: Group ID to delete

Returns:
  Confirmation of deletion.`,
    {
      groupId: z.string().describe('Group ID to delete'),
    },
    async ({ groupId }) => {
      try {
        await client.deleteGroup(groupId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Group ${groupId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_group_users',
    `Get all users in a group.

Args:
  - groupId: Group ID
  - pageSize: Users per page
  - pageNumber: Page number
  - format: Response format

Returns:
  Paginated list of users in the group.`,
    {
      groupId: z.string().describe('Group ID'),
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ groupId, pageSize, pageNumber, format }) => {
      try {
        const result = await client.getGroupUsers(groupId, { pageSize, pageNumber });
        return formatResponse(result, format, 'users');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_user_to_group',
    `Add a user to a group.

Args:
  - groupId: Group ID
  - userId: User ID to add

Returns:
  User details.`,
    {
      groupId: z.string().describe('Group ID'),
      userId: z.string().describe('User ID to add'),
    },
    async ({ groupId, userId }) => {
      try {
        const user = await client.addUserToGroup(groupId, userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'User added to group', user }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_remove_user_from_group',
    `Remove a user from a group.

Args:
  - groupId: Group ID
  - userId: User ID to remove

Returns:
  Confirmation of removal.`,
    {
      groupId: z.string().describe('Group ID'),
      userId: z.string().describe('User ID to remove'),
    },
    async ({ groupId, userId }) => {
      try {
        await client.removeUserFromGroup(groupId, userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `User ${userId} removed from group` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Group Sets
  server.tool(
    'tableau_list_group_sets',
    `List all group sets on the current site.

Args:
  - pageSize: Group sets per page
  - pageNumber: Page number
  - format: Response format

Returns:
  Paginated list of group sets.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageSize, pageNumber, format }) => {
      try {
        const result = await client.listGroupSets({ pageSize, pageNumber });
        return formatResponse(result, format, 'groupsets');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_create_group_set',
    `Create a new group set.

Args:
  - name: Group set name

Returns:
  Created group set details.`,
    {
      name: z.string().describe('Group set name'),
    },
    async ({ name }) => {
      try {
        const groupSet = await client.createGroupSet(name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Group set created', groupSet }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_group_set',
    `Delete a group set.

Args:
  - groupSetId: Group set ID to delete

Returns:
  Confirmation of deletion.`,
    {
      groupSetId: z.string().describe('Group set ID'),
    },
    async ({ groupSetId }) => {
      try {
        await client.deleteGroupSet(groupSetId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Group set ${groupSetId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
