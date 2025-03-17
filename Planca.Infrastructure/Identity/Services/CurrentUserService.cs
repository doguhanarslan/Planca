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

        public string UserId
        {
            get
            {
                // First try to get it from HttpContext.User
                if (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated == true)
                {
                    var subClaim = _httpContextAccessor.HttpContext.User.FindFirst(JwtRegisteredClaimNames.Sub);
                    if (subClaim != null && !string.IsNullOrEmpty(subClaim.Value))
                    {
                        return subClaim.Value;
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

        public bool IsAuthenticated =>
            (_httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false) ||
            !string.IsNullOrEmpty(_tokenService.GetToken());

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