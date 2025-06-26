using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Commands.DeleteAppointment
{
    public class DeleteAppointmentCommandHandler : IRequestHandler<DeleteAppointmentCommand, Result>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;

        public DeleteAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IUnitOfWork unitOfWork,
            ICacheService cacheService)
        {
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
        }

        public async Task<Result> Handle(DeleteAppointmentCommand request, CancellationToken cancellationToken)
        {
            // 1. Get the appointment with related entities
            var appointment = await _appointmentRepository.GetByIdAsync(request.Id);
            if (appointment == null)
            {
                throw new NotFoundException(nameof(Appointment), request.Id);
            }

            // 2. Tenant security check
            if (appointment.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // 3. Check if appointment can be deleted
            if (appointment.Status == Domain.Common.Enums.AppointmentStatus.Completed)
            {
                return Result.Failure("Cannot delete a completed appointment");
            }

            // Store IDs for cache invalidation BEFORE deletion
            var employeeId = appointment.EmployeeId;
            var customerId = appointment.CustomerId;
            var appointmentId = appointment.Id;
            var tenantId = appointment.TenantId;

            // 4. Delete the appointment
            await _appointmentRepository.DeleteAsync(appointment);

            // 5. Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 6. IMMEDIATE CACHE CLEARING with optimized patterns
            try 
            {
                // Clear specific cache entries first for immediate effect
                var specificPatterns = new[]
                {
                    $"appointment_detail_{appointmentId}",
                    $"appointments_list",
                    $"employee_appointments_{employeeId}",
                    $"customer_appointments_{customerId}",
                    "dashboard",
                    "employees_list"
                };

                // Clear specific entries immediately
                foreach (var pattern in specificPatterns)
                {
                    await _cacheService.RemoveByPatternAsync(pattern);
                }

                // Clear broader patterns for consistency
                var broadPatterns = new[]
                {
                    "appointments", "employee_appointments", "customer_appointments",
                    "services_list", "employees", "customers"
                };

                foreach (var pattern in broadPatterns)
                {
                    await _cacheService.RemoveByPatternAsync(pattern);
                }
                
                System.Diagnostics.Debug.WriteLine($"🔄 Optimized cache invalidation completed for appointment {appointmentId}");
            }
            catch (Exception ex)
            {
                // Don't fail the operation if cache invalidation fails, just log it
                System.Diagnostics.Debug.WriteLine($"❌ Cache invalidation failed: {ex.Message}");
            }

            return Result.Success();
        }
    }
}