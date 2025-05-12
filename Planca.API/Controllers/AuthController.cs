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
using Planca.Application.Features.Auth.Commands.RevokeRefreshToken;
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
                SetTokenCookie(result.Data.Token, result.Data.RefreshToken, result.Data.RefreshTokenExpiryTime);

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
                SetTokenCookie(result.Data.Token, result.Data.RefreshToken, result.Data.RefreshTokenExpiryTime);

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
                    SetTokenCookie(result.Data.Token, result.Data.RefreshToken, result.Data.RefreshTokenExpiryTime);

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

            // Refresh token'ı hem doğrudan servisten hem de cookie'den al
            if (Request.Cookies.TryGetValue("refreshToken", out var refreshCookie))
            {
                Console.WriteLine($"RefreshToken cookie found, length: {refreshCookie?.Length ?? 0}");
                command.RefreshTokenFromCookie = refreshCookie;
            }
            else
            {
                Console.WriteLine("RefreshToken cookie not found");
            }

            // Doğrudan servisten alma metodunu da dene
            var refreshFromService = _tokenService.GetRefreshToken();
            if (!string.IsNullOrEmpty(refreshFromService))
            {
                Console.WriteLine($"RefreshToken from service found, length: {refreshFromService.Length}");
                command.RefreshToken = refreshFromService;
            }
            else if (!string.IsNullOrEmpty(command.RefreshTokenFromCookie))
            {
                // Cookie'de refresh token varsa, doğrudan onu kullan
                command.RefreshToken = command.RefreshTokenFromCookie;
            }

            var result = await Mediator.Send(command);

            if (result.Succeeded)
            {
                Console.WriteLine("Refresh token operation successful");

                // Set new encrypted tokens as cookies
                SetTokenCookie(result.Data.Token, result.Data.RefreshToken, result.Data.RefreshTokenExpiryTime);

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
        public async Task<ActionResult> Logout()
        {
            try 
            {
                // 1. Mevcut kullanıcı kimliğini al
                var userId = _currentUserService.UserId;
                
                // 2. Veritabanında refresh token'ı iptal et
                if (!string.IsNullOrEmpty(userId))
                {
                    try
                    {
                        // RevokeRefreshTokenCommand kullanarak veritabanından token'ı sil
                        var revokeCommand = new Planca.Application.Features.Auth.Commands.RevokeRefreshToken.RevokeRefreshTokenCommand { UserId = userId };
                        var result = await Mediator.Send(revokeCommand);
                        
                        if (!result.Succeeded)
                        {
                            Console.WriteLine($"Kullanıcı {userId} için refresh token silinirken bir hata oluştu: {string.Join(", ", result.Errors)}");
                            // Hatayı logla ama işleme devam et
                        }
                        else
                        {
                            Console.WriteLine($"Kullanıcı {userId} için refresh token veritabanından silindi");
                        }
                    }
                    catch (Exception tokenEx)
                    {
                        Console.WriteLine($"Refresh token silme işlemi sırasında hata: {tokenEx.Message}");
                        // Hatayı logla ama yine de işleme devam et
                    }
                }
                else
                {
                    Console.WriteLine("Çıkış yapılırken kullanıcı ID'si bulunamadı!");
                }

                // 3. Cookie'leri temizle - her durumda deneyelim
                try
                {
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
                    
                    Console.WriteLine("Kullanıcı çıkış yaptı, cookie'ler temizlendi");
                }
                catch (Exception cookieEx)
                {
                    Console.WriteLine($"Cookie'leri silerken hata: {cookieEx.Message}");
                    // Hatayı logla ama devam et
                }

                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Logout error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { error = "Çıkış yapılırken bir hata oluştu" });
            }
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
        private void SetTokenCookie(string token, string refreshToken = null, DateTime? refreshTokenExpiry = null)
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

            Response.Cookies.Append("jwt", token, jwtTokenCookieOptions);
            
            // Refresh token'ı cookie'ye ekle
            if (!string.IsNullOrEmpty(refreshToken))
            {
                // KONTROL: Eğer refreshTokenExpiry null ise, loglayalım ve fallback kullanmak yerine
                // güvenlik nedeniyle daha kısa bir süre kullanılacak (1 gün)
                if (refreshTokenExpiry == null)
                {
                    Console.WriteLine("UYARI: refreshTokenExpiry değeri null, bu bir güvenlik riski olabilir!");
                    Console.WriteLine("İleriki geliştirmelerde RefreshTokenExpiryTime kontrolü ekleyin veya LoginCommandHandler.cs, RegisterCommandHandler.cs, " +
                                    "ve diğer handler'larda bu değerin mutlaka ayarlanmasını sağlayın!");
                    
                    // Güvenlik nedeniyle kısa bir fallback süresi (1 gün)
                    refreshTokenExpiry = DateTime.UtcNow.AddDays(1);
                }
                
                var refreshTokenCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                    // Güvenlik için doğrulanmış süreci kullan
                    Expires = refreshTokenExpiry.Value,
                Path = "/api/Auth", // Sadece refresh endpoint'inde kullanılabilir
                Secure = true, // Send only over HTTPS
                SameSite = SameSiteMode.None, // CSRF protection
                IsEssential = true
            };

                Response.Cookies.Append("refreshToken", refreshToken, refreshTokenCookieOptions);
                Console.WriteLine($"Refresh token added to cookies, length: {refreshToken.Length}, expires: {refreshTokenCookieOptions.Expires}");
            }
        }
    }
}