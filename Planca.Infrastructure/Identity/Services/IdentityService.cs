using Microsoft.AspNetCore.Identity;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Infrastructure.Identity.Extensions;  // Extension method namespace'i eklendi
using Planca.Infrastructure.Identity.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Identity.Services
{
    public class IdentityService : IIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
       
        public IdentityService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<(Result Result, string UserId)> CreateUserAsync(UserCreationDto userDto)
        {
            var user = new ApplicationUser
            {
                UserName = userDto.UserName,
                Email = userDto.Email,
                EmailConfirmed = true,
                FirstName = userDto.FirstName ?? "", // Null koruması
                LastName = userDto.LastName ?? "",   // Null koruması
                PhoneNumber = userDto.PhoneNumber,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                RefreshToken = string.Empty,
                RefreshTokenExpiryTime = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, userDto.Password);
            return (result.ToApplicationResult(), user.Id);
        }

        public async Task<Result> UpdateUserTenantAsync(string userId, Guid tenantId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure(new[] { "User not found" });
            }

            user.TenantId = tenantId;
            var result = await _userManager.UpdateAsync(user);

            return result.ToApplicationResult();
        }

        public async Task<Result> DeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure(new[] { "User not found" });
            }

            var result = await _userManager.DeleteAsync(user);

            return result.ToApplicationResult();
        }

        public async Task<string> GetUserNameAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            return user?.UserName;
        }

        public async Task<(Result Result, string UserId)> FindByEmailAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                return (Result.Failure(new[] { "User not found" }), null);
            }

            return (Result.Success(), user.Id);
        }

        public async Task<bool> CheckUserPasswordAsync(string userId, string password)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return false;
            }

            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task<bool> IsInRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            return user != null && await _userManager.IsInRoleAsync(user, role);
        }

        public async Task<Result> AddToRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure(new[] { "User not found" });
            }

            var result = await _userManager.AddToRoleAsync(user, role);

            return result.ToApplicationResult();
        }

        public async Task<Result> RemoveFromRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure(new[] { "User not found" });
            }

            var result = await _userManager.RemoveFromRoleAsync(user, role);

            return result.ToApplicationResult();
        }

        public async Task<IList<string>> GetUserRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return new List<string>();
            }

            return await _userManager.GetRolesAsync(user);
        }

        public async Task<Result> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure(new[] { "User not found" });
            }

            var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);

            return result.ToApplicationResult();
        }

        public async Task<string> GeneratePasswordResetTokenAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return null;
            }

            return await _userManager.GeneratePasswordResetTokenAsync(user);
        }

        public async Task<Result> ResetPasswordAsync(string userId, string token, string newPassword)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure(new[] { "User not found" });
            }

            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            return result.ToApplicationResult();
        }

        public async Task<Result> UpdateUserRefreshTokenAsync(string userId, string refreshToken, DateTime refreshTokenExpiryTime)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure(new[] { "User not found" });
            }

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = refreshTokenExpiryTime;

            var result = await _userManager.UpdateAsync(user);

            return result.ToApplicationResult();
        }

        public async Task<Result<(string RefreshToken, DateTime ExpiryTime)>> GetUserRefreshTokenAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result<(string, DateTime)>.Failure("User not found");
            }

            return Result<(string, DateTime)>.Success((user.RefreshToken, user.RefreshTokenExpiryTime));
        }

        public async Task<Result<UserBasicData>> GetUserBasicDataAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result<UserBasicData>.Failure("User not found");
            }

            // Check that the required fields aren't null
            if (string.IsNullOrEmpty(user.FirstName) || string.IsNullOrEmpty(user.LastName))
            {
                // Log warning but don't fail - use empty strings instead
                Console.WriteLine("User {UserId} has missing name information", userId);
            }
            var roles = await _userManager.GetRolesAsync(user);
            var userData = new UserBasicData
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName ?? "",
                LastName = user.LastName ?? "",
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                TenantId = user.TenantId,
                // Include these additional properties
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                Roles = roles.ToArray()
            };

            return Result<UserBasicData>.Success(userData);
        }

        public async Task<Result> UpdateUserBasicDataAsync(string userId, UserBasicData userData)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result.Failure(new[] { "User not found" });
            }

            user.FirstName = userData.FirstName;
            user.LastName = userData.LastName;
            user.Email = userData.Email;
            user.PhoneNumber = userData.PhoneNumber;
            user.TenantId = userData.TenantId;

            var result = await _userManager.UpdateAsync(user);

            return result.ToApplicationResult();
        }
    }

    // Extension method to convert Identity result to our application result
    public static class IdentityResultExtensions
    {
        public static Result ToApplicationResult(this IdentityResult identityResult)
        {
            return identityResult.Succeeded
                ? Result.Success()
                : Result.Failure(identityResult.Errors.Select(e => e.Description).ToArray());
        }
    }
}