using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using System;

namespace Planca.Application.Features.Employees.Commands.DeleteEmployee
{
    public class DeleteEmployeeCommand : IRequest<Result>, ITenantRequest
    {
        // Silinecek çalışan kimliği
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
    }
}