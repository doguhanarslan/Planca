using System;
using Planca.Domain.Common;

namespace Planca.Domain.Entities
{
    public class TenantWorkingHours : BaseEntity
    {
        public Guid TenantId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation property
        public Tenant Tenant { get; set; }
    }
}