FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy API solution projects to restore and publish.
COPY . .
RUN dotnet restore "OurGame.Api/OurGame.Api.csproj"
RUN dotnet publish "OurGame.Api/OurGame.Api.csproj" -c Release -o /home/site/wwwroot

FROM mcr.microsoft.com/azure-functions/dotnet-isolated:4-dotnet-isolated8.0
WORKDIR /home/site/wwwroot
COPY --from=build /home/site/wwwroot .

ENV FUNCTIONS_WORKER_RUNTIME=dotnet-isolated \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
