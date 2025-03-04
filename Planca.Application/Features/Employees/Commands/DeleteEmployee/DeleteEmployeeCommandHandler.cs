using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Employees.Commands.DeleteEmployee
{
    public class DeleteEmployeeCommandHandler : IRequestHandler<DeleteEmployeeCommand, Result>
    {
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAppointmentRepository _appointmentRepository;

        public DeleteEmployeeCommandHandler(
            IRepository<Employee> employeeRepository,
            IUnitOfWork unitOfWork,
            IAppointmentRepository appointmentRepository)
        {
            _employeeRepository = employeeRepository;
            _unitOfWork = unitOfWork;
            _appointmentRepository = appointmentRepository;
        }

        public async Task<Result> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
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

            // 3. Çalışanın randevuları var mı kontrol et
            var appointments = await _appointmentRepository.GetAppointmentsForEmployeeAsync(
                request.Id,
                System.DateTime.UtcNow,
                System.DateTime.UtcNow.AddYears(10));

            if (appointments.Any())
            {
                return Result.Failure("Cannot delete employee with future appointments. Please reassign or delete the appointments first.");
            }

            // 4. Çalışanı sil
            await _employeeRepository.DeleteAsync(employee);

            // 5. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}