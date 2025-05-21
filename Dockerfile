### FRONTEND BUILD ###
FROM node:24-alpine AS frontend-build
WORKDIR /app/frontend

# Copy package.json and package-lock.json first for better caching
COPY frontend/package*.json ./
RUN npm ci

# Copy the rest of the frontend code
COPY frontend/ ./

# Build the frontend
RUN npm run build -- --configuration production

### BACKEND BUILD ###
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /app/backend

# Copy csproj & tool manifest first for better caching
COPY backend/TaxCalculator/TaxCalculator.csproj backend/.config ./
RUN dotnet restore && dotnet tool restore

# Copy the rest of the backend code
COPY backend/TaxCalculator/* ./

RUN dotnet publish -c Release -o out
RUN dotnet ef migrations bundle

### FINAL IMAGE ###
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy backend build artifacts
COPY --from=backend-build /app/backend/out ./
COPY --from=backend-build /app/backend/efbundle ./

# Copy frontend build artifacts to wwwroot
COPY --from=frontend-build /app/frontend/dist/tax-calculator/browser ./wwwroot

# Expose ports
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS="http://0.0.0.0:8080"
ENV ASPNETCORE_ENVIRONMENT=Production

# Start the application
CMD ["dotnet", "TaxCalculator.dll"]
