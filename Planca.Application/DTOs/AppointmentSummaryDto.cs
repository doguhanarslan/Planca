using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.DTOs
{
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

        // Calculated properties
        public double CompletionRate => TotalAppointments > 0 ? (double)CompletedAppointments / TotalAppointments * 100 : 0;
        public double GuestAppointmentRate => TotalAppointments > 0 ? (double)GuestAppointments / TotalAppointments * 100 : 0;
        public decimal AverageRevenuePerAppointment => CompletedAppointments > 0 ? TotalRevenue / CompletedAppointments : 0;
    }
}
