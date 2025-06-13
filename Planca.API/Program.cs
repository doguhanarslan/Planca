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

// Add Application Insights
builder.Services.AddApplicationInsightsTelemetry();

// Add Serilog with Application Insights
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

// JWT Authentication configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // TokenService'deki aynı anahtar normalleştirme işlemini yapıyoruz
    string encKeyString = builder.Configuration["JwtSettings:EncryptedKey"] ?? "default-encryption-key-32-bytes-len";
    byte[] keyBytes = Encoding.UTF8.GetBytes(encKeyString);
    byte[] normalizedKey = new byte[32];

    // Anahtarı 32 byte'a normalize et
    int bytesToCopy = Math.Min(keyBytes.Length, 32);
    Array.Copy(keyBytes, normalizedKey, bytesToCopy);
    if (bytesToCopy < 32)
    {
        for (int i = bytesToCopy; i < 32; i++)
        {
            normalizedKey[i] = (byte)(i & 0xFF);
        }
    }

    var encryptionKey = new SymmetricSecurityKey(normalizedKey);

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"])),
        TokenDecryptionKey = encryptionKey,
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ClockSkew = TimeSpan.Zero,
        NameClaimType = JwtRegisteredClaimNames.Sub,
        RoleClaimType = ClaimTypes.Role
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Cookie'den token almaya çalış
            if (context.Request.Cookies.ContainsKey("jwt"))
            {
                context.Token = context.Request.Cookies["jwt"];
                Console.WriteLine($"JWT token found in cookie, length: {context.Token?.Length ?? 0}");
            }
            else
            {
                Console.WriteLine("JWT token not found in cookies");
                // Authorization header'dan da kontrol et
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                {
                    context.Token = authHeader.Substring("Bearer ".Length).Trim();
                    Console.WriteLine($"JWT token found in Authorization header, length: {context.Token?.Length ?? 0}");
                }
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            Log.Warning("JWT Authentication failed: {Exception}", context.Exception.Message);
            
            // Geliştirme ortamında daha detaylı hata bilgisi
            if (context.HttpContext.RequestServices.GetService<IWebHostEnvironment>()?.IsDevelopment() == true)
            {
                Console.WriteLine($"Authentication failed details: {context.Exception}");
            }
            
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validation successful");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"JWT Challenge: {context.Error}, {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
});

// Add OpenAPI/Swagger support (only for development)
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new() { Title = "Planca API", Version = "v1" });
    });
}

// Add HTTP Context Accessor
builder.Services.AddHttpContextAccessor();

// Add CORS - Development ve Production için
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", corsBuilder =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Development için localhost'ları açıkça izin ver
            corsBuilder
                .WithOrigins("http://localhost:3000", "http://localhost:5173", "https://localhost:3000", "https://localhost:5173")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
        else
        {
            // Production için configuration'dan oku
            var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "*" };
            corsBuilder
                .WithOrigins(corsOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
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
    // Production error handling
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseCors("AllowFrontend");

// Use custom exception handler middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Add tenant resolution middleware
app.UseMiddleware<TenantResolutionMiddleware>();

app.UseHttpsRedirection();

// Enable authentication & authorization
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

// Health check endpoint
app.MapGet("/health", () => "Healthy");

// Database migration - Run in all environments
try
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    Log.Information("Starting database migration...");
    await context.Database.MigrateAsync();
    Log.Information("Database migration completed successfully");

    // Seed default data after migration
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

    Log.Information("Starting database seeding...");
    await ApplicationDbContextSeed.SeedDefaultDataAsync(context, userManager, roleManager, logger);
    Log.Information("Database seeding completed successfully");
}
catch (Exception ex)
{
    Log.Fatal(ex, "Database migration or seeding failed");
    throw;
}

try
{
    Log.Information("Starting Planca API application");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}