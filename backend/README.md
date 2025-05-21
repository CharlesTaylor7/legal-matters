# Legal Matters API

This is the backend API for the TODO



## Migrations management
Migrations are managed through the dotnet ef CLI tool. 

Use the script `ef.sh`. All shell arguments will be forwarded to the underlying [dotnet-ef CLI](https://learn.microsoft.com/en-us/ef/core/cli/dotnet#common-options).

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
dotnet watch run
```

The API will be available at http://localhost:5000
Swagger UI is available at http://localhost:5000/swagger
