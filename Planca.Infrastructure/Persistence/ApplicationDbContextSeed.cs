using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
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
            ILogger<ApplicationDbContext> logger)
        {
            // Seed işlemleri kaldırıldı
            logger.LogInformation("Seed operations have been disabled");
            await Task.CompletedTask;
        }
    }
}