#!/usr/bin/env bash
set -euo pipefail

# Configurable values (override with environment variables if needed)
CONTAINER_NAME="${CONTAINER_NAME:-ourgame-sqlserver}"
SA_PASSWORD="${SA_PASSWORD:-YourStrong@Passw0rd}"
DB_NAME="${DB_NAME:-OurGame}"
HOST_PORT="${HOST_PORT:-1433}"
IMAGE="${IMAGE:-mcr.microsoft.com/mssql/server:2022-latest}"
# SQL Server 2022 container is commonly linux/amd64; override if you use a different image.
IMAGE_PLATFORM="${IMAGE_PLATFORM:-linux/amd64}"
RUN_SEED="${RUN_SEED:-true}"
DOTNET_ROLL_FORWARD_VALUE="${DOTNET_ROLL_FORWARD_VALUE:-Major}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is not installed or not available in PATH."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running. Start Docker Desktop and try again."
  exit 1
fi

if docker ps -a --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"; then
  echo "Container '$CONTAINER_NAME' already exists. Ensuring it is running..."
  docker start "$CONTAINER_NAME" >/dev/null
else
  echo "Creating SQL Server container '$CONTAINER_NAME' on port $HOST_PORT..."
  docker run \
    --platform "$IMAGE_PLATFORM" \
    --name "$CONTAINER_NAME" \
    -e "ACCEPT_EULA=Y" \
    -e "MSSQL_SA_PASSWORD=$SA_PASSWORD" \
    -p "$HOST_PORT:1433" \
    -d "$IMAGE" >/dev/null
fi

SQLCMD="/opt/mssql-tools18/bin/sqlcmd"

# Wait for SQL Server to become ready before creating the database
READY=0
for i in $(seq 1 60); do
  if docker exec "$CONTAINER_NAME" "$SQLCMD" -S localhost -U sa -P "$SA_PASSWORD" -C -Q "SELECT 1" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 2
done

if [[ "$READY" -ne 1 ]]; then
  echo "Error: SQL Server did not become ready in time."
  exit 1
fi

echo "Creating database '$DB_NAME' if it does not already exist..."
docker exec "$CONTAINER_NAME" "$SQLCMD" -S localhost -U sa -P "$SA_PASSWORD" -C -Q "IF DB_ID(N'$DB_NAME') IS NULL CREATE DATABASE [$DB_NAME];"

if [[ "$RUN_SEED" == "true" ]]; then
  if ! command -v dotnet >/dev/null 2>&1; then
    echo "Error: dotnet SDK is not installed or not available in PATH."
    echo "Set RUN_SEED=false to skip seeding."
    exit 1
  fi

  echo "Running OurGame seeder..."
  CONNECTION_STRING="Server=localhost,$HOST_PORT;Database=$DB_NAME;User Id=sa;Password=$SA_PASSWORD;TrustServerCertificate=True"
  (
    cd api
    DOTNET_ROLL_FORWARD="$DOTNET_ROLL_FORWARD_VALUE" \
      CONNECTIONSTRINGS__DEFAULTCONNECTION="$CONNECTION_STRING" \
      dotnet run --project OurGame.Seeder/OurGame.Seeder.csproj
  )
fi

echo "Done."
echo "Connection string: Server=localhost,$HOST_PORT;Database=$DB_NAME;User Id=sa;Password=$SA_PASSWORD;TrustServerCertificate=True"
