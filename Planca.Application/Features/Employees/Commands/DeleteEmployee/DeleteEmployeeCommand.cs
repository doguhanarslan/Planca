using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.Common.Interfaces;
using System;

namespace Planca.Application.Features.Employees.Commands.DeleteEmployee
{
    public class DeleteEmployeeCommand : IRequest<Result>, ITenantRequest, ICacheInvalidatorCommand<Result>
    {
        // Silinecek çalışan kimliği
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }

        public string CacheKeyToInvalidate => $"employee_detail_{Id}";
        public string CacheKeyPatternToInvalidate => "employees_list";
    }
}