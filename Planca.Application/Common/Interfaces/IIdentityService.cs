using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Planca.Application.Common.Models;

namespace Planca.Application.Common.Interfaces
{
    public interface IIdentityService
    {
        // User management
        Task<(Result Result, string UserId)> CreateUserAsync(UserCreationDto userDto);
        Task<Result> DeleteUserAsync(string userId);
        Task<string> GetUserNameAsync(string userId);
        Task<(Result Result, string UserId)> FindByEmailAsync(string email);
        Task<bool> CheckUserPasswordAsync(string userId, string password);

        // Role management
        Task<bool> IsInRoleAsync(string userId, string role);
        Task<Result> AddToRoleAsync(string userId, string role);
        Task<Result> RemoveFromRoleAsync(string userId, string role);
        Task<IList<string>> GetUserRolesAsync(string userId);

        // Password management
        Task<Result> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<string> GeneratePasswordResetTokenAsync(string userId);
        Task<Result> ResetPasswordAsync(string userId, string token, string newPassword);

        // Token management
        Task<Result> UpdateUserRefreshTokenAsync(string userId, string refreshToken, DateTime refreshTokenExpiryTime);
        Task<Result<(string RefreshToken, DateTime ExpiryTime)>> GetUserRefreshTokenAsync(string userId);

        // User data
        Task<Result<UserBasicData>> GetUserBasicDataAsync(string userId);
        Task<Result> UpdateUserBasicDataAsync(string userId, UserBasicData userData);

        // Tenant management
        Task<Result> UpdateUserTenantAsync(string userId, Guid tenantId);
    }
}