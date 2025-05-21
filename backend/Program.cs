using System.Reflection;
using dotenv.net;
using LegalMatters.Data;
// using LegalMatters.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

WebApplicationBuilder Configure()
{
    var builder = WebApplication.CreateBuilder(args);

    // for development only, we load the .env file
    // production secrets are set via fly secrets cli
    if (builder.Environment.IsDevelopment())
    {
        DotEnv.Load(options: new DotEnvOptions(envFilePaths: ["../.env"]));
    }

    // Add services to the container
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    if (builder.Environment.IsDevelopment())
    {
        // Configure CORS
        builder.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod();
            });
        });
    }

    // Configure Swagger
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc(
            "v1",
            new OpenApiInfo
            {
                Version = "v1",
                Title = "Legal Matters API",
                Description =
                    "An ASP.NET Core Web API for calculating UK taxes based on gross annual salary",
                Contact = new OpenApiContact
                {
                    Name = "Legal Matters Team",
                    Email = "support@legalmatters.com",
                },
            }
        );

        // Enable XML comments
        var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    });

    // Configure PostgreSQL with Entity Framework Core
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(Environment.GetEnvironmentVariable("NPGSQL_CONNECTION"))
    );

    // Register repositories

    // Register application services

    // Add health checks
    builder.Services.AddHealthChecks().AddDbContextCheck<ApplicationDbContext>();

    return builder;
}

void Start(WebApplication app)
{
    app.UseStaticFiles();
    app.UseRouting();
    app.UseCors();
    app.MapControllers();

    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Legal Matters API v1");
        options.RoutePrefix = "swagger";
    });

    app.MapHealthChecks("/health");

    if (app.Environment.IsProduction())
    {
        app.MapFallbackToFile("index.html");
    }

    app.Run();
}

Start(Configure().Build());
