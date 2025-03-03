using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Infrastructure.Persistence.Context;

namespace Planca.Infrastructure.Persistence.Repositories
{
    public class AppointmentRepository : BaseRepository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(ApplicationDbContext dbContext)
            : base(dbContext)
        {
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsForEmployeeAsync(Guid employeeId, DateTime startDate, DateTime endDate)
        {
            return await _dbContext.Appointments
                .Where(a => a.EmployeeId == employeeId &&
                            a.StartTime >= startDate &&
                            a.EndTime <= endDate)
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsForCustomerAsync(Guid customerId)
        {
            return await _dbContext.Appointments
                .Where(a => a.CustomerId == customerId)
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<bool> IsTimeSlotAvailableAsync(Guid employeeId, DateTime startTime, DateTime endTime, Guid? excludeAppointmentId = null)
        {
            var query = _dbContext.Appointments
                .Where(a => a.EmployeeId == employeeId &&
                           ((a.StartTime <= startTime && a.EndTime > startTime) ||
                            (a.StartTime < endTime && a.EndTime >= endTime) ||
                            (a.StartTime >= startTime && a.EndTime <= endTime)));

            if (excludeAppointmentId.HasValue)
            {
                query = query.Where(a => a.Id != excludeAppointmentId.Value);
            }

            // If any appointments are found in this time range, the slot is not available
            return !(await query.AnyAsync());
        }
    }
}