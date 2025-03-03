using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;

namespace Planca.Domain.Common.Interfaces
{
    public interface IEmployeeRepository : IRepository<Employee>
    {
        Task<IEnumerable<Employee>> GetEmployeesByServiceIdAsync(Guid serviceId);
        Task<IEnumerable<Employee>> GetActiveEmployeesAsync();
        Task<Employee> GetEmployeeByUserIdAsync(string userId);
        Task<bool> IsEmployeeAvailableAsync(Guid employeeId, DateTime startTime, DateTime endTime, Guid? excludeAppointmentId = null);
    }
}