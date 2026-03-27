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

@description('Object ID of the Azure AD principal to set as SQL Server administrator')
param sqlAdminObjectId string

@description('Login name (display name) of the Azure AD SQL administrator')
param sqlAdminLoginName string

@description('Azure AD tenant ID for SQL administrator')
param sqlAdminTenantId string

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
    sqlAdminObjectId: sqlAdminObjectId
    sqlAdminLoginName: sqlAdminLoginName
    sqlAdminTenantId: sqlAdminTenantId
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
output managedIdentityName string = infrastructure.outputs.managedIdentityName
output managedIdentityClientId string = infrastructure.outputs.managedIdentityClientId
