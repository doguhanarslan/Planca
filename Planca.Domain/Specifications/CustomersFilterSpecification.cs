using Planca.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Specifications
{
    public class CustomersFilterSpecification : BaseSpecification<Customer>
    {
        public CustomersFilterSpecification(string searchString = null)
            : base(CreateSearchCriteria(searchString))
        {
            // Constructor boş kalabilir çünkü criteria base constructor'a aktarıldı
        }

        private static Expression<Func<Customer, bool>> CreateSearchCriteria(string searchString)
        {
            // Arama kriteri yoksa null döndür
            if (string.IsNullOrEmpty(searchString))
                return null;

            // Arama kriteri oluştur
            searchString = searchString.ToLower();
            return c =>
                c.FirstName.ToLower().Contains(searchString) ||
                c.LastName.ToLower().Contains(searchString) ||
                c.Email.ToLower().Contains(searchString) ||
                (c.PhoneNumber != null && c.PhoneNumber.ToLower().Contains(searchString));
        }
    }
}
