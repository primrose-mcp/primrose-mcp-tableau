/**
 * Project Tools
 *
 * MCP tools for Tableau project management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerProjectTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_list_projects',
    `List all projects on the current site.

Args:
  - pageSize: Number of projects per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression (e.g., "name:eq:Sales")
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of projects.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100).describe('Projects per page'),
      pageNumber: z.number().int().min(1).default(1).describe('Page number'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listProjects({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'projects');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_create_project',
    `Create a new project on the current site.

Args:
  - name: Project name (required)
  - description: Project description
  - contentPermissions: Permission mode ('ManagedByOwner', 'LockedToProject', 'LockedToProjectWithoutNested')
  - parentProjectId: Parent project ID for nested projects

Returns:
  Created project details.`,
    {
      name: z.string().describe('Project name'),
      description: z.string().optional().describe('Project description'),
      contentPermissions: z
        .enum(['ManagedByOwner', 'LockedToProject', 'LockedToProjectWithoutNested'])
        .optional()
        .describe('Content permission mode'),
      parentProjectId: z.string().optional().describe('Parent project ID'),
    },
    async (input) => {
      try {
        const project = await client.createProject(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project created', project }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_project',
    `Update a project's settings.

Args:
  - projectId: Project ID to update
  - name: New project name
  - description: New description
  - contentPermissions: New permission mode
  - parentProjectId: New parent project ID
  - ownerId: New owner user ID

Returns:
  Updated project details.`,
    {
      projectId: z.string().describe('Project ID to update'),
      name: z.string().optional(),
      description: z.string().optional(),
      contentPermissions: z.string().optional(),
      parentProjectId: z.string().optional(),
      ownerId: z.string().optional(),
    },
    async ({ projectId, ...input }) => {
      try {
        const project = await client.updateProject(projectId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project updated', project }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_project',
    `Delete a project and all its contents.

WARNING: This permanently deletes the project and all workbooks, data sources, and nested projects inside it.

Args:
  - projectId: Project ID to delete

Returns:
  Confirmation of deletion.`,
    {
      projectId: z.string().describe('Project ID to delete'),
    },
    async ({ projectId }) => {
      try {
        await client.deleteProject(projectId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Project ${projectId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
