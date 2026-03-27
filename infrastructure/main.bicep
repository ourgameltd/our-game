@description('Location for all resources')
param location string = resourceGroup().location

@description('Environment name (e.g., dev, staging, prod)')
@minLength(1)
param environmentName string

@description('Base name for resources')
@minLength(1)
param baseName string = 'ourgame'

@description('Storage account SKU')
param storageAccountSku string = 'Standard_LRS'

@description('Default network access rule for the storage account network ACLs (Deny or Allow). Default is Deny for security.')
@allowed(['Allow', 'Deny'])
param storageDefaultAction string = 'Deny'

@description('Object ID of the Azure AD principal to set as SQL Server administrator')
param sqlAdminObjectId string

@description('Login name (display name) of the Azure AD SQL administrator')
param sqlAdminLoginName string

@description('Azure AD tenant ID for SQL administrator')
param sqlAdminTenantId string

// Storage account names must be 3-24 chars, lowercase letters and numbers only.
// Normalize by lowercasing and removing hyphens, then truncate to 24 characters.
var storageAccountNameRaw = replace(toLower('${baseName}storage${environmentName}'), '-', '')
var storageAccountNameSeed = empty(storageAccountNameRaw) ? 'ourgame' : storageAccountNameRaw
var storageAccountName = substring('${storageAccountNameSeed}001', 0, min(length('${storageAccountNameSeed}001'), 24))
var staticWebAppName = '${baseName}-swa-${environmentName}'
var functionAppName = '${baseName}-func-${environmentName}'
var appServicePlanName = '${baseName}-asp-${environmentName}'
var logAnalyticsName = '${baseName}-log-${environmentName}'
var appInsightsName = '${baseName}-ai-${environmentName}'
var sqlServerName = '${baseName}-sql-${environmentName}'
var sqlDatabaseName = 'OurGame'
var managedIdentityName = '${baseName}-id-${environmentName}'
var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};EndpointSuffix=${environment().suffixes.storage};AccountKey='

// User-Assigned Managed Identity — stable identity that survives Function App redeployments
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: storageAccountSku
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    networkAcls: {
      defaultAction: storageDefaultAction
    }
  }
}

// Table Service
resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// App Service Plan (Consumption - Windows)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: false
  }
}

// Azure Function App - .NET 8 Isolated (Windows Consumption)
resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    reserved: false
    siteConfig: {     
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: '${storageConnectionString}${storageAccount.listKeys().keys[0].value}'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'dotnet-isolated'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${sqlDatabaseName};Authentication=Active Directory Managed Identity;User Id=${managedIdentity.properties.clientId};Encrypt=True;TrustServerCertificate=False;'
        }
      ]
    }
  }
}

// SQL Server - Azure AD only authentication (no SQL auth)
resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    minimalTlsVersion: '1.2'
    administrators: {
      administratorType: 'ActiveDirectory'
      login: sqlAdminLoginName
      sid: sqlAdminObjectId
      tenantId: sqlAdminTenantId
      principalType: 'Application'
      azureADOnlyAuthentication: true
    }
  }
}

// SQL Database - General Purpose Serverless (cheapest tier)
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: 'GP_S_Gen5'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 34359738368
    autoPauseDelay: 60
    minCapacity: json('0.5')
    requestedBackupStorageRedundancy: 'Local'
  }
}

// Allow Azure services to access SQL Server
resource sqlFirewallAllowAzure 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Static Web App - Standard tier to support linked backends
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    repositoryUrl: ''
    branch: ''
  }
}

// Link Function App to Static Web App as backend
resource staticWebAppBackend 'Microsoft.Web/staticSites/linkedBackends@2023-12-01' = {
  parent: staticWebApp
  name: 'backend'
  properties: {
    backendResourceId: functionApp.id
    region: location
  }
}

// Outputs — only non-sensitive resource names and URLs are exposed.
// Secrets (connection strings, keys, tokens) must be retrieved at deploy-time
// via CLI commands (e.g. az staticwebapp secrets list) to avoid leaking them
// into ARM deployment history and CI logs.
output storageAccountName string = storageAccount.name
output staticWebAppName string = staticWebApp.name
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output functionAppName string = functionApp.name
output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output sqlServerName string = sqlServer.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output managedIdentityName string = managedIdentity.name
output managedIdentityClientId string = managedIdentity.properties.clientId
output managedIdentityPrincipalId string = managedIdentity.properties.principalId
