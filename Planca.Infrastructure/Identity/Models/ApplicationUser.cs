using System;
using Microsoft.AspNetCore.Identity;

namespace Planca.Infrastructure.Identity.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public Guid? TenantId { get; set; }
    }
}