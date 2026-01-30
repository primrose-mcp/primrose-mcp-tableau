/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  CustomView,
  DataSource,
  ExtractRefreshTask,
  Flow,
  Group,
  Job,
  PaginatedResponse,
  Project,
  ResponseFormat,
  Schedule,
  Site,
  Subscription,
  User,
  View,
  Workbook,
} from '../types/entities.js';
import { TableauApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof TableauApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (isPaginatedResponse(data)) {
    return formatPaginatedAsMarkdown(data, entityType);
  }

  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Type guard for paginated response
 */
function isPaginatedResponse(data: unknown): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    Array.isArray((data as PaginatedResponse<unknown>).items) &&
    'pagination' in data
  );
}

/**
 * Format paginated response as Markdown
 */
function formatPaginatedAsMarkdown(data: PaginatedResponse<unknown>, entityType: string): string {
  const lines: string[] = [];

  lines.push(`## ${capitalize(entityType)}`);
  lines.push('');

  const { pagination } = data;
  lines.push(`**Page:** ${pagination.pageNumber} | **Page Size:** ${pagination.pageSize} | **Total:** ${pagination.totalAvailable}`);
  lines.push('');

  if (data.items.length === 0) {
    lines.push('_No items found._');
    return lines.join('\n');
  }

  // Format items based on entity type
  switch (entityType) {
    case 'sites':
      lines.push(formatSitesTable(data.items as Site[]));
      break;
    case 'projects':
      lines.push(formatProjectsTable(data.items as Project[]));
      break;
    case 'workbooks':
      lines.push(formatWorkbooksTable(data.items as Workbook[]));
      break;
    case 'views':
      lines.push(formatViewsTable(data.items as View[]));
      break;
    case 'datasources':
      lines.push(formatDataSourcesTable(data.items as DataSource[]));
      break;
    case 'users':
      lines.push(formatUsersTable(data.items as User[]));
      break;
    case 'groups':
      lines.push(formatGroupsTable(data.items as Group[]));
      break;
    case 'schedules':
      lines.push(formatSchedulesTable(data.items as Schedule[]));
      break;
    case 'jobs':
      lines.push(formatJobsTable(data.items as Job[]));
      break;
    case 'flows':
      lines.push(formatFlowsTable(data.items as Flow[]));
      break;
    case 'subscriptions':
      lines.push(formatSubscriptionsTable(data.items as Subscription[]));
      break;
    case 'tasks':
      lines.push(formatTasksTable(data.items as ExtractRefreshTask[]));
      break;
    case 'customviews':
      lines.push(formatCustomViewsTable(data.items as CustomView[]));
      break;
    default:
      lines.push(formatGenericTable(data.items));
  }

  return lines.join('\n');
}

