using System.Linq;
using System;
using Microsoft.EntityFrameworkCore;
using Planca.Domain.Common;
using Planca.Domain.Common.Interfaces;

namespace Planca.Infrastructure.Persistence.Repositories
{
    public static class SpecificationEvaluator<T> where T : BaseEntity
    {
        public static IQueryable<T> GetQuery(IQueryable<T> inputQuery, ISpecification<T> specification)
        {
            Console.WriteLine($"[DEBUG-EVAL] Starting specification evaluation for {typeof(T).Name}");
            
            var query = inputQuery;

            // Apply criteria
            if (specification.Criteria != null)
            {
                Console.WriteLine($"[DEBUG-EVAL] Applying criteria: {specification.Criteria}");
                try
                {
                    query = query.Where(specification.Criteria);
                    Console.WriteLine("[DEBUG-EVAL] Criteria applied successfully");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR-EVAL] Error applying criteria: {ex.Message}");
                    Console.WriteLine($"[ERROR-EVAL] Stack trace: {ex.StackTrace}");
                    // Still trying to continue with the query
                }
            }
            else
            {
                Console.WriteLine("[DEBUG-EVAL] No criteria to apply");
            }

            // Include expressions
            if (specification.Includes.Any())
            {
                Console.WriteLine($"[DEBUG-EVAL] Applying {specification.Includes.Count} includes");
                query = specification.Includes.Aggregate(query,
                    (current, include) => current.Include(include));
            }

            // Include strings
            if (specification.IncludeStrings.Any())
            {
                Console.WriteLine($"[DEBUG-EVAL] Applying {specification.IncludeStrings.Count} include strings");
                query = specification.IncludeStrings.Aggregate(query,
                    (current, include) => current.Include(include));
            }

            // Apply ordering
            if (specification.OrderBy != null)
            {
                Console.WriteLine("[DEBUG-EVAL] Applying OrderBy");
                query = query.OrderBy(specification.OrderBy);
            }
            else if (specification.OrderByDescending != null)
            {
                Console.WriteLine("[DEBUG-EVAL] Applying OrderByDescending");
                query = query.OrderByDescending(specification.OrderByDescending);
            }
            else
            {
                Console.WriteLine("[DEBUG-EVAL] No ordering to apply");
            }

            // Apply paging
            if (specification.IsPagingEnabled)
            {
                Console.WriteLine($"[DEBUG-EVAL] Applying paging: Skip {specification.Skip}, Take {specification.Take}");
                query = query.Skip(specification.Skip)
                    .Take(specification.Take);
            }
            else
            {
                Console.WriteLine("[DEBUG-EVAL] No paging to apply");
            }

            try
            {
                // Log the SQL query for debugging
                var sqlQuery = query.ToQueryString();
                Console.WriteLine($"[DEBUG-EVAL] Generated SQL query: {sqlQuery}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR-EVAL] Could not get SQL query: {ex.Message}");
            }

            Console.WriteLine("[DEBUG-EVAL] Specification evaluation completed");
            return query;
        }
    }
}