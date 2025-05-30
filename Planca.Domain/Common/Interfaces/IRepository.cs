using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Common.Interfaces
{
    public interface IRepository<T> where T : BaseEntity, ITenantEntity
    {
        Task<T> GetByIdAsync(Guid id);
        Task<IReadOnlyList<T>> ListAllAsync();
        Task<IReadOnlyList<T>> ListAsync(ISpecification<T> spec);
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task HardDeleteAsync(T entity);
        Task<int> CountAsync(ISpecification<T> spec);
        Task<T> FirstOrDefaultAsync(ISpecification<T> spec);
        
        // Toplu veri getirme için metod
        Task<IReadOnlyList<T>> GetByIdsAsync(IEnumerable<Guid> ids);
        
        // Performans optimizasyonu için IQueryable<T> döndüren metot
        IQueryable<T> GetQuery(ISpecification<T> spec);
        
        // Soft delete related methods
        Task<T> GetByIdIncludeDeletedAsync(Guid id);
        Task<IReadOnlyList<T>> ListAllIncludeDeletedAsync();
        Task RestoreAsync(T entity);
    }
}
