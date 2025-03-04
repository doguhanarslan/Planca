using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Common.Interfaces
{
 
    /// Infrastructure katmanında uygulanacaktır.
    public interface IAppSettings
    {
        int RefreshTokenExpiryDays { get; }

        int JwtTokenExpiryMinutes { get; }
    }
}