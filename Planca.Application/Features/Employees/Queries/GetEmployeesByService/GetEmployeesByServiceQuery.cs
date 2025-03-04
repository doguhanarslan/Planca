using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;

namespace Planca.Application.Features.Employees.Queries.GetEmployeesByService
{
    public class GetEmployeesByServiceQuery : IRequest<Result<List<EmployeeDto>>>, ITenantRequest
    {
        // Servis ID'si
        public Guid ServiceId { get; set; }

        // Sadece aktif çalışanları getir (opsiyonel)
        public bool ActiveOnly { get; set; } = true;

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
    }
}