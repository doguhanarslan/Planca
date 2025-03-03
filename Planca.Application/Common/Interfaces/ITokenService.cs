using System.Collections.Generic;

namespace Planca.Application.Common.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(string userId, string email, IList<string> roles, string tenantId = null);
        bool ValidateToken(string token);
    }
}