﻿using System;

namespace Planca.Application.Common.Models
{
    public class UserBasicData
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public Guid? TenantId { get; set; }

        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public string[] Roles { get; set; }
    }
}