using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;

namespace Planca.Application.Features.Customers.Commands.DeleteCustomer
{
    public class DeleteCustomerCommand : IRequest<Result>, ITenantRequest
    {
        // Silinecek müşteri kimliği
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
    }
}