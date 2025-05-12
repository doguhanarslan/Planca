using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Auth.Commands.RevokeRefreshToken
{
    public class RevokeRefreshTokenCommandHandler : IRequestHandler<RevokeRefreshTokenCommand, Result>
    {
        private readonly IIdentityService _identityService;
        private readonly ILogger<RevokeRefreshTokenCommandHandler> _logger;

        public RevokeRefreshTokenCommandHandler(IIdentityService identityService, ILogger<RevokeRefreshTokenCommandHandler> logger)
        {
            _identityService = identityService;
            _logger = logger;
        }

        public async Task<Result> Handle(RevokeRefreshTokenCommand request, CancellationToken cancellationToken)
        {
            try 
            {
                if (string.IsNullOrEmpty(request.UserId))
                {
                    _logger.LogWarning("RevokeRefreshTokenCommand: UserId eksik.");
                    return Result.Failure("User ID is required.");
                }

                // Refresh token'ı null ve expiry time'ı geçmiş bir tarih yaparak geçersiz kıl
                var result = await _identityService.UpdateUserRefreshTokenAsync(request.UserId, "", DateTime.UtcNow.AddYears(-1));

                if (result.Succeeded)
                {
                    _logger.LogInformation("Kullanıcı ({UserId}) için refresh token başarıyla geçersiz kılındı (revoke edildi).", request.UserId);
                }
                else
                {
                    _logger.LogError("Kullanıcı ({UserId}) için refresh token geçersiz kılınamadı. Hatalar: {Errors}", request.UserId, string.Join(", ", result.Errors ?? System.Array.Empty<string>()));
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Refresh token revoke işlemi sırasında hata oluştu. UserId: {UserId}", request.UserId);
                return Result.Failure($"Refresh token revoke işlemi başarısız: {ex.Message}");
            }
        }
    }
}