/**
 * Schedule and Job Tools
 *
 * MCP tools for Tableau schedule and job management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TableauClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerScheduleTools(server: McpServer, client: TableauClient): void {
  // Schedules
  server.tool(
    'tableau_list_schedules',
    `List all server schedules.

Args:
  - pageSize: Schedules per page (default: 100)
  - pageNumber: Page number (default: 1)
  - format: Response format ('json' or 'markdown')

Returns:
  Paginated list of schedules.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageSize, pageNumber, format }) => {
      try {
        const result = await client.listSchedules({ pageSize, pageNumber });
        return formatResponse(result, format, 'schedules');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_schedule',
    `Get details for a specific schedule.

Args:
  - scheduleId: Schedule ID
  - format: Response format

Returns:
  Schedule details.`,
    {
      scheduleId: z.string().describe('Schedule ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ scheduleId, format }) => {
      try {
        const schedule = await client.getSchedule(scheduleId);
        return formatResponse(schedule, format, 'schedule');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_create_schedule',
    `Create a new server schedule (Tableau Server only).

Args:
  - name: Schedule name
  - type: Schedule type ('Extract', 'Subscription', 'Flow', 'DataAcceleration')
  - frequency: Frequency ('Hourly', 'Daily', 'Weekly', 'Monthly')
  - startTime: Start time (HH:MM:SS format)
  - endTime: End time for hourly schedules
  - priority: Priority (1-100, lower = higher priority)
  - executionOrder: Execution order ('Parallel' or 'Serial')

Returns:
  Created schedule details.`,
    {
      name: z.string().describe('Schedule name'),
      type: z.enum(['Extract', 'Subscription', 'Flow', 'DataAcceleration']).describe('Schedule type'),
      frequency: z.enum(['Hourly', 'Daily', 'Weekly', 'Monthly']).describe('Frequency'),
      startTime: z.string().describe('Start time (HH:MM:SS)'),
      endTime: z.string().optional().describe('End time for hourly schedules'),
      priority: z.number().int().min(1).max(100).optional().describe('Priority (1-100)'),
      executionOrder: z.enum(['Parallel', 'Serial']).optional(),
    },
    async ({ name, type, frequency, startTime, endTime, priority, executionOrder }) => {
      try {
        const schedule = await client.createSchedule({
          name,
          type,
          frequency,
          priority,
          executionOrder,
          frequencyDetails: {
            start: startTime,
            end: endTime,
          },
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Schedule created', schedule }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_update_schedule',
    `Update a schedule's settings.

Args:
  - scheduleId: Schedule ID to update
  - name: New schedule name
  - priority: New priority
  - frequency: New frequency
  - state: Schedule state ('Active' or 'Suspended')
  - executionOrder: New execution order

Returns:
  Updated schedule details.`,
    {
      scheduleId: z.string().describe('Schedule ID'),
      name: z.string().optional(),
      priority: z.number().int().min(1).max(100).optional(),
      frequency: z.string().optional(),
      state: z.enum(['Active', 'Suspended']).optional(),
      executionOrder: z.enum(['Parallel', 'Serial']).optional(),
    },
    async ({ scheduleId, ...input }) => {
      try {
        const schedule = await client.updateSchedule(scheduleId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Schedule updated', schedule }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_delete_schedule',
    `Delete a schedule.

Args:
  - scheduleId: Schedule ID to delete

Returns:
  Confirmation of deletion.`,
    {
      scheduleId: z.string().describe('Schedule ID'),
    },
    async ({ scheduleId }) => {
      try {
        await client.deleteSchedule(scheduleId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Schedule ${scheduleId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_datasource_to_schedule',
    `Add a data source to an extract refresh schedule.

Args:
  - scheduleId: Schedule ID
  - dataSourceId: Data source ID to add

Returns:
  Confirmation of addition.`,
    {
      scheduleId: z.string().describe('Schedule ID'),
      dataSourceId: z.string().describe('Data source ID'),
    },
    async ({ scheduleId, dataSourceId }) => {
      try {
        await client.addDataSourceToSchedule(scheduleId, dataSourceId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Data source added to schedule' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_add_workbook_to_schedule',
    `Add a workbook to an extract refresh schedule.

Args:
  - scheduleId: Schedule ID
  - workbookId: Workbook ID to add

Returns:
  Confirmation of addition.`,
    {
      scheduleId: z.string().describe('Schedule ID'),
      workbookId: z.string().describe('Workbook ID'),
    },
    async ({ scheduleId, workbookId }) => {
      try {
        await client.addWorkbookToSchedule(scheduleId, workbookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Workbook added to schedule' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Jobs
  server.tool(
    'tableau_list_jobs',
    `List all background jobs on the current site.

Args:
  - pageSize: Jobs per page (default: 100)
  - pageNumber: Page number (default: 1)
  - filter: Filter expression
  - format: Response format

Returns:
  Paginated list of jobs.`,
    {
      pageSize: z.number().int().min(1).max(1000).default(100),
      pageNumber: z.number().int().min(1).default(1),
      filter: z.string().optional().describe('Filter expression'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ pageSize, pageNumber, filter, format }) => {
      try {
        const result = await client.listJobs({ pageSize, pageNumber, filter });
        return formatResponse(result, format, 'jobs');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_job',
    `Get details for a specific job.

Args:
  - jobId: Job ID
  - format: Response format

Returns:
  Job details including status and progress.`,
    {
      jobId: z.string().describe('Job ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ jobId, format }) => {
      try {
        const job = await client.getJob(jobId);
        return formatResponse(job, format, 'job');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_cancel_job',
    `Cancel a running job.

Args:
  - jobId: Job ID to cancel

Returns:
  Confirmation of cancellation.`,
    {
      jobId: z.string().describe('Job ID'),
    },
    async ({ jobId }) => {
      try {
        await client.cancelJob(jobId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Job ${jobId} cancelled` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // Extract Refresh Tasks
  server.tool(
    'tableau_list_extract_refresh_tasks',
    `List all extract refresh tasks on the current site.

Args:
  - format: Response format

Returns:
  List of extract refresh tasks.`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const tasks = await client.listExtractRefreshTasks();
        return formatResponse(tasks, format, 'tasks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_get_extract_refresh_task',
    `Get details for a specific extract refresh task.

Args:
  - taskId: Task ID
  - format: Response format

Returns:
  Task details.`,
    {
      taskId: z.string().describe('Task ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ taskId, format }) => {
      try {
        const task = await client.getExtractRefreshTask(taskId);
        return formatResponse(task, format, 'task');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  server.tool(
    'tableau_run_extract_refresh_task',
    `Run an extract refresh task immediately.

Args:
  - taskId: Task ID to run

Returns:
  Job details for the started refresh.`,
    {
      taskId: z.string().describe('Task ID'),
    },
    async ({ taskId }) => {
      try {
        const job = await client.runExtractRefreshTask(taskId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Extract refresh started', job }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
