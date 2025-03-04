using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Infrastructure.Identity.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Identity.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<string> GetUserNameAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return user?.UserName;
        }

        public async Task<Result<UserBasicData>> GetUserBasicDataAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                return Result<UserBasicData>.Failure("User not found");
            }

            // Get user roles
            var roles = await _userManager.GetRolesAsync(user);

            var userData = new UserBasicData
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                TenantId = user.TenantId,
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
                return Result.Failure("User not found");
            }

            user.FirstName = userData.FirstName;
            user.LastName = userData.LastName;
            user.Email = userData.Email;
            user.PhoneNumber = userData.PhoneNumber;
            user.TenantId = userData.TenantId;
            user.IsActive = userData.IsActive;

            var result = await _userManager.UpdateAsync(user);

            return result.Succeeded
                ? Result.Success()
                : Result.Failure(result.Errors.Select(e => e.Description).ToArray());
        }

        public async Task<Result<PaginatedList<UserBasicData>>> GetUsersAsync(
            Guid tenantId,
            int pageNumber,
            int pageSize,
            string searchString = null,
            string role = null,
            string sortBy = null,
            bool sortAscending = true)
        {
            try
            {
                // Base query - filter by tenant
                IQueryable<ApplicationUser> usersQuery = _userManager.Users
                    .Where(u => u.TenantId == tenantId);

                // Apply search filter
                if (!string.IsNullOrEmpty(searchString))
                {
                    searchString = searchString.ToLower();
                    usersQuery = usersQuery.Where(u =>
                        u.UserName.ToLower().Contains(searchString) ||
                        u.Email.ToLower().Contains(searchString) ||
                        u.FirstName.ToLower().Contains(searchString) ||
                        u.LastName.ToLower().Contains(searchString));
                }

                // Apply role filter if needed
                if (!string.IsNullOrEmpty(role))
                {
                    // Role filtresi için daha etkili bir yöntem kullanabiliriz
                    var roleId = await _roleManager.Roles
                        .Where(r => r.Name == role)
                        .Select(r => r.Id)
                        .FirstOrDefaultAsync();

                    if (!string.IsNullOrEmpty(roleId))
                    {
                        var userIdsInRole = await _userManager.GetUsersInRoleAsync(role);
                        var userIds = userIdsInRole.Select(u => u.Id).ToList();
                        usersQuery = usersQuery.Where(u => userIds.Contains(u.Id));
                    }
                }

                // Calculate total count before pagination
                var totalCount = await usersQuery.CountAsync();

                // Apply sorting
                if (!string.IsNullOrEmpty(sortBy))
                {
                    usersQuery = sortBy.ToLower() switch
                    {
                        "username" => sortAscending
                            ? usersQuery.OrderBy(u => u.UserName)
                            : usersQuery.OrderByDescending(u => u.UserName),
                        "email" => sortAscending
                            ? usersQuery.OrderBy(u => u.Email)
                            : usersQuery.OrderByDescending(u => u.Email),
                        "fullname" => sortAscending
                            ? usersQuery.OrderBy(u => u.LastName).ThenBy(u => u.FirstName)
                            : usersQuery.OrderByDescending(u => u.LastName).ThenByDescending(u => u.FirstName),
                        "createdat" => sortAscending
                            ? usersQuery.OrderBy(u => u.CreatedAt)
                            : usersQuery.OrderByDescending(u => u.CreatedAt),
                        _ => sortAscending
                            ? usersQuery.OrderBy(u => u.UserName)
                            : usersQuery.OrderByDescending(u => u.UserName)
                    };
                }
                else
                {
                    // Default sorting
                    usersQuery = usersQuery.OrderBy(u => u.UserName);
                }

                // Apply pagination
                usersQuery = usersQuery
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize);

                // Execute query and get results
                var users = await usersQuery.ToListAsync();

                // Map to DTOs and include roles
                var userDtos = new List<UserBasicData>();
                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    userDtos.Add(new UserBasicData
                    {
                        Id = user.Id,
                        UserName = user.UserName,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email,
                        PhoneNumber = user.PhoneNumber,
                        TenantId = user.TenantId,
                        CreatedAt = user.CreatedAt,
                        IsActive = user.IsActive,
                        Roles = roles.ToArray()
                    });
                }

                // Create paginated result
                return Result<PaginatedList<UserBasicData>>.Success(
                    new PaginatedList<UserBasicData>(userDtos, totalCount, pageNumber, pageSize));
            }
            catch (Exception ex)
            {
                return Result<PaginatedList<UserBasicData>>.Failure($"Error retrieving users: {ex.Message}");
            }
        }
    }
}