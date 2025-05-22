# Legal Matters API

This is the REST API Server for the Legal Matters application.


## Migrations management
Migrations are managed through the [dotnet ef CLI tool](https://learn.microsoft.com/en-us/ef/core/cli/dotnet#common-options) 

Example commands:

Add a new migration:
``` 
dotnet ef migration add <name>
```

Apply database migrations:
```
dotnet ef database update
```


## API Endpoints

When running locally, the backend provides Swagger documentation summarizing the available APIs. Visit:

http://localhost:5000/swagger

## Running with live reload

To run the application, use the following command:

```bash
docker compose up db migrate -d
dotnet watch run --non-interactive
```

The API will be available at http://localhost:5000
Swagger UI is available at http://localhost:5000/swagger
