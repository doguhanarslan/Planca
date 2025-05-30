using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Planca.Application.Common.Interfaces;
using Planca.Domain.Common;

namespace Planca.Infrastructure.Persistence.Interceptors
{
    public class AuditableEntitySaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IDateTime _dateTime;

        public AuditableEntitySaveChangesInterceptor(
            ICurrentUserService currentUserService,
            IDateTime dateTime)
        {
            _currentUserService = currentUserService;
            _dateTime = dateTime;
        }

        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            UpdateEntities(eventData.Context);

            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            UpdateEntities(eventData.Context);

            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void UpdateEntities(DbContext context)
        {
            if (context == null)
                return;

            foreach (var entry in context.ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = _dateTime.UtcNow;

                    // Only override CreatedBy if it wasn't already set
                    if (string.IsNullOrEmpty(entry.Entity.CreatedBy))
                    {
                        // Use "System" as fallback when UserId is null
                        entry.Entity.CreatedBy = _currentUserService.UserId ?? "System";
                    }
                }

                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.LastModifiedAt = _dateTime.UtcNow;

                    // Use "System" as fallback when UserId is null
                    entry.Entity.LastModifiedBy = _currentUserService.UserId ?? "System";
                    
                    // Handle soft delete
                    if (entry.Entity.IsDeleted && entry.Entity.DeletedAt == null)
                    {
                        entry.Entity.DeletedAt = _dateTime.UtcNow;
                        entry.Entity.DeletedBy = _currentUserService.UserId ?? "System";
                    }
                }
            }
        }
    }
}