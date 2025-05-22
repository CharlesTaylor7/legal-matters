# Legal Matters 

To quickly demo the deployed application, visit:

https://legal-matters.fly.dev


## Developing with Docker Compose

To build and run the application locally, a `docker-compose.yml` file is provided for convenience.

Run the following command:

```
# The example environment will out of the box with docker compose  
cp .env.example .env
docker compose up --build
```

This will:
- Set up PostgreSQL
- Run database migrations
- Bundle the frontend
- Build the backend

However, this approach does not support live reloading. For live reload, see the next section.

## Developing with Live Reload

### 1. Environment Variables

Before starting, copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your own secrets as needed.


### 2. PostgreSQL 

```bash
docker compose up db -d
```
(Or run postgres locally, and update NPGSQL_CONNECTION in .env)

### 3. React dev server

```
cd frontend
npm install
npm run dev
```

If successful, the frontend will be served at http://localhost:3000

### 4. .NET dev server

```
cd backend
# Install dotnet-ef & csharpier
dotnet tool restore

# Apply migrations
dotnet ef database update

# Run server
dotnet watch run --non-interactive
```

If successful, the backend will be available at http://localhost:5000

### Notes
Access the application at http://localhost:3000. The frontend development server is configured to proxy requests to the backend.

For Swagger API documentation, visit http://localhost:5000/swagger

## CI/CD and Deployments
This project uses GitHub Actions for CI/CD. All pushes to the main branch automatically run basic validation steps (frontend & backend). On success, the application is deployed to https://legal-matters.fly.dev

All pull requests to main require tests to pass before merging.


## Cut for time
- automated testing:
  - Jest & React Testing Library 
  - xunit for backend unit tests
  - Playwright for e2e

- phone number validation that works for international numbers. 
  - https://www.npmjs.com/package/is-phone-number
  - https://www.nuget.org/packages/libphonenumber-csharp
- pagination for frontend
- searching
- filtering
- rewrite RBAC policies as declarative attributes. The server still does some basic RBAC via inline database queries.
