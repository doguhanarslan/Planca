using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Planca.Domain.Entities;
using Planca.Domain.Models;
namespace Planca.Domain.Common.Interfaces
{
    public interface IAppointmentRepository : IRepository<Appointment>
    {
        // Mevcut metodlar
        Task<IEnumerable<Appointment>> GetAppointmentsForEmployeeAsync(Guid employeeId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<Appointment>> GetAppointmentsForCustomerAsync(Guid customerId);
        Task<bool> IsTimeSlotAvailableAsync(Guid employeeId, DateTime startTime, DateTime endTime, Guid? excludeAppointmentId = null);

        // YENİ: Guest appointment metodları

        /// <summary>
        /// Guest müşteri email'ine göre randevuları getir
        /// </summary>
        Task<IEnumerable<Appointment>> GetGuestAppointmentsByEmailAsync(string email);

        /// <summary>
        /// Belirli tarih aralığında guest email için randevu sayısını getir (spam protection için)
        /// </summary>
        Task<int> CountGuestAppointmentsByEmailAndDateRangeAsync(string email, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Onay bekleyen (Pending) randevuları getir
        /// </summary>
        Task<IEnumerable<Appointment>> GetPendingAppointmentsAsync(Guid tenantId, int pageNumber = 1, int pageSize = 10);

        /// <summary>
        /// Onay bekleyen randevu sayısını getir
        /// </summary>
        Task<int> GetPendingAppointmentsCountAsync(Guid tenantId);

        /// <summary>
        /// Guest appointment'ları (hem pending hem confirmed) getir
        /// </summary>
        Task<IEnumerable<Appointment>> GetGuestAppointmentsAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null, int pageNumber = 1, int pageSize = 20);

        /// <summary>
        /// Belirli durumda olan randevuları getir
        /// </summary>
        Task<IEnumerable<Appointment>> GetAppointmentsByStatusAsync(Guid tenantId, Domain.Common.Enums.AppointmentStatus status, int pageNumber = 1, int pageSize = 20);

        /// <summary>
        /// Employee için pending appointment sayısını getir
        /// </summary>
        Task<int> GetPendingAppointmentsCountForEmployeeAsync(Guid employeeId);

        /// <summary>
        /// Bugünün randevularını getir (dashboard için)
        /// </summary>
        Task<IEnumerable<Appointment>> GetTodaysAppointmentsAsync(Guid tenantId);

        /// <summary>
        /// Bu haftanın randevularını getir
        /// </summary>
        Task<IEnumerable<Appointment>> GetThisWeeksAppointmentsAsync(Guid tenantId);

        /// <summary>
        /// Appointment'ı email ile arama (guest appointments için)
        /// </summary>
        Task<Appointment> GetAppointmentByEmailAndIdAsync(string email, Guid appointmentId);

        /// <summary>
        /// Son X gün içindeki guest appointment istatistikleri
        /// </summary>
        Task<Dictionary<string, int>> GetGuestAppointmentStatsAsync(Guid tenantId, int lastDays = 30);

        /// <summary>
        /// Çakışan randevuları kontrol et (advanced check)
        /// </summary>
        Task<IEnumerable<Appointment>> GetConflictingAppointmentsAsync(Guid employeeId, DateTime startTime, DateTime endTime, Guid? excludeAppointmentId = null);

        /// <summary>
        /// Employee'nin belirli gündeki tüm randevularını getir
        /// </summary>
        Task<IEnumerable<Appointment>> GetEmployeeDayScheduleAsync(Guid employeeId, DateTime date);

        /// <summary>
        /// Tenant için appointment özet bilgileri
        /// </summary>
        Task<AppointmentSummary> GetAppointmentSummaryAsync(Guid tenantId, DateTime? startDate = null, DateTime? endDate = null);
    }

    // Özet bilgileri için DTO
    public class AppointmentSummaryDto
    {
        public int TotalAppointments { get; set; }
        public int PendingAppointments { get; set; }
        public int ConfirmedAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        public int GuestAppointments { get; set; }
        public int RegisteredCustomerAppointments { get; set; }
        public decimal TotalRevenue { get; set; }
        public Dictionary<string, int> AppointmentsByStatus { get; set; } = new();
        public Dictionary<DateTime, int> AppointmentsByDate { get; set; } = new();
    }
}