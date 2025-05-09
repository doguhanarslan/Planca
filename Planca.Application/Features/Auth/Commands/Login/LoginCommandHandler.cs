using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Auth.Commands.Login
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<AuthResponse>>
    {
        private readonly IIdentityService _identityService;
        private readonly ITokenService _tokenService;
        private readonly IAppSettings _appSettings;
        private readonly ILogger<LoginCommandHandler> _logger;

        public LoginCommandHandler(
            IIdentityService identityService,
            ITokenService tokenService,
            IAppSettings appSettings,
            ILogger<LoginCommandHandler> logger)
        {
            _identityService = identityService;
            _tokenService = tokenService;
            _appSettings = appSettings;
            _logger = logger;
        }

        // In LoginCommandHandler.cs
        public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Find user by email
                var userResult = await _identityService.FindByEmailAsync(request.Email);
                if (!userResult.Result.Succeeded)
                {
                    _logger.LogWarning("Login failed: User with email {Email} not found", request.Email);
                    return Result<AuthResponse>.Failure("Invalid email or password");
                }

                var userId = userResult.UserId;

                // Check password
                var isPasswordValid = await _identityService.CheckUserPasswordAsync(userId, request.Password);
                if (!isPasswordValid)
                {
                    _logger.LogWarning("Login failed: Invalid password for user {Email}", request.Email);
                    return Result<AuthResponse>.Failure("Invalid email or password");
                }

                // Get user roles
                var roles = await _identityService.GetUserRolesAsync(userId);

                // Get user data
                var userDataResult = await _identityService.GetUserBasicDataAsync(userId);
                if (!userDataResult.Succeeded)
                {
                    _logger.LogError("Failed to retrieve user data for {UserId}", userId);
                    return Result<AuthResponse>.Failure("Failed to retrieve user data");
                }

                // Generate JWT token
                var token = _tokenService.CreateToken(
                    userId,
                    request.Email,
                    roles,
                    userDataResult.Data.TenantId?.ToString());

                // Generate refresh token
                var refreshToken = Guid.NewGuid().ToString();
                var refreshTokenExpiryDays = _appSettings.RefreshTokenExpiryDays;
                var refreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshTokenExpiryDays);

                // Store refresh token
                await _identityService.UpdateUserRefreshTokenAsync(userId, refreshToken, refreshTokenExpiryTime);

                // Create response
                var response = new AuthResponse
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    UserId = userId,
                    UserName = $"{userDataResult.Data.FirstName} {userDataResult.Data.LastName}",
                    Email = request.Email,
                    TenantId = userDataResult.Data.TenantId,
                    Roles = roles.ToArray(),
                    RefreshTokenExpiryTime = refreshTokenExpiryTime
                };

                _logger.LogInformation("User {Email} logged in successfully", request.Email);
                return Result<AuthResponse>.Success(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {Email}", request.Email);
                return Result<AuthResponse>.Failure($"An error occurred during login: {ex.Message}");
            }
        }
    }
}