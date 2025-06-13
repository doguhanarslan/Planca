# Azure Container Apps için optimize edilmiş .NET API Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Non-root user için güvenlik
RUN adduser --disabled-password --gecos '' --shell /bin/bash appuser && chown -R appuser /app
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["Planca.API/Planca.API.csproj", "Planca.API/"]
COPY ["Planca.Application/Planca.Application.csproj", "Planca.Application/"]
COPY ["Planca.Infrastructure/Planca.Infrastructure.csproj", "Planca.Infrastructure/"]
COPY ["Planca.Domain/Planca.Domain.csproj", "Planca.Domain/"]

RUN dotnet restore "Planca.API/Planca.API.csproj"

# Copy source code
COPY . .
WORKDIR "/src/Planca.API"

# Build application
RUN dotnet build "Planca.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Planca.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Environment variables for Docker development
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true

ENTRYPOINT ["dotnet", "Planca.API.dll"]