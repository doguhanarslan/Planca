using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;

namespace Planca.Application.Features.Employees.Commands.CreateEmployee
{
    public class CreateEmployeeCommand : IRequest<Result<EmployeeDto>>, ITenantRequest
    {
        // Temel bilgiler
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        // İsteğe bağlı Identity bağlantısı
        public string? UserId { get; set; }

        // Çalışanın hizmet verebileceği servisler
        public List<Guid> ServiceIds { get; set; } = new List<Guid>();

        // Çalışma saatleri
        public List<WorkingHoursDto> WorkingHours { get; set; } = new List<WorkingHoursDto>();

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
    }
}