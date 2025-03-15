using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, Result<AuthResponse>>
    {
        private readonly IIdentityService _identityService;
        private readonly ITokenService _tokenService;
        private readonly IAppSettings _appSettings;
        private readonly ILogger<RefreshTokenCommandHandler> _logger;

        public RefreshTokenCommandHandler(
            IIdentityService identityService,
            ITokenService tokenService,
            IAppSettings appSettings,
            ILogger<RefreshTokenCommandHandler> logger)
        {
            _identityService = identityService;
            _tokenService = tokenService;
            _appSettings = appSettings;
            _logger = logger;
        }

        public async Task<Result<AuthResponse>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Validate the JWT token format
                if (!_tokenService.ValidateToken(request.Token))
                {
                    _logger.LogWarning("Invalid token format during refresh token request");
                    return Result<AuthResponse>.Failure("Invalid token format");
                }

                // Extract user ID from the token - Infrastructure katmanına delegasyon
                var userId = _tokenService.GetUserIdFromToken(request.Token);

                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("Could not extract user ID from token during refresh");
                    return Result<AuthResponse>.Failure("Invalid token");
                }

                // Check if user exists
                var userName = await _identityService.GetUserNameAsync(userId);
                if (string.IsNullOrEmpty(userName))
                {
                    _logger.LogWarning("User {UserId} not found during token refresh", userId);
                    return Result<AuthResponse>.Failure("User not found");
                }

                // Get stored refresh token
                var storedTokenResult = await _identityService.GetUserRefreshTokenAsync(userId);
                if (!storedTokenResult.Succeeded)
                {
                    _logger.LogWarning("Failed to retrieve refresh token for user {UserId}", userId);
                    return Result<AuthResponse>.Failure("Invalid refresh token");
                }

                var (storedRefreshToken, expiryTime) = storedTokenResult.Data;

                // Validate refresh token
                if (storedRefreshToken != request.RefreshToken)
                {
                    _logger.LogWarning("Refresh token mismatch for user {UserId}", userId);
                    return Result<AuthResponse>.Failure("Invalid refresh token");
                }

                // Check if refresh token is expired
                if (expiryTime <= DateTime.UtcNow)
                {
                    _logger.LogWarning("Expired refresh token for user {UserId}", userId);
                    return Result<AuthResponse>.Failure("Refresh token expired");
                }

                // Get user data
                var userDataResult = await _identityService.GetUserBasicDataAsync(userId);
                if (!userDataResult.Succeeded)
                {
                    _logger.LogError("Failed to retrieve user data for {UserId} during token refresh", userId);
                    return Result<AuthResponse>.Failure("Failed to retrieve user data");
                }

                // Get user roles
                var roles = await _identityService.GetUserRolesAsync(userId);

                // Generate new JWT token
                var newToken = _tokenService.CreateToken(
                    userId,
                    userDataResult.Data.Email,
                    roles,
                    userDataResult.Data.TenantId?.ToString());

                // Generate new refresh token
                var newRefreshToken = Guid.NewGuid().ToString();
                var refreshTokenExpiryDays = _appSettings.RefreshTokenExpiryDays;
                var newExpiryTime = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);

                // Store new refresh token
                await _identityService.UpdateUserRefreshTokenAsync(userId, newRefreshToken, newExpiryTime);

                // Create response
                var response = new AuthResponse
                {
                    Token = newToken,
                    RefreshToken = newRefreshToken,
                    UserId = userId,
                    UserName = $"{userDataResult.Data.FirstName} {userDataResult.Data.LastName}",
                    Email = userDataResult.Data.Email,
                    Roles = roles.ToArray(),
                    TenantId = userDataResult.Data.TenantId
                };

                _logger.LogInformation("Token refreshed successfully for user {UserId}", userId);
                return Result<AuthResponse>.Success(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return Result<AuthResponse>.Failure($"Token refresh failed: {ex.Message}");
            }
        }
    }
}