/**
 * Flow Tools
 *
 * MCP tools for Tableau Prep Flow management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerFlowTools(server: McpServer, client: TableauClient): void {
  server.tool(
    'tableau_list_flows',
    `List all Tableau Prep flows on the current site.

Args:
  - pageSize: Flows per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of flows.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      filter: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listFlows({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'flows');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_flow',
    `Get details for a specific flow.

Args:
  - flowId: Flow ID
  - format: Response format

Returns:
  Flow details including project and owner.`,
    {
      flowId: z.string().describe('Flow ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ flowId, format }) => {
      try {
        const flow = await client.getFlow(flowId);
        return formatResponse(flow, format, 'flow');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_flow',
    `Update a flow's settings.

Args:
  - flowId: Flow ID to update
  - name: New flow name
  - description: New description
  - projectId: Move to different project
  - ownerId: Change owner

Returns:
  Updated flow details.`,
    {
      flowId: z.string().describe('Flow ID'),
      name: z.string().optional(),
      description: z.string().optional(),
      projectId: z.string().optional(),
      ownerId: z.string().optional(),
    },
    async ({ flowId, ...input }) => {
      try {
        const flow = await client.updateFlow(flowId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Flow updated', flow }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_flow',
    `Delete a flow.

Args:
  - flowId: Flow ID to delete

Returns:
  Confirmation of deletion.`,
    {
      flowId: z.string().describe('Flow ID'),
    },
    async ({ flowId }) => {
      try {
        await client.deleteFlow(flowId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Flow ${flowId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_run_flow',
    `Run a flow immediately.

Args:
  - flowId: Flow ID to run

Returns:
  Flow run details.`,
    {
      flowId: z.string().describe('Flow ID'),
    },
    async ({ flowId }) => {
      try {
        const flowRun = await client.runFlow(flowId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Flow run started', flowRun }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_list_flow_runs',
    `List all flow runs on the current site.

Args:
  - pageSize: Runs per page
  - pageNumber: Page number
  - filter: Filter expression
  - format: Response format

Returns:
  Paginated list of flow runs.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      filter: z.string().optional(),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.getFlowRuns({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'flowruns');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_flow_run',
    `Get details for a specific flow run.

Args:
  - flowRunId: Flow run ID
  - format: Response format

Returns:
  Flow run details including status and progress.`,
    {
      flowRunId: z.string().describe('Flow run ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ flowRunId, format }) => {
      try {
        const flowRun = await client.getFlowRun(flowRunId);
        return formatResponse(flowRun, format, 'flowrun');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_cancel_flow_run',
    `Cancel a running flow.

Args:
  - flowRunId: Flow run ID to cancel

Returns:
  Confirmation of cancellation.`,
    {
      flowRunId: z.string().describe('Flow run ID'),
    },
    async ({ flowRunId }) => {
      try {
        await client.cancelFlowRun(flowRunId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Flow run ${flowRunId} cancelled` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_list_flow_tasks',
    `List all flow run tasks on the current site.

Args:
  - format: Response format

Returns:
  List of flow tasks.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const tasks = await client.listFlowTasks();
        return formatResponse(tasks, format, 'flowtasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_flow_connections',
    `Get all connections for a flow.

Args:
  - flowId: Flow ID
  - format: Response format

Returns:
  List of flow connections.`,
    {
      flowId: z.string().describe('Flow ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ flowId, format }) => {
      try {
        const connections = await client.getFlowConnections(flowId);
        return formatResponse(connections, format, 'connections');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
