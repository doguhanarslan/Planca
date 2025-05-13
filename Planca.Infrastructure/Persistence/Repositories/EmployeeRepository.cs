using Microsoft.EntityFrameworkCore;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Specifications;
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
            // Önce veritabanından verileri çekelim
            var employees = await _dbContext.Employees
                .Where(e => e.IsActive)
                .AsNoTracking()
                .ToListAsync();
            
            // Sonra memory'de ServiceIds filtrelemesini yapalım
            return employees
                .Where(e => e.ServiceIds != null && e.ServiceIds.Contains(serviceId))
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .ToList();
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
        
        // Spesifikasyon kullanarak listeleme - özellikle ServiceId filtrelemesi için özel işlem
        public override async Task<IReadOnlyList<Employee>> ListAsync(ISpecification<Employee> spec)
        {
            // EmployeesFilterSpecification'dan ServiceId alıyoruz
            Guid? serviceIdFilter = null;
            if (spec is EmployeesFilterSpecification employeeSpec)
            {
                serviceIdFilter = employeeSpec.ServiceIdFilter;
            }
            
            // Temel sorguyu oluştur
            var query = ApplySpecification(spec);
            
            // Önce veritabanından çalışanları getir
            var employees = await query.ToListAsync();
            
            // ServiceId filtresi varsa, memory'de uygula (Entity Framework bunu SQL'e çeviremediği için)
            if (serviceIdFilter.HasValue)
            {
                employees = employees
                    .Where(e => e.ServiceIds != null && e.ServiceIds.Contains(serviceIdFilter.Value))
                    .ToList();
            }
            
            return employees;
        }
        
        // SpecificationEvaluator'a erişim sağlamak için protected olarak tanımladık
        protected IQueryable<Employee> ApplySpecification(ISpecification<Employee> spec)
        {
            return SpecificationEvaluator<Employee>.GetQuery(_dbContext.Set<Employee>().AsQueryable(), spec);
        }
    }
}