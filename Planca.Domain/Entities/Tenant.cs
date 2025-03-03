using Planca.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Entities
{
    public class Tenant : BaseEntity
    {
        public string Name { get; set; }
        public string Subdomain { get; set; }
        public string ConnectionString { get; set; }
        public string LogoUrl { get; set; }
        public string PrimaryColor { get; set; }
        public bool IsActive { get; set; }

        // For Tenant entity, the TenantId is the same as its Id
        public new Guid TenantId
        {
            get => Id;
            set => Id = value;
        }
    }
}
