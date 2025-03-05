using Planca.Application.Common.Interfaces;

namespace Planca.Infrastructure.Services
{
    public class DateTimeService : IDateTime
    {
        public DateTime Now => DateTime.UtcNow;
        public DateTime UtcNow => DateTime.UtcNow;
    }
}