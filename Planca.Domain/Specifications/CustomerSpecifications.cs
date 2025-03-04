using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System;
using System.Linq.Expressions;

namespace Planca.Domain.Specifications
{
    // Temel filtreleme için spesifikasyon
    public class CustomersFilterSpecification : BaseSpecification<Customer>
    {
        public CustomersFilterSpecification(string searchString = null)
        {
            // Arama filtresi (opsiyonel)
            if (!string.IsNullOrEmpty(searchString))
            {
                searchString = searchString.ToLower();

                // BaseSpecification'daki constructor'ı kullanarak Criteria'yı ayarla
                Expression<Func<Customer, bool>> searchCriteria = c =>
                    c.FirstName.ToLower().Contains(searchString) ||
                    c.LastName.ToLower().Contains(searchString) ||
                    c.Email.ToLower().Contains(searchString) ||
                    (c.PhoneNumber != null && c.PhoneNumber.ToLower().Contains(searchString));

                // AndCriteria metodunu kullanarak mevcut kriterlere arama kriterlerini ekle
                AndCriteria(searchCriteria);
            }
        }
    }

    // Filtreleme, sıralama ve sayfalama için spesifikasyon
    public class CustomersFilterPagingSpecification : CustomersFilterSpecification
    {
        public CustomersFilterPagingSpecification(
            string searchString = null,
            string sortBy = null,
            bool sortAscending = true,
            int? take = null,
            int? skip = null) : base(searchString)
        {
            // Sıralama
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy)
                {
                    case "FirstName":
                        if (sortAscending)
                            ApplyOrderBy(c => c.FirstName);
                        else
                            ApplyOrderByDescending(c => c.FirstName);
                        break;
                    case "Email":
                        if (sortAscending)
                            ApplyOrderBy(c => c.Email);
                        else
                            ApplyOrderByDescending(c => c.Email);
                        break;
                    case "CreatedAt":
                        if (sortAscending)
                            ApplyOrderBy(c => c.CreatedAt);
                        else
                            ApplyOrderByDescending(c => c.CreatedAt);
                        break;
                    default: // "LastName" (default)
                        if (sortAscending)
                            ApplyOrderBy(c => c.LastName);
                        else
                            ApplyOrderByDescending(c => c.LastName);
                        break;
                }
            }
            else
            {
                // Varsayılan sıralama
                ApplyOrderBy(c => c.LastName);
            }

            // Sayfalama
            if (take.HasValue && skip.HasValue)
            {
                ApplyPaging(skip.Value, take.Value);
            }
        }
    }
}