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
    public class CustomerRepository : BaseRepository<Customer>, ICustomerRepository
    {
        public CustomerRepository(ApplicationDbContext dbContext)
            : base(dbContext)
        {
        }

        public async Task<Customer> GetCustomerByUserIdAsync(string userId)
        {
            return await _dbContext.Customers
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<bool> IsEmailUniqueAsync(string email, Guid? excludeId = null)
        {
            var query = _dbContext.Customers.AsQueryable();

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return !await query.AnyAsync(c => c.Email.ToLower() == email.ToLower());
        }

        public async Task<IEnumerable<Customer>> SearchCustomersAsync(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return await _dbContext.Customers.ToListAsync();

            searchTerm = searchTerm.ToLower();

            return await _dbContext.Customers
                .Where(c => c.FirstName.ToLower().Contains(searchTerm) ||
                           c.LastName.ToLower().Contains(searchTerm) ||
                           c.Email.ToLower().Contains(searchTerm) ||
                           c.PhoneNumber.Contains(searchTerm))
                .ToListAsync();
        }
    }
}