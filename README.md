# Tableau MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/tableau)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

A Model Context Protocol (MCP) server for Tableau, enabling business intelligence operations, workbook management, and data visualization.

## Features

- **Auth** - Authentication and session management
- **Data Sources** - Data source management
- **Flows** - Prep flow operations
- **Groups** - User group management
- **Permissions** - Permission configuration
- **Projects** - Project organization
- **Schedules** - Refresh and extract schedules
- **Sites** - Site administration
- **Subscriptions** - Alert and subscription management
- **Users** - User administration
- **Views** - View and dashboard access
- **Workbooks** - Workbook management

## Quick Start

### Recommended: Primrose SDK

The easiest way to use this MCP server is with the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const client = new PrimroseMCP({
  server: 'tableau',
  credentials: {
    serverUrl: 'https://your-server.tableau.com',
    patName: 'your-pat-name',
    patSecret: 'your-pat-secret'
  }
});
```

### Manual Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Tableau-Server-URL` | Tableau Server or Cloud URL |
| `X-Tableau-PAT-Name` | Personal Access Token name |
| `X-Tableau-PAT-Secret` | Personal Access Token secret |

### Optional Headers

| Header | Description |
|--------|-------------|
| `X-Tableau-Site-Content-URL` | Site content URL (empty for default site) |
| `X-Tableau-Auth-Token` | Pre-existing auth token |
| `X-Tableau-API-Version` | API version (default: 3.21) |

## Available Tools

### Workbooks
- `tableau_list_workbooks` - List workbooks on a site
- `tableau_get_workbook` - Get workbook details
- `tableau_download_workbook` - Download workbook
- `tableau_publish_workbook` - Publish workbook
- `tableau_update_workbook` - Update workbook
- `tableau_delete_workbook` - Delete workbook
- `tableau_refresh_workbook` - Refresh workbook data

### Views
- `tableau_list_views` - List views in a workbook
- `tableau_get_view` - Get view details
- `tableau_get_view_image` - Get view as image
- `tableau_get_view_pdf` - Get view as PDF
- `tableau_get_view_data` - Get underlying data

### Data Sources
- `tableau_list_datasources` - List data sources
- `tableau_get_datasource` - Get data source details
- `tableau_download_datasource` - Download data source
- `tableau_publish_datasource` - Publish data source
- `tableau_update_datasource` - Update data source
- `tableau_delete_datasource` - Delete data source
- `tableau_refresh_datasource` - Refresh data source

### Projects
- `tableau_list_projects` - List projects
- `tableau_get_project` - Get project details
- `tableau_create_project` - Create project
- `tableau_update_project` - Update project
- `tableau_delete_project` - Delete project

### Users
- `tableau_list_users` - List site users
- `tableau_get_user` - Get user details
- `tableau_add_user` - Add user to site
- `tableau_update_user` - Update user
- `tableau_remove_user` - Remove user from site

### Groups
- `tableau_list_groups` - List groups
- `tableau_get_group` - Get group details
- `tableau_create_group` - Create group
- `tableau_update_group` - Update group
- `tableau_delete_group` - Delete group
- `tableau_add_user_to_group` - Add user to group
- `tableau_remove_user_from_group` - Remove user from group

### Sites
- `tableau_list_sites` - List sites
- `tableau_get_site` - Get site details
- `tableau_create_site` - Create site
- `tableau_update_site` - Update site
- `tableau_delete_site` - Delete site

### Schedules
- `tableau_list_schedules` - List schedules
- `tableau_get_schedule` - Get schedule details
- `tableau_create_schedule` - Create schedule
- `tableau_update_schedule` - Update schedule
- `tableau_delete_schedule` - Delete schedule

### Flows
- `tableau_list_flows` - List Prep flows
- `tableau_get_flow` - Get flow details
- `tableau_run_flow` - Run a flow
- `tableau_download_flow` - Download flow

### Subscriptions
- `tableau_list_subscriptions` - List subscriptions
- `tableau_get_subscription` - Get subscription details
- `tableau_create_subscription` - Create subscription
- `tableau_update_subscription` - Update subscription
- `tableau_delete_subscription` - Delete subscription

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Type checking
npm run typecheck

# Deploy to Cloudflare
npm run deploy
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Tableau REST API Documentation](https://help.tableau.com/current/api/rest_api/en-us/REST/rest_api.htm)
- [Tableau Developer Portal](https://www.tableau.com/developer)
- [Model Context Protocol](https://modelcontextprotocol.io/)
