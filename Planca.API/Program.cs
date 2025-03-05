using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Planca.API.Middleware;
using Planca.Application;
using Planca.Infrastructure;
using Planca.Infrastructure.Identity.Models;
using Planca.Infrastructure.Persistence.Context;
using Planca.Infrastructure.Persistence;
using Serilog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// Add Controllers
builder.Services.AddControllers();

// Configure API behavior options
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

// Add OpenAPI/Swagger support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Planca API", Version = "v1" });
});

// Add HTTP Context Accessor
builder.Services.AddHttpContextAccessor();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Planca API v1"));
    app.UseDeveloperExceptionPage();
}
else
{
    // The default HSTS value is 30 days
    app.UseHsts();
}

// Use custom exception handler middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Add tenant resolution middleware
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowAll");

// Add authentication & authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

try
{
    // MİGRASYON VE SEED İŞLEMLERİ KISMI
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILogger<Program>>();

        try
        {
            // 1. Veritabanı bağlantısını ve connection string'i loglama
            var context = services.GetRequiredService<ApplicationDbContext>();
            var connectionString = context.Database.GetConnectionString();
            logger.LogInformation("Database connection string (masked): {ConnectionString}",
                connectionString?.Replace("Password=", "Password=***"));

            // 2. Migrasyon yerine doğrudan veritabanı oluşturma yaklaşımı kullan
            try
            {
                logger.LogInformation("Ensuring database exists...");
                // Uyarıları görmezden gel ve veritabanını oluştur
                context.Database.EnsureCreated();
                logger.LogInformation("Database created or already exists");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error ensuring database exists");
            }

            // 3. Seed data uygulama
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

            // ApplicationDbContext tipine özel logger oluştur
            var dbContextLogger = services.GetRequiredService<ILogger<ApplicationDbContext>>();

            logger.LogInformation("Seeding default data...");
            await ApplicationDbContextSeed.SeedDefaultDataAsync(context, userManager, roleManager, dbContextLogger);
            logger.LogInformation("Seed data applied successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating or seeding the database.");
            // Hatayı yakalamanın ardından, devam edelim - uygulamanın çalışmasını engellemiyoruz
        }
    }
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}