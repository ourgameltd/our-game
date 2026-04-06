---
domain: Infrastructure
technology: [Azure Bicep, Azure Resource Manager]
categories: [IaC, Cloud Infrastructure, Deployment]
related:
  - .github/workflows/tag-release.yml
  - infrastructure/parameters-subscription.json
---

# infrastructure

Azure Bicep Infrastructure as Code (IaC) templates for provisioning all cloud resources. Uses subscription-level deployment orchestrating resource group creation and all Azure resources.

## Files

| File | Purpose |
|---|---|
| `main-subscription.bicep` | Entry point — subscription-level deployment that creates the resource group and invokes `main.bicep` |
| `main.bicep` | Resource group-level deployment defining all Azure resources |
| `parameters-subscription.json` | Parameter file for subscription-level deployment |

## Resources Provisioned

| Resource | SKU/Tier | Purpose |
|---|---|---|
| Azure Static Web App | Standard | Hosts Vite frontend build output |
| Azure Functions | Consumption (Y1) | Linked SWA backend API |
| Azure SQL Server | Serverless (GP_S_Gen5) | Database with 60-min auto-pause |
| Storage Account | StorageV2, TLS 1.2 | Function App storage |
| Application Insights | — | Telemetry and diagnostics |
| Log Analytics Workspace | — | 30-day log retention |
| Azure Communication Services | — | Email via managed domain |

## Deployment

```bash
az deployment sub create \
  --location uksouth \
  --template-file main-subscription.bicep \
  --parameters @parameters-subscription.json
```
