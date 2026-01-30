/**
 * View Tools
 *
 * MCP tools for Tableau view management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerViewTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_list_views',
    `List all views on the current site.

Args:
  - pageSize: Number of views per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression (e.g., "name:eq:Sales Chart")
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of views.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100).describe('Views per page'),
      pageNumber: z.number().int().min(1).default(1).describe('Page number'),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listViews({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'views');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_view',
    `Get details for a specific view.

Args:
  - viewId: View ID
  - format: Response format

Returns:
  View details including workbook and owner info.`,
    {
      viewId: z.string().describe('View ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ viewId, format }) => {
      try {
        const view = await client.getView(viewId);
        return formatResponse(view, format, 'view');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_workbook_views',
    `Get all views in a workbook.

Args:
  - workbookId: Workbook ID
  - format: Response format

Returns:
  List of views in the workbook.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workbookId, format }) => {
      try {
        const views = await client.getWorkbookViews(workbookId);
        return formatResponse(views, format, 'views');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_query_view_data',
    `Query the underlying data from a view.

Returns the data in CSV format.

Args:
  - viewId: View ID
  - maxAge: Maximum age of cached data in minutes

Returns:
  View data in CSV format.`,
    {
      viewId: z.string().describe('View ID'),
      maxAge: z.number().int().optional().describe('Max cache age in minutes'),
    },
    async ({ viewId, maxAge }) => {
      try {
        const data = await client.queryViewData(viewId, maxAge);
        return {
          content: [
            {
              type: 'text',
              text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_view_image',
    `Get a view rendered as a PNG image.

Returns the image as base64-encoded data.

Args:
  - viewId: View ID
  - resolution: Image resolution ('standard' or 'high')
  - maxAge: Maximum age of cached image in minutes

Returns:
  Base64-encoded PNG image.`,
    {
      viewId: z.string().describe('View ID'),
      resolution: z.enum(['standard', 'high']).optional().describe('Image resolution'),
      maxAge: z.number().int().optional().describe('Max cache age in minutes'),
    },
    async ({ viewId, resolution, maxAge }) => {
      try {
        const imageBuffer = await client.getViewImage(viewId, resolution, maxAge);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                format: 'png',
                encoding: 'base64',
                data: base64,
                message: 'Image retrieved. Use the base64 data to display or save the image.',
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_view_pdf',
    `Get a view rendered as a PDF document.

Returns the PDF as base64-encoded data.

Args:
  - viewId: View ID
  - orientation: Page orientation ('portrait' or 'landscape')
  - type: Page type/size

Returns:
  Base64-encoded PDF document.`,
    {
      viewId: z.string().describe('View ID'),
      orientation: z.enum(['portrait', 'landscape']).optional(),
      type: z.string().optional().describe('Page size type'),
    },
    async ({ viewId, orientation, type }) => {
      try {
        const pdfBuffer = await client.getViewPdf(viewId, { orientation, type });
        const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                format: 'pdf',
                encoding: 'base64',
                data: base64,
                message: 'PDF retrieved. Use the base64 data to save the document.',
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_view_tags',
    `Add tags to a view.

Args:
  - viewId: View ID
  - tags: Array of tag labels to add

Returns:
  Confirmation of tags added.`,
    {
      viewId: z.string().describe('View ID'),
      tags: z.array(z.string()).describe('Tags to add'),
    },
    async ({ viewId, tags }) => {
      try {
        await client.addViewTags(viewId, tags);
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
    'tableau_delete_view_tag',
    `Remove a tag from a view.

Args:
  - viewId: View ID
  - tag: Tag label to remove

Returns:
  Confirmation of tag removed.`,
    {
      viewId: z.string().describe('View ID'),
      tag: z.string().describe('Tag to remove'),
    },
    async ({ viewId, tag }) => {
      try {
        await client.deleteViewTag(viewId, tag);
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

  // Custom Views
  server.tool(
    'tableau_list_custom_views',
    `List all custom views on the current site.

Args:
  - pageSize: Number of custom views per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression
  - format: Response format

Returns:
  Paginated list of custom views.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      filter: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listCustomViews({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'customviews');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_custom_view',
    `Get details for a specific custom view.

Args:
  - customViewId: Custom view ID
  - format: Response format

Returns:
  Custom view details.`,
    {
      customViewId: z.string().describe('Custom view ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ customViewId, format }) => {
      try {
        const customView = await client.getCustomView(customViewId);
        return formatResponse(customView, format, 'customview');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_custom_view',
    `Update a custom view.

Args:
  - customViewId: Custom view ID to update
  - name: New name
  - ownerId: New owner user ID

Returns:
  Updated custom view details.`,
    {
      customViewId: z.string().describe('Custom view ID'),
      name: z.string().optional(),
      ownerId: z.string().optional(),
    },
    async ({ customViewId, ...input }) => {
      try {
        const customView = await client.updateCustomView(customViewId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Custom view updated', customView }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_custom_view',
    `Delete a custom view.

Args:
  - customViewId: Custom view ID to delete

Returns:
  Confirmation of deletion.`,
    {
      customViewId: z.string().describe('Custom view ID'),
    },
    async ({ customViewId }) => {
      try {
        await client.deleteCustomView(customViewId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Custom view ${customViewId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_custom_view_image',
    `Get a custom view rendered as a PNG image.

Args:
  - customViewId: Custom view ID
  - resolution: Image resolution ('standard' or 'high')

Returns:
  Base64-encoded PNG image.`,
    {
      customViewId: z.string().describe('Custom view ID'),
      resolution: z.enum(['standard', 'high']).optional(),
    },
    async ({ customViewId, resolution }) => {
      try {
        const imageBuffer = await client.getCustomViewImage(customViewId, resolution);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                format: 'png',
                encoding: 'base64',
                data: base64,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
