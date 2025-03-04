using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Employees.Queries.GetEmployeeDetail
{
    public class GetEmployeeDetailQueryHandler : IRequestHandler<GetEmployeeDetailQuery, Result<EmployeeDto>>
    {
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IMapper _mapper;

        public GetEmployeeDetailQueryHandler(
            IRepository<Employee> employeeRepository,
            IMapper mapper)
        {
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<Result<EmployeeDto>> Handle(GetEmployeeDetailQuery request, CancellationToken cancellationToken)
        {
            var employee = await _employeeRepository.GetByIdAsync(request.Id);

            if (employee == null)
            {
                throw new NotFoundException(nameof(Employee), request.Id);
            }

            // Tenant güvenlik kontrolü - TenantId'si uyuşmayan çalışanlara erişimi engelle
            if (employee.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            var employeeDto = _mapper.Map<EmployeeDto>(employee);

            return Result<EmployeeDto>.Success(employeeDto);
        }
    }
}