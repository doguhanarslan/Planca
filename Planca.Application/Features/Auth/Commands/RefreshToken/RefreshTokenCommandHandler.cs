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
                // Log the refresh token process start
                _logger.LogInformation("Refresh token işlemi başlatıldı");

                // Get refresh token from request or cookie
                string refreshToken = request.GetEffectiveRefreshToken();

                _logger.LogInformation("RefreshToken from request: {RefreshTokenLength}",
                    refreshToken?.Length ?? 0);

                // If refresh token is null, log and return failure
             
                // Find user by refresh token - THIS IS THE KEY CHANGE
                // We directly use the refresh token to find the user in the database
                // This doesn't require the JWT token to be valid
                var userByRefreshTokenResult = await _identityService.GetUserByRefreshTokenAsync(refreshToken);

                if (!userByRefreshTokenResult.Succeeded || string.IsNullOrEmpty(userByRefreshTokenResult.Data?.Id))
                {
                    _logger.LogWarning("Could not find user with the given refresh token");
                    return Result<AuthResponse>.Failure("Invalid refresh token");
                }

                var userId = userByRefreshTokenResult.Data.Id;
                _logger.LogInformation("User found by refresh token. UserId: {UserId}", userId);

                // Get stored refresh token details from database
                var storedTokenResult = await _identityService.GetUserRefreshTokenAsync(userId);
                if (!storedTokenResult.Succeeded)
                {
                    _logger.LogWarning("Failed to retrieve refresh token for user {UserId}", userId);
                    return Result<AuthResponse>.Failure("Invalid refresh token");
                }

                var (storedRefreshToken, expiryTime) = storedTokenResult.Data;

                // Validate refresh token from database matches the one we received
                if (storedRefreshToken != refreshToken)
                {
                    _logger.LogWarning("Refresh token mismatch for user {UserId}", userId);
                    return Result<AuthResponse>.Failure("Invalid refresh token");
                }

                // Check if refresh token is expired
                if (expiryTime <= DateTime.UtcNow)
                {
                    _logger.LogWarning("Expired refresh token for user {UserId}. Expiry: {ExpiryTime}, Now: {Now}",
                        userId, expiryTime, DateTime.UtcNow);
                    return Result<AuthResponse>.Failure("Refresh token expired");
                }

                // The rest of your code remains the same...
                bool refreshTokenNeedsRenewal = expiryTime <= DateTime.UtcNow.AddDays(1); // 1 gün kala yenileme

                // Get user data
                var userDataResult = await _identityService.GetUserBasicDataAsync(userId);
                if (!userDataResult.Succeeded)
                {
                    _logger.LogError("Failed to retrieve user data for {UserId} during token refresh", userId);
                    return Result<AuthResponse>.Failure("Failed to retrieve user data");
                }

                // Get user roles
                var roles = await _identityService.GetUserRolesAsync(userId);

                // Create new JWT token
                var newToken = _tokenService.CreateToken(
                    userId,
                    userDataResult.Data.Email,
                    roles,
                    userDataResult.Data.TenantId?.ToString() ?? string.Empty);

                string responseRefreshToken = refreshToken;
                DateTime responseExpiryTime = expiryTime;

                if (refreshTokenNeedsRenewal)
                {
                    _logger.LogInformation("Refresh token expiry is approaching, creating new refresh token for user {UserId}", userId);

                    // Create new refresh token only if needed
                    responseRefreshToken = Guid.NewGuid().ToString();
                    
                    // ÖNEMLİ: Burada orijinal süreyi koruyoruz, yeniden süre belirlemiyoruz
                    // Orijinal süreyi koruyarak güvenlik açığını kapatıyoruz
                    responseExpiryTime = expiryTime; // Orijinal süreyi koru

                    // Update refresh token in database
                    await _identityService.UpdateUserRefreshTokenAsync(userId, responseRefreshToken, responseExpiryTime);

                    _logger.LogInformation("New refresh token created for user {UserId}. Expires at: {ExpiryTime} (original expiry preserved)",
                        userId, responseExpiryTime);
                }
                else
                {
                    _logger.LogInformation("Using existing valid refresh token for user {UserId}. Expires at: {ExpiryTime}",
                        userId, expiryTime);
                }

                // Create response
                var response = new AuthResponse
                {
                    Token = newToken,
                    RefreshToken = responseRefreshToken,
                    UserId = userId,
                    UserName = $"{userDataResult.Data.FirstName} {userDataResult.Data.LastName}",
                    Email = userDataResult.Data.Email,
                    Roles = roles.ToArray(),
                    TenantId = userDataResult.Data.TenantId,
                    RefreshTokenExpiryTime = responseExpiryTime
                };

                _logger.LogInformation("Token refreshed successfully for user {UserId}. New JWT token created.", userId);
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