using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Auth.Queries.GetUsersList
{
    public class GetUsersListQueryHandler : IRequestHandler<GetUsersListQuery, PaginatedList<UserListItemDto>>
    {
        private readonly IUserService _userService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<GetUsersListQueryHandler> _logger;

        public GetUsersListQueryHandler(
            IUserService userService,
            ICurrentUserService currentUserService,
            ILogger<GetUsersListQueryHandler> logger)
        {
            _userService = userService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<PaginatedList<UserListItemDto>> Handle(GetUsersListQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // Check if current user has permission to list users (usually admin or manager)
                if (!_currentUserService.IsInRole("Admin") && !_currentUserService.IsInRole("Manager"))
                {
                    _logger.LogWarning("User {UserId} attempted to access user list without permission", _currentUserService.UserId);
                    throw new Planca.Application.Common.Exceptions.ForbiddenAccessException();
                }

                // Get users from the user service
                var usersResult = await _userService.GetUsersAsync(
                    request.TenantId,
                    request.PageNumber,
                    request.PageSize,
                    request.SearchString,
                    request.Role,
                    request.SortBy,
                    request.SortAscending);

                if (!usersResult.Succeeded)
                {
                    _logger.LogError("Failed to retrieve users list");
                    return new PaginatedList<UserListItemDto>(new List<UserListItemDto>(), 0, request.PageNumber, request.PageSize);
                }

                // Create DTOs
                var userDtos = usersResult.Data.Items.Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Email = u.Email,
                    FullName = $"{u.FirstName} {u.LastName}",
                    Roles = u.Roles,
                    CreatedAt = u.CreatedAt,
                    IsActive = u.IsActive
                }).ToList();

                // Return paginated result
                return new PaginatedList<UserListItemDto>(
                    userDtos,
                    usersResult.Data.TotalCount,
                    request.PageNumber,
                    request.PageSize);
            }
            catch (Exception ex) when (!(ex is Planca.Application.Common.Exceptions.ForbiddenAccessException))
            {
                _logger.LogError(ex, "Error retrieving users list");
                throw;
            }
        }
    }
}