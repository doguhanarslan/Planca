using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Planca.Application.Common.Interfaces;
using Planca.Domain.Common.Interfaces;
using Planca.Infrastructure.Identity.Models;
using Planca.Infrastructure.Identity.Services;
using Planca.Infrastructure.Persistence.Context;
using Planca.Infrastructure.Persistence.Interceptors;
using Planca.Infrastructure.Persistence.Repositories;
using Planca.Infrastructure.Services;

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
                        .EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)));

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
            var jwtSettings = configuration.GetSection("JwtSettings");
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtSettings["Key"]))
                };
            });

            // Infrastructure servisleri ekleme

            // Interceptor'lar
            services.AddScoped<AuditableEntitySaveChangesInterceptor>();

            // Core servisler
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<ICurrentTenantService, CurrentTenantService>();
            services.AddTransient<IDateTime, DateTimeService>();
            services.AddScoped<ITokenService, TokenService>();

            // Repository'ler
            services.AddScoped(typeof(IRepository<>), typeof(BaseRepository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IAppointmentRepository, AppointmentRepository>();

            // Bu repository'leri ihtiyaç oldukça ayrıca oluşturabiliriz
            // services.AddScoped<IEmployeeRepository, EmployeeRepository>();
            // services.AddScoped<ICustomerRepository, CustomerRepository>();
            // services.AddScoped<IServiceRepository, ServiceRepository>();

            // İsteğe bağlı servisler - ihtiyaç duyarsanız etkinleştirin
            // Email servisi
            // services.AddTransient<IEmailService, EmailService>();

            // Dosya yükleme/saklama servisi
            // services.AddTransient<IFileStorageService, LocalFileStorageService>();

            // Arka plan iş servisi (örneğin Hangfire) - hatırlatmalar için
            // services.AddSingleton<IBackgroundJobService, HangfireBackgroundJobService>();
            // services.AddHangfire(config => config.UseSqlServerStorage(configuration.GetConnectionString("DefaultConnection")));
            // services.AddHangfireServer();

            return services;
        }
    }
}