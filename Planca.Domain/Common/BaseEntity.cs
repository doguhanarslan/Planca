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
        public Guid TenantId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string LastModifiedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
    }
}
