using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Employees.Queries.GetEmployeeDetail
{
    public class GetEmployeeDetailQuery : IRequest<Result<EmployeeDto>>, ITenantRequest
    {
        // Görüntülenecek çalışan kimliği
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid? TenantId { get; set; }
    }
}