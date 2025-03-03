using System;

namespace Planca.Application.DTOs
{
    public class TenantDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Subdomain { get; set; }
        public string LogoUrl { get; set; }
        public string PrimaryColor { get; set; }
        public bool IsActive { get; set; }
    }
}