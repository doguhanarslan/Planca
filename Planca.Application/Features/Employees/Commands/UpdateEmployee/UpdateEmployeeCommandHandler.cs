using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.ValueObjects;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Employees.Commands.UpdateEmployee
{
    public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, Result<EmployeeDto>>
    {
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public UpdateEmployeeCommandHandler(
            IRepository<Employee> employeeRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _employeeRepository = employeeRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<EmployeeDto>> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
        {
            // 1. Çalışanı veritabanından getir
            var employee = await _employeeRepository.GetByIdAsync(request.Id);
            if (employee == null)
            {
                throw new NotFoundException(nameof(Employee), request.Id);
            }

            // 2. Tenant güvenlik kontrolü
            if (employee.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // 3. Temel bilgileri güncelle
            employee.FirstName = request.FirstName;
            employee.LastName = request.LastName;
            employee.Email = request.Email;
            employee.PhoneNumber = request.PhoneNumber;
            employee.Title = request.Title;
            employee.IsActive = request.IsActive;
            employee.ServiceIds = request.ServiceIds;
            employee.LastModifiedBy = _currentUserService.UserId ?? "System";
            employee.LastModifiedAt = DateTime.UtcNow;

            // 4. Çalışma saatlerini güncelle
            employee.WorkingHours.Clear();
            foreach (var workingHoursDto in request.WorkingHours)
            {
                employee.WorkingHours.Add(new WorkingHours
                {
                    DayOfWeek = workingHoursDto.DayOfWeek,
                    StartTime = workingHoursDto.StartTime,
                    EndTime = workingHoursDto.EndTime,
                    IsWorkingDay = workingHoursDto.IsWorkingDay
                });
            }

            // 5. Repository'de güncelle
            await _employeeRepository.UpdateAsync(employee);

            // 6. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 7. DTO'ya dönüştür ve sonucu döndür
            var employeeDto = _mapper.Map<EmployeeDto>(employee);
            return Result<EmployeeDto>.Success(employeeDto);
        }
    }
}