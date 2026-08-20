# syntax=docker/dockerfile:1

# ---- Stage 1: build frontend (Vite) ----
FROM node:20-bookworm AS frontend-build
WORKDIR /src/frontend
COPY BackOffice/frontend/package.json BackOffice/frontend/package-lock.json ./
RUN npm ci
COPY BackOffice/frontend/ ./
# vite.config.ts builds directly into ../backend/wwwroot, so give it that layout
WORKDIR /src
COPY BackOffice/backend/backend.csproj BackOffice/backend/backend.csproj
RUN mkdir -p BackOffice/backend/wwwroot
WORKDIR /src/frontend
RUN npm run build

# ---- Stage 2: build backend (.NET) ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src
COPY BackOffice/backend/backend.csproj BackOffice/backend/
RUN dotnet restore BackOffice/backend/backend.csproj
COPY BackOffice/backend/ BackOffice/backend/
COPY --from=frontend-build /src/BackOffice/backend/wwwroot BackOffice/backend/wwwroot/
RUN dotnet publish BackOffice/backend/backend.csproj -c Release -o /app/publish --no-restore

# ---- Stage 3: runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN useradd --create-home --shell /bin/bash appuser \
    && mkdir -p /home/appuser/Documents \
    && chown -R appuser:appuser /home/appuser /app

COPY --from=backend-build /app/publish .
RUN chown -R appuser:appuser /app

USER appuser
ENV HOME=/home/appuser
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "backend.dll"]
