using Planca.Domain.Entities;
using System;

namespace Planca.Domain.Specifications
{
    public class ServicesFilterPagingSpecification : ServicesFilterSpecification
    {
        public ServicesFilterPagingSpecification(
            string? searchString = null,
            bool? isActive = null,
            decimal? maxPrice = null,
            string? sortBy = null,
            bool sortAscending = true,
            int? take = null,
            int? skip = null) : base(searchString, isActive, maxPrice)
        {
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
            if (take.HasValue && skip.HasValue)
            {
                ApplyPaging(skip.Value, take.Value);
            }
        }
    }
}