using Planca.Domain.Entities;
using System;

namespace Planca.Domain.Specifications
{
    public class ServicesFilterPagingSpecification : BaseSpecification<Service>
    {
        public ServicesFilterPagingSpecification(
        string searchString,
        bool? isActive,
        decimal? maxPrice,
        string sortBy,
        bool sortAscending,
        int take,
        int skip,
        Guid? tenantId)
        {
            // Tenant filtresi
            Criteria = x => x.TenantId == tenantId;

            // Arama filtresi
            if (!string.IsNullOrEmpty(searchString))
            {
                AndCriteria(x => x.Name.Contains(searchString) || 
                    (x.Description != null && x.Description.Contains(searchString)));
            }

            // Aktiflik filtresi
            if (isActive.HasValue)
            {
                AndCriteria(x => x.IsActive == isActive.Value);
            }

            // Maksimum fiyat filtresi
            if (maxPrice.HasValue)
            {
                AndCriteria(x => x.Price <= maxPrice.Value);
            }

            // Sıralama
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "name":
                        if (sortAscending)
                            ApplyOrderBy(s => s.Name);
                        else
                            ApplyOrderByDescending(s => s.Name);
                        break;
                    case "price":
                        if (sortAscending)
                            ApplyOrderBy(s => s.Price);
                        else
                            ApplyOrderByDescending(s => s.Price);
                        break;
                    case "duration":
                        if (sortAscending)
                            ApplyOrderBy(s => s.DurationMinutes);
                        else
                            ApplyOrderByDescending(s => s.DurationMinutes);
                        break;
                    case "createdat":
                        if (sortAscending)
                            ApplyOrderBy(s => s.CreatedAt);
                        else
                            ApplyOrderByDescending(s => s.CreatedAt);
                        break;
                    default: // Varsayılan sıralama Name'e göre
                        if (sortAscending)
                            ApplyOrderBy(s => s.Name);
                        else
                            ApplyOrderByDescending(s => s.Name);
                        break;
                }
            }
            else
            {
                // Varsayılan sıralama
                ApplyOrderBy(s => s.Name);
            }

            // Sayfalama
            ApplyPaging(skip, take);
        }
    }
}