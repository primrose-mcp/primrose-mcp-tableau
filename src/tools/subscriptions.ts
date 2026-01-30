/**
 * Subscription and Favorites Tools
 *
 * MCP tools for Tableau subscriptions and favorites management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerSubscriptionTools(server: McpServer, client: TableauClient): void {
  // Subscriptions
  server.tool(
    'tableau_list_subscriptions',
    `List all subscriptions on the current site.

Args:
  - pageSize: Subscriptions per page (default: 100)
  - pageNumber: Page number (default: 1)
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of subscriptions.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageSize, pageNumber, format }) => {
      try {
        const result = await client.listSubscriptions({ pageSize, pageNumber });
        return formatResponse(result, format, 'subscriptions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_subscription',
    `Get details for a specific subscription.

Args:
  - subscriptionId: Subscription ID
  - format: Response format

Returns:
  Subscription details.`,
    {
      subscriptionId: z.string().describe('Subscription ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ subscriptionId, format }) => {
      try {
        const subscription = await client.getSubscription(subscriptionId);
        return formatResponse(subscription, format, 'subscription');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_create_subscription',
    `Create a new subscription.

Args:
  - subject: Email subject
  - contentId: Workbook or view ID
  - contentType: Content type ('Workbook' or 'View')
  - userId: User ID to subscribe
  - scheduleId: Schedule ID
  - attachImage: Attach image to email
  - attachPdf: Attach PDF to email
  - message: Custom message
  - pageOrientation: PDF orientation ('Portrait' or 'Landscape')

Returns:
  Created subscription details.`,
    {
      subject: z.string().describe('Email subject'),
      contentId: z.string().describe('Workbook or view ID'),
      contentType: z.enum(['Workbook', 'View']).describe('Content type'),
      userId: z.string().describe('User ID'),
      scheduleId: z.string().describe('Schedule ID'),
      attachImage: z.boolean().optional(),
      attachPdf: z.boolean().optional(),
      message: z.string().optional(),
      pageOrientation: z.enum(['Portrait', 'Landscape']).optional(),
    },
    async (input) => {
      try {
        const subscription = await client.createSubscription(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Subscription created', subscription }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_subscription',
    `Update a subscription's settings.

Args:
  - subscriptionId: Subscription ID to update
  - subject: New email subject
  - scheduleId: New schedule ID
  - suspended: Suspend subscription
  - attachImage: Attach image
  - attachPdf: Attach PDF
  - message: Custom message
  - pageOrientation: PDF orientation

Returns:
  Updated subscription details.`,
    {
      subscriptionId: z.string().describe('Subscription ID'),
      subject: z.string().optional(),
      scheduleId: z.string().optional(),
      suspended: z.boolean().optional(),
      attachImage: z.boolean().optional(),
      attachPdf: z.boolean().optional(),
      message: z.string().optional(),
      pageOrientation: z.string().optional(),
    },
    async ({ subscriptionId, ...input }) => {
      try {
        const subscription = await client.updateSubscription(subscriptionId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Subscription updated', subscription }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_subscription',
    `Delete a subscription.

Args:
  - subscriptionId: Subscription ID to delete

Returns:
  Confirmation of deletion.`,
    {
      subscriptionId: z.string().describe('Subscription ID'),
    },
    async ({ subscriptionId }) => {
      try {
        await client.deleteSubscription(subscriptionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Subscription ${subscriptionId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Favorites
  server.tool(
    'tableau_get_user_favorites',
    `Get all favorites for a user.

Args:
  - userId: User ID
  - format: Response format

Returns:
  List of user's favorites.`,
    {
      userId: z.string().describe('User ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ userId, format }) => {
      try {
        const favorites = await client.getUserFavorites(userId);
        return formatResponse(favorites, format, 'favorites');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_workbook_to_favorites',
    `Add a workbook to user's favorites.

Args:
  - userId: User ID
  - workbookId: Workbook ID to favorite
  - label: Favorite label (optional)

Returns:
  Confirmation of addition.`,
    {
      userId: z.string().describe('User ID'),
      workbookId: z.string().describe('Workbook ID'),
      label: z.string().optional().describe('Favorite label'),
    },
    async ({ userId, workbookId, label }) => {
      try {
        await client.addWorkbookToFavorites(userId, workbookId, label);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Workbook added to favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_view_to_favorites',
    `Add a view to user's favorites.

Args:
  - userId: User ID
  - viewId: View ID to favorite
  - label: Favorite label (optional)

Returns:
  Confirmation of addition.`,
    {
      userId: z.string().describe('User ID'),
      viewId: z.string().describe('View ID'),
      label: z.string().optional().describe('Favorite label'),
    },
    async ({ userId, viewId, label }) => {
      try {
        await client.addViewToFavorites(userId, viewId, label);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'View added to favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_datasource_to_favorites',
    `Add a data source to user's favorites.

Args:
  - userId: User ID
  - dataSourceId: Data source ID to favorite
  - label: Favorite label (optional)

Returns:
  Confirmation of addition.`,
    {
      userId: z.string().describe('User ID'),
      dataSourceId: z.string().describe('Data source ID'),
      label: z.string().optional().describe('Favorite label'),
    },
    async ({ userId, dataSourceId, label }) => {
      try {
        await client.addDataSourceToFavorites(userId, dataSourceId, label);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Data source added to favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_project_to_favorites',
    `Add a project to user's favorites.

Args:
  - userId: User ID
  - projectId: Project ID to favorite
  - label: Favorite label (optional)

Returns:
  Confirmation of addition.`,
    {
      userId: z.string().describe('User ID'),
      projectId: z.string().describe('Project ID'),
      label: z.string().optional().describe('Favorite label'),
    },
    async ({ userId, projectId, label }) => {
      try {
        await client.addProjectToFavorites(userId, projectId, label);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project added to favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_flow_to_favorites',
    `Add a flow to user's favorites.

Args:
  - userId: User ID
  - flowId: Flow ID to favorite
  - label: Favorite label (optional)

Returns:
  Confirmation of addition.`,
    {
      userId: z.string().describe('User ID'),
      flowId: z.string().describe('Flow ID'),
      label: z.string().optional().describe('Favorite label'),
    },
    async ({ userId, flowId, label }) => {
      try {
        await client.addFlowToFavorites(userId, flowId, label);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Flow added to favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_remove_workbook_from_favorites',
    `Remove a workbook from user's favorites.

Args:
  - userId: User ID
  - workbookId: Workbook ID to remove

Returns:
  Confirmation of removal.`,
    {
      userId: z.string().describe('User ID'),
      workbookId: z.string().describe('Workbook ID'),
    },
    async ({ userId, workbookId }) => {
      try {
        await client.removeWorkbookFromFavorites(userId, workbookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Workbook removed from favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_remove_view_from_favorites',
    `Remove a view from user's favorites.

Args:
  - userId: User ID
  - viewId: View ID to remove

Returns:
  Confirmation of removal.`,
    {
      userId: z.string().describe('User ID'),
      viewId: z.string().describe('View ID'),
    },
    async ({ userId, viewId }) => {
      try {
        await client.removeViewFromFavorites(userId, viewId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'View removed from favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_remove_datasource_from_favorites',
    `Remove a data source from user's favorites.

Args:
  - userId: User ID
  - dataSourceId: Data source ID to remove

Returns:
  Confirmation of removal.`,
    {
      userId: z.string().describe('User ID'),
      dataSourceId: z.string().describe('Data source ID'),
    },
    async ({ userId, dataSourceId }) => {
      try {
        await client.removeDataSourceFromFavorites(userId, dataSourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Data source removed from favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_remove_project_from_favorites',
    `Remove a project from user's favorites.

Args:
  - userId: User ID
  - projectId: Project ID to remove

Returns:
  Confirmation of removal.`,
    {
      userId: z.string().describe('User ID'),
      projectId: z.string().describe('Project ID'),
    },
    async ({ userId, projectId }) => {
      try {
        await client.removeProjectFromFavorites(userId, projectId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Project removed from favorites' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
