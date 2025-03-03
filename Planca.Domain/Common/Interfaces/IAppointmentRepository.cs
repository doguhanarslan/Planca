using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Planca.Domain.Entities;

namespace Planca.Domain.Common.Interfaces
{
    public interface IAppointmentRepository : IRepository<Appointment>
    {
        Task<IEnumerable<Appointment>> GetAppointmentsForEmployeeAsync(Guid employeeId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<Appointment>> GetAppointmentsForCustomerAsync(Guid customerId);
        Task<bool> IsTimeSlotAvailableAsync(Guid employeeId, DateTime startTime, DateTime endTime, Guid? excludeAppointmentId = null);
    }
}
