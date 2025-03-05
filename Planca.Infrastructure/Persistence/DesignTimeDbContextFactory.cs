using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Planca.Infrastructure.Identity.Services;
using Planca.Infrastructure.Persistence.Context;
using Planca.Infrastructure.Persistence.Interceptors;
using System;
using System.IO;

namespace Planca.Infrastructure.Persistence
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            // Configuration
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.Development.json", optional: true)
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // DbContextOptionsBuilder
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            // Mock services for design time
            var tenantService = new MockCurrentTenantService();
            var interceptor = new AuditableEntitySaveChangesInterceptor(
                new MockCurrentUserService(),
                new Services.DateTimeService());

            return new ApplicationDbContext(optionsBuilder.Options, tenantService, interceptor);
        }
    }

    // Mock implementation for design time factory
    public class MockCurrentTenantService : Planca.Application.Common.Interfaces.ICurrentTenantService
    {
        public Guid GetTenantId() => Guid.Empty;
        public string GetTenantName() => "Design";
        public bool IsValid() => true;
    }

    public class MockCurrentUserService : Planca.Application.Common.Interfaces.ICurrentUserService
    {
        public string UserId => "Design";
        public string UserName => "DesignUser";
        public bool IsAuthenticated => true;
        public bool IsInRole(string role) => true;
    }
}