# OurGane

Football managment at all level organised and done properly.

## Why?
Cause just now Scottish football is an underfunded shambles.

## Technology Stack

- **Frontend**: React 19 + TypeScript with Vite
- **Backend**: Azure Functions v4 (.NET 8.0) with Isolated Worker Model
- **Infrastructure**: Azure Static Web Apps + Azure Functions + Azure Table Storage
- **Deployment**: GitHub Actions + Bicep IaC
- **Storage**: Postgres and Azure storage
- **Local Development**: Azure Static Web Apps CLI

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [.NET 6.0 SDK](https://dotnet.microsoft.com/download/dotnet/6.0) (for Azure Functions)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) (for deployment)
- [Azure Functions Core Tools](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local) (for local development)

## Local Development

### Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20.x+](https://nodejs.org/)
- [Azure Functions Core Tools v4](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Azure Static Web Apps CLI](https://azure.github.io/static-web-apps-cli/) (installed as dev dependency)
- Azure Storage Emulator (Azurite) or Azure Storage connection string

### Build the solution

```bash
cd api
dotnet restore
dotnet build --configuration Release
```

### Run locally with Azure Static Web Apps CLI

The Azure Static Web Apps CLI provides local development with automatic API routing without CORS issues.

1. **Set up local.settings.json for Azure Functions**:
   ```bash
   cd api/OurGame.Api
   cp local.settings.json.example local.settings.json
   # Edit local.settings.json with your storage connection strings
   ```

2. **Option 1 - Use SWA CLI (Recommended)**:
   
   First, start the API in one terminal:
   ```bash
   cd api/OurGame.Api
   func start
   ```
   
   Then, in another terminal, start the SWA CLI:
   ```bash
   cd web
   npm install
   npm start
   ```
   
   The app will be available at `http://localhost:4280` with API automatically routed through `/api/*`.

3. **Option 2 - Run separately (for debugging)**:
   
   **Terminal 1 - Start the API (Azure Functions)**:
   ```bash
   cd api/OurGame.Api
   func start
   ```
   
   **Terminal 2 - Start the React app**:
   ```bash
   cd web
   npm install
   npm run dev
   ```
   
   The React app will be available at `http://localhost:5173` and will connect to the API at `http://localhost:7071/api`.

## Deployment

### Infrastructure Deployment

The infrastructure is managed using Bicep templates in the `infrastructure/` directory.

1. **Login to Azure**:
   ```bash
   az login
   ```

2. **Create Resource Group**:
   ```bash
   az group create --name rgourgame --location westeurope
   ```

3. **Deploy Infrastructure**:
   ```bash
   az deployment group create \
     --resource-group rgourgame \
     --template-file infrastructure/main.bicep \
     --parameters infrastructure/parameters.json
   ```

### GitHub Actions Deployment

Deployment is automated via GitHub Actions:

- **PR Build** (`.github/workflows/pr-build.yml`): Builds and validates on pull requests
- **Release** (`.github/workflows/release.yml`): Deploys infrastructure and applications to Azure

#### Setup GitHub Secrets

1. Create an Azure Service Principal:
   ```bash
   az ad sp create-for-rbac --name "github-ourgame" --role contributor \
     --scopes /subscriptions/{subscription-id}/resourceGroups/rgourgame \
     --sdk-auth
   ```

2. Add the output as a secret named `AZURE_CREDENTIALS` in your GitHub repository.

## Project Structure

```
.
├── api/                               # .NET 8.0 Backend
│   ├── OurGame.Api/      # Azure Functions backend
│   ├── OurGame.Application/ # Shared business logic
│   ├── OurGame.sln       # .NET solution file
│   └── Directory.Build.props          # Build properties
├── web/                               # React + TypeScript frontend
│   ├── src/                           # React components and logic
│   ├── public/
│   │   └── staticwebapp.config.json   # Static Web App routing config
│   └── swa-cli.config.json            # SWA CLI local development config
├── infrastructure/                     # Bicep infrastructure templates
│   ├── main.bicep                     # Main infrastructure template
│   ├── parameters.json                # Environment parameters
│   └── README.md                      # Infrastructure documentation
└── .github/workflows/                 # GitHub Actions workflows
    ├── pr-build.yml                   # PR validation workflow
    ├── release.yml                    # Deployment workflow (dev/staging)
    └── tag-release.yml                # Production deployment workflow
```

## Version Management

Versions are now manually managed in project files (`.csproj`). Update the `<Version>`, `<AssemblyVersion>`, and `<FileVersion>` properties as needed.

Current version: **1.0.0**

## NuGet Package

The `api/OurGame.Application` library contains shared business logic and is used by the API project.
