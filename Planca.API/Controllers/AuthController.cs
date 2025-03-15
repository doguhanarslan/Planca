// Planca.API/Controllers/AuthController.cs
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.API.Controllers;
using Planca.Application.Common.Interfaces;
using Planca.Application.Features.Auth.Commands.Login;
using Planca.Application.Features.Auth.Commands.RefreshToken;
using Planca.Application.Features.Tenants.Commands.CreateBusiness;

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

        if (result.Succeeded)
        {
            // JWT'yi HTTP-only cookie olarak ayarla
            SetTokenCookie(result.Data.Token);
        }

        return HandleActionResult(result);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult> Register(RegisterCommand command)
    {
        var result = await Mediator.Send(command);

        if (result.Succeeded)
        {
            // JWT'yi HTTP-only cookie olarak ayarla
            SetTokenCookie(result.Data.Token);
        }

        return HandleActionResult(result);
    }

    [HttpPost("create-business")]
    public async Task<ActionResult> CreateBusiness(CreateBusinessCommand command)
    {
        // Mevcut kullanıcı ID'sini ekle
        string userId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User identity not found" });
        }

        command.UserId = userId;
        var result = await Mediator.Send(command);

        if (result.Succeeded && !string.IsNullOrEmpty(result.Data.AuthToken))
        {
            // Yeni token'ı HTTP-only cookie olarak ayarla
            SetTokenCookie(result.Data.AuthToken);
        }

        return HandleActionResult(result);
    }

    [HttpPost("refresh-token")]
    [AllowAnonymous]
    public async Task<ActionResult> RefreshToken(RefreshTokenCommand command)
    {
        var result = await Mediator.Send(command);

        if (result.Succeeded)
        {
            // Yeni JWT'yi HTTP-only cookie olarak ayarla
            SetTokenCookie(result.Data.Token);
        }

        return HandleActionResult(result);
    }

    // HTTP-only cookie ayarlama helper metodu
    private void SetTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = DateTime.UtcNow.AddDays(7), // Cookie süresi
            Secure = true, // HTTPS üzerinden gönder
            SameSite = SameSiteMode.Strict // CSRF koruması için
        };

        Response.Cookies.Append("jwt", token, cookieOptions);
    }
}