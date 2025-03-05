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
                // Seed Roles
                await SeedRolesAsync(roleManager);

                // Seed Default Tenant
                var defaultTenant = await SeedDefaultTenantAsync(context);

                // Seed Default User
                await SeedDefaultUserAsync(userManager, defaultTenant.Id);

                // Seed Basic Services
                await SeedServicesAsync(context, defaultTenant.Id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            if (roleManager.Roles.Any())
                return;

            await roleManager.CreateAsync(new IdentityRole(UserRoles.Admin));
            await roleManager.CreateAsync(new IdentityRole(UserRoles.Employee));
            await roleManager.CreateAsync(new IdentityRole(UserRoles.Customer));
            await roleManager.CreateAsync(new IdentityRole("SuperAdmin"));
        }

        private static async Task<Tenant> SeedDefaultTenantAsync(ApplicationDbContext context)
        {
            if (await context.Tenants.AnyAsync())
                return await context.Tenants.FirstAsync();

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
                ConnectionString = "Host=db;Database=planca_default;Username=postgres;Password=postgres",
            };

            defaultTenant.TenantId = defaultTenant.Id;

            await context.Tenants.AddAsync(defaultTenant);
            await context.SaveChangesAsync();

            return defaultTenant;
        }

        private static async Task SeedDefaultUserAsync(UserManager<ApplicationUser> userManager, Guid tenantId)
        {
            if (await userManager.FindByEmailAsync("admin@example.com") != null)
                return;

            var adminUser = new ApplicationUser
            {
                UserName = "admin@example.com",
                Email = "admin@example.com",
                EmailConfirmed = true,
                FirstName = "Admin",
                LastName = "User",
                TenantId = tenantId,
                PhoneNumber = "5551234567",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRolesAsync(adminUser, new[] { UserRoles.Admin, "SuperAdmin" });
            }
        }

        private static async Task SeedServicesAsync(ApplicationDbContext context, Guid tenantId)
        {
            if (await context.Services.AnyAsync())
                return;

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
                    CreatedBy = "System"
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
                    CreatedBy = "System"
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
                    CreatedBy = "System"
                }
            };

            await context.Services.AddRangeAsync(services);
            await context.SaveChangesAsync();
        }
    }
}