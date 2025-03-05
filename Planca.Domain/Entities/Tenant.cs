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

        // Adres bilgileri
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }

        // Çalışma saatleri koleksiyonu
        public List<TenantWorkingHours> WorkingHours { get; set; } = new List<TenantWorkingHours>();

        // For Tenant entity, the TenantId is the same as its Id
        public new Guid TenantId
        {
            get => Id;
            set => Id = value;
        }
    }
}
