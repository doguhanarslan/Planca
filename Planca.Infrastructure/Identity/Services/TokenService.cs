using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Planca.Application.Common.Interfaces;

namespace Planca.Infrastructure.Identity.Services
{
    public class TokenService : ITokenService
    {

        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }
        public string GetToken()
        {
            _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("jwt", out var token);
            return token;
        }

        public string GetRefreshToken()
        {
            _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("refreshToken", out var refreshToken);
            return refreshToken;
        }

        public void StoreTokens(string token, string refreshToken, DateTime tokenExpiry, DateTime refreshTokenExpiry)
        {
            _httpContextAccessor.HttpContext.Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // Geliştirme ortamında HTTP kullanıyorsanız
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = tokenExpiry
            });

            _httpContextAccessor.HttpContext.Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // Geliştirme ortamında HTTP kullanıyorsanız
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = refreshTokenExpiry
            });
        }
        public string CreateToken(string userId, string email, IList<string> roles, string tenantId = null)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Name, email), // Kullanıcı adı için ClaimTypes.Name ekleyin
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            // Add roles to claims
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // Add tenant ID if available

            claims.Add(new Claim("TenantId",
                   !string.IsNullOrEmpty(tenantId) ? tenantId : Guid.Empty.ToString()));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:DurationInMinutes"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public void DecodeToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token) as JwtSecurityToken;

            if (jsonToken != null)
            {
                foreach (var claim in jsonToken.Claims)
                {
                    Console.WriteLine($"{claim.Type}: {claim.Value}");
                }
            }
        }
        public bool ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSettings:Key"]);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = _configuration["JwtSettings:Issuer"],
                    ValidAudience = _configuration["JwtSettings:Audience"],
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        // Yeni eklenen metot: Token içerisinden User ID çıkarma
        public string GetUserIdFromToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();

                // Token formatı geçerli mi kontrol et
                if (!tokenHandler.CanReadToken(token))
                {
                    return string.Empty;
                }

                var jwtToken = tokenHandler.ReadJwtToken(token);
                var subject = jwtToken.Subject;

                // Subject (User ID) boş mu kontrol et
                if (string.IsNullOrEmpty(subject))
                {
                    // Alternatif olarak sub claim'i kontrol et
                    var subClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
                    return subClaim?.Value ?? string.Empty;
                }

                return subject;
            }
            catch
            {
                // Hata durumunda boş string döndür
                return string.Empty;
            }
        }
    }
}