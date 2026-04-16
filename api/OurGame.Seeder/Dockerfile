FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /src

# Copy all API projects so project references resolve for the seeder run.
COPY . .
RUN dotnet restore "OurGame.Seeder/OurGame.Seeder.csproj"

ENTRYPOINT ["dotnet", "run", "--project", "OurGame.Seeder", "--", "--clean"]
