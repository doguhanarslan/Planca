using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Common.Models
{
    public class UserCreationDto
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; } = ""; // Varsayılan değer
        public string LastName { get; set; } = "";  // Varsayılan değer
        public string PhoneNumber { get; set; }
    }
}
