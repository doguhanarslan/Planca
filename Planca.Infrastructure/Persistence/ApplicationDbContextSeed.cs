using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Planca.Domain.Common.Enums;
using Planca.Infrastructure.Identity.Models;
using Planca.Infrastructure.Persistence.Context;
using System;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Persistence
{
    public static class ApplicationDbContextSeed
    {
        public static async Task SeedDefaultDataAsync(ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger logger)
        {
            try
            {
                // Ensure default roles are created
                await SeedRolesAsync(roleManager, logger);

                logger.LogInformation("Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
                throw;
            }
        }

        private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager, ILogger logger)
        {
            logger.LogInformation("Starting role seeding...");

            var roles = new[]
            {
                UserRoles.Admin,
                UserRoles.Employee,
                UserRoles.Customer
            };

            foreach (var roleName in roles)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var role = new IdentityRole(roleName);
                    var result = await roleManager.CreateAsync(role);

                    if (result.Succeeded)
                    {
                        logger.LogInformation("Created role: {RoleName}", roleName);
                    }
                    else
                    {
                        logger.LogError("Failed to create role: {RoleName}. Errors: {Errors}", 
                            roleName, string.Join(", ", result.Errors));
                    }
                }
                else
                {
                    logger.LogInformation("Role already exists: {RoleName}", roleName);
                }
            }

            logger.LogInformation("Role seeding completed");
        }
    }
}