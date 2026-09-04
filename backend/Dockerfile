FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["HealthBridge.Api.csproj", "./"]
RUN dotnet restore "HealthBridge.Api.csproj"

COPY . .
RUN dotnet publish "HealthBridge.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "HealthBridge.Api.dll"]
