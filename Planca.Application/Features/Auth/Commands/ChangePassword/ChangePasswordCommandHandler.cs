using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Auth.Commands.ChangePassword
{
    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Result>
    {
        private readonly IIdentityService _identityService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<ChangePasswordCommandHandler> _logger;

        public ChangePasswordCommandHandler(
            IIdentityService identityService,
            ICurrentUserService currentUserService,
            ILogger<ChangePasswordCommandHandler> logger)
        {
            _identityService = identityService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            // Verify user is authenticated
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                throw new Planca.Application.Common.Exceptions.UnauthorizedAccessException("User is not authenticated");
            }

            // Check if the user exists
            var userName = await _identityService.GetUserNameAsync(userId);
            if (string.IsNullOrEmpty(userName))
            {
                _logger.LogWarning("User ID {UserId} not found when attempting to change password", userId);
                throw new NotFoundException("User", userId);
            }

            // Verify current password is correct before attempting to change
            var passwordValid = await _identityService.CheckUserPasswordAsync(userId, request.CurrentPassword);
            if (!passwordValid)
            {
                _logger.LogWarning("Invalid current password provided for user {UserName}", userName);
                return Result.Failure("Current password is incorrect");
            }

            // Confirm that new password and confirmation match (this should be caught by validator but good as a fallback)
            if (request.NewPassword != request.ConfirmNewPassword)
            {
                return Result.Failure("New password and confirmation do not match");
            }

            // Change the password
            var result = await _identityService.ChangePasswordAsync(
                userId,
                request.CurrentPassword,
                request.NewPassword);

            if (result.Succeeded)
            {
                _logger.LogInformation("Password changed successfully for user {UserName}", userName);
            }
            else
            {
                _logger.LogWarning("Password change failed for user {UserName}", userName);
            }

            return result;
        }
    }
}