using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Services.Commands.UpdateService
{
    public class UpdateServiceCommand : IRequest<Result<ServiceDto>>, ITenantRequest
    {
        // Güncellenecek servis ID'si
        public Guid Id { get; set; }

        // Servis bilgileri
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsActive { get; set; }
        public string Color { get; set; } = string.Empty;

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }

        public string CacheKeyToInvalidate => $"service_detail_{Id}";
        public string CacheKeyPatternToInvalidate =>
            "services_list|" +                  // All service lists
            $"service_employees_{Id}|" +        // Employees offering this service
            "appointments_list";                // Appointment lists showing service info
    }
}