using Planca.Domain.Entities;
using System;
using System.Collections.Generic;

namespace Planca.Domain.Specifications
{
    public class EmployeesFilterPagingSpecification : EmployeesFilterSpecification
    {
        public EmployeesFilterPagingSpecification(
            string? searchString = null,
            bool? isActive = null,
            Guid? serviceId = null,
            string? sortBy = null,
            bool sortAscending = true,
            int? take = null,
            int? skip = null,
            Guid? tenantId = null) : base(searchString, isActive, serviceId, tenantId)
        {
            // Sıralama
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy)
                {
                    case "FirstName":
                        if (sortAscending)
                            ApplyOrderBy(e => e.FirstName);
                        else
                            ApplyOrderByDescending(e => e.FirstName);
                        break;
                    case "Email":
                        if (sortAscending)
                            ApplyOrderBy(e => e.Email);
                        else
                            ApplyOrderByDescending(e => e.Email);
                        break;
                    case "Title":
                        if (sortAscending)
                            ApplyOrderBy(e => e.Title);
                        else
                            ApplyOrderByDescending(e => e.Title);
                        break;
                    case "CreatedAt":
                        if (sortAscending)
                            ApplyOrderBy(e => e.CreatedAt);
                        else
                            ApplyOrderByDescending(e => e.CreatedAt);
                        break;
                    default: // "LastName" (default)
                        if (sortAscending)
                            ApplyOrderBy(e => e.LastName);
                        else
                            ApplyOrderByDescending(e => e.LastName);
                        break;
                }
            }
            else
            {
                // Varsayılan sıralama
                ApplyOrderBy(e => e.LastName);
            }

            // Sayfalama
            if (take.HasValue && skip.HasValue)
            {
                ApplyPaging(skip.Value, take.Value);
            }
        }
    }
}