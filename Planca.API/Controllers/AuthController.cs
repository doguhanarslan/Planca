using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Planca.Application.Common.Interfaces;
using Planca.Application.Features.Auth.Commands.ChangePassword;
using Planca.Application.Features.Auth.Commands.Login;
using Planca.Application.Features.Auth.Commands.RefreshToken;
using Planca.Application.Features.Auth.Commands.Register;
using Planca.Application.Features.Auth.Queries.GetCurrentUser;
using Planca.Application.Features.Tenants.Commands.CreateBusiness;
using System;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    public class AuthController : BaseApiController
    {
        private readonly ICurrentUserService _currentUserService;

        public AuthController(ICurrentUserService currentUserService)
        {
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginCommand command)
        {
            var result = await Mediator.Send(command);

            if (result.Succeeded)
            {
                // Set JWT as HTTP-only cookie
                SetTokenCookie(result.Data.Token, result.Data.RefreshToken);

                // Return auth data WITHOUT including the token in the response body
                // This prevents the token from being stored in JavaScript
                return Ok(new
                {
                    userId = result.Data.UserId,
                    userName = result.Data.UserName,
                    roles = result.Data.Roles,
                    refreshToken = result.Data.RefreshToken // This is just a reference, not the auth token
                });
            }

            return Unauthorized(result.Errors);
        }

        /// <summary>
        /// Registers a new user account
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> Register(RegisterCommand command)
        {
            var result = await Mediator.Send(command);

            if (result.Succeeded)
            {
                // Set JWT as HTTP-only cookie
                SetTokenCookie(result.Data.Token, result.Data.RefreshToken);
            }

            return HandleActionResult(result);
        }

        /// <summary>
        /// Creates a new business and assigns it to the current user
        /// </summary>
        [HttpPost("create-business")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> CreateBusiness(CreateBusinessCommand command)
        {
            // Add current user ID
            string userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User identity not found" });
            }

            command.UserId = userId;
            var result = await Mediator.Send(command);

            if (result.Succeeded)
            {
                // Set new token as HTTP-only cookie
                SetTokenCookie(result.Data.Token,result.Data.RefreshToken);
            }

            return HandleActionResult(result);
        }

        /// <summary>
        /// Issues a new JWT token based on a valid refresh token
        /// </summary>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
        {
            // If body is empty, create a new command
            command ??= new RefreshTokenCommand();

            // Read token and refresh token from cookies and add to command
            if (Request.Cookies.TryGetValue("jwt", out var jwtCookie))
            {
                command.Token = jwtCookie;
            }

            if (Request.Cookies.TryGetValue("refreshToken", out var refreshCookie))
            {
                command.RefreshToken = refreshCookie;
            }

            var result = await Mediator.Send(command);

            if (result.Succeeded)
            {
                // Set new tokens as cookies
                SetTokenCookie(result.Data.Token, result.Data.RefreshToken);

                // Return user information without tokens in the response body
                return Ok(new
                {
                    userId = result.Data.UserId,
                    userName = result.Data.UserName,
                    email = result.Data.Email,
                    roles = result.Data.Roles,
                    tenantId = result.Data.TenantId
                });
            }

            return BadRequest(new { errors = result.Errors });
        }


        /// <summary>
        /// Logs out the current user by clearing the authentication cookie
        /// </summary>
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult Logout()
        {
            // Clear the JWT cookie
            Response.Cookies.Delete("jwt");
            Response.Cookies.Delete("refreshToken");


            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Returns the current authenticated user's information
        /// </summary>
        [HttpGet("current-user")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> GetCurrentUser()
        {
            var result = await Mediator.Send(new GetCurrentUserQuery());
            return HandleActionResult(result);
        }

        /// <summary>
        /// Changes the current user's password
        /// </summary>
        [HttpPost("change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> ChangePassword(ChangePasswordCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        // Helper method to set an HTTP-only cookie with the JWT token
        private void SetTokenCookie(string token,string refreshToken)
        {
            var JwtTokenCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddMinutes(30), // Cookie duration
                Secure = false, // Send only over HTTPS
                SameSite = SameSiteMode.Strict // CSRF protection
            };
            var RefreshTokenCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7), // Cookie duration
                Secure = false, // Send only over HTTPS
                SameSite = SameSiteMode.Strict // CSRF protection
            };
            Response.Cookies.Append("jwt", token, JwtTokenCookieOptions);

            Response.Cookies.Append("refreshToken", refreshToken, RefreshTokenCookieOptions);
        }
    }
}