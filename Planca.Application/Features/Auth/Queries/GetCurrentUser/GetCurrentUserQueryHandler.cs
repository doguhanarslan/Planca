using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System.Data;
using System.Threading;
using System.Threading.Tasks;
using UnauthorizedAccessException = Planca.Application.Common.Exceptions.UnauthorizedAccessException;

namespace Planca.Application.Features.Auth.Queries.GetCurrentUser
{
    public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, Result<UserDto>>
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserService _userService;
        private readonly ILogger<GetCurrentUserQueryHandler> _logger;
        private readonly ITokenService _tokenService;
        public GetCurrentUserQueryHandler(
            ICurrentUserService currentUserService,
            IUserService userService,
            ILogger<GetCurrentUserQueryHandler> logger,
            ITokenService tokenService)
        {
            _currentUserService = currentUserService;
            _userService = userService;
            _logger = logger;
            _tokenService = tokenService;
        }

        public async Task<Result<UserDto>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
        {
            // Get current user ID from the token
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("GetCurrentUser failed: No authenticated user");
                throw new UnauthorizedAccessException("User is not authenticated");
            }

            request.SetUserId(userId); // Set userId for cache key generation

            // Get user basic data - artık IUserService'ten alıyoruz
            var userDataResult = await _userService.GetUserBasicDataAsync(userId);
            if (!userDataResult.Succeeded)
            {
                _logger.LogError("Failed to retrieve user data for {UserId}", userId);
                return Result<UserDto>.Failure("Failed to retrieve user data");
            }

            // Create DTO
            var userDto = new UserDto
            {
                Id = userId,
                UserName = userDataResult.Data.Email,
                Email = userDataResult.Data.Email,
                FirstName = userDataResult.Data.FirstName,
                LastName = userDataResult.Data.LastName,
                PhoneNumber = userDataResult.Data.PhoneNumber,
                TenantId = userDataResult.Data.TenantId.ToString(),
                Roles = userDataResult.Data.Roles // UserBasicData'da roller var
            };

            return Result<UserDto>.Success(userDto);
        }
    }
}