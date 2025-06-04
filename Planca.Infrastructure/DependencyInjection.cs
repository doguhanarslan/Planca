using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Services;
using Planca.Domain.Common.Interfaces;
using Planca.Infrastructure.Configuration;
using Planca.Infrastructure.Identity.Models;
using Planca.Infrastructure.Identity.Services;
using Planca.Infrastructure.Persistence.Context;
using Planca.Infrastructure.Persistence.Interceptors;
using Planca.Infrastructure.Persistence.Repositories;
using Planca.Infrastructure.Services;
using StackExchange.Redis;

namespace Planca.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // PostgreSQL için DbContext ekleme
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
                        ));

            // Add Identity
            services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                // Password settings
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 8;

                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;

                // User settings
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            // Add JWT Authentication



            //Redis conf

            services.Configure<CacheSettings>(configuration.GetSection("CacheSettings"));


            //Cache servisleri
            var cacheSettings = configuration.GetSection("CacheSettings").Get<CacheSettings>();
            if (cacheSettings.EnableDistributedCache)
            {
                // Redis connection
                services.AddSingleton<IConnectionMultiplexer>(sp =>
                {
                    var connectionString = cacheSettings.ConnectionString;
                    return ConnectionMultiplexer.Connect(connectionString);
                });

                // Redis distributed cache
                services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = cacheSettings.ConnectionString;
                    options.InstanceName = cacheSettings.InstanceName;
                });

                // Cache services
                services.AddScoped<ITenantCacheKeyService, TenantCacheKeyService>();
                services.AddScoped<ICacheService, RedisCacheService>();
            }
            else
            {
                // Fallback to memory cache if Redis is disabled
                services.AddMemoryCache();
                services.AddScoped<ITenantCacheKeyService, TenantCacheKeyService>();
                services.AddScoped<ICacheService, MemoryCacheService>();
            }

            // Data Retention Configuration
            services.Configure<DataRetentionOptions>(configuration.GetSection(DataRetentionOptions.SectionName));

            // Infrastructure servisleri ekleme
            services.AddHttpContextAccessor();
            // Interceptor'lar
            services.AddScoped<AuditableEntitySaveChangesInterceptor>();

            // Core servisler
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<ICurrentTenantService, CurrentTenantService>();
            services.AddTransient<IDateTime, DateTimeService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAppSettings, AppSettings>();
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddScoped<IUserService, UserService>();

            // Data Retention Services
            services.AddScoped<IDataRetentionService, DataRetentionService>();
            services.AddHostedService<DataRetentionBackgroundService>();

            // Repository'ler
            services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IAppointmentRepository, AppointmentRepository>();
            services.AddScoped<IEmployeeRepository, EmployeeRepository>();
            services.AddScoped<ICustomerRepository, CustomerRepository>();
            services.AddScoped<ISettingsRepository, SettingsRepository>();
            
            // Servis Repository'si için logger ekleyerek kayıt
            services.AddScoped<IServiceRepository>(provider => 
            {
                var dbContext = provider.GetRequiredService<ApplicationDbContext>();
                var tenantService = provider.GetRequiredService<ICurrentTenantService>();
                var logger = provider.GetRequiredService<Microsoft.Extensions.Logging.ILogger<ServiceRepository>>();
                return new ServiceRepository(dbContext, tenantService, logger);
            });
            
            services.AddScoped<ITenantRepository, TenantRepository>();

            return services;
        }
    }
}