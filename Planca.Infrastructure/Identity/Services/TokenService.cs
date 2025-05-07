using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Planca.Application.Common.Interfaces;
using Microsoft.IdentityModel.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Planca.Infrastructure.Identity.Models;


namespace Planca.Infrastructure.Identity.Services
{
    public class TokenService : ITokenService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        
        private readonly IServiceProvider _serviceProvider;
        static TokenService()
        {
            // PII loglamasını aktifleştir - sadece geliştirme ortamında kullanılmalı
            IdentityModelEventSource.ShowPII = true;
        }


        public TokenService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IServiceProvider serviceProvider)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _serviceProvider = serviceProvider;
        }

        public string GetToken()
        {
            if (_httpContextAccessor.HttpContext == null)
            {
                Console.WriteLine("GetToken: HttpContext is null");
                return null;
            }

            // Debug: Print all cookies
            Console.WriteLine("All cookies:");
            foreach (var cookie in _httpContextAccessor.HttpContext.Request.Cookies)
            {
                Console.WriteLine($"  {cookie.Key}: {(cookie.Key == "jwt" ? $"Length={cookie.Value?.Length ?? 0}" : "[hidden]")}");
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
        private UserManager<ApplicationUser> GetUserManager()
        {
            return _serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        }
        public string GetRefreshToken()
        {
            try
            {
                // Get user ID from the current JWT token
                var jwtToken = GetToken();
                if (string.IsNullOrEmpty(jwtToken))
                {
                    Console.WriteLine("GetRefreshToken: No JWT token available to identify user");
                    return null;
                }

                // Get user ID from JWT token
                var userId = GetUserIdFromToken(jwtToken);
                if (string.IsNullOrEmpty(userId))
                {
                    Console.WriteLine("GetRefreshToken: Could not extract user ID from token");
                    return null;
                }

                // Inject IIdentityService in the constructor to get access to this method
                var refreshTokenResult = GetUserManager().FindByIdAsync(userId).Result.RefreshToken;
               

                var refreshToken = refreshTokenResult;
                Console.WriteLine($"GetRefreshToken: Retrieved refresh token from database, length={refreshToken?.Length ?? 0}");
                return refreshToken;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetRefreshToken error: {ex.Message}");
                return null;
            }
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

                var refreshTokenClaims = new List<Claim>
                {
                    new Claim(JwtRegisteredClaimNames.Sub, userId),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

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
                var refreshTokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(refreshTokenClaims),
                    Expires = DateTime.UtcNow.AddDays(7),
                    SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature)
                };
                var refreshToken = tokenHandler.CreateJwtSecurityToken(refreshTokenDescriptor);
                var jwtRefreshToken = tokenHandler.WriteToken(refreshToken);
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

        public string GetUserIdFromRefreshToken(string refreshToken)
        {
            try
            {
                Console.WriteLine($"Raw refreshToken: {refreshToken}");

                // Eğer token Base64Url formatında değilse veya düzeltilmesi gerekiyorsa
                refreshToken = refreshToken.Trim(); // Boşlukları temizle

                // Token formatını kontrol et ve debug amaçlı logla
                var tokenParts = refreshToken.Split('.');
                if (tokenParts.Length != 3)
                {
                    Console.WriteLine($"Token format hatası: Beklenen 3 bölüm, bulunan {tokenParts.Length}");
                    // Yine de devam et, daha aşağıda manuel decode etmeyi deneyeceğiz
                }
                else
                {
                    Console.WriteLine($"Token bölümleri: Header({tokenParts[0].Length}), Payload({tokenParts[1].Length}), Signature({tokenParts[2].Length})");
                }

                var tokenHandler = new JwtSecurityTokenHandler();

                // Token formatı geçerli mi kontrol et
                if (!tokenHandler.CanReadToken(refreshToken))
                {
                    Console.WriteLine("Token format JwtSecurityTokenHandler tarafından okunamıyor, manuel decode deneniyor");

                    // Manuel olarak payload'ı decode etmeyi dene
                    if (tokenParts.Length >= 2)
                    {
                        try
                        {
                            string payload = tokenParts[1];
                            // Base64Url decode
                            payload = payload.Replace('-', '+').Replace('_', '/');
                            switch (payload.Length % 4)
                            {
                                case 2: payload += "=="; break;
                                case 3: payload += "="; break;
                            }

                            var jsonBytes = Convert.FromBase64String(payload);
                            var jsonText = System.Text.Encoding.UTF8.GetString(jsonBytes);

                            Console.WriteLine($"Manuel decoded payload: {jsonText}");

                            // JSON'dan sub claim'ini çıkar
                            var jsonObj = System.Text.Json.JsonDocument.Parse(jsonText);
                            if (jsonObj.RootElement.TryGetProperty("sub", out var subElement))
                            {
                                string userId = subElement.GetString();
                                Console.WriteLine($"Manuel olarak çıkarılan userId: {userId}");
                                return userId;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Manuel decode hatası: {ex.Message}");
                        }
                    }

                    return string.Empty;
                }

                // Normal yol - token okunabiliyorsa
                var jwtToken = tokenHandler.ReadJwtToken(refreshToken);
                Console.WriteLine($"Token claims sayısı: {jwtToken.Claims.Count()}");

                // Sub claim'ini ara
                var subClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
                if (subClaim != null && !string.IsNullOrEmpty(subClaim.Value))
                {
                    Console.WriteLine($"Bulunan userId: {subClaim.Value}");
                    return subClaim.Value;
                }

                Console.WriteLine("Sub claim bulunamadı");
                return string.Empty;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token işleme hatası: {ex.Message}");
                return string.Empty;
            }
        }
    }
}
