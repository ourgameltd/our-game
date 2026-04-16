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

@description('VAPID subject for Web Push notifications (e.g. mailto:admin@yourdomain.com)')
param vapidSubject string = 'mailto:admin@ourgame.app'

@description('VAPID public key for Web Push notifications (base64url-encoded). Generate with: npx web-push generate-vapid-keys')
param vapidPublicKey string = ''

@description('VAPID private key for Web Push notifications (base64url-encoded). Generate with: npx web-push generate-vapid-keys')
@secure()
param vapidPrivateKey string = ''

@description('Data location for Azure Communication Services (e.g. Europe, United States, Asia Pacific, Australia)')
param acsDataLocation string = 'Europe'

@description('Local-part for ACS sender email address (left side of @).')
param emailSenderLocalPart string = 'DoNotReply'

@description('Custom sender domain for ACS email (for example, isourgame.com). Leave empty to use the Azure-managed domain.')
param emailSenderCustomDomain string = ''

@description('Frontend base URL used in transactional emails (e.g. invite links). Defaults to the Static Web App URL.')
param frontendBaseUrl string = ''

@description('Static Web App custom domain host name (for example, football.isourgame.com). Leave empty to skip custom domain setup.')
param staticWebCustomDomainHostName string = ''

@description('Azure DNS zone name for the custom domain (for example, isourgame.com).')
param staticWebCustomDomainDnsZoneName string = ''

@description('Azure DNS record-set name for the custom domain (for example, football).')
param staticWebCustomDomainDnsRecordSetName string = ''

@description('TTL (seconds) for the Azure DNS CNAME record used by the Static Web App custom domain.')
@minValue(60)
param staticWebCustomDomainDnsTtl int = 3600

@description('SQL Server administrator username')
param sqlAdminUsername string

@description('SQL Server administrator password')
@secure()
param sqlAdminPassword string

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
var communicationServiceName = '${baseName}-acs-${environmentName}'
var emailServiceName = '${baseName}-email-${environmentName}'
var storageConnectionString = 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};EndpointSuffix=${environment().suffixes.storage};AccountKey='
var emailSenderAddress = empty(emailSenderCustomDomain)
  ? '${emailSenderLocalPart}@${emailDomain.properties.fromSenderDomain}'
  : '${emailSenderLocalPart}@${emailSenderCustomDomain}'
var shouldConfigureStaticWebCustomDomain = !empty(staticWebCustomDomainHostName)
var shouldConfigureStaticWebCustomDomainDns = shouldConfigureStaticWebCustomDomain && !empty(staticWebCustomDomainDnsZoneName) && !empty(staticWebCustomDomainDnsRecordSetName)

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

// Blob Service
resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
}

// Blob Containers for image uploads
resource playerPhotosContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'player-photos'
  properties: {
    publicAccess: 'Blob'
  }
}

resource coachPhotosContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'coach-photos'
  properties: {
    publicAccess: 'Blob'
  }
}

resource clubLogosContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'club-logos'
  properties: {
    publicAccess: 'Blob'
  }
}

resource playerAlbumContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'player-album'
  properties: {
    publicAccess: 'Blob'
  }
}

resource userPhotosContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'user-photos'
  properties: {
    publicAccess: 'Blob'
  }
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
          value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Database=${sqlDatabaseName};User ID=${sqlAdminUsername};Password=${sqlAdminPassword};Encrypt=True;TrustServerCertificate=False;'
        }
        {
          name: 'Vapid__Subject'
          value: vapidSubject
        }
        {
          name: 'Vapid__PublicKey'
          value: vapidPublicKey
        }
        {
          name: 'Vapid__PrivateKey'
          value: vapidPrivateKey
        }
        {
          name: 'AzureCommunicationServices__ConnectionString'
          value: communicationService.listKeys().primaryConnectionString
        }
        {
          name: 'AzureCommunicationServices__SenderAddress'
          value: emailSenderAddress
        }
        {
          name: 'App__FrontendBaseUrl'
          value: empty(frontendBaseUrl) ? 'https://${staticWebApp.properties.defaultHostname}' : frontendBaseUrl
        }
        {
          name: 'BlobStorage__ConnectionString'
          value: '${storageConnectionString}${storageAccount.listKeys().keys[0].value}'
        }
      ]
    }
  }
}

// SQL Server - SQL authentication
resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    minimalTlsVersion: '1.2'
    administratorLogin: sqlAdminUsername
    administratorLoginPassword: sqlAdminPassword
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

// Azure Communication Services - Email Service
resource emailService 'Microsoft.Communication/emailServices@2023-04-01' = {
  name: emailServiceName
  location: 'global'
  properties: {
    dataLocation: acsDataLocation
  }
}

// Azure-managed email domain (provides DoNotReply@<guid>.azurecomm.net sender)
resource emailDomain 'Microsoft.Communication/emailServices/domains@2023-04-01' = {
  parent: emailService
  name: 'AzureManagedDomain'
  location: 'global'
  properties: {
    domainManagement: 'AzureManaged'
    userEngagementTracking: 'Disabled'
  }
}

// Azure Communication Services (linked to email domain)
resource communicationService 'Microsoft.Communication/communicationServices@2023-04-01' = {
  name: communicationServiceName
  location: 'global'
  properties: {
    dataLocation: acsDataLocation
    linkedDomains: [
      emailDomain.id
    ]
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

resource staticWebCustomDomainDnsZone 'Microsoft.Network/dnsZones@2018-05-01' existing = if (shouldConfigureStaticWebCustomDomainDns) {
  name: staticWebCustomDomainDnsZoneName
}

resource staticWebCustomDomainCnameRecord 'Microsoft.Network/dnsZones/CNAME@2018-05-01' = if (shouldConfigureStaticWebCustomDomainDns) {
  parent: staticWebCustomDomainDnsZone
  name: staticWebCustomDomainDnsRecordSetName
  properties: {
    TTL: staticWebCustomDomainDnsTtl
    CNAMERecord: {
      cname: staticWebApp.properties.defaultHostname
    }
  }
}

resource staticWebCustomDomain 'Microsoft.Web/staticSites/customDomains@2021-03-01' = if (shouldConfigureStaticWebCustomDomain) {
  parent: staticWebApp
  name: staticWebCustomDomainHostName
  properties: {
    validationMethod: 'cname-delegation'
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
output sqlAdminUsername string = sqlAdminUsername
output communicationServiceName string = communicationService.name
