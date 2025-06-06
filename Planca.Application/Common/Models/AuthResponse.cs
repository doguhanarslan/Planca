﻿namespace Planca.Application.Common.Models
{
    public class AuthResponse
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string[] Roles { get; set; }
        public Guid? TenantId { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
    }
}