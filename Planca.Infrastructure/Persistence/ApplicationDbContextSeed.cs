using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Planca.Domain.Common.Enums;
using Planca.Domain.Entities;
using Planca.Infrastructure.Identity.Models;
using Planca.Infrastructure.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Persistence
{
    public static class ApplicationDbContextSeed
    {
        public static async Task SeedDefaultDataAsync(ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<ApplicationDbContext> logger)
        {
            try
            {
                logger.LogInformation("Beginning database seeding process...");

                // Check if we can connect to the database
                try
                {
                    var canConnect = await context.Database.CanConnectAsync();
                    logger.LogInformation("Database connection test: {CanConnect}", canConnect);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error testing database connection");
                }

                // Seed Roles
                logger.LogInformation("Seeding roles...");
                await SeedRolesAsync(roleManager, logger);

                // Seed Default Tenant
                logger.LogInformation("Seeding default tenant...");
                var defaultTenant = await SeedDefaultTenantAsync(context, logger);
                logger.LogInformation("Default tenant created with ID: {TenantId}", defaultTenant.Id);

                // Seed Default User
                logger.LogInformation("Seeding default user...");
                await SeedDefaultUserAsync(userManager, defaultTenant.Id, logger);

                // Seed Basic Services
                logger.LogInformation("Seeding services...");
                await SeedServicesAsync(context, defaultTenant.Id, logger);

                logger.LogInformation("Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager, ILogger logger)
        {
            if (roleManager.Roles.Any())
            {
                logger.LogInformation("Roles already exist, skipping seed");
                return;
            }

            logger.LogInformation("Creating roles: Admin, Employee, Customer, SuperAdmin");
            await roleManager.CreateAsync(new IdentityRole(UserRoles.Admin));
            await roleManager.CreateAsync(new IdentityRole(UserRoles.Employee));
            await roleManager.CreateAsync(new IdentityRole(UserRoles.Customer));
            await roleManager.CreateAsync(new IdentityRole("SuperAdmin"));
            logger.LogInformation("Roles created successfully");
        }

        private static async Task<Tenant> SeedDefaultTenantAsync(ApplicationDbContext context, ILogger logger)
        {
            if (await context.Tenants.AnyAsync())
            {
                logger.LogInformation("At least one tenant already exists, using the first one");
                var existingTenant = await context.Tenants.FirstAsync();
                logger.LogInformation("Using existing tenant: {TenantName} ({TenantId})",
                    existingTenant.Name, existingTenant.Id);
                return existingTenant;
            }

            logger.LogInformation("No tenants found, creating default tenant");
            var defaultTenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = "Default Salon",
                Subdomain = "default",
                LogoUrl = "/logo.png",
                PrimaryColor = "#3498db",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                LastModifiedBy = "System",
                ConnectionString = "Host=db;Database=planca_default;Username=postgres;Password=postgres",
            };

            defaultTenant.TenantId = defaultTenant.Id;

            try
            {
                logger.LogInformation("Adding default tenant to context");
                await context.Tenants.AddAsync(defaultTenant);

                logger.LogInformation("Saving changes to database");
                await context.SaveChangesAsync();

                logger.LogInformation("Default tenant created with ID: {TenantId}", defaultTenant.Id);
                return defaultTenant;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error saving default tenant");
                throw;
            }
        }

        private static async Task SeedDefaultUserAsync(UserManager<ApplicationUser> userManager, Guid tenantId, ILogger logger)
        {
            var testEmail = "admin@example.com";
            logger.LogInformation("Checking if user {Email} already exists", testEmail);

            if (await userManager.FindByEmailAsync(testEmail) != null)
            {
                logger.LogInformation("User {Email} already exists, skipping creation", testEmail);
                return;
            }

            logger.LogInformation("Creating admin user with email {Email}", testEmail);
            var adminUser = new ApplicationUser
            {
                UserName = testEmail,
                Email = testEmail,
                EmailConfirmed = true,
                FirstName = "Admin",
                LastName = "User",
                TenantId = tenantId,
                PhoneNumber = "5551234567",
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                RefreshToken = string.Empty,
                RefreshTokenExpiryTime = DateTime.UtcNow
            };

            logger.LogInformation("Attempting to create user in database");
            var result = await userManager.CreateAsync(adminUser, "Admin123!");

            if (result.Succeeded)
            {
                logger.LogInformation("User created successfully, assigning roles");
                await userManager.AddToRolesAsync(adminUser, new[] { UserRoles.Admin, "SuperAdmin" });
                logger.LogInformation("Roles assigned to admin user");
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                logger.LogError("Failed to create admin user. Errors: {Errors}", errors);
                throw new Exception($"Failed to create admin user: {errors}");
            }
        }

        private static async Task SeedServicesAsync(ApplicationDbContext context, Guid tenantId, ILogger logger)
        {
            if (await context.Services.AnyAsync())
            {
                logger.LogInformation("Services already exist, skipping seed");
                return;
            }

            logger.LogInformation("Creating default services");
            var services = new List<Service>
            {
                new Service
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Name = "Haircut",
                    Description = "Basic haircut service",
                    Price = 30.00m,
                    DurationMinutes = 30,
                    IsActive = true,
                    Color = "#3498db",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System",
                    LastModifiedBy = "System"
                },
                new Service
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Name = "Hair Coloring",
                    Description = "Full hair coloring treatment",
                    Price = 80.00m,
                    DurationMinutes = 120,
                    IsActive = true,
                    Color = "#e74c3c",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System",
                    LastModifiedBy = "System"
                },
                new Service
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    Name = "Manicure",
                    Description = "Basic manicure service",
                    Price = 25.00m,
                    DurationMinutes = 45,
                    IsActive = true,
                    Color = "#9b59b6",
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System",
                    LastModifiedBy = "System"
                }
            };

            try
            {
                logger.LogInformation("Adding services to context");
                await context.Services.AddRangeAsync(services);

                logger.LogInformation("Saving services to database");
                await context.SaveChangesAsync();

                logger.LogInformation("Services created successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error saving services");
                throw;
            }
        }
    }
}