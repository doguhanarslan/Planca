using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Employees.Queries.GetEmployeesByService
{
    public class GetEmployeesByServiceQueryHandler : IRequestHandler<GetEmployeesByServiceQuery, Result<List<EmployeeDto>>>
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;

        public GetEmployeesByServiceQueryHandler(
            IEmployeeRepository employeeRepository,
            IServiceRepository serviceRepository,
            IMapper mapper)
        {
            _employeeRepository = employeeRepository;
            _serviceRepository = serviceRepository;
            _mapper = mapper;
        }

        public async Task<Result<List<EmployeeDto>>> Handle(GetEmployeesByServiceQuery request, CancellationToken cancellationToken)
        {
            // Servisin var olduğunu ve tenant'a ait olduğunu kontrol et
            var service = await _serviceRepository.GetByIdAsync(request.ServiceId);
            if (service == null)
            {
                throw new NotFoundException(nameof(Service), request.ServiceId);
            }

            if (service.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // Servise göre çalışanları getir
            var employees = await _employeeRepository.GetEmployeesByServiceIdAsync(request.ServiceId);

            // Sadece aktif çalışanları filtreleme
            if (request.ActiveOnly)
            {
                employees = employees.Where(e => e.IsActive).ToList();
            }

            // DTO'ya dönüştür
            var employeeDtos = _mapper.Map<List<EmployeeDto>>(employees);

            return Result<List<EmployeeDto>>.Success(employeeDtos);
        }
    }
}