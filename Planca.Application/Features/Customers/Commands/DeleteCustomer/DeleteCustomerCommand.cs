using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Customers.Commands.DeleteCustomer
{
    public class DeleteCustomerCommand : IRequest<Result>, ITenantRequest, ICacheInvalidatorCommand<Result>
    {
        // Silinecek müşteri kimliği
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }

        public string CacheKeyToInvalidate => $"customer_detail_{Id}";
        public string CacheKeyPatternToInvalidate =>
            "customers_list|" +             // All customer lists
            $"customer_appointments_{Id}|" + // This customer's appointments
            "appointments_list";            // Appointment lists that display customer info
    }
}