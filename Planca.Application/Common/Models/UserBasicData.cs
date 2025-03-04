using System;

namespace Planca.Application.Common.Models
{
    /// <summary>
    /// Temel kullanıcı bilgilerini içeren model
    /// </summary>
    public class UserBasicData
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public Guid? TenantId { get; set; }
    }
}