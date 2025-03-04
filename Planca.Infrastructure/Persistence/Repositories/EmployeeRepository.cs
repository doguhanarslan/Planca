using Microsoft.EntityFrameworkCore;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Infrastructure.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Persistence.Repositories
{
    public class EmployeeRepository : BaseRepository<Employee>, IEmployeeRepository
    {
        private readonly IAppointmentRepository _appointmentRepository;

        public EmployeeRepository(
            ApplicationDbContext dbContext,
            IAppointmentRepository appointmentRepository)
            : base(dbContext)
        {
            _appointmentRepository = appointmentRepository;
        }

        public async Task<IEnumerable<Employee>> GetActiveEmployeesAsync()
        {
            return await _dbContext.Employees
                .Where(e => e.IsActive)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();
        }

        public async Task<Employee> GetEmployeeByUserIdAsync(string userId)
        {
            return await _dbContext.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId);
        }

        public async Task<IEnumerable<Employee>> GetEmployeesByServiceIdAsync(Guid serviceId)
        {
            return await _dbContext.Employees
                .Where(e => e.ServiceIds.Contains(serviceId) && e.IsActive)
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToListAsync();
        }

        public async Task<bool> IsEmployeeAvailableAsync(Guid employeeId, DateTime startTime, DateTime endTime, Guid? excludeAppointmentId = null)
        {
            // Çalışan müsait mi diye kontrol et - önce randevulara bak
            var isTimeSlotAvailable = await _appointmentRepository.IsTimeSlotAvailableAsync(
                employeeId, startTime, endTime, excludeAppointmentId);

            if (!isTimeSlotAvailable)
                return false;

            // Çalışanın çalışma saatlerini kontrol et
            var employee = await GetByIdAsync(employeeId);
            if (employee == null || !employee.IsActive)
                return false;

            return employee.IsAvailable(startTime, endTime);
        }
    }
}