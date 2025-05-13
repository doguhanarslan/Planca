using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Specifications
{
    public class CustomersFilterPagingSpecification : CustomersFilterSpecification
    {
        public CustomersFilterPagingSpecification(
            string searchString = null,
            string sortBy = null,
            bool sortAscending = true,
            int? take = null,
            int? skip = null,
            Guid tenantId = default) : base(searchString, tenantId)
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