function formatSitesTable(sites: Site[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Content URL | State |');
  lines.push('|---|---|---|---|');
  for (const site of sites) {
    lines.push(`| ${site.id} | ${site.name} | ${site.contentUrl || '-'} | ${site.state || '-'} |`);
  }
  return lines.join('\n');
}

function formatProjectsTable(projects: Project[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Description | Parent |');
  lines.push('|---|---|---|---|');
  for (const project of projects) {
    lines.push(`| ${project.id} | ${project.name} | ${truncate(project.description || '-', 30)} | ${project.parentProjectId || 'root'} |`);
  }
  return lines.join('\n');
}

function formatWorkbooksTable(workbooks: Workbook[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Project | Owner | Updated |');
  lines.push('|---|---|---|---|---|');
  for (const wb of workbooks) {
    lines.push(`| ${wb.id} | ${wb.name} | ${wb.project?.name || '-'} | ${wb.owner?.name || '-'} | ${formatDate(wb.updatedAt)} |`);
  }
  return lines.join('\n');
}

function formatViewsTable(views: View[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Workbook | Owner |');
  lines.push('|---|---|---|---|');
  for (const view of views) {
    lines.push(`| ${view.id} | ${view.name} | ${view.workbook?.name || '-'} | ${view.owner?.name || '-'} |`);
  }
  return lines.join('\n');
}

function formatDataSourcesTable(datasources: DataSource[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Project | Certified |');
  lines.push('|---|---|---|---|---|');
  for (const ds of datasources) {
    lines.push(`| ${ds.id} | ${ds.name} | ${ds.type} | ${ds.project?.name || '-'} | ${ds.isCertified ? 'Yes' : 'No'} |`);
  }
  return lines.join('\n');
}

function formatUsersTable(users: User[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Full Name | Site Role | Last Login |');
  lines.push('|---|---|---|---|---|');
  for (const user of users) {
    lines.push(`| ${user.id} | ${user.name} | ${user.fullName || '-'} | ${user.siteRole} | ${formatDate(user.lastLogin)} |`);
  }
  return lines.join('\n');
}

function formatGroupsTable(groups: Group[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Domain | Min Site Role |');
  lines.push('|---|---|---|---|');
  for (const group of groups) {
    lines.push(`| ${group.id} | ${group.name} | ${group.domainName || 'local'} | ${group.minimumSiteRole || '-'} |`);
  }
  return lines.join('\n');
}

function formatSchedulesTable(schedules: Schedule[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Type | Frequency | State | Next Run |');
  lines.push('|---|---|---|---|---|---|');
  for (const schedule of schedules) {
    lines.push(`| ${schedule.id} | ${schedule.name} | ${schedule.type || '-'} | ${schedule.frequency || '-'} | ${schedule.state || '-'} | ${formatDate(schedule.nextRunAt)} |`);
  }
  return lines.join('\n');
}

function formatJobsTable(jobs: Job[]): string {
  const lines: string[] = [];
  lines.push('| ID | Type | Progress | Status | Started | Completed |');
  lines.push('|---|---|---|---|---|---|');
  for (const job of jobs) {
    lines.push(`| ${job.id} | ${job.type || '-'} | ${job.progress || 0}% | ${job.finishCode !== undefined ? (job.finishCode === 0 ? 'Success' : 'Failed') : 'Running'} | ${formatDate(job.startedAt)} | ${formatDate(job.completedAt)} |`);
  }
  return lines.join('\n');
}

function formatFlowsTable(flows: Flow[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | Project | Owner | Updated |');
  lines.push('|---|---|---|---|---|');
  for (const flow of flows) {
    lines.push(`| ${flow.id} | ${flow.name} | ${flow.project?.name || '-'} | ${flow.owner?.name || '-'} | ${formatDate(flow.updatedAt)} |`);
  }
  return lines.join('\n');
}

function formatSubscriptionsTable(subscriptions: Subscription[]): string {
  const lines: string[] = [];
  lines.push('| ID | Subject | Content Type | User | Suspended |');
  lines.push('|---|---|---|---|---|');
  for (const sub of subscriptions) {
    lines.push(`| ${sub.id} | ${sub.subject} | ${sub.content?.type || '-'} | ${sub.user?.name || '-'} | ${sub.suspended ? 'Yes' : 'No'} |`);
  }
  return lines.join('\n');
}

function formatTasksTable(tasks: ExtractRefreshTask[]): string {
  const lines: string[] = [];
  lines.push('| ID | Type | Schedule | Resource |');
  lines.push('|---|---|---|---|');
  for (const task of tasks) {
    const resource = task.datasource?.name || task.workbook?.name || '-';
    lines.push(`| ${task.id} | ${task.type || '-'} | ${task.schedule?.name || '-'} | ${resource} |`);
  }
  return lines.join('\n');
}

function formatCustomViewsTable(customViews: CustomView[]): string {
  const lines: string[] = [];
  lines.push('| ID | Name | View | Workbook | Owner | Shared |');
  lines.push('|---|---|---|---|---|---|');
  for (const cv of customViews) {
    lines.push(`| ${cv.id} | ${cv.name} | ${cv.view?.name || '-'} | ${cv.workbook?.name || '-'} | ${cv.owner?.name || '-'} | ${cv.shared ? 'Yes' : 'No'} |`);
  }
  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5); // Limit columns

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => String(record[k] ?? '-'));
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  switch (entityType) {
    case 'sites':
      return formatSitesTable(data as Site[]);
    case 'projects':
      return formatProjectsTable(data as Project[]);
    case 'workbooks':
      return formatWorkbooksTable(data as Workbook[]);
    case 'views':
      return formatViewsTable(data as View[]);
    case 'datasources':
      return formatDataSourcesTable(data as DataSource[]);
    case 'users':
      return formatUsersTable(data as User[]);
    case 'groups':
      return formatGroupsTable(data as Group[]);
    case 'schedules':
      return formatSchedulesTable(data as Schedule[]);
    default:
      return formatGenericTable(data);
  }
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format a date string
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

/**
 * Truncate a string to a maximum length
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}
