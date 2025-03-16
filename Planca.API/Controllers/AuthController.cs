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
                SetTokenCookie(result.Data.Token);

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
                SetTokenCookie(result.Data.Token);
            }

            return HandleActionResult(result);
        }

        /// <summary>
        /// Creates a new business and assigns it to the current user
        /// </summary>
        [HttpPost("create-business")]
        [Authorize]
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

            if (result.Succeeded && !string.IsNullOrEmpty(result.Data.AuthToken))
            {
                // Set new token as HTTP-only cookie
                SetTokenCookie(result.Data.AuthToken);
            }

            return HandleActionResult(result);
        }

        /// <summary>
        /// Issues a new JWT token based on a valid refresh token
        /// </summary>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult> RefreshToken(RefreshTokenCommand command)
        {
            var result = await Mediator.Send(command);

            if (result.Succeeded)
            {
                // Set the new JWT as HTTP-only cookie
                SetTokenCookie(result.Data.Token);

                // Return auth data WITHOUT including the token
                return Ok(new
                {
                    userId = result.Data.UserId,
                    userName = result.Data.UserName,
                    roles = result.Data.Roles,
                    refreshToken = result.Data.RefreshToken
                });
            }

            return BadRequest(result.Errors);
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

            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Returns the current authenticated user's information
        /// </summary>
        [HttpGet("current-user")]
        [Authorize]
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
        private void SetTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7), // Cookie duration
                Secure = true, // Send only over HTTPS
                SameSite = SameSiteMode.Strict // CSRF protection
            };

            Response.Cookies.Append("jwt", token, cookieOptions);
        }
    }
}