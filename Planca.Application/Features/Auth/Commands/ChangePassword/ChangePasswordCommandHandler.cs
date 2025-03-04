using MediatR;
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

        public ChangePasswordCommandHandler(
            IIdentityService identityService,
            ICurrentUserService currentUserService)
        {
            _identityService = identityService;
            _currentUserService = currentUserService;
        }

        public async Task<Result> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                // Kendi exception sınıfımızı kullanıyoruz, .NET Core sınıfı değil
                throw new Planca.Application.Common.Exceptions.UnauthorizedAccessException("User is not authenticated");
            }

            // Check if the user exists
            var userName = await _identityService.GetUserNameAsync(userId);
            if (string.IsNullOrEmpty(userName))
            {
                throw new NotFoundException("User", userId);
            }

            // Change the password
            var result = await _identityService.ChangePasswordAsync(
                userId, 
                request.CurrentPassword, 
                request.NewPassword);

            return result;
        }
    }
}