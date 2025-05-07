using MediatR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
        private readonly ITokenService _tokenService;

        public AuthController(ICurrentUserService currentUserService, ITokenService tokenService)
        {
            _currentUserService = currentUserService;
            _tokenService = tokenService;
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
                Console.WriteLine($"Login successful for: {command.Email}");
                Console.WriteLine($"Token length: {result.Data.Token?.Length ?? 0}");

                // Set JWT as HTTP-only cookie
                SetTokenCookie(result.Data.Token);

                // Get token from cookie to verify it was set properly
                var tokenFromCookie = Request.Cookies["jwt"];
                Console.WriteLine($"Token in cookie after setting: {(string.IsNullOrEmpty(tokenFromCookie) ? "Not found" : "Found, length=" + tokenFromCookie.Length)}");

                // Return auth data WITHOUT including the token in the response body
                return Ok(new
                {
                    userId = result.Data.UserId,
                    userName = result.Data.UserName,
                    roles = result.Data.Roles,
                    isAuthenticated = true
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
                // Set encrypted JWT as HTTP-only cookie
                SetTokenCookie(result.Data.Token);

                return Ok(new
                {
                    userId = result.Data.UserId,
                    userName = result.Data.UserName,
                    email = result.Data.Email,
                    isAuthenticated = true
                });
            }

            return HandleActionResult(result);
        }

        /// <summary>
        /// Creates a new business and assigns it to the current user
        /// </summary>
        [HttpPost("create-business")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> CreateBusiness(CreateBusinessCommand command)
        {
            try
            {
                // Hem HttpContext.User hem de token üzerinden kullanıcı kimliğini almaya çalış
                string userId = _currentUserService.UserId;

                // Eğer hala userId boşsa, hatayı log'la ve unauthorized döndür
                if (string.IsNullOrEmpty(userId))
                {
                    Console.WriteLine("UserId not found in token or HttpContext.User");
                    Console.WriteLine($"IsAuthenticated: {_currentUserService.IsAuthenticated}");
                    var token = _tokenService.GetToken();
                    Console.WriteLine($"Token exists: {!string.IsNullOrEmpty(token)}");

                    return Unauthorized(new { error = "User identity not found" });
                }

                command.UserId = userId;
                var result = await Mediator.Send(command);

                if (result.Succeeded)
                {
                    // Set new token with TenantId as HTTP-only cookie
                    SetTokenCookie(result.Data.Token);

                    // Return success response
                    return Ok(new
                    {
                        businessId = result.Data.Id,
                        businessName = result.Data.Name,
                        tenantId = result.Data.Id,
                        success = true
                    });
                }

                return HandleActionResult(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CreateBusiness error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Issues a new JWT token based on a valid refresh token
        /// </summary>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        public async Task<ActionResult> RefreshToken([FromBody] RefreshTokenCommand command = null)
        {
            Console.WriteLine("Refresh token endpoint called");

            // If body is empty, create a new command
            command ??= new RefreshTokenCommand();

            // Read token and refresh token from cookies
            if (Request.Cookies.TryGetValue("jwt", out var jwtCookie))
            {
                Console.WriteLine($"JWT cookie found, length: {jwtCookie?.Length ?? 0}");
                command.TokenFromCookie = jwtCookie;
            }
            else
            {
                Console.WriteLine("JWT cookie not found");
            }

            command.RefreshToken = _tokenService.GetRefreshToken();

          

            var result = await Mediator.Send(command);

            if (result.Succeeded)
            {
                Console.WriteLine("Refresh token operation successful");

                // Set new encrypted tokens as cookies
                SetTokenCookie(result.Data.Token);

                // Return user information without tokens in the response body
                return Ok(new
                {
                    userId = result.Data.UserId,
                    userName = result.Data.UserName,
                    email = result.Data.Email,
                    roles = result.Data.Roles,
                    isAuthenticated = true
                });
            }
            else
            {
                Console.WriteLine($"Refresh token operation failed: {string.Join(", ", result.Errors)}");
            }

            // Token geçersizse çerezleri temizle
            Response.Cookies.Delete("jwt");
            

            return BadRequest(new { errors = result.Errors });
        }

        /// <summary>
        /// Logs out the current user by clearing the authentication cookie
        /// </summary>
        [HttpPost("logout")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult Logout()
        {
            // Clear the JWT and refresh token cookies with secure options
            var options = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(-1) // Geçmiş bir tarih ayarlayarak cookie'yi siler
            };

            Response.Cookies.Delete("jwt", new CookieOptions
            {
                Path = "/",
                Secure = true,
                SameSite = SameSiteMode.None
            });

            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                Path = "/api/Auth",
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Returns the current authenticated user's information
        /// </summary>
        [HttpGet("current-user")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> GetCurrentUser()
        {
            try
            {
                // CurrentUserService'den TenantId'yi doğrudan al
                var tenantId = _currentUserService.TenantId;
                Console.WriteLine($"Controller - TenantId from CurrentUserService: {tenantId ?? "null"}");

                var result = await Mediator.Send(new GetCurrentUserQuery());

                if (result.Succeeded)
                {
                    // Manuel olarak yeni bir anonim nesne oluştur ve TenantId'yi ekle
                    var userData = new
                    {
                        id = result.Data.Id,
                        userName = result.Data.UserName,
                        email = result.Data.Email,
                        roles = result.Data.Roles,
                        tenantId = result.Data.TenantId,
                        // TenantId'yi direkt olarak service'den al
                        isAuthenticated = true
                    };

                    // Yanıtı tam olarak logla
                    Console.WriteLine($"Sending response to frontend: {System.Text.Json.JsonSerializer.Serialize(userData)}");

                    return Ok(userData);
                }

                return HandleActionResult(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetCurrentUser error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Changes the current user's password
        /// </summary>
        [HttpPost("change-password")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> ChangePassword(ChangePasswordCommand command)
        {
            var result = await Mediator.Send(command);
            return HandleResult(result);
        }

        // Helper method to set HTTP-only cookies with the JWT token and refresh token
        private void SetTokenCookie(string token)
        {
            var jwtTokenCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddSeconds(30), // Cookie duration
                Secure = true, // Send only over HTTPS
                SameSite = SameSiteMode.None, // CSRF protection
                IsEssential = true,
                Path = "/"
            };

            var refreshTokenCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7), // Cookie duration
                Path = "/api/Auth", // Sadece refresh endpoint'inde kullanılabilir
                Secure = true, // Send only over HTTPS
                SameSite = SameSiteMode.None, // CSRF protection
                IsEssential = true
            };

            Response.Cookies.Append("jwt", token, jwtTokenCookieOptions);
           
        }
    }
}