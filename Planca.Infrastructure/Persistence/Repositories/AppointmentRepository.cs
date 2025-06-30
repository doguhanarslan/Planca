using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Common.Enums;
using Planca.Infrastructure.Persistence.Context;
using Planca.Domain.Models;

namespace Planca.Infrastructure.Persistence.Repositories
{
    public class AppointmentRepository : BaseRepository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(ApplicationDbContext dbContext)
            : base(dbContext)
        {
        }

        // Mevcut metodlar
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
                           // Çakışma kontrolü
                           ((a.StartTime <= startTime && a.EndTime > startTime) ||
                            (a.StartTime < endTime && a.EndTime >= endTime) ||
                            (a.StartTime >= startTime && a.EndTime <= endTime)) &&
                           // İptal edilmiş randevuları dahil etme
                           a.Status != AppointmentStatus.Canceled &&
                           a.Status != AppointmentStatus.Rejected);

            if (excludeAppointmentId.HasValue)
            {
                query = query.Where(a => a.Id != excludeAppointmentId.Value);
            }

            return !(await query.AnyAsync());
        }

        // YENİ: Guest appointment metodları

        public async Task<IEnumerable<Appointment>> GetGuestAppointmentsByEmailAsync(string email)
        {
            return await _dbContext.Appointments
                .Where(a => a.IsGuestAppointment &&
                           a.GuestEmail.ToLower() == email.ToLower())
                .OrderByDescending(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<int> CountGuestAppointmentsByEmailAndDateRangeAsync(string email, DateTime startDate, DateTime endDate)
        {
            return await _dbContext.Appointments
                .Where(a => a.IsGuestAppointment &&
                           a.GuestEmail.ToLower() == email.ToLower() &&
                           a.StartTime >= startDate &&
                           a.StartTime < endDate &&
                           a.Status != AppointmentStatus.Canceled &&
                           a.Status != AppointmentStatus.Rejected)
                .CountAsync();
        }

        public async Task<IEnumerable<Appointment>> GetPendingAppointmentsAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10)
        {
            return await _dbContext.Appointments
                .Where(a => a.TenantId == tenantId &&
                           a.Status == AppointmentStatus.Pending)
                .Include(a => a.Service)
                .Include(a => a.Employee)
                .Include(a => a.Customer) // Null olabilir guest appointments için
                .OrderBy(a => a.StartTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetPendingAppointmentsCountAsync(Guid tenantId)
        {
            return await _dbContext.Appointments
                .Where(a => a.TenantId == tenantId &&
                           a.Status == AppointmentStatus.Pending)
                .CountAsync();
        }

        public async Task<IEnumerable<Appointment>> GetGuestAppointmentsAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 20)
        {
            var query = _dbContext.Appointments
                .Where(a => a.TenantId == tenantId && a.IsGuestAppointment);

            if (startDate.HasValue)
            {
                query = query.Where(a => a.StartTime >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(a => a.StartTime <= endDate.Value);
            }

            return await query
                .Include(a => a.Service)
                .Include(a => a.Employee)
                .OrderByDescending(a => a.StartTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByStatusAsync(Guid tenantId, AppointmentStatus status, int pageNumber = 1, int pageSize = 20)
        {
            return await _dbContext.Appointments
                .Where(a => a.TenantId == tenantId && a.Status == status)
                .Include(a => a.Service)
                .Include(a => a.Employee)
                .Include(a => a.Customer)
                .OrderByDescending(a => a.StartTime)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetPendingAppointmentsCountForEmployeeAsync(Guid employeeId)
        {
            return await _dbContext.Appointments
                .Where(a => a.EmployeeId == employeeId &&
                           a.Status == AppointmentStatus.Pending)
                .CountAsync();
        }

        public async Task<IEnumerable<Appointment>> GetTodaysAppointmentsAsync(Guid tenantId)
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            return await _dbContext.Appointments
                .Where(a => a.TenantId == tenantId &&
                           a.StartTime >= today &&
                           a.StartTime < tomorrow &&
                           a.Status != AppointmentStatus.Canceled &&
                           a.Status != AppointmentStatus.Rejected)
                .Include(a => a.Service)
                .Include(a => a.Employee)
                .Include(a => a.Customer)
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetThisWeeksAppointmentsAsync(Guid tenantId)
        {
            var startOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7);

            return await _dbContext.Appointments
                .Where(a => a.TenantId == tenantId &&
                           a.StartTime >= startOfWeek &&
                           a.StartTime < endOfWeek &&
                           a.Status != AppointmentStatus.Canceled &&
                           a.Status != AppointmentStatus.Rejected)
                .Include(a => a.Service)
                .Include(a => a.Employee)
                .Include(a => a.Customer)
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<Appointment> GetAppointmentByEmailAndIdAsync(string email, Guid appointmentId)
        {
            return await _dbContext.Appointments
                .Where(a => a.Id == appointmentId &&
                           a.IsGuestAppointment &&
                           a.GuestEmail.ToLower() == email.ToLower())
                .Include(a => a.Service)
                .Include(a => a.Employee)
                .FirstOrDefaultAsync();
        }

        public async Task<Dictionary<string, int>> GetGuestAppointmentStatsAsync(Guid tenantId, int lastDays = 30)
        {
            var startDate = DateTime.Today.AddDays(-lastDays);

            var stats = await _dbContext.Appointments
                .Where(a => a.TenantId == tenantId &&
                           a.IsGuestAppointment &&
                           a.CreatedAt >= startDate)
                .GroupBy(a => a.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);

            return stats;
        }

        public async Task<IEnumerable<Appointment>> GetConflictingAppointmentsAsync(Guid employeeId, DateTime startTime, DateTime endTime, Guid? excludeAppointmentId = null)
        {
            var query = _dbContext.Appointments
                .Where(a => a.EmployeeId == employeeId &&
                           // Çakışma kontrolü - detaylı
                           ((a.StartTime <= startTime && a.EndTime > startTime) ||
                            (a.StartTime < endTime && a.EndTime >= endTime) ||
                            (a.StartTime >= startTime && a.EndTime <= endTime) ||
                            (startTime <= a.StartTime && endTime > a.StartTime)) &&
                           // Aktif randevular
                           a.Status != AppointmentStatus.Canceled &&
                           a.Status != AppointmentStatus.Rejected);

            if (excludeAppointmentId.HasValue)
            {
                query = query.Where(a => a.Id != excludeAppointmentId.Value);
            }

            return await query
                .Include(a => a.Service)
                .Include(a => a.Customer)
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetEmployeeDayScheduleAsync(Guid employeeId, DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            return await _dbContext.Appointments
                .Where(a => a.EmployeeId == employeeId &&
                           a.StartTime >= startOfDay &&
                           a.StartTime < endOfDay &&
                           a.Status != AppointmentStatus.Canceled &&
                           a.Status != AppointmentStatus.Rejected)
                .Include(a => a.Service)
                .Include(a => a.Customer)
                .OrderBy(a => a.StartTime)
                .ToListAsync();
        }

        public async Task<AppointmentSummary> GetAppointmentSummaryAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _dbContext.Appointments.Where(a => a.TenantId == tenantId);

            if (startDate.HasValue)
            {
                query = query.Where(a => a.StartTime >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(a => a.StartTime <= endDate.Value);
            }

            var appointments = await query
                .Include(a => a.Service)
                .ToListAsync();

            var summary = new AppointmentSummary
            {
                TotalAppointments = appointments.Count,
                PendingAppointments = appointments.Count(a => a.Status == AppointmentStatus.Pending),
                ConfirmedAppointments = appointments.Count(a => a.Status == AppointmentStatus.Confirmed),
                CompletedAppointments = appointments.Count(a => a.Status == AppointmentStatus.Completed),
                CancelledAppointments = appointments.Count(a => a.Status == AppointmentStatus.Canceled),
                GuestAppointments = appointments.Count(a => a.IsGuestAppointment),
                RegisteredCustomerAppointments = appointments.Count(a => !a.IsGuestAppointment),
                TotalRevenue = appointments
                    .Where(a => a.Status == AppointmentStatus.Completed)
                    .Sum(a => a.Service?.Price ?? 0),
                AppointmentsByStatus = appointments
                    .GroupBy(a => a.Status.ToString())
                    .ToDictionary(g => g.Key, g => g.Count()),
                AppointmentsByDate = appointments
                    .GroupBy(a => a.StartTime.Date)
                    .ToDictionary(g => g.Key, g => g.Count())
            };

            return summary;
        }
    }
}