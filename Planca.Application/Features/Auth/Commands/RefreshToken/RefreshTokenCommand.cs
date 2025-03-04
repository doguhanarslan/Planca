using MediatR;
using Planca.Application.Common.Models;

namespace Planca.Application.Features.Auth.Commands.RefreshToken
{
    public class RefreshTokenCommand : IRequest<Result<AuthResponse>>
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}