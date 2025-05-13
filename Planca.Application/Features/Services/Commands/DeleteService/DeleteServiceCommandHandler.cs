using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Services.Commands.DeleteService
{
    public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand, Result>
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteServiceCommandHandler(
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            IRepository<Appointment> appointmentRepository,
            IUnitOfWork unitOfWork)
        {
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
        {
            // 1. Servisi veritabanından getir
            var service = await _serviceRepository.GetByIdAsync(request.Id);
            if (service == null)
            {
                throw new NotFoundException(nameof(Service), request.Id);
            }

            // 2. Tenant güvenlik kontrolü
            if (service.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // 3. Servisin gelecek randevuları var mı kontrol et
            var appointments = await _appointmentRepository.ListAsync(
                new Domain.Specifications.AppointmentsFilterSpecification(
                    startDate: System.DateTime.UtcNow,
                    serviceId: request.Id));

            if (appointments.Any())
            {
                return Result.Failure("Cannot delete service with future appointments. Please reschedule or delete the appointments first.");
            }

            // 4. Servisi kullanan çalışanları kontrol et ve onları güncelle
            var employeesWithService = await _employeeRepository.GetEmployeesByServiceIdAsync(request.Id);

            foreach (var employee in employeesWithService)
            {
                employee.ServiceIds.Remove(request.Id);
                await _employeeRepository.UpdateAsync(employee);
            }

            // 5. Servisi sil
            await _serviceRepository.DeleteAsync(service);

            // 6. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}