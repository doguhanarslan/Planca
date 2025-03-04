﻿using System.Collections.Generic;

namespace Planca.Application.Common.Interfaces
{
    public interface ITokenService
    {
        /// <summary>
        /// Kullanıcı bilgileri ve rolleri içeren bir JWT token oluşturur
        /// </summary>
        string CreateToken(string userId, string email, IList<string> roles, string tenantId = null);

        /// <summary>
        /// Token formatının geçerli olup olmadığını doğrular
        /// </summary>
        bool ValidateToken(string token);

        /// <summary>
        /// Token içerisinden kullanıcı ID'sini çıkarır
        /// </summary>
        /// <param name="token">JWT token</param>
        /// <returns>Kullanıcı ID'si veya token geçersizse boş string</returns>
        string GetUserIdFromToken(string token);
    }
}