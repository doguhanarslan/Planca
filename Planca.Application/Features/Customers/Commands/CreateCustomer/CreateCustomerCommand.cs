using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Customers.Commands.CreateCustomer
{
    public class CreateCustomerCommand : IRequest<Result<CustomerDto>>, ITenantRequest
    {
        // Basic information
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }

        // Notes
        public string Notes { get; set; }

        // ID of the user, if this customer is linked to a user account
        public string UserId { get; set; }

        // Tenant ID will be filled automatically by TenantBehavior
        public Guid TenantId { get; set; }
    }
}