targetScope = 'subscription'

@description('Name of the resource group to create')
param resourceGroupName string

@description('Location for the resource group and all resources')
param location string

@description('Environment name (e.g., dev, staging, prod)')
param environmentName string

@description('Base name for resources')
param baseName string = 'ourgame'

@description('Storage account SKU')
param storageAccountSku string = 'Standard_LRS'

@description('SQL Server administrator username')
param sqlAdminUsername string

@description('SQL Server administrator password')
@secure()
param sqlAdminPassword string

@description('Frontend base URL used in transactional emails. Defaults to the Static Web App URL.')
param frontendBaseUrl string = ''

@description('Local-part for ACS sender email address (left side of @).')
param emailSenderLocalPart string = 'DoNotReply'

@description('Custom sender domain for ACS email (for example, isourgame.com). Leave empty to use the Azure-managed domain.')
param emailSenderCustomDomain string = ''

@description('Static Web App custom domain host name (for example, football.isourgame.com). Leave empty to skip custom domain setup.')
param staticWebCustomDomainHostName string = ''

@description('Azure DNS zone name for the custom domain (for example, isourgame.com).')
param staticWebCustomDomainDnsZoneName string = ''

@description('Azure DNS record-set name for the custom domain (for example, football).')
param staticWebCustomDomainDnsRecordSetName string = ''

@description('TTL (seconds) for the Azure DNS CNAME record used by the Static Web App custom domain.')
@minValue(60)
param staticWebCustomDomainDnsTtl int = 3600

// Create the resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: resourceGroupName
  location: location
  tags: {
    Environment: environmentName
    Project: 'Our-Game'
    ManagedBy: 'Bicep'
  }
}

// Deploy the main infrastructure as a module
module infrastructure 'main.bicep' = {
  name: 'infrastructure-deployment'
  scope: resourceGroup
  params: {
    location: location
    environmentName: environmentName
    baseName: baseName
    storageAccountSku: storageAccountSku
    sqlAdminUsername: sqlAdminUsername
    sqlAdminPassword: sqlAdminPassword
    frontendBaseUrl: frontendBaseUrl
    emailSenderLocalPart: emailSenderLocalPart
    emailSenderCustomDomain: emailSenderCustomDomain
    staticWebCustomDomainHostName: staticWebCustomDomainHostName
    staticWebCustomDomainDnsZoneName: staticWebCustomDomainDnsZoneName
    staticWebCustomDomainDnsRecordSetName: staticWebCustomDomainDnsRecordSetName
    staticWebCustomDomainDnsTtl: staticWebCustomDomainDnsTtl
  }
}

// Outputs from the infrastructure module — non-sensitive values only.
// Secrets are retrieved at deploy-time via CLI commands.
output resourceGroupName string = resourceGroup.name
output storageAccountName string = infrastructure.outputs.storageAccountName
output staticWebAppName string = infrastructure.outputs.staticWebAppName
output staticWebAppUrl string = infrastructure.outputs.staticWebAppUrl
output functionAppName string = infrastructure.outputs.functionAppName
output functionAppUrl string = infrastructure.outputs.functionAppUrl
output sqlServerName string = infrastructure.outputs.sqlServerName
output sqlServerFqdn string = infrastructure.outputs.sqlServerFqdn
output sqlAdminUsername string = infrastructure.outputs.sqlAdminUsername
output communicationServiceName string = infrastructure.outputs.communicationServiceName
