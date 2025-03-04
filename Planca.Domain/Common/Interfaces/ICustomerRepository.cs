using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;

namespace Planca.Domain.Common.Interfaces
{
    public interface ICustomerRepository : IRepository<Customer>
    {
        Task<Customer> GetCustomerByUserIdAsync(string userId);
        Task<bool> IsEmailUniqueAsync(string email, Guid? excludeId = null);
        Task<IEnumerable<Customer>> SearchCustomersAsync(string searchTerm);
    }
}