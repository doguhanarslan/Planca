using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using System;

namespace Planca.Application.Features.Auth.Commands.Register
{
    public class RegisterCommand : IRequest<Result<AuthResponse>>, ITenantRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }

        // Default to customer role
        public string Role { get; set; } = "Customer";

        // Will be set by TenantBehavior
        public Guid TenantId { get; set; }
    }
}