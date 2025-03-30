﻿using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Planca.Application.Common.Interfaces;
using Microsoft.IdentityModel.Logging;

namespace Planca.Infrastructure.Identity.Services
{
    public class TokenService : ITokenService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;

        static TokenService()
        {
            // PII loglamasını aktifleştir - sadece geliştirme ortamında kullanılmalı
            IdentityModelEventSource.ShowPII = true;
        }

        public TokenService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetToken()
        {
            if (_httpContextAccessor.HttpContext == null)
            {
                Console.WriteLine("GetToken: HttpContext is null");
                return null;
            }

            bool success = _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue("jwt", out var token);
            if (success)
            {
                Console.WriteLine($"GetToken: Found token in cookie, length={token?.Length ?? 0}");
            }
            else
            {
                Console.WriteLine("GetToken: No token found in cookies");
            }
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
                Secure = true, // Geliştirme ortamında HTTP kullanıyorsanız, üretimde true olmalı
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = tokenExpiry
            });

            _httpContextAccessor.HttpContext.Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Geliştirme ortamında HTTP kullanıyorsanız, üretimde true olmalı
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = refreshTokenExpiry
            });
        }

        // Anahtar boyutunu normalize eden yardımcı metod
        private byte[] NormalizeKeyTo32Bytes(string keyString)
        {
            // 32 byte (256 bit) boyutunda bir dizi oluştur
            byte[] normalizedKey = new byte[32];

            // Config'den gelen anahtarı byte dizisine dönüştür
            byte[] keyBytes = Encoding.UTF8.GetBytes(keyString);

            // Kopyalanacak byte sayısını belirle (en fazla 32)
            int bytesToCopy = Math.Min(keyBytes.Length, 32);

            // Kaynaktan hedefe byte'ları kopyala
            Array.Copy(keyBytes, normalizedKey, bytesToCopy);

            // Eğer kaynak 32 byte'dan küçükse, kalan kısmı doldur
            if (bytesToCopy < 32)
            {
                // Eksik kısmı belirli bir pattern ile doldur
                for (int i = bytesToCopy; i < 32; i++)
                {
                    normalizedKey[i] = (byte)(i & 0xFF);
                }
            }

            return normalizedKey;
        }

        public string CreateToken(string userId, string email, IList<string> roles, string tenantId = null)
        {
            try
            {
                var claims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, userId),
                    new Claim(JwtRegisteredClaimNames.Email, email),
                    new Claim(ClaimTypes.Name, email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                // Add roles to claims
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                // Add tenant ID if valid
                if (!string.IsNullOrEmpty(tenantId) && tenantId != Guid.Empty.ToString())
                {
                    claims.Add(new Claim("TenantId", tenantId));
                }

                // İmzalama anahtarı (signing key)
                var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));

                // Şifreleme anahtarı (encryption key) - tam olarak 32 byte olacak şekilde normalize et
                string encKeyString = _configuration["JwtSettings:EncryptedKey"] ?? "default-encryption-key-32-bytes-len";
                byte[] normalizedKey = NormalizeKeyTo32Bytes(encKeyString);
                var encryptionKey = new SymmetricSecurityKey(normalizedKey);

                var tokenHandler = new JwtSecurityTokenHandler();
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JwtSettings:DurationInMinutes"])),
                    Issuer = _configuration["JwtSettings:Issuer"],
                    Audience = _configuration["JwtSettings:Audience"],
                    SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature),
                    EncryptingCredentials = new EncryptingCredentials(
                        encryptionKey,
                        SecurityAlgorithms.Aes256KW,        // Anahtar sarmalama algoritması
                        SecurityAlgorithms.Aes256CbcHmacSha512  // İçerik şifreleme algoritması
                    )
                };

                var token = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                // Hata durumunda loglama yap
                Console.WriteLine($"JWT oluşturma hatası: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"İç hata: {ex.InnerException.Message}");
                }
                return ex.Message;
            }
        }
        public void DecodeToken(string token)
        {
            var handler = new JwtSecurityTokenHandler();

            try
            {
                // Şifrelenmiş token'ı okumaya çalışırken hata verebilir
                var jsonToken = handler.ReadToken(token);

                // Şifrelenmiş token için bu noktaya gelmemeli, 
                // çünkü şifrelenmiş token doğrudan okunamaz
                Console.WriteLine("Token şifrelenmemiş veya geçersiz!");

                if (jsonToken is JwtSecurityToken jwtToken)
                {
                    foreach (var claim in jwtToken.Claims)
                    {
                        Console.WriteLine($"{claim.Type}: {claim.Value}");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token şifrelenmiş veya geçersiz: {ex.Message}");
            }
        }

        public bool ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));

            // Aynı normalize edilmiş anahtarı burada da kullan
            string encKeyString = _configuration["JwtSettings:EncryptedKey"] ?? "default-encryption-key-32-bytes-len";
            byte[] normalizedKey = NormalizeKeyTo32Bytes(encKeyString);
            var encryptionKey = new SymmetricSecurityKey(normalizedKey);

            try
            {
                // TokenValidationParameters'a decryption key eklenmeli
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    TokenDecryptionKey = encryptionKey,  // Şifre çözme anahtarı ekleniyor
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

        public string GetTenantIdFromToken(string token)
        {
            try
            {
                // Şifreli token'ı çözmek için validate ediyoruz
                var tokenHandler = new JwtSecurityTokenHandler();

                // TokenService'de kullandığımız normalize anahtar yöntemini kullanın
                string encKeyString = _configuration["JwtSettings:EncryptedKey"] ?? "default-encryption-key-32-bytes-len";
                byte[] normalizedKey = NormalizeKeyTo32Bytes(encKeyString);
                var encryptionKey = new SymmetricSecurityKey(normalizedKey);

                var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]));

                // Token'ı doğrula ve decrypt et
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = signingKey,
                    TokenDecryptionKey = encryptionKey,  // Şifre çözme için gerekli
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = _configuration["JwtSettings:Issuer"],
                    ValidAudience = _configuration["JwtSettings:Audience"],
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                // TenantId claim'ini ara
                var tenantClaim = principal.FindFirst("TenantId");
                if (tenantClaim != null && !string.IsNullOrEmpty(tenantClaim.Value) &&
                    tenantClaim.Value != Guid.Empty.ToString())
                {
                    return tenantClaim.Value;
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting TenantId from token: {ex.Message}");
                return null;
            }
        }
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

                // Doğrudan token'ı okuyarak claims'leri kontrol et
                var jwtToken = tokenHandler.ReadJwtToken(token);

                // 1. Önce Sub claim'i ara
                var subClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
                if (subClaim != null && !string.IsNullOrEmpty(subClaim.Value))
                {
                    return subClaim.Value;
                }

                // 2. Sonra NameIdentifier claim'i ara
                var nameIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (nameIdClaim != null && !string.IsNullOrEmpty(nameIdClaim.Value))
                {
                    return nameIdClaim.Value;
                }

                // 3. nameidentifier veya subject içeren claim ara
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c =>
                    (c.Type.Contains("nameidentifier", StringComparison.OrdinalIgnoreCase) ||
                     c.Type.Contains("subject", StringComparison.OrdinalIgnoreCase)) &&
                    !string.IsNullOrEmpty(c.Value));

                if (userIdClaim != null)
                {
                    return userIdClaim.Value;
                }

                return string.Empty;
            }
            catch
            {
                return string.Empty;
            }
        }


    }
}