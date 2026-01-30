/**
 * Tableau REST API Client
 *
 * Comprehensive client for the Tableau Server REST API.
 * Supports authentication via Personal Access Tokens (PAT).
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different API keys.
 */

import type {
  Connection,
  ConnectionUpdateInput,
  CustomView,
  CustomViewUpdateInput,
  DataSource,
  DataSourceConnection,
  DataSourceUpdateInput,
  ExtractRefreshTask,
  Favorite,
  Flow,
  FlowRun,
  FlowTask,
  FlowUpdateInput,
  Group,
  GroupCreateInput,
  GroupSet,
  GroupUpdateInput,
  Job,
  PaginatedResponse,
  PaginationParams,
  Permission,
  PersonalAccessToken,
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
  Revision,
  Schedule,
  ScheduleCreateInput,
  ScheduleUpdateInput,
  ServerInfo,
  SignInResponse,
  Site,
  SiteCreateInput,
  SiteUpdateInput,
  Subscription,
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
  User,
  UserCreateInput,
  UserUpdateInput,
  View,
  Workbook,
  WorkbookUpdateInput,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import {
  AuthenticationError,
  NotSignedInError,
  RateLimitError,
  parseTableauError,
} from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_API_VERSION = '3.21';

// =============================================================================
// Tableau Client Interface
// =============================================================================

export interface TableauClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string; serverInfo?: ServerInfo }>;

  // Authentication
  signIn(siteContentUrl?: string): Promise<SignInResponse>;
  signOut(): Promise<void>;
  switchSite(siteContentUrl: string): Promise<SignInResponse>;
  listPersonalAccessTokens(userId: string): Promise<PersonalAccessToken[]>;
  revokePersonalAccessToken(userId: string, tokenName: string): Promise<void>;

  // Sites
  listSites(params?: PaginationParams): Promise<PaginatedResponse<Site>>;
  getSite(siteId?: string): Promise<Site>;
  createSite(input: SiteCreateInput): Promise<Site>;
  updateSite(siteId: string, input: SiteUpdateInput): Promise<Site>;
  deleteSite(siteId: string): Promise<void>;

  // Projects
  listProjects(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Project>>;
  createProject(input: ProjectCreateInput): Promise<Project>;
  updateProject(projectId: string, input: ProjectUpdateInput): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;

  // Workbooks
  listWorkbooks(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Workbook>>;
  getWorkbook(workbookId: string): Promise<Workbook>;
  updateWorkbook(workbookId: string, input: WorkbookUpdateInput): Promise<Workbook>;
  deleteWorkbook(workbookId: string): Promise<void>;
  refreshWorkbook(workbookId: string): Promise<Job>;
  downloadWorkbook(workbookId: string, includeExtract?: boolean): Promise<ArrayBuffer>;
  getWorkbookRevisions(workbookId: string, params?: PaginationParams): Promise<PaginatedResponse<Revision>>;
  getWorkbookConnections(workbookId: string): Promise<Connection[]>;
  updateWorkbookConnection(workbookId: string, connectionId: string, input: ConnectionUpdateInput): Promise<Connection>;
  addWorkbookTags(workbookId: string, tags: string[]): Promise<void>;
  deleteWorkbookTag(workbookId: string, tag: string): Promise<void>;

  // Views
  listViews(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<View>>;
  getView(viewId: string): Promise<View>;
  getWorkbookViews(workbookId: string): Promise<View[]>;
  queryViewData(viewId: string, maxAge?: number): Promise<string>;
  getViewImage(viewId: string, resolution?: string, maxAge?: number): Promise<ArrayBuffer>;
  getViewPdf(viewId: string, options?: { orientation?: string; type?: string }): Promise<ArrayBuffer>;
  addViewTags(viewId: string, tags: string[]): Promise<void>;
  deleteViewTag(viewId: string, tag: string): Promise<void>;

  // Custom Views
  listCustomViews(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<CustomView>>;
  getCustomView(customViewId: string): Promise<CustomView>;
  updateCustomView(customViewId: string, input: CustomViewUpdateInput): Promise<CustomView>;
  deleteCustomView(customViewId: string): Promise<void>;
  getCustomViewImage(customViewId: string, resolution?: string): Promise<ArrayBuffer>;

  // Data Sources
  listDataSources(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<DataSource>>;
  getDataSource(dataSourceId: string): Promise<DataSource>;
  updateDataSource(dataSourceId: string, input: DataSourceUpdateInput): Promise<DataSource>;
  deleteDataSource(dataSourceId: string): Promise<void>;
  refreshDataSource(dataSourceId: string): Promise<Job>;
  downloadDataSource(dataSourceId: string, includeExtract?: boolean): Promise<ArrayBuffer>;
  getDataSourceRevisions(dataSourceId: string, params?: PaginationParams): Promise<PaginatedResponse<Revision>>;
  getDataSourceConnections(dataSourceId: string): Promise<DataSourceConnection[]>;
  updateDataSourceConnection(dataSourceId: string, connectionId: string, input: ConnectionUpdateInput): Promise<Connection>;
  addDataSourceTags(dataSourceId: string, tags: string[]): Promise<void>;
  deleteDataSourceTag(dataSourceId: string, tag: string): Promise<void>;

  // Users
  listUsers(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<User>>;
  getUser(userId: string): Promise<User>;
  addUserToSite(input: UserCreateInput): Promise<User>;
  updateUser(userId: string, input: UserUpdateInput): Promise<User>;
  removeUserFromSite(userId: string): Promise<void>;
  getUserGroups(userId: string): Promise<Group[]>;

  // Groups
  listGroups(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Group>>;
  getGroup(groupId: string): Promise<Group>;
  createGroup(input: GroupCreateInput): Promise<Group>;
  updateGroup(groupId: string, input: GroupUpdateInput): Promise<Group>;
  deleteGroup(groupId: string): Promise<void>;
  getGroupUsers(groupId: string, params?: PaginationParams): Promise<PaginatedResponse<User>>;
  addUserToGroup(groupId: string, userId: string): Promise<User>;
  removeUserFromGroup(groupId: string, userId: string): Promise<void>;

  // Group Sets
  listGroupSets(params?: PaginationParams): Promise<PaginatedResponse<GroupSet>>;
  getGroupSet(groupSetId: string): Promise<GroupSet>;
  createGroupSet(name: string): Promise<GroupSet>;
  updateGroupSet(groupSetId: string, name: string): Promise<GroupSet>;
  deleteGroupSet(groupSetId: string): Promise<void>;

  // Schedules
  listSchedules(params?: PaginationParams): Promise<PaginatedResponse<Schedule>>;
  getSchedule(scheduleId: string): Promise<Schedule>;
  createSchedule(input: ScheduleCreateInput): Promise<Schedule>;
  updateSchedule(scheduleId: string, input: ScheduleUpdateInput): Promise<Schedule>;
  deleteSchedule(scheduleId: string): Promise<void>;
  addDataSourceToSchedule(scheduleId: string, dataSourceId: string): Promise<void>;
  addWorkbookToSchedule(scheduleId: string, workbookId: string): Promise<void>;

  // Jobs
  listJobs(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Job>>;
  getJob(jobId: string): Promise<Job>;
  cancelJob(jobId: string): Promise<void>;

  // Extract Refresh Tasks
  listExtractRefreshTasks(): Promise<ExtractRefreshTask[]>;
  getExtractRefreshTask(taskId: string): Promise<ExtractRefreshTask>;
  runExtractRefreshTask(taskId: string): Promise<Job>;

  // Flows
  listFlows(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Flow>>;
  getFlow(flowId: string): Promise<Flow>;
  updateFlow(flowId: string, input: FlowUpdateInput): Promise<Flow>;
  deleteFlow(flowId: string): Promise<void>;
  downloadFlow(flowId: string): Promise<ArrayBuffer>;
  runFlow(flowId: string): Promise<FlowRun>;
  getFlowRuns(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<FlowRun>>;
  getFlowRun(flowRunId: string): Promise<FlowRun>;
  cancelFlowRun(flowRunId: string): Promise<void>;
  listFlowTasks(): Promise<FlowTask[]>;
  getFlowConnections(flowId: string): Promise<Connection[]>;

  // Subscriptions
  listSubscriptions(params?: PaginationParams): Promise<PaginatedResponse<Subscription>>;
  getSubscription(subscriptionId: string): Promise<Subscription>;
  createSubscription(input: SubscriptionCreateInput): Promise<Subscription>;
  updateSubscription(subscriptionId: string, input: SubscriptionUpdateInput): Promise<Subscription>;
  deleteSubscription(subscriptionId: string): Promise<void>;

  // Favorites
  getUserFavorites(userId: string): Promise<Favorite[]>;
  addWorkbookToFavorites(userId: string, workbookId: string, label?: string): Promise<void>;
  addViewToFavorites(userId: string, viewId: string, label?: string): Promise<void>;
  addDataSourceToFavorites(userId: string, dataSourceId: string, label?: string): Promise<void>;
  addProjectToFavorites(userId: string, projectId: string, label?: string): Promise<void>;
  addFlowToFavorites(userId: string, flowId: string, label?: string): Promise<void>;
  removeWorkbookFromFavorites(userId: string, workbookId: string): Promise<void>;
  removeViewFromFavorites(userId: string, viewId: string): Promise<void>;
  removeDataSourceFromFavorites(userId: string, dataSourceId: string): Promise<void>;
  removeProjectFromFavorites(userId: string, projectId: string): Promise<void>;

  // Permissions
  getWorkbookPermissions(workbookId: string): Promise<Permission>;
  addWorkbookPermissions(workbookId: string, permissions: Permission): Promise<Permission>;
  getDataSourcePermissions(dataSourceId: string): Promise<Permission>;
  addDataSourcePermissions(dataSourceId: string, permissions: Permission): Promise<Permission>;
  getViewPermissions(viewId: string): Promise<Permission>;
  addViewPermissions(viewId: string, permissions: Permission): Promise<Permission>;
  getProjectPermissions(projectId: string): Promise<Permission>;
  addProjectPermissions(projectId: string, permissions: Permission): Promise<Permission>;
  getFlowPermissions(flowId: string): Promise<Permission>;
  addFlowPermissions(flowId: string, permissions: Permission): Promise<Permission>;

  // Getters for current state
  getAuthToken(): string | undefined;
  getSiteId(): string | undefined;
  getUserId(): string | undefined;
}

// =============================================================================
// Tableau Client Implementation
// =============================================================================

class TableauClientImpl implements TableauClient {
  private credentials: TenantCredentials;
  private serverUrl: string;
  private apiVersion: string;
  private authToken?: string;
  private siteId?: string;
  private userId?: string;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
    this.serverUrl = credentials.serverUrl || '';
    this.apiVersion = credentials.apiVersion || DEFAULT_API_VERSION;
    this.authToken = credentials.authToken;
    this.siteId = credentials.siteId;
    this.userId = credentials.userId;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.authToken) {
      headers['X-Tableau-Auth'] = this.authToken;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    acceptBinary = false
  ): Promise<T> {
    const url = `${this.serverUrl}/api/${this.apiVersion}${endpoint}`;

    const headers = this.getAuthHeaders();
    if (acceptBinary) {
      headers.Accept = 'application/octet-stream';
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? Number.parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401) {
      throw new AuthenticationError('Authentication failed. Check your credentials or sign in again.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      throw parseTableauError(response, errorBody);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Handle binary responses
    if (acceptBinary) {
      return response.arrayBuffer() as Promise<T>;
    }

    return response.json() as Promise<T>;
  }

  private ensureSignedIn(): void {
    if (!this.authToken || !this.siteId) {
      throw new NotSignedInError();
    }
  }

  private buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
    if (!params) return '';
    const filtered = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return filtered.length > 0 ? `?${filtered.join('&')}` : '';
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string; serverInfo?: ServerInfo }> {
    try {
      const response = await this.request<{ serverInfo: ServerInfo }>('/serverinfo');
      return {
        connected: true,
        message: `Connected to Tableau Server ${response.serverInfo.productVersion.value}`,
        serverInfo: response.serverInfo,
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Authentication
  // ===========================================================================

  async signIn(siteContentUrl?: string): Promise<SignInResponse> {
    const site = siteContentUrl ?? this.credentials.siteContentUrl ?? '';

    // Use PAT authentication
    if (!this.credentials.patName || !this.credentials.patSecret) {
      throw new AuthenticationError('PAT credentials required');
    }

    const body = {
      credentials: {
        site: { contentUrl: site },
        personalAccessTokenName: this.credentials.patName,
        personalAccessTokenSecret: this.credentials.patSecret,
      },
    };

    const response = await this.request<SignInResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Store the auth token and IDs for subsequent requests
    this.authToken = response.credentials.token;
    this.siteId = response.credentials.site.id;
    this.userId = response.credentials.user.id;

    return response;
  }

  async signOut(): Promise<void> {
    this.ensureSignedIn();
    await this.request('/auth/signout', { method: 'POST' });
    this.authToken = undefined;
    this.siteId = undefined;
    this.userId = undefined;
  }

  async switchSite(siteContentUrl: string): Promise<SignInResponse> {
    this.ensureSignedIn();
    const response = await this.request<SignInResponse>('/auth/switchSite', {
      method: 'POST',
      body: JSON.stringify({ site: { contentUrl: siteContentUrl } }),
    });

    this.authToken = response.credentials.token;
    this.siteId = response.credentials.site.id;

    return response;
  }

  async listPersonalAccessTokens(userId: string): Promise<PersonalAccessToken[]> {
    this.ensureSignedIn();
    const response = await this.request<{ personalAccessTokens: { personalAccessToken: PersonalAccessToken[] } }>(
      `/sites/${this.siteId}/users/${userId}/personal-access-tokens`
    );
    return response.personalAccessTokens?.personalAccessToken || [];
  }

  async revokePersonalAccessToken(userId: string, tokenName: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(
      `/sites/${this.siteId}/users/${userId}/personal-access-tokens/${encodeURIComponent(tokenName)}`,
      { method: 'DELETE' }
    );
  }

  // ===========================================================================
  // Sites
  // ===========================================================================

  async listSites(params?: PaginationParams): Promise<PaginatedResponse<Site>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      sites: { site: Site[] };
    }>(`/sites${qs}`);

    return {
      items: response.sites?.site || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getSite(siteId?: string): Promise<Site> {
    this.ensureSignedIn();
    const id = siteId || this.siteId;
    const response = await this.request<{ site: Site }>(`/sites/${id}`);
    return response.site;
  }

  async createSite(input: SiteCreateInput): Promise<Site> {
    this.ensureSignedIn();
    const response = await this.request<{ site: Site }>('/sites', {
      method: 'POST',
      body: JSON.stringify({ site: input }),
    });
    return response.site;
  }

  async updateSite(siteId: string, input: SiteUpdateInput): Promise<Site> {
    this.ensureSignedIn();
    const response = await this.request<{ site: Site }>(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify({ site: input }),
    });
    return response.site;
  }

  async deleteSite(siteId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${siteId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Projects
  // ===========================================================================

  async listProjects(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Project>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      projects: { project: Project[] };
    }>(`/sites/${this.siteId}/projects${qs}`);

    return {
      items: response.projects?.project || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async createProject(input: ProjectCreateInput): Promise<Project> {
    this.ensureSignedIn();
    const response = await this.request<{ project: Project }>(`/sites/${this.siteId}/projects`, {
      method: 'POST',
      body: JSON.stringify({ project: input }),
    });
    return response.project;
  }

  async updateProject(projectId: string, input: ProjectUpdateInput): Promise<Project> {
    this.ensureSignedIn();
    const body: Record<string, unknown> = { ...input };
    if (input.ownerId) {
      body.owner = { id: input.ownerId };
      delete body.ownerId;
    }
    const response = await this.request<{ project: Project }>(`/sites/${this.siteId}/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({ project: body }),
    });
    return response.project;
  }

  async deleteProject(projectId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/projects/${projectId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Workbooks
  // ===========================================================================

  async listWorkbooks(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Workbook>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      workbooks: { workbook: Workbook[] };
    }>(`/sites/${this.siteId}/workbooks${qs}`);

    return {
      items: response.workbooks?.workbook || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getWorkbook(workbookId: string): Promise<Workbook> {
    this.ensureSignedIn();
    const response = await this.request<{ workbook: Workbook }>(`/sites/${this.siteId}/workbooks/${workbookId}`);
    return response.workbook;
  }

  async updateWorkbook(workbookId: string, input: WorkbookUpdateInput): Promise<Workbook> {
    this.ensureSignedIn();
    const body: Record<string, unknown> = { ...input };
    if (input.projectId) {
      body.project = { id: input.projectId };
      delete body.projectId;
    }
    if (input.ownerId) {
      body.owner = { id: input.ownerId };
      delete body.ownerId;
    }
    const response = await this.request<{ workbook: Workbook }>(`/sites/${this.siteId}/workbooks/${workbookId}`, {
      method: 'PUT',
      body: JSON.stringify({ workbook: body }),
    });
    return response.workbook;
  }

  async deleteWorkbook(workbookId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/workbooks/${workbookId}`, { method: 'DELETE' });
  }

  async refreshWorkbook(workbookId: string): Promise<Job> {
    this.ensureSignedIn();
    const response = await this.request<{ job: Job }>(`/sites/${this.siteId}/workbooks/${workbookId}/refresh`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response.job;
  }

  async downloadWorkbook(workbookId: string, includeExtract = false): Promise<ArrayBuffer> {
    this.ensureSignedIn();
    const qs = includeExtract ? '?includeExtract=true' : '';
    return this.request<ArrayBuffer>(`/sites/${this.siteId}/workbooks/${workbookId}/content${qs}`, {}, true);
  }

  async getWorkbookRevisions(workbookId: string, params?: PaginationParams): Promise<PaginatedResponse<Revision>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      revisions: { revision: Revision[] };
    }>(`/sites/${this.siteId}/workbooks/${workbookId}/revisions${qs}`);

    return {
      items: response.revisions?.revision || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getWorkbookConnections(workbookId: string): Promise<Connection[]> {
    this.ensureSignedIn();
    const response = await this.request<{ connections: { connection: Connection[] } }>(
      `/sites/${this.siteId}/workbooks/${workbookId}/connections`
    );
    return response.connections?.connection || [];
  }

  async updateWorkbookConnection(workbookId: string, connectionId: string, input: ConnectionUpdateInput): Promise<Connection> {
    this.ensureSignedIn();
    const response = await this.request<{ connection: Connection }>(
      `/sites/${this.siteId}/workbooks/${workbookId}/connections/${connectionId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ connection: input }),
      }
    );
    return response.connection;
  }

  async addWorkbookTags(workbookId: string, tags: string[]): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/workbooks/${workbookId}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tags: { tag: tags.map((label) => ({ label })) } }),
    });
  }

  async deleteWorkbookTag(workbookId: string, tag: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/workbooks/${workbookId}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Views
  // ===========================================================================

  async listViews(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<View>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      views: { view: View[] };
    }>(`/sites/${this.siteId}/views${qs}`);

    return {
      items: response.views?.view || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getView(viewId: string): Promise<View> {
    this.ensureSignedIn();
    const response = await this.request<{ view: View }>(`/sites/${this.siteId}/views/${viewId}`);
    return response.view;
  }

  async getWorkbookViews(workbookId: string): Promise<View[]> {
    this.ensureSignedIn();
    const response = await this.request<{ views: { view: View[] } }>(
      `/sites/${this.siteId}/workbooks/${workbookId}/views`
    );
    return response.views?.view || [];
  }

  async queryViewData(viewId: string, maxAge?: number): Promise<string> {
    this.ensureSignedIn();
    const qs = maxAge ? `?maxAge=${maxAge}` : '';
    const response = await this.request<string>(`/sites/${this.siteId}/views/${viewId}/data${qs}`);
    return response;
  }

  async getViewImage(viewId: string, resolution?: string, maxAge?: number): Promise<ArrayBuffer> {
    this.ensureSignedIn();
    const params: Record<string, string | number | undefined> = { resolution, maxAge };
    const qs = this.buildQueryString(params);
    return this.request<ArrayBuffer>(`/sites/${this.siteId}/views/${viewId}/image${qs}`, {}, true);
  }

  async getViewPdf(viewId: string, options?: { orientation?: string; type?: string }): Promise<ArrayBuffer> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(options);
    return this.request<ArrayBuffer>(`/sites/${this.siteId}/views/${viewId}/pdf${qs}`, {}, true);
  }

  async addViewTags(viewId: string, tags: string[]): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/views/${viewId}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tags: { tag: tags.map((label) => ({ label })) } }),
    });
  }

  async deleteViewTag(viewId: string, tag: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/views/${viewId}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Custom Views
  // ===========================================================================

  async listCustomViews(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<CustomView>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      customViews: { customView: CustomView[] };
    }>(`/sites/${this.siteId}/customviews${qs}`);

    return {
      items: response.customViews?.customView || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getCustomView(customViewId: string): Promise<CustomView> {
    this.ensureSignedIn();
    const response = await this.request<{ customView: CustomView }>(`/sites/${this.siteId}/customviews/${customViewId}`);
    return response.customView;
  }

  async updateCustomView(customViewId: string, input: CustomViewUpdateInput): Promise<CustomView> {
    this.ensureSignedIn();
    const body: Record<string, unknown> = { ...input };
    if (input.ownerId) {
      body.owner = { id: input.ownerId };
      delete body.ownerId;
    }
    const response = await this.request<{ customView: CustomView }>(`/sites/${this.siteId}/customviews/${customViewId}`, {
      method: 'PUT',
      body: JSON.stringify({ customView: body }),
    });
    return response.customView;
  }

  async deleteCustomView(customViewId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/customviews/${customViewId}`, { method: 'DELETE' });
  }

  async getCustomViewImage(customViewId: string, resolution?: string): Promise<ArrayBuffer> {
    this.ensureSignedIn();
    const qs = resolution ? `?resolution=${resolution}` : '';
    return this.request<ArrayBuffer>(`/sites/${this.siteId}/customviews/${customViewId}/image${qs}`, {}, true);
  }

  // ===========================================================================
  // Data Sources
  // ===========================================================================

  async listDataSources(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<DataSource>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      datasources: { datasource: DataSource[] };
    }>(`/sites/${this.siteId}/datasources${qs}`);

    return {
      items: response.datasources?.datasource || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getDataSource(dataSourceId: string): Promise<DataSource> {
    this.ensureSignedIn();
    const response = await this.request<{ datasource: DataSource }>(`/sites/${this.siteId}/datasources/${dataSourceId}`);
    return response.datasource;
  }

  async updateDataSource(dataSourceId: string, input: DataSourceUpdateInput): Promise<DataSource> {
    this.ensureSignedIn();
    const body: Record<string, unknown> = { ...input };
    if (input.projectId) {
      body.project = { id: input.projectId };
      delete body.projectId;
    }
    if (input.ownerId) {
      body.owner = { id: input.ownerId };
      delete body.ownerId;
    }
    const response = await this.request<{ datasource: DataSource }>(`/sites/${this.siteId}/datasources/${dataSourceId}`, {
      method: 'PUT',
      body: JSON.stringify({ datasource: body }),
    });
    return response.datasource;
  }

  async deleteDataSource(dataSourceId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/datasources/${dataSourceId}`, { method: 'DELETE' });
  }

  async refreshDataSource(dataSourceId: string): Promise<Job> {
    this.ensureSignedIn();
    const response = await this.request<{ job: Job }>(`/sites/${this.siteId}/datasources/${dataSourceId}/refresh`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response.job;
  }

  async downloadDataSource(dataSourceId: string, includeExtract = false): Promise<ArrayBuffer> {
    this.ensureSignedIn();
    const qs = includeExtract ? '?includeExtract=true' : '';
    return this.request<ArrayBuffer>(`/sites/${this.siteId}/datasources/${dataSourceId}/content${qs}`, {}, true);
  }

  async getDataSourceRevisions(dataSourceId: string, params?: PaginationParams): Promise<PaginatedResponse<Revision>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      revisions: { revision: Revision[] };
    }>(`/sites/${this.siteId}/datasources/${dataSourceId}/revisions${qs}`);

    return {
      items: response.revisions?.revision || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getDataSourceConnections(dataSourceId: string): Promise<DataSourceConnection[]> {
    this.ensureSignedIn();
    const response = await this.request<{ connections: { connection: DataSourceConnection[] } }>(
      `/sites/${this.siteId}/datasources/${dataSourceId}/connections`
    );
    return response.connections?.connection || [];
  }

  async updateDataSourceConnection(dataSourceId: string, connectionId: string, input: ConnectionUpdateInput): Promise<Connection> {
    this.ensureSignedIn();
    const response = await this.request<{ connection: Connection }>(
      `/sites/${this.siteId}/datasources/${dataSourceId}/connections/${connectionId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ connection: input }),
      }
    );
    return response.connection;
  }

  async addDataSourceTags(dataSourceId: string, tags: string[]): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/datasources/${dataSourceId}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tags: { tag: tags.map((label) => ({ label })) } }),
    });
  }

  async deleteDataSourceTag(dataSourceId: string, tag: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/datasources/${dataSourceId}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE',
    });
  }

  // ===========================================================================
  // Users
  // ===========================================================================

  async listUsers(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<User>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      users: { user: User[] };
    }>(`/sites/${this.siteId}/users${qs}`);

    return {
      items: response.users?.user || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getUser(userId: string): Promise<User> {
    this.ensureSignedIn();
    const response = await this.request<{ user: User }>(`/sites/${this.siteId}/users/${userId}`);
    return response.user;
  }

  async addUserToSite(input: UserCreateInput): Promise<User> {
    this.ensureSignedIn();
    const response = await this.request<{ user: User }>(`/sites/${this.siteId}/users`, {
      method: 'POST',
      body: JSON.stringify({ user: input }),
    });
    return response.user;
  }

  async updateUser(userId: string, input: UserUpdateInput): Promise<User> {
    this.ensureSignedIn();
    const response = await this.request<{ user: User }>(`/sites/${this.siteId}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ user: input }),
    });
    return response.user;
  }

  async removeUserFromSite(userId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/users/${userId}`, { method: 'DELETE' });
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    this.ensureSignedIn();
    const response = await this.request<{ groups: { group: Group[] } }>(
      `/sites/${this.siteId}/users/${userId}/groups`
    );
    return response.groups?.group || [];
  }

  // ===========================================================================
  // Groups
  // ===========================================================================

  async listGroups(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Group>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      groups: { group: Group[] };
    }>(`/sites/${this.siteId}/groups${qs}`);

    return {
      items: response.groups?.group || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getGroup(groupId: string): Promise<Group> {
    this.ensureSignedIn();
    const response = await this.request<{ group: Group }>(`/sites/${this.siteId}/groups/${groupId}`);
    return response.group;
  }

  async createGroup(input: GroupCreateInput): Promise<Group> {
    this.ensureSignedIn();
    const response = await this.request<{ group: Group }>(`/sites/${this.siteId}/groups`, {
      method: 'POST',
      body: JSON.stringify({ group: input }),
    });
    return response.group;
  }

  async updateGroup(groupId: string, input: GroupUpdateInput): Promise<Group> {
    this.ensureSignedIn();
    const response = await this.request<{ group: Group }>(`/sites/${this.siteId}/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify({ group: input }),
    });
    return response.group;
  }

  async deleteGroup(groupId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/groups/${groupId}`, { method: 'DELETE' });
  }

  async getGroupUsers(groupId: string, params?: PaginationParams): Promise<PaginatedResponse<User>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      users: { user: User[] };
    }>(`/sites/${this.siteId}/groups/${groupId}/users${qs}`);

    return {
      items: response.users?.user || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async addUserToGroup(groupId: string, userId: string): Promise<User> {
    this.ensureSignedIn();
    const response = await this.request<{ user: User }>(`/sites/${this.siteId}/groups/${groupId}/users`, {
      method: 'POST',
      body: JSON.stringify({ user: { id: userId } }),
    });
    return response.user;
  }

  async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/groups/${groupId}/users/${userId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Group Sets
  // ===========================================================================

  async listGroupSets(params?: PaginationParams): Promise<PaginatedResponse<GroupSet>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      groupSets: { groupSet: GroupSet[] };
    }>(`/sites/${this.siteId}/groupsets${qs}`);

    return {
      items: response.groupSets?.groupSet || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getGroupSet(groupSetId: string): Promise<GroupSet> {
    this.ensureSignedIn();
    const response = await this.request<{ groupSet: GroupSet }>(`/sites/${this.siteId}/groupsets/${groupSetId}`);
    return response.groupSet;
  }

  async createGroupSet(name: string): Promise<GroupSet> {
    this.ensureSignedIn();
    const response = await this.request<{ groupSet: GroupSet }>(`/sites/${this.siteId}/groupsets`, {
      method: 'POST',
      body: JSON.stringify({ groupSet: { name } }),
    });
    return response.groupSet;
  }

  async updateGroupSet(groupSetId: string, name: string): Promise<GroupSet> {
    this.ensureSignedIn();
    const response = await this.request<{ groupSet: GroupSet }>(`/sites/${this.siteId}/groupsets/${groupSetId}`, {
      method: 'PUT',
      body: JSON.stringify({ groupSet: { name } }),
    });
    return response.groupSet;
  }

  async deleteGroupSet(groupSetId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/groupsets/${groupSetId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Schedules
  // ===========================================================================

  async listSchedules(params?: PaginationParams): Promise<PaginatedResponse<Schedule>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      schedules: { schedule: Schedule[] };
    }>(`/schedules${qs}`);

    return {
      items: response.schedules?.schedule || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getSchedule(scheduleId: string): Promise<Schedule> {
    this.ensureSignedIn();
    const response = await this.request<{ schedule: Schedule }>(`/schedules/${scheduleId}`);
    return response.schedule;
  }

  async createSchedule(input: ScheduleCreateInput): Promise<Schedule> {
    this.ensureSignedIn();
    const response = await this.request<{ schedule: Schedule }>('/schedules', {
      method: 'POST',
      body: JSON.stringify({ schedule: input }),
    });
    return response.schedule;
  }

  async updateSchedule(scheduleId: string, input: ScheduleUpdateInput): Promise<Schedule> {
    this.ensureSignedIn();
    const response = await this.request<{ schedule: Schedule }>(`/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify({ schedule: input }),
    });
    return response.schedule;
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/schedules/${scheduleId}`, { method: 'DELETE' });
  }

  async addDataSourceToSchedule(scheduleId: string, dataSourceId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/schedules/${scheduleId}/datasources`, {
      method: 'PUT',
      body: JSON.stringify({ task: { datasource: { id: dataSourceId } } }),
    });
  }

  async addWorkbookToSchedule(scheduleId: string, workbookId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/schedules/${scheduleId}/workbooks`, {
      method: 'PUT',
      body: JSON.stringify({ task: { workbook: { id: workbookId } } }),
    });
  }

  // ===========================================================================
  // Jobs
  // ===========================================================================

  async listJobs(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Job>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      backgroundJobs: { backgroundJob: Job[] };
    }>(`/sites/${this.siteId}/jobs${qs}`);

    return {
      items: response.backgroundJobs?.backgroundJob || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getJob(jobId: string): Promise<Job> {
    this.ensureSignedIn();
    const response = await this.request<{ job: Job }>(`/sites/${this.siteId}/jobs/${jobId}`);
    return response.job;
  }

  async cancelJob(jobId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/jobs/${jobId}`, { method: 'PUT' });
  }

  // ===========================================================================
  // Extract Refresh Tasks
  // ===========================================================================

  async listExtractRefreshTasks(): Promise<ExtractRefreshTask[]> {
    this.ensureSignedIn();
    const response = await this.request<{ tasks: { task: ExtractRefreshTask[] } }>(
      `/sites/${this.siteId}/tasks/extractRefreshes`
    );
    return response.tasks?.task || [];
  }

  async getExtractRefreshTask(taskId: string): Promise<ExtractRefreshTask> {
    this.ensureSignedIn();
    const response = await this.request<{ task: ExtractRefreshTask }>(
      `/sites/${this.siteId}/tasks/extractRefreshes/${taskId}`
    );
    return response.task;
  }

  async runExtractRefreshTask(taskId: string): Promise<Job> {
    this.ensureSignedIn();
    const response = await this.request<{ job: Job }>(
      `/sites/${this.siteId}/tasks/extractRefreshes/${taskId}/runNow`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return response.job;
  }

  // ===========================================================================
  // Flows
  // ===========================================================================

  async listFlows(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<Flow>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      flows: { flow: Flow[] };
    }>(`/sites/${this.siteId}/flows${qs}`);

    return {
      items: response.flows?.flow || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getFlow(flowId: string): Promise<Flow> {
    this.ensureSignedIn();
    const response = await this.request<{ flow: Flow }>(`/sites/${this.siteId}/flows/${flowId}`);
    return response.flow;
  }

  async updateFlow(flowId: string, input: FlowUpdateInput): Promise<Flow> {
    this.ensureSignedIn();
    const body: Record<string, unknown> = { ...input };
    if (input.projectId) {
      body.project = { id: input.projectId };
      delete body.projectId;
    }
    if (input.ownerId) {
      body.owner = { id: input.ownerId };
      delete body.ownerId;
    }
    const response = await this.request<{ flow: Flow }>(`/sites/${this.siteId}/flows/${flowId}`, {
      method: 'PUT',
      body: JSON.stringify({ flow: body }),
    });
    return response.flow;
  }

  async deleteFlow(flowId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/flows/${flowId}`, { method: 'DELETE' });
  }

  async downloadFlow(flowId: string): Promise<ArrayBuffer> {
    this.ensureSignedIn();
    return this.request<ArrayBuffer>(`/sites/${this.siteId}/flows/${flowId}/content`, {}, true);
  }

  async runFlow(flowId: string): Promise<FlowRun> {
    this.ensureSignedIn();
    const response = await this.request<{ flowRun: FlowRun }>(`/sites/${this.siteId}/flows/${flowId}/runs`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return response.flowRun;
  }

  async getFlowRuns(params?: PaginationParams & { filter?: string }): Promise<PaginatedResponse<FlowRun>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      flowRuns: { flowRun: FlowRun[] };
    }>(`/sites/${this.siteId}/flows/runs${qs}`);

    return {
      items: response.flowRuns?.flowRun || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getFlowRun(flowRunId: string): Promise<FlowRun> {
    this.ensureSignedIn();
    const response = await this.request<{ flowRun: FlowRun }>(`/sites/${this.siteId}/flows/runs/${flowRunId}`);
    return response.flowRun;
  }

  async cancelFlowRun(flowRunId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/flows/runs/${flowRunId}`, { method: 'PUT' });
  }

  async listFlowTasks(): Promise<FlowTask[]> {
    this.ensureSignedIn();
    const response = await this.request<{ tasks: { task: FlowTask[] } }>(
      `/sites/${this.siteId}/tasks/runFlow`
    );
    return response.tasks?.task || [];
  }

  async getFlowConnections(flowId: string): Promise<Connection[]> {
    this.ensureSignedIn();
    const response = await this.request<{ connections: { connection: Connection[] } }>(
      `/sites/${this.siteId}/flows/${flowId}/connections`
    );
    return response.connections?.connection || [];
  }

  // ===========================================================================
  // Subscriptions
  // ===========================================================================

  async listSubscriptions(params?: PaginationParams): Promise<PaginatedResponse<Subscription>> {
    this.ensureSignedIn();
    const qs = this.buildQueryString(params);
    const response = await this.request<{
      pagination: { pageNumber: string; pageSize: string; totalAvailable: string };
      subscriptions: { subscription: Subscription[] };
    }>(`/sites/${this.siteId}/subscriptions${qs}`);

    return {
      items: response.subscriptions?.subscription || [],
      pagination: {
        pageNumber: Number.parseInt(response.pagination.pageNumber, 10),
        pageSize: Number.parseInt(response.pagination.pageSize, 10),
        totalAvailable: Number.parseInt(response.pagination.totalAvailable, 10),
      },
    };
  }

  async getSubscription(subscriptionId: string): Promise<Subscription> {
    this.ensureSignedIn();
    const response = await this.request<{ subscription: Subscription }>(
      `/sites/${this.siteId}/subscriptions/${subscriptionId}`
    );
    return response.subscription;
  }

  async createSubscription(input: SubscriptionCreateInput): Promise<Subscription> {
    this.ensureSignedIn();
    const body = {
      subscription: {
        subject: input.subject,
        attachImage: input.attachImage,
        attachPdf: input.attachPdf,
        message: input.message,
        pageOrientation: input.pageOrientation,
        pageSizeOption: input.pageSizeOption,
        content: { id: input.contentId, type: input.contentType },
        schedule: { id: input.scheduleId },
        user: { id: input.userId },
      },
    };
    const response = await this.request<{ subscription: Subscription }>(`/sites/${this.siteId}/subscriptions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return response.subscription;
  }

  async updateSubscription(subscriptionId: string, input: SubscriptionUpdateInput): Promise<Subscription> {
    this.ensureSignedIn();
    const body: Record<string, unknown> = { ...input };
    if (input.scheduleId) {
      body.schedule = { id: input.scheduleId };
      delete body.scheduleId;
    }
    const response = await this.request<{ subscription: Subscription }>(
      `/sites/${this.siteId}/subscriptions/${subscriptionId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ subscription: body }),
      }
    );
    return response.subscription;
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/subscriptions/${subscriptionId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Favorites
  // ===========================================================================

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    this.ensureSignedIn();
    const response = await this.request<{ favorites: { favorite: Favorite[] } }>(
      `/sites/${this.siteId}/favorites/${userId}`
    );
    return response.favorites?.favorite || [];
  }

  async addWorkbookToFavorites(userId: string, workbookId: string, label?: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ favorite: { label: label || '', workbook: { id: workbookId } } }),
    });
  }

  async addViewToFavorites(userId: string, viewId: string, label?: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ favorite: { label: label || '', view: { id: viewId } } }),
    });
  }

  async addDataSourceToFavorites(userId: string, dataSourceId: string, label?: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ favorite: { label: label || '', datasource: { id: dataSourceId } } }),
    });
  }

  async addProjectToFavorites(userId: string, projectId: string, label?: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ favorite: { label: label || '', project: { id: projectId } } }),
    });
  }

  async addFlowToFavorites(userId: string, flowId: string, label?: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ favorite: { label: label || '', flow: { id: flowId } } }),
    });
  }

  async removeWorkbookFromFavorites(userId: string, workbookId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}/workbooks/${workbookId}`, { method: 'DELETE' });
  }

  async removeViewFromFavorites(userId: string, viewId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}/views/${viewId}`, { method: 'DELETE' });
  }

  async removeDataSourceFromFavorites(userId: string, dataSourceId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}/datasources/${dataSourceId}`, { method: 'DELETE' });
  }

  async removeProjectFromFavorites(userId: string, projectId: string): Promise<void> {
    this.ensureSignedIn();
    await this.request(`/sites/${this.siteId}/favorites/${userId}/projects/${projectId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Permissions
  // ===========================================================================

  async getWorkbookPermissions(workbookId: string): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/workbooks/${workbookId}/permissions`
    );
    return response.permissions;
  }

  async addWorkbookPermissions(workbookId: string, permissions: Permission): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/workbooks/${workbookId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }
    );
    return response.permissions;
  }

  async getDataSourcePermissions(dataSourceId: string): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/datasources/${dataSourceId}/permissions`
    );
    return response.permissions;
  }

  async addDataSourcePermissions(dataSourceId: string, permissions: Permission): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/datasources/${dataSourceId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }
    );
    return response.permissions;
  }

  async getViewPermissions(viewId: string): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/views/${viewId}/permissions`
    );
    return response.permissions;
  }

  async addViewPermissions(viewId: string, permissions: Permission): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/views/${viewId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }
    );
    return response.permissions;
  }

  async getProjectPermissions(projectId: string): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/projects/${projectId}/permissions`
    );
    return response.permissions;
  }

  async addProjectPermissions(projectId: string, permissions: Permission): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/projects/${projectId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }
    );
    return response.permissions;
  }

  async getFlowPermissions(flowId: string): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/flows/${flowId}/permissions`
    );
    return response.permissions;
  }

  async addFlowPermissions(flowId: string, permissions: Permission): Promise<Permission> {
    this.ensureSignedIn();
    const response = await this.request<{ permissions: Permission }>(
      `/sites/${this.siteId}/flows/${flowId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }
    );
    return response.permissions;
  }

  // ===========================================================================
  // Getters for current state
  // ===========================================================================

  getAuthToken(): string | undefined {
    return this.authToken;
  }

  getSiteId(): string | undefined {
    return this.siteId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Tableau client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createTableauClient(credentials: TenantCredentials): TableauClient {
  return new TableauClientImpl(credentials);
}
