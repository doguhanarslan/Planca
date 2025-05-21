using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Customers.Commands.UpdateCustomer
{
    public class UpdateCustomerCommand : IRequest<Result<CustomerDto>>, ITenantRequest, ICacheInvalidatorCommand<Result<CustomerDto>>
    {
        // Güncellenecek müşteri kimliği
        public Guid Id { get; set; }

        // Temel bilgiler
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }

        // Notlar
        public string Notes { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }

        public string CacheKeyToInvalidate => null;
        public string CacheKeyPatternToInvalidate => "customers_list";
    }
}