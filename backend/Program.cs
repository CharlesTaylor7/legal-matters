using System.Reflection;
using dotenv.net;
using LegalMatters.Data;
using LegalMatters.Models;
using LegalMatters.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
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
    builder.Services.AddHttpContextAccessor();

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
                Description = "An ASP.NET Core REST API for managing Legal Matters",
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

    var connection = Environment.GetEnvironmentVariable("NPGSQL_CONNECTION");
    Console.WriteLine(connection);
    // Configure PostgreSQL with Entity Framework Core
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(connection)
    );

    // Register repositories

    // Register application services
    builder.Services.AddScoped<IPhoneNumberService, USPhoneNumberService>();

    // Add health checks
    builder.Services.AddHealthChecks().AddDbContextCheck<ApplicationDbContext>();

    // Configure Identity and Authentication
    builder
        .Services.AddIdentity<User, Role>(options =>
        {
            // Password settings
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;

            // Lockout settings
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;

            // User settings
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

    // Configure Cookie Authentication
    builder.Services.ConfigureApplicationCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.ExpireTimeSpan = TimeSpan.FromDays(7);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
    });
    builder.Services.AddAuthorization();

    return builder;
}

async Task Start(WebApplication app)
{
    using (var scope = app.Services.CreateScope())
    {
        await LegalMattersSeedData.SeedAsync(scope.ServiceProvider);
    }
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Legal Matters API v1"));

    app.UseHttpsRedirection();
    app.UseStaticFiles();
    app.UseRouting();
    app.UseCors();

    // Add authentication and authorization middleware
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapHealthChecks("/health");

    if (app.Environment.IsProduction())
    {
        app.MapFallbackToFile("index.html");
    }

    app.Run();
}

await Start(Configure().Build());
