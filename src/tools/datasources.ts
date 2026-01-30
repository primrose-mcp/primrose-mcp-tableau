/**
 * Data Source Tools
 *
 * MCP tools for Tableau data source management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerDataSourceTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_list_datasources',
    `List all data sources on the current site.

Args:
  - pageSize: Number of data sources per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression (e.g., "name:eq:Sales Data")
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of data sources.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100).describe('Data sources per page'),
      pageNumber: z.number().int().min(1).default(1).describe('Page number'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listDataSources({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'datasources');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_datasource',
    `Get details for a specific data source.

Args:
  - dataSourceId: Data source ID
  - format: Response format

Returns:
  Data source details including project, owner, and certification info.`,
    {
      dataSourceId: z.string().describe('Data source ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ dataSourceId, format }) => {
      try {
        const datasource = await client.getDataSource(dataSourceId);
        return formatResponse(datasource, format, 'datasource');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_datasource',
    `Update a data source's settings.

Args:
  - dataSourceId: Data source ID to update
  - name: New data source name
  - description: New description
  - projectId: Move to different project
  - ownerId: Change owner
  - isCertified: Certification status
  - certificationNote: Certification note
  - encryptExtracts: Encrypt extracts

Returns:
  Updated data source details.`,
    {
      dataSourceId: z.string().describe('Data source ID to update'),
      name: z.string().optional(),
      description: z.string().optional(),
      projectId: z.string().optional(),
      ownerId: z.string().optional(),
      isCertified: z.boolean().optional(),
      certificationNote: z.string().optional(),
      encryptExtracts: z.boolean().optional(),
    },
    async ({ dataSourceId, ...input }) => {
      try {
        const datasource = await client.updateDataSource(dataSourceId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Data source updated', datasource }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_datasource',
    `Delete a data source.

Args:
  - dataSourceId: Data source ID to delete

Returns:
  Confirmation of deletion.`,
    {
      dataSourceId: z.string().describe('Data source ID to delete'),
    },
    async ({ dataSourceId }) => {
      try {
        await client.deleteDataSource(dataSourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Data source ${dataSourceId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_refresh_datasource',
    `Refresh the extract data for a data source.

Args:
  - dataSourceId: Data source ID to refresh

Returns:
  Job details for the refresh operation.`,
    {
      dataSourceId: z.string().describe('Data source ID to refresh'),
    },
    async ({ dataSourceId }) => {
      try {
        const job = await client.refreshDataSource(dataSourceId);
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
    'tableau_get_datasource_revisions',
    `Get revision history for a data source.

Args:
  - dataSourceId: Data source ID
  - pageSize: Revisions per page
  - pageNumber: Page number
  - format: Response format

Returns:
  List of data source revisions.`,
    {
      dataSourceId: z.string().describe('Data source ID'),
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ dataSourceId, pageSize, pageNumber, format }) => {
      try {
        const result = await client.getDataSourceRevisions(dataSourceId, { pageSize, pageNumber });
        return formatResponse(result, format, 'revisions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_datasource_connections',
    `Get all connections for a data source.

Args:
  - dataSourceId: Data source ID
  - format: Response format

Returns:
  List of data connections.`,
    {
      dataSourceId: z.string().describe('Data source ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ dataSourceId, format }) => {
      try {
        const connections = await client.getDataSourceConnections(dataSourceId);
        return formatResponse(connections, format, 'connections');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_datasource_connection',
    `Update a data source's connection.

Args:
  - dataSourceId: Data source ID
  - connectionId: Connection ID to update
  - serverAddress: New server address
  - serverPort: New server port
  - userName: New username
  - password: New password
  - embedPassword: Embed password in connection

Returns:
  Updated connection details.`,
    {
      dataSourceId: z.string().describe('Data source ID'),
      connectionId: z.string().describe('Connection ID'),
      serverAddress: z.string().optional(),
      serverPort: z.string().optional(),
      userName: z.string().optional(),
      password: z.string().optional(),
      embedPassword: z.boolean().optional(),
    },
    async ({ dataSourceId, connectionId, ...input }) => {
      try {
        const connection = await client.updateDataSourceConnection(dataSourceId, connectionId, input);
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
    'tableau_add_datasource_tags',
    `Add tags to a data source.

Args:
  - dataSourceId: Data source ID
  - tags: Array of tag labels to add

Returns:
  Confirmation of tags added.`,
    {
      dataSourceId: z.string().describe('Data source ID'),
      tags: z.array(z.string()).describe('Tags to add'),
    },
    async ({ dataSourceId, tags }) => {
      try {
        await client.addDataSourceTags(dataSourceId, tags);
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
    'tableau_delete_datasource_tag',
    `Remove a tag from a data source.

Args:
  - dataSourceId: Data source ID
  - tag: Tag label to remove

Returns:
  Confirmation of tag removed.`,
    {
      dataSourceId: z.string().describe('Data source ID'),
      tag: z.string().describe('Tag to remove'),
    },
    async ({ dataSourceId, tag }) => {
      try {
        await client.deleteDataSourceTag(dataSourceId, tag);
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
