using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Planca.Application.Common.Interfaces;
using Planca.Infrastructure.Persistence.Interceptors;
using System;
using System.IO;

namespace Planca.Infrastructure.Persistence.Context
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var basePath = Directory.GetCurrentDirectory();
            var configurationBuilder = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true);

            var configuration = configurationBuilder.Build();

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            
            // Use a default connection string for migrations
            var connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                "Host=localhost;Database=PlancaDb;Username=postgres;Password=password";
            
            optionsBuilder.UseNpgsql(connectionString);

            // Create mock services for design time
            var mockCurrentTenantService = new MockCurrentTenantService();
            var mockCurrentUserService = new MockCurrentUserService(); 
            var mockDateTime = new MockDateTime();
            var auditInterceptor = new AuditableEntitySaveChangesInterceptor(mockCurrentUserService, mockDateTime);

            return new ApplicationDbContext(optionsBuilder.Options, mockCurrentTenantService, auditInterceptor);
        }
    }

    // Mock implementations for design time
    public class MockCurrentTenantService : ICurrentTenantService
    {
        public Guid GetTenantId() => Guid.Empty;
        public string GetTenantName() => "Design";
        public bool IsValid() => true;
        public void SetCurrentTenantId(Guid tenantId) { }
    }

    public class MockCurrentUserService : ICurrentUserService
    {
        public string UserId => "System";
        public string UserName => "DesignUser";
        public bool IsAuthenticated => true;
        public string TenantId => Guid.Empty.ToString();
        public bool IsInRole(string role) => true;
    }

    public class MockDateTime : IDateTime
    {
        public DateTime Now => DateTime.Now;
        public DateTime UtcNow => DateTime.UtcNow;
    }
} 