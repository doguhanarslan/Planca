using Planca.Domain.Common.Enums;
using Planca.Domain.Entities;
using System;

namespace Planca.Domain.Specifications
{
    /// <summary>
    /// Filtreleme, sıralama ve sayfalama destekli randevu spesifikasyonu
    /// </summary>
    public class AppointmentsFilterPagingSpecification : AppointmentsFilterSpecification
    {
        public AppointmentsFilterPagingSpecification(
            DateTime? startDate = null,
            DateTime? endDate = null,
            Guid? employeeId = null,
            Guid? customerId = null,
            Guid? serviceId = null,
            AppointmentStatus? status = null,
            string sortBy = null,
            bool sortAscending = true,
            int? take = null,
            int? skip = null)
            : base(startDate, endDate, employeeId, customerId, serviceId, status)
        {
            // Sıralama
            if (!string.IsNullOrEmpty(sortBy))
            {
                switch (sortBy.ToLower())
                {
                    case "starttime":
                        if (sortAscending)
                            ApplyOrderBy(a => a.StartTime);
                        else
                            ApplyOrderByDescending(a => a.StartTime);
                        break;
                    case "endtime":
                        if (sortAscending)
                            ApplyOrderBy(a => a.EndTime);
                        else
                            ApplyOrderByDescending(a => a.EndTime);
                        break;
                    case "status":
                        if (sortAscending)
                            ApplyOrderBy(a => a.Status);
                        else
                            ApplyOrderByDescending(a => a.Status);
                        break;
                    case "createdat":
                        if (sortAscending)
                            ApplyOrderBy(a => a.CreatedAt);
                        else
                            ApplyOrderByDescending(a => a.CreatedAt);
                        break;
                    default:
                        // Varsayılan olarak başlangıç zamanına göre sırala
                        if (sortAscending)
                            ApplyOrderBy(a => a.StartTime);
                        else
                            ApplyOrderByDescending(a => a.StartTime);
                        break;
                }
            }
            else
            {
                // Varsayılan olarak başlangıç zamanına göre sırala
                ApplyOrderBy(a => a.StartTime);
            }

            // Sayfalama
            if (take.HasValue && skip.HasValue)
            {
                ApplyPaging(skip.Value, take.Value);
            }
        }
    }
}