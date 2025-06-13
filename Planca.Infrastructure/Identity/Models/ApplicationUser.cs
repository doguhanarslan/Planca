using System;
using Microsoft.AspNetCore.Identity;

namespace Planca.Infrastructure.Identity.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Guid? TenantId { get; set; }

        // Refresh Token özellikleri - Updated to match database schema
        public string RefreshTokenId { get; set; }
        public string HashedRefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }

        // Eklenen yeni özellikler
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}