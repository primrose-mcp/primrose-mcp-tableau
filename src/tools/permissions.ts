/**
 * Permission Tools
 *
 * MCP tools for Tableau permissions management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const CapabilityModeSchema = z.enum(['Allow', 'Deny']);

const CapabilityNameSchema = z.enum([
  'AddComment',
  'ChangeHierarchy',
  'ChangePermissions',
  'Connect',
  'Delete',
  'ExportData',
  'ExportImage',
  'ExportXml',
  'Filter',
  'ProjectLeader',
  'Read',
  'ShareView',
  'ViewComments',
  'ViewUnderlyingData',
  'WebAuthoring',
  'Write',
]);

const CapabilitySchema = z.object({
  name: CapabilityNameSchema,
  mode: CapabilityModeSchema,
});

const GranteeCapabilitySchema = z.object({
  userId: z.string().optional().describe('User ID to grant capability to'),
  groupId: z.string().optional().describe('Group ID to grant capability to'),
  capabilities: z.array(CapabilitySchema).describe('Capabilities to grant'),
});

export function registerPermissionTools(server: McpServer, client: TableauClient): void {
  // Workbook Permissions
  server.tool(
    'tableau_get_workbook_permissions',
    `Get permissions for a workbook.

Args:
  - workbookId: Workbook ID
  - format: Response format

Returns:
  Workbook permissions.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ workbookId, format }) => {
      try {
        const permissions = await client.getWorkbookPermissions(workbookId);
        return formatResponse(permissions, format, 'permissions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_workbook_permissions',
    `Add permissions to a workbook.

Args:
  - workbookId: Workbook ID
  - granteeCapabilities: Array of grantee capabilities with user/group IDs and capabilities

Returns:
  Updated permissions.`,
    {
      workbookId: z.string().describe('Workbook ID'),
      granteeCapabilities: z.array(GranteeCapabilitySchema).describe('Grantee capabilities'),
    },
    async ({ workbookId, granteeCapabilities }) => {
      try {
        const permissions = await client.addWorkbookPermissions(workbookId, {
          granteeCapabilities: granteeCapabilities.map((gc) => ({
            user: gc.userId ? { id: gc.userId } : undefined,
            group: gc.groupId ? { id: gc.groupId } : undefined,
            capabilities: gc.capabilities,
          })),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Permissions updated', permissions }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Data Source Permissions
  server.tool(
    'tableau_get_datasource_permissions',
    `Get permissions for a data source.

Args:
  - dataSourceId: Data source ID
  - format: Response format

Returns:
  Data source permissions.`,
    {
      dataSourceId: z.string().describe('Data source ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ dataSourceId, format }) => {
      try {
        const permissions = await client.getDataSourcePermissions(dataSourceId);
        return formatResponse(permissions, format, 'permissions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_datasource_permissions',
    `Add permissions to a data source.

Args:
  - dataSourceId: Data source ID
  - granteeCapabilities: Array of grantee capabilities

Returns:
  Updated permissions.`,
    {
      dataSourceId: z.string().describe('Data source ID'),
      granteeCapabilities: z.array(GranteeCapabilitySchema).describe('Grantee capabilities'),
    },
    async ({ dataSourceId, granteeCapabilities }) => {
      try {
        const permissions = await client.addDataSourcePermissions(dataSourceId, {
          granteeCapabilities: granteeCapabilities.map((gc) => ({
            user: gc.userId ? { id: gc.userId } : undefined,
            group: gc.groupId ? { id: gc.groupId } : undefined,
            capabilities: gc.capabilities,
          })),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Permissions updated', permissions }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // View Permissions
  server.tool(
    'tableau_get_view_permissions',
    `Get permissions for a view.

Args:
  - viewId: View ID
  - format: Response format

Returns:
  View permissions.`,
    {
      viewId: z.string().describe('View ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ viewId, format }) => {
      try {
        const permissions = await client.getViewPermissions(viewId);
        return formatResponse(permissions, format, 'permissions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_view_permissions',
    `Add permissions to a view.

Args:
  - viewId: View ID
  - granteeCapabilities: Array of grantee capabilities

Returns:
  Updated permissions.`,
    {
      viewId: z.string().describe('View ID'),
      granteeCapabilities: z.array(GranteeCapabilitySchema).describe('Grantee capabilities'),
    },
    async ({ viewId, granteeCapabilities }) => {
      try {
        const permissions = await client.addViewPermissions(viewId, {
          granteeCapabilities: granteeCapabilities.map((gc) => ({
            user: gc.userId ? { id: gc.userId } : undefined,
            group: gc.groupId ? { id: gc.groupId } : undefined,
            capabilities: gc.capabilities,
          })),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Permissions updated', permissions }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Project Permissions
  server.tool(
    'tableau_get_project_permissions',
    `Get permissions for a project.

Args:
  - projectId: Project ID
  - format: Response format

Returns:
  Project permissions.`,
    {
      projectId: z.string().describe('Project ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ projectId, format }) => {
      try {
        const permissions = await client.getProjectPermissions(projectId);
        return formatResponse(permissions, format, 'permissions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_project_permissions',
    `Add permissions to a project.

Args:
  - projectId: Project ID
  - granteeCapabilities: Array of grantee capabilities

Returns:
  Updated permissions.`,
    {
      projectId: z.string().describe('Project ID'),
      granteeCapabilities: z.array(GranteeCapabilitySchema).describe('Grantee capabilities'),
    },
    async ({ projectId, granteeCapabilities }) => {
      try {
        const permissions = await client.addProjectPermissions(projectId, {
          granteeCapabilities: granteeCapabilities.map((gc) => ({
            user: gc.userId ? { id: gc.userId } : undefined,
            group: gc.groupId ? { id: gc.groupId } : undefined,
            capabilities: gc.capabilities,
          })),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Permissions updated', permissions }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Flow Permissions
  server.tool(
    'tableau_get_flow_permissions',
    `Get permissions for a flow.

Args:
  - flowId: Flow ID
  - format: Response format

Returns:
  Flow permissions.`,
    {
      flowId: z.string().describe('Flow ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ flowId, format }) => {
      try {
        const permissions = await client.getFlowPermissions(flowId);
        return formatResponse(permissions, format, 'permissions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_flow_permissions',
    `Add permissions to a flow.

Args:
  - flowId: Flow ID
  - granteeCapabilities: Array of grantee capabilities

Returns:
  Updated permissions.`,
    {
      flowId: z.string().describe('Flow ID'),
      granteeCapabilities: z.array(GranteeCapabilitySchema).describe('Grantee capabilities'),
    },
    async ({ flowId, granteeCapabilities }) => {
      try {
        const permissions = await client.addFlowPermissions(flowId, {
          granteeCapabilities: granteeCapabilities.map((gc) => ({
            user: gc.userId ? { id: gc.userId } : undefined,
            group: gc.groupId ? { id: gc.groupId } : undefined,
            capabilities: gc.capabilities,
          })),
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Permissions updated', permissions }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
