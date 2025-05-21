# UK Tax Calculator

A web application for calculating UK taxes, featuring a modern Angular frontend and .NET backend. See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed overview of the system architecture.

To quickly demo the deployed application, visit:

https://uk-tax-app.fly.dev

## Developing with Docker Compose

To build and run the application locally, a `docker-compose.yml` file is provided for convenience.

Run the following command:

```
docker compose up --build
```

This will:
- Set up PostgreSQL
- Run database migrations
- Bundle the frontend
- Build the backend

However, this approach does not support live reloading. For live reload, see the next section.

## Developing with Live Reload

### 1. Set up PostgreSQL locally

On macOS, use the following commands:

```
brew install postgres@16
brew services start postgres
createuser --superuser postgres
```

### 2. Start the frontend development server

```
cd frontend
npm install
npm run dev
```

If successful, the frontend will be served at http://localhost:4200

### 3. Start the backend development server

```
cd backend
# Install dotnet-ef & csharpier
dotnet tool restore

# Apply migrations
dotnet ef database update

# Run server
dotnet watch run --project TaxCalculator
```

If successful, the backend will be available at http://localhost:5000

### Notes
Access the application at http://localhost:4200. The frontend development server is configured to proxy requests to the backend.

For Swagger API documentation, visit http://localhost:5000/swagger

## End-to-End (E2E) Tests

E2E tests are implemented with Playwright and can be run using Docker Compose:

```
docker compose --profile e2e build e2e
docker compose run --rm e2e
```

## Unit Tests
To run backend tests:

```
cd backend
dotnet test
```

Note: Frontend unit tests are not implemented; only E2E tests are provided.


## CI/CD and Deployments
This project uses GitHub Actions for CI/CD. All pushes to the main branch automatically run both E2E and unit tests. On success, the application is deployed to https://uk-tax-app.fly.dev

All pull requests to main require tests to pass before merging.
