/**
 * Workbook Tools
 *
 * MCP tools for Tableau workbook management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerWorkbookTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_list_workbooks',
    `List all workbooks on the current site.

Args:
  - pageSize: Number of workbooks per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression (e.g., "name:eq:Sales Dashboard")
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of workbooks.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100).describe('Workbooks per page'),
      pageNumber: z.number().int().min(1).default(1).describe('Page number'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listWorkbooks({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'workbooks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_workbook',
    `Get details for a specific workbook.

Args:
  - workbookId: Workbook ID
  - format: Response format

Returns:
  Workbook details including views, project, and owner info.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workbookId, format }) => {
      try {
        const workbook = await client.getWorkbook(workbookId);
        return formatResponse(workbook, format, 'workbook');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_workbook',
    `Update a workbook's settings.

Args:
  - workbookId: Workbook ID to update
  - name: New workbook name
  - description: New description
  - showTabs: Show sheet tabs
  - projectId: Move to different project
  - ownerId: Change owner
  - encryptExtracts: Encrypt extracts

Returns:
  Updated workbook details.`,
    {
      workbookId: z.string().describe('Workbook ID to update'),
      name: z.string().optional(),
      description: z.string().optional(),
      showTabs: z.boolean().optional(),
      projectId: z.string().optional(),
      ownerId: z.string().optional(),
      encryptExtracts: z.boolean().optional(),
    },
    async ({ workbookId, ...input }) => {
      try {
        const workbook = await client.updateWorkbook(workbookId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Workbook updated', workbook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_workbook',
    `Delete a workbook.

Args:
  - workbookId: Workbook ID to delete

Returns:
  Confirmation of deletion.`,
    {
      workbookId: z.string().describe('Workbook ID to delete'),
    },
    async ({ workbookId }) => {
      try {
        await client.deleteWorkbook(workbookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Workbook ${workbookId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_refresh_workbook',
    `Refresh the extract data for a workbook.

Args:
  - workbookId: Workbook ID to refresh

Returns:
  Job details for the refresh operation.`,
    {
      workbookId: z.string().describe('Workbook ID to refresh'),
    },
    async ({ workbookId }) => {
      try {
        const job = await client.refreshWorkbook(workbookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Refresh started', job }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_workbook_revisions',
    `Get revision history for a workbook.

Args:
  - workbookId: Workbook ID
  - pageSize: Revisions per page
  - pageNumber: Page number
  - format: Response format

Returns:
  List of workbook revisions.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workbookId, pageSize, pageNumber, format }) => {
      try {
        const result = await client.getWorkbookRevisions(workbookId, { pageSize, pageNumber });
        return formatResponse(result, format, 'revisions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_workbook_connections',
    `Get all data connections for a workbook.

Args:
  - workbookId: Workbook ID
  - format: Response format

Returns:
  List of data connections.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workbookId, format }) => {
      try {
        const connections = await client.getWorkbookConnections(workbookId);
        return formatResponse(connections, format, 'connections');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_workbook_connection',
    `Update a workbook's data connection.

Args:
  - workbookId: Workbook ID
  - connectionId: Connection ID to update
  - serverAddress: New server address
  - serverPort: New server port
  - userName: New username
  - password: New password
  - embedPassword: Embed password in connection

Returns:
  Updated connection details.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      connectionId: z.string().describe('Connection ID'),
      serverAddress: z.string().optional(),
      serverPort: z.string().optional(),
      userName: z.string().optional(),
      password: z.string().optional(),
      embedPassword: z.boolean().optional(),
    },
    async ({ workbookId, connectionId, ...input }) => {
      try {
        const connection = await client.updateWorkbookConnection(workbookId, connectionId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Connection updated', connection }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_workbook_tags',
    `Add tags to a workbook.

Args:
  - workbookId: Workbook ID
  - tags: Array of tag labels to add

Returns:
  Confirmation of tags added.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      tags: z.array(z.string()).describe('Tags to add'),
    },
    async ({ workbookId, tags }) => {
      try {
        await client.addWorkbookTags(workbookId, tags);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Tags added: ${tags.join(', ')}` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_workbook_tag',
    `Remove a tag from a workbook.

Args:
  - workbookId: Workbook ID
  - tag: Tag label to remove

Returns:
  Confirmation of tag removed.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      tag: z.string().describe('Tag to remove'),
    },
    async ({ workbookId, tag }) => {
      try {
        await client.deleteWorkbookTag(workbookId, tag);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Tag '${tag}' removed` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
