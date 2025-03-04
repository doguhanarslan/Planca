using AutoMapper;
using MediatR;
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

namespace Planca.Application.Features.Employees.Commands.CreateEmployee
{
    public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, Result<EmployeeDto>>
    {
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public CreateEmployeeCommandHandler(
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

        public async Task<Result<EmployeeDto>> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
        {
            // 1. Employee entity'si oluştur
            var employee = new Employee
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Title = request.Title,
                IsActive = request.IsActive,
                UserId = request.UserId ?? string.Empty,
                ServiceIds = request.ServiceIds,
                TenantId = request.TenantId,
                CreatedBy = _currentUserService.UserId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            // 2. Çalışma saatlerini ekle
            if (request.WorkingHours != null && request.WorkingHours.Any())
            {
                employee.WorkingHours = request.WorkingHours.Select(wh => new WorkingHours
                {
                    DayOfWeek = wh.DayOfWeek,
                    StartTime = wh.StartTime,
                    EndTime = wh.EndTime,
                    IsWorkingDay = wh.IsWorkingDay
                }).ToList();
            }

            // 3. Repository'ye kaydet
            await _employeeRepository.AddAsync(employee);

            // 4. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 5. DTO'ya dönüştür ve sonucu döndür
            var employeeDto = _mapper.Map<EmployeeDto>(employee);
            return Result<EmployeeDto>.Success(employeeDto);
        }
    }
}