using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;
using TaxCalculator;
using TaxCalculator.Data;
using TaxCalculator.Repositories;
using TaxCalculator.Services;

WebApplicationBuilder Configure()
{
    var builder = WebApplication.CreateBuilder(args);

    // Add services to the container
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    // Configure CORS
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod();
        });
    });

    // Configure Swagger
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc(
            "v1",
            new OpenApiInfo
            {
                Version = "v1",
                Title = "UK Tax Calculator API",
                Description =
                    "An ASP.NET Core Web API for calculating UK taxes based on gross annual salary",
                Contact = new OpenApiContact
                {
                    Name = "Tax Calculator Team",
                    Email = "support@taxcalculator.com",
                },
            }
        );

        // Enable XML comments
        var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
    });

    // Configure PostgreSQL with Entity Framework Core
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres"))
    );

    // Register repositories
    builder.Services.AddScoped<ITaxRulesRepository, TaxRulesRepository>();

    // Register application services
    builder.Services.AddScoped<TaxCalculationService>();

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
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "UK Tax Calculator API v1");
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
