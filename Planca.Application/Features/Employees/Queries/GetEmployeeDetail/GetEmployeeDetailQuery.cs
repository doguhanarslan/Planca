using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Employees.Queries.GetEmployeeDetail
{
    public class GetEmployeeDetailQuery : IRequest<Result<EmployeeDto>>, ITenantRequest, ICacheableQuery<Result<EmployeeDto>>
{
    // Existing properties
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    
    // New properties for caching
    public string CacheKey => $"employee_detail_{Id}";
    public TimeSpan? CacheDuration => TimeSpan.FromMinutes(30);
    public bool BypassCache { get; set; } = false;
}
}