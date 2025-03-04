using Planca.Domain.Entities;
using System;

namespace Planca.Domain.Specifications
{
    public class TenantsFilterPagingSpecification : TenantsFilterSpecification
    {
        public TenantsFilterPagingSpecification(
            string? searchString = null,
            bool? isActive = null,
            string? sortBy = null,
            bool sortAscending = true,
            int? take = null,
            int? skip = null) : base(searchString, isActive)
        {
            // Sıralama
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "name":
                        if (sortAscending)
                            ApplyOrderBy(t => t.Name);
                        else
                            ApplyOrderByDescending(t => t.Name);
                        break;
                    case "subdomain":
                        if (sortAscending)
                            ApplyOrderBy(t => t.Subdomain);
                        else
                            ApplyOrderByDescending(t => t.Subdomain);
                        break;
                    case "createdat":
                        if (sortAscending)
                            ApplyOrderBy(t => t.CreatedAt);
                        else
                            ApplyOrderByDescending(t => t.CreatedAt);
                        break;
                    default: // Varsayılan sıralama Name'e göre
                        if (sortAscending)
                            ApplyOrderBy(t => t.Name);
                        else
                            ApplyOrderByDescending(t => t.Name);
                        break;
                }
            }
            else
            {
                // Varsayılan sıralama
                ApplyOrderBy(t => t.Name);
            }

            // Sayfalama
            if (take.HasValue && skip.HasValue)
            {
                ApplyPaging(skip.Value, take.Value);
            }
        }
    }
}