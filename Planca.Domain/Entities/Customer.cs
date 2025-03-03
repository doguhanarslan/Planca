using Planca.Domain.Common;
using Planca.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Entities
{
    public class Customer : BaseEntity
    {
        public string UserId { get; set; } // Identity relationship
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public Address Address { get; set; }
        public string Notes { get; set; }

        public string FullName => $"{FirstName} {LastName}";
    }
}
