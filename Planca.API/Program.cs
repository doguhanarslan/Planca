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
using Planca.Domain.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.AspNetCore.Authentication.Cookies;

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
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
        .AddJwtBearer(options =>
        {
            // Token validation parameters...
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"])),
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                ValidateAudience = true,
                ValidAudience = builder.Configuration["JwtSettings:Audience"],
                ClockSkew = TimeSpan.Zero,
                NameClaimType = JwtRegisteredClaimNames.Sub,   // ÖNEMLİ: Name claim tipini belirt
                RoleClaimType = ClaimTypes.Role    // ÖNEMLİ: Role claim tipini belirt
            };

            // Cookie'den token okuma
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    context.Token = context.Request.Cookies["jwt"];
                    return Task.CompletedTask;
                }
            };
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
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder
            .WithOrigins("http://localhost:5173") // Your Vite frontend
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials(); // This is crucial for cookies
    });
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


app.UseCors("AllowFrontend");

// Use custom exception handler middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Add tenant resolution middleware
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseHttpsRedirection();

// Enable CORS
// Add authentication & authorization
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});
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

            // 2. Veritabanı var mı kontrol et
            logger.LogInformation("Migrating database...");
            await context.Database.MigrateAsync(); // Bu satır migrations'ları uygular
            logger.LogInformation("Database migrated successfully");

            // 3. Tablo listesini loglama (varsa)
            try
            {
                var tables = await context.Database.SqlQuery<string>($"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'").ToListAsync();
                logger.LogInformation("Current tables in database: {Tables}", string.Join(", ", tables));
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not query table names");
            }

            // 4. Seed data uygulama
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

            // ApplicationDbContext tipine özel logger oluştur
            var dbContextLogger = services.GetRequiredService<ILogger<ApplicationDbContext>>();

            logger.LogInformation("Seeding default data...");
            await ApplicationDbContextSeed.SeedDefaultDataAsync(context, userManager, roleManager, dbContextLogger);
            logger.LogInformation("Seed data applied successfully");

            // 5. Seed sonrası temel verileri kontrol et
            try
            {
                var tenantsCount = await context.Tenants.CountAsync();
                var usersCount = await userManager.Users.CountAsync();
                var rolesCount = await roleManager.Roles.CountAsync();
                var servicesCount = await context.Services.CountAsync();

                logger.LogInformation("Database seed check: Tenants: {TenantsCount}, Users: {UsersCount}, Roles: {RolesCount}, Services: {ServicesCount}",
                    tenantsCount, usersCount, rolesCount, servicesCount);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not verify seed data counts");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while migrating or seeding the database.");
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