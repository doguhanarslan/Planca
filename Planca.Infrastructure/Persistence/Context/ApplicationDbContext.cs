using System;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Planca.Application.Common.Interfaces;
using Planca.Domain.Common;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Infrastructure.Identity.Models;
using Planca.Infrastructure.Persistence.Interceptors;

namespace Planca.Infrastructure.Persistence.Context
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        private readonly ICurrentTenantService _currentTenantService;
        private readonly AuditableEntitySaveChangesInterceptor _auditableEntitySaveChangesInterceptor;

        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options,
            ICurrentTenantService currentTenantService,
            AuditableEntitySaveChangesInterceptor auditableEntitySaveChangesInterceptor)
            : base(options)
        {
            _currentTenantService = currentTenantService;
            _auditableEntitySaveChangesInterceptor = auditableEntitySaveChangesInterceptor;
        }

        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<TenantWorkingHours> TenantWorkingHours => Set<TenantWorkingHours>();
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // PostgreSQL için tüm tablo ve kolon adlarını lowercase yapma
            foreach (var entity in builder.Model.GetEntityTypes())
            {
                // Tablo adını lowercase'e çevir - ToLower() yerine ToLowerInvariant() kullan
                entity.SetTableName(entity.GetTableName().ToLowerInvariant());

                // Tüm property'lerin (kolonların) adlarını lowercase'e çevir
                foreach (var property in entity.GetProperties())
                {
                    property.SetColumnName(property.GetColumnName().ToLowerInvariant());
                }

                // Key, foreign key ve index adlarını lowercase yap
                foreach (var key in entity.GetKeys())
                {
                    key.SetName(key.GetName().ToLowerInvariant());
                }

                foreach (var key in entity.GetForeignKeys())
                {
                    key.SetConstraintName(key.GetConstraintName().ToLowerInvariant());
                }

                foreach (var index in entity.GetIndexes())
                {
                    index.SetDatabaseName(index.GetDatabaseName().ToLowerInvariant());
                }
            }

            // Configure Identity tables with PostgreSQL requirements
            ConfigureIdentityTables(builder);

            // Apply entity configurations
            builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Apply global query filters for multi-tenancy
            ApplyGlobalFilters(builder);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Add interceptors
            optionsBuilder.AddInterceptors(_auditableEntitySaveChangesInterceptor);

            base.OnConfiguring(optionsBuilder);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Apply tenant ID to new entities
            ApplyTenantId();

            return await base.SaveChangesAsync(cancellationToken);
        }

        private void ConfigureIdentityTables(ModelBuilder builder)
        {
            // Set specific names for identity tables (optional)
            builder.Entity<ApplicationUser>().ToTable("users");
            builder.Entity<IdentityRole>().ToTable("roles");
            builder.Entity<IdentityUserRole<string>>().ToTable("user_roles");
            builder.Entity<IdentityUserClaim<string>>().ToTable("user_claims");
            builder.Entity<IdentityUserLogin<string>>().ToTable("user_logins");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("role_claims");
            builder.Entity<IdentityUserToken<string>>().ToTable("user_tokens");

            // Configure ApplicationUser specific properties
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(e => e.FirstName).HasMaxLength(100);
                entity.Property(e => e.LastName).HasMaxLength(100);
                entity.Property(e => e.RefreshToken).HasMaxLength(256);
            });
        }

        private void ApplyGlobalFilters(ModelBuilder modelBuilder)
        {
            // Add global query filter for multi-tenancy
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                // Check if the entity type is implementing ITenantEntity
                if (typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType) &&
                    entityType.ClrType != typeof(Tenant)) // Skip Tenant entity itself
                {
                    // Create a dynamic filter expression that calls the CurrentTenantService at query time
                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    var tenantIdProperty = Expression.Property(parameter, nameof(ITenantEntity.TenantId));
                    
                    // Instead of using a constant with the current value, create a method call expression
                    // that will be evaluated when the query is executed
                    var currentTenantIdMethod = typeof(ICurrentTenantService)
                        .GetMethod(nameof(ICurrentTenantService.GetTenantId));
                    
                    var currentTenantServiceProperty = Expression.Constant(_currentTenantService);
                    var currentTenantIdCall = Expression.Call(currentTenantServiceProperty, currentTenantIdMethod);
                    
                    var filter = Expression.Lambda(
                        Expression.Equal(tenantIdProperty, currentTenantIdCall), 
                        parameter);

                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
                }
            }
        }

        private void ApplyTenantId()
        {
            var tenantId = _currentTenantService.GetTenantId();

            if (tenantId == Guid.Empty)
                return;

            // Set tenant ID for new entities
            foreach (var entry in ChangeTracker.Entries<ITenantEntity>()
                .Where(e => e.State == EntityState.Added && e.Entity.TenantId == Guid.Empty && e.Entity.GetType() != typeof(Tenant)))
            {
                entry.Entity.TenantId = tenantId;
            }
        }
    }
}