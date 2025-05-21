using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Configuration
{
    public class CacheSettings
    {
        public string ConnectionString { get; set; }
        public string InstanceName { get; set; }
        public int DefaultExpirationMinutes { get; set; } = 30;
        public bool EnableDistributedCache { get; set; } = true;
        public bool EnableResponseCaching { get; set; } = true;
    }
}
