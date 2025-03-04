using Microsoft.Extensions.Configuration;
using Planca.Application.Common.Interfaces;

namespace Planca.Infrastructure.Services
{
    public class AppSettings : IAppSettings
    {
        private readonly IConfiguration _configuration;

        public AppSettings(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public int RefreshTokenExpiryDays =>
            _configuration.GetValue<int>("JwtSettings:RefreshTokenDurationInDays", 7);

        public int JwtTokenExpiryMinutes =>
            _configuration.GetValue<int>("JwtSettings:DurationInMinutes", 60);
    }
}