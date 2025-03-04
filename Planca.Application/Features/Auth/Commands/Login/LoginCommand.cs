using MediatR;
using Planca.Application.Common.Models;

namespace Planca.Application.Features.Auth.Commands.Login
{
    public class LoginCommand : IRequest<Result<AuthResponse>>
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}