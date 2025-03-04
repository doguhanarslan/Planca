using AutoMapper;
using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Employees.Queries.GetEmployeesList
{
    public class GetEmployeesListQueryHandler : IRequestHandler<GetEmployeesListQuery, PaginatedList<EmployeeDto>>
    {
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IMapper _mapper;

        public GetEmployeesListQueryHandler(
            IRepository<Employee> employeeRepository,
            IMapper mapper)
        {
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<PaginatedList<EmployeeDto>> Handle(GetEmployeesListQuery request, CancellationToken cancellationToken)
        {
            // Çalışan listesi için bir spesifikasyon oluştur
            var specification = new EmployeesFilterPagingSpecification(
                request.SearchString,
                request.IsActive,
                request.ServiceId,
                request.SortBy,
                request.SortAscending,
                request.PageSize,
                (request.PageNumber - 1) * request.PageSize
            );

            // Spesifikasyona göre çalışanları getir
            var employees = await _employeeRepository.ListAsync(specification);

            // Toplam çalışan sayısını getir
            var countSpecification = new EmployeesFilterSpecification(
                request.SearchString,
                request.IsActive,
                request.ServiceId);
            var totalEmployees = await _employeeRepository.CountAsync(countSpecification);

            // DTO'lara dönüştür
            var employeeDtos = _mapper.Map<List<EmployeeDto>>(employees);

            // Sayfalanmış sonuç oluştur
            return new PaginatedList<EmployeeDto>(
                employeeDtos,
                totalEmployees,
                request.PageNumber,
                request.PageSize);
        }
    }
}