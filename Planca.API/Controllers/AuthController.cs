using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Features.Auth.Commands.Login;
using Planca.Application.Features.Auth.Commands.Register;
using Planca.Application.Features.Auth.Commands.RefreshToken;
using Planca.Application.Features.Auth.Queries.GetCurrentUser;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    public class AuthController : BaseApiController
    {
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult> Login(LoginCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult> Register(RegisterCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult> RefreshToken(RefreshTokenCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        [HttpGet("current-user")]
        [Authorize]
        public async Task<ActionResult> GetCurrentUser()
        {
            var result = await Mediator.Send(new GetCurrentUserQuery());
            return HandleResult(result);
        }
    }
}