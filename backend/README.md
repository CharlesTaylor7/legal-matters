# UK Tax Calculator API

This is the backend API for the UK Tax Calculator application, built with ASP.NET Core, Entity Framework Core, and PostgreSQL. It provides endpoints for tax calculations and rule management.
## Database Setup

To set up the database (macOS):

1. Ensure PostgreSQL 16 is installed and running:
   ```bash
   brew install postgres@16
   brew services start postgres
   ```
2. Create a superuser named `postgres`:
   ```bash
   createuser --superuser postgres
   ```
3. Run migrations:
   ```bash
   dotnet ef database update
   ```

(Adjust commands as needed for other platforms.)

## API Endpoints

When running locally, the backend provides Swagger documentation summarizing the available APIs. Visit:

http://localhost:5000/swagger

## Running the Application

To run the application, use the following command:

```bash
dotnet run --project TaxCalculator
```

The API will be available at http://localhost:5000
Swagger UI is available at http://localhost:5000/swagger
