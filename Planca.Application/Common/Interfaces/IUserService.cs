using System;
using System.Threading.Tasks;
using Planca.Application.Common.Models;

namespace Planca.Application.Common.Interfaces
{
    /// <summary>
    /// Kullanıcı bilgilerinin yönetimi ve sorgulanması için arayüz.
    /// IIdentityService'in sorumluluklarının bir kısmını taşır.
    /// </summary>
    public interface IUserService
    {
        Task<string> GetUserNameAsync(string userId);
        Task<Result<UserBasicData>> GetUserBasicDataAsync(string userId);
        Task<Result> UpdateUserBasicDataAsync(string userId, UserBasicData userData);

        Task<Result<PaginatedList<UserBasicData>>> GetUsersAsync(
            Guid tenantId,
            int pageNumber,
            int pageSize,
            string searchString = null,
            string role = null,
            string sortBy = null,
            bool sortAscending = true);
    }
}