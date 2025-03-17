using MediatR;
using Planca.Application.Common.Models;

namespace Planca.Application.Features.Auth.Commands.RefreshToken
{
      public class RefreshTokenCommand : IRequest<Result<AuthResponse>>
        {
            public string Token { get; set; }
            public string RefreshToken { get; set; }
            public string TokenFromCookie { get; set; }
            public string RefreshTokenFromCookie { get; set; }

            public string GetEffectiveToken() => !string.IsNullOrEmpty(Token) ? Token : TokenFromCookie;
            public string GetEffectiveRefreshToken() => !string.IsNullOrEmpty(RefreshToken) ? RefreshToken : RefreshTokenFromCookie;
        }

   
}