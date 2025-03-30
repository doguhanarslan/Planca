using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Planca.Application.Common.Interfaces;

namespace Planca.Infrastructure.Identity.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITokenService _tokenService;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, ITokenService tokenService)
        {
            _httpContextAccessor = httpContextAccessor;
            _tokenService = tokenService;
        }
        public string TenantId
        {
            get
            {
                Console.WriteLine("CurrentUserService.TenantId property accessed");

                // Önce HttpContext.User'dan almayı deneyin
                if (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true)
                {
                    var tenantClaim = _httpContextAccessor.HttpContext.User.FindFirst("TenantId");
                    if (tenantClaim != null && !string.IsNullOrEmpty(tenantClaim.Value) &&
                        tenantClaim.Value != Guid.Empty.ToString())
                    {
                        Console.WriteLine($"Found TenantId from HttpContext.User: {tenantClaim.Value}");
                        return tenantClaim.Value;
                    }

                    // Claim'leri logla
                    Console.WriteLine("Searching all claims for tenant...");
                    foreach (var claim in _httpContextAccessor.HttpContext.User.Claims)
                    {
                        Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
                        if (claim.Type.Contains("tenant", StringComparison.OrdinalIgnoreCase) &&
                            !string.IsNullOrEmpty(claim.Value) &&
                            claim.Value != Guid.Empty.ToString())
                        {
                            Console.WriteLine($"Found TenantId from claims search: {claim.Value}");
                            return claim.Value;
                        }
                    }

                    Console.WriteLine("No TenantId found in HttpContext.User");
                }

                // Token'dan almayı deneyin
                Console.WriteLine("Trying to get TenantId from token...");
                var token = _tokenService.GetToken();
                if (!string.IsNullOrEmpty(token))
                {
                    try
                    {
                        var tenantId = _tokenService.GetTenantIdFromToken(token);
                        if (!string.IsNullOrEmpty(tenantId) && tenantId != Guid.Empty.ToString())
                        {
                            Console.WriteLine($"Found TenantId from token: {tenantId}");
                            return tenantId;
                        }
                        else
                        {
                            Console.WriteLine("No valid TenantId found in token");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error extracting TenantId from token: {ex.Message}");
                    }
                }
                else
                {
                    Console.WriteLine("No token found to extract TenantId");
                }

                Console.WriteLine("No TenantId found anywhere");
                return null;
            }
        }

        public string UserId
        {
            get
            {
                // First try to get it from HttpContext.User
                if (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true)
                {
                    // Try multiple claim types for user ID
                    var user = _httpContextAccessor.HttpContext.User;

                    // 1. Try JwtRegisteredClaimNames.Sub
                    var subClaim = user.FindFirst(JwtRegisteredClaimNames.Sub);
                    if (subClaim != null && !string.IsNullOrEmpty(subClaim.Value))
                    {
                        return subClaim.Value;
                    }

                    // 2. Try ClaimTypes.NameIdentifier
                    var nameIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
                    if (nameIdClaim != null && !string.IsNullOrEmpty(nameIdClaim.Value))
                    {
                        return nameIdClaim.Value;
                    }

                    // 3. Log tüm claim'leri
                    Console.WriteLine("Searching all claims for user identity...");
                    foreach (var claim in user.Claims)
                    {
                        Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
                        // NameIdentifier veya Subject içeren bir claim ise kullan
                        if ((claim.Type.Contains("nameidentifier", StringComparison.OrdinalIgnoreCase) ||
                             claim.Type.Contains("subject", StringComparison.OrdinalIgnoreCase)) &&
                            !string.IsNullOrEmpty(claim.Value))
                        {
                            return claim.Value;
                        }
                    }
                }

                // If not found in HttpContext.User, extract directly from token
                var token = _tokenService.GetToken();
                if (!string.IsNullOrEmpty(token))
                {
                    return _tokenService.GetUserIdFromToken(token);
                }

                return null;
            }
        }

        public string UserName
        {
            get
            {
                if (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true)
                {
                    return _httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.Name);
                }

                // Try to extract from token if not found in claims
                var token = _tokenService.GetToken();
                if (!string.IsNullOrEmpty(token))
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var jwtToken = tokenHandler.ReadJwtToken(token);
                    return jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                }

                return null;
            }
        }

        public bool IsAuthenticated
        {
            get
            {
                var httpContextAuth = _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
                var hasToken = !string.IsNullOrEmpty(_tokenService.GetToken());
                Console.WriteLine($"IsAuthenticated: HttpContext={httpContextAuth}, HasToken={hasToken}");
                return httpContextAuth || hasToken;
            }
        }

        public bool IsInRole(string role)
        {
            if (_httpContextAccessor.HttpContext?.User?.IsInRole(role) ?? false)
            {
                return true;
            }

            // Try to check role from token if not found in HttpContext
            var token = _tokenService.GetToken();
            if (!string.IsNullOrEmpty(token))
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                return jwtToken.Claims.Any(c => c.Type == ClaimTypes.Role && c.Value == role);
            }

            return false;
        }
    }
}