using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Planca.Domain.Common.Interfaces;

namespace Planca.Domain.Common
{
    public abstract class BaseEntity : ITenantEntity
    {
        public Guid Id { get; set; }
        public Guid TenantId { get; set; } = Guid.NewGuid();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "System";
        public string LastModifiedBy { get; set; } = "System";
        public DateTime? LastModifiedAt { get; set; } = DateTime.UtcNow;
        
        // Soft Delete properties
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public string? DeletedBy { get; set; }
    }
}
