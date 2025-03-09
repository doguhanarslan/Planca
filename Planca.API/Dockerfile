FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["Planca.API/Planca.API.csproj", "Planca.API/"]
COPY ["Planca.Application/Planca.Application.csproj", "Planca.Application/"]
COPY ["Planca.Infrastructure/Planca.Infrastructure.csproj", "Planca.Infrastructure/"]
COPY ["Planca.Domain/Planca.Domain.csproj", "Planca.Domain/"]
RUN dotnet restore "Planca.API/Planca.API.csproj"
COPY . .
WORKDIR "/src/Planca.API"
RUN dotnet build "Planca.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Planca.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Planca.API.dll"]