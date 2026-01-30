/**
 * Tableau REST API Entity Types
 *
 * Type definitions for all Tableau entities returned by the API.
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  [key: string]: string | number | boolean | undefined;
  pageSize?: number;
  pageNumber?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalAvailable: number;
  };
}

// =============================================================================
// Authentication
// =============================================================================

export interface SignInResponse {
  credentials: {
    site: {
      id: string;
      contentUrl: string;
    };
    user: {
      id: string;
    };
    token: string;
  };
}

export interface PersonalAccessToken {
  id: string;
  name: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
}

// =============================================================================
// Site
// =============================================================================

export interface Site {
  id: string;
  name: string;
  contentUrl: string;
  adminMode?: string;
  state?: string;
  revision?: string;
  userQuota?: number;
  storageQuota?: number;
  tierCreatorCapacity?: number;
  tierExplorerCapacity?: number;
  tierViewerCapacity?: number;
  disableSubscriptions?: boolean;
  subscribeOthersEnabled?: boolean;
  revisionHistoryEnabled?: boolean;
  revisionLimit?: number;
  dataAccelerationMode?: string;
  flowsEnabled?: boolean;
  catalogingEnabled?: boolean;
  guestAccessEnabled?: boolean;
  allowSubscriptionAttachments?: boolean;
  cacheWarmupEnabled?: boolean;
  commentingEnabled?: boolean;
  extractEncryptionMode?: string;
}

export interface SiteCreateInput {
  name: string;
  contentUrl: string;
  adminMode?: string;
  userQuota?: number;
  storageQuota?: number;
  disableSubscriptions?: boolean;
}

export interface SiteUpdateInput {
  name?: string;
  contentUrl?: string;
  adminMode?: string;
  state?: string;
  userQuota?: number;
  storageQuota?: number;
  disableSubscriptions?: boolean;
  revisionHistoryEnabled?: boolean;
  revisionLimit?: number;
}

// =============================================================================
// Project
// =============================================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  contentPermissions?: string;
  parentProjectId?: string;
  topLevelProject?: boolean;
  createdAt?: string;
  updatedAt?: string;
  owner?: {
    id: string;
  };
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  contentPermissions?: 'ManagedByOwner' | 'LockedToProject' | 'LockedToProjectWithoutNested';
  parentProjectId?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  description?: string;
  contentPermissions?: string;
  parentProjectId?: string;
  ownerId?: string;
}

// =============================================================================
// Workbook
// =============================================================================

export interface Workbook {
  id: string;
  name: string;
  description?: string;
  contentUrl: string;
  webpageUrl?: string;
  showTabs?: boolean;
  size?: number;
  createdAt?: string;
  updatedAt?: string;
  encryptExtracts?: boolean;
  defaultViewId?: string;
  project?: {
    id: string;
    name?: string;
  };
  owner?: {
    id: string;
    name?: string;
  };
  tags?: Tag[];
  views?: View[];
}

export interface WorkbookUpdateInput {
  name?: string;
  description?: string;
  showTabs?: boolean;
  projectId?: string;
  ownerId?: string;
  encryptExtracts?: boolean;
}

// =============================================================================
// View
// =============================================================================

export interface View {
  id: string;
  name: string;
  contentUrl: string;
  createdAt?: string;
  updatedAt?: string;
  viewUrlName?: string;
  workbook?: {
    id: string;
    name?: string;
  };
  owner?: {
    id: string;
    name?: string;
  };
  project?: {
    id: string;
    name?: string;
  };
  tags?: Tag[];
  usage?: {
    totalViewCount: number;
  };
}

export interface CustomView {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  shared?: boolean;
  view?: {
    id: string;
    name?: string;
  };
  workbook?: {
    id: string;
    name?: string;
  };
  owner?: {
    id: string;
    name?: string;
  };
}

export interface CustomViewUpdateInput {
  name?: string;
  ownerId?: string;
}

// =============================================================================
// Data Source
// =============================================================================

export interface DataSource {
  id: string;
  name: string;
  description?: string;
  contentUrl: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  encryptExtracts?: boolean;
  hasExtracts?: boolean;
  isCertified?: boolean;
  certificationNote?: string;
  useRemoteQueryAgent?: boolean;
  webpageUrl?: string;
  project?: {
    id: string;
    name?: string;
  };
  owner?: {
    id: string;
    name?: string;
  };
  tags?: Tag[];
}

export interface DataSourceUpdateInput {
  name?: string;
  description?: string;
  projectId?: string;
  ownerId?: string;
  isCertified?: boolean;
  certificationNote?: string;
  encryptExtracts?: boolean;
}

export interface DataSourceConnection {
  id: string;
  type: string;
  serverAddress?: string;
  serverPort?: string;
  userName?: string;
  embedPassword?: boolean;
  datasource?: {
    id: string;
    name?: string;
  };
}

// =============================================================================
// User
// =============================================================================

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email?: string;
  siteRole: string;
  authSetting?: string;
  lastLogin?: string;
  externalAuthUserId?: string;
  locale?: string;
  language?: string;
}

export interface UserCreateInput {
  name: string;
  siteRole: SiteRole;
  authSetting?: string;
}

export interface UserUpdateInput {
  fullName?: string;
  email?: string;
  siteRole?: SiteRole;
  authSetting?: string;
}

export type SiteRole =
  | 'Creator'
  | 'Explorer'
  | 'ExplorerCanPublish'
  | 'SiteAdministratorExplorer'
  | 'SiteAdministratorCreator'
  | 'Unlicensed'
  | 'Viewer';

// =============================================================================
// Group
// =============================================================================

export interface Group {
  id: string;
  name: string;
  domainName?: string;
  minimumSiteRole?: string;
  import?: {
    domainName?: string;
    siteRole?: string;
    grantLicenseMode?: string;
  };
}

export interface GroupCreateInput {
  name: string;
  minimumSiteRole?: SiteRole;
}

export interface GroupUpdateInput {
  name?: string;
  minimumSiteRole?: SiteRole;
}

export interface GroupSet {
  id: string;
  name: string;
  groupCount?: number;
}

// =============================================================================
// Schedule
// =============================================================================

export interface Schedule {
  id: string;
  name: string;
  state?: string;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  frequency?: string;
  nextRunAt?: string;
  endScheduleAt?: string;
  executionOrder?: string;
  frequencyDetails?: {
    start?: string;
    end?: string;
    intervals?: ScheduleInterval[];
  };
}

export interface ScheduleInterval {
  hours?: string;
  minutes?: string;
  weekDay?: string;
  monthDay?: string;
}

export interface ScheduleCreateInput {
  name: string;
  priority?: number;
  type: 'Extract' | 'Subscription' | 'Flow' | 'DataAcceleration';
  frequency: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly';
  frequencyDetails: {
    start: string;
    end?: string;
    intervals?: ScheduleInterval[];
  };
  executionOrder?: 'Parallel' | 'Serial';
}

export interface ScheduleUpdateInput {
  name?: string;
  priority?: number;
  frequency?: string;
  frequencyDetails?: {
    start?: string;
    end?: string;
    intervals?: ScheduleInterval[];
  };
  state?: 'Active' | 'Suspended';
  executionOrder?: 'Parallel' | 'Serial';
}

// =============================================================================
// Job
// =============================================================================

export interface Job {
  id: string;
  mode?: string;
  type?: string;
  progress?: number;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  finishCode?: number;
  notes?: string[];
  statusNotes?: JobStatusNote;
}

export interface JobStatusNote {
  status?: string;
  severity?: string;
  text?: string;
}

// =============================================================================
// Task
// =============================================================================

export interface ExtractRefreshTask {
  id: string;
  priority?: number;
  consecutiveFailedCount?: number;
  type?: string;
  schedule?: {
    id: string;
    name?: string;
    state?: string;
    priority?: number;
    frequency?: string;
    nextRunAt?: string;
  };
  datasource?: {
    id: string;
    name?: string;
  };
  workbook?: {
    id: string;
    name?: string;
  };
}

// =============================================================================
// Flow
// =============================================================================

export interface Flow {
  id: string;
  name: string;
  description?: string;
  webpageUrl?: string;
  fileType?: string;
  createdAt?: string;
  updatedAt?: string;
  project?: {
    id: string;
    name?: string;
  };
  owner?: {
    id: string;
    name?: string;
  };
  tags?: Tag[];
}

export interface FlowUpdateInput {
  name?: string;
  description?: string;
  projectId?: string;
  ownerId?: string;
}

export interface FlowRun {
  id: string;
  flowId?: string;
  startedAt?: string;
  completedAt?: string;
  progress?: number;
  backgroundJobId?: string;
}

export interface FlowTask {
  id: string;
  type?: string;
  schedule?: {
    id: string;
    name?: string;
  };
  flow?: {
    id: string;
    name?: string;
  };
}

// =============================================================================
// Subscription
// =============================================================================

export interface Subscription {
  id: string;
  subject: string;
  attachImage?: boolean;
  attachPdf?: boolean;
  message?: string;
  pageOrientation?: string;
  pageSizeOption?: string;
  suspended?: boolean;
  content?: {
    id: string;
    type: 'Workbook' | 'View';
  };
  schedule?: {
    id: string;
    name?: string;
  };
  user?: {
    id: string;
    name?: string;
  };
}

export interface SubscriptionCreateInput {
  subject: string;
  contentId: string;
  contentType: 'Workbook' | 'View';
  userId: string;
  scheduleId: string;
  attachImage?: boolean;
  attachPdf?: boolean;
  message?: string;
  pageOrientation?: 'Portrait' | 'Landscape';
  pageSizeOption?: string;
}

export interface SubscriptionUpdateInput {
  subject?: string;
  scheduleId?: string;
  suspended?: boolean;
  attachImage?: boolean;
  attachPdf?: boolean;
  message?: string;
  pageOrientation?: string;
  pageSizeOption?: string;
}

// =============================================================================
// Favorites
// =============================================================================

export interface Favorite {
  label: string;
  workbook?: Workbook;
  view?: View;
  datasource?: DataSource;
  project?: Project;
  flow?: Flow;
}

// =============================================================================
// Permissions
// =============================================================================

export interface Permission {
  granteeCapabilities: GranteeCapability[];
}

export interface GranteeCapability {
  user?: {
    id: string;
  };
  group?: {
    id: string;
  };
  capabilities: Capability[];
}

export interface Capability {
  name: string;
  mode: 'Allow' | 'Deny';
}

export type CapabilityName =
  | 'AddComment'
  | 'ChangeHierarchy'
  | 'ChangePermissions'
  | 'Connect'
  | 'Delete'
  | 'ExportData'
  | 'ExportImage'
  | 'ExportXml'
  | 'Filter'
  | 'ProjectLeader'
  | 'Read'
  | 'ShareView'
  | 'ViewComments'
  | 'ViewUnderlyingData'
  | 'WebAuthoring'
  | 'Write';

// =============================================================================
// Tags
// =============================================================================

export interface Tag {
  label: string;
}

// =============================================================================
// Revision
// =============================================================================

export interface Revision {
  revisionNumber: string;
  publishedAt?: string;
  deleted?: boolean;
  current?: boolean;
  sizeInBytes?: number;
  publisher?: {
    id: string;
    name?: string;
  };
}

// =============================================================================
// Server Info
// =============================================================================

export interface ServerInfo {
  productVersion: {
    value: string;
    build?: string;
  };
  restApiVersion: string;
}

// =============================================================================
// Connection
// =============================================================================

export interface Connection {
  id: string;
  type: string;
  serverAddress?: string;
  serverPort?: string;
  userName?: string;
  embedPassword?: boolean;
}

export interface ConnectionUpdateInput {
  serverAddress?: string;
  serverPort?: string;
  userName?: string;
  password?: string;
  embedPassword?: boolean;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';
