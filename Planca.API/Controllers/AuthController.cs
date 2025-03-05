using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Features.Auth.Commands.Login;
using Planca.Application.Features.Auth.Commands.Register;
using Planca.Application.Features.Auth.Commands.RefreshToken;
using Planca.Application.Features.Auth.Queries.GetCurrentUser;
using System.Threading.Tasks;
using Planca.Application.Features.Tenants.Commands.CreateBusiness;
using Planca.Application.Common.Interfaces;
namespace Planca.API.Controllers
{
    public class AuthController : BaseApiController
    {
        private readonly ICurrentUserService _currentUserService;
        public AuthController(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult> Login(LoginCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult> Register(RegisterCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpPost("create-business")]
        [Authorize] // Kullanıcı giriş yapmış olmalı
        public async Task<ActionResult> CreateBusiness(CreateBusinessCommand command)
        {
            // Mevcut kullanıcı ID'sini ekle
            command.UserId = _currentUserService.UserId;

            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult> RefreshToken(RefreshTokenCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleActionResult(result);
        }

        [HttpGet("current-user")]
        [Authorize]
        public async Task<ActionResult> GetCurrentUser()
        {
            var result = await Mediator.Send(new GetCurrentUserQuery());
            return HandleActionResult(result);
        }
    }
}