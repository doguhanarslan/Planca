using Planca.Domain.Common.Enums;
using Planca.Domain.Entities;
using System;
using System.Linq.Expressions;

namespace Planca.Domain.Specifications
{
    /// <summary>
    /// Temel randevu filtreleme spesifikasyonu
    /// </summary>
    public class AppointmentsFilterSpecification : BaseSpecification<Appointment>
    {
        public AppointmentsFilterSpecification(
            DateTime? startDate = null,
            DateTime? endDate = null,
            Guid? employeeId = null,
            Guid? customerId = null,
            Guid? serviceId = null,
            AppointmentStatus? status = null)
            : base(CreateFilterCriteria(startDate, endDate, employeeId, customerId, serviceId, status))
        {
        }

        private static Expression<Func<Appointment, bool>> CreateFilterCriteria(
            DateTime? startDate,
            DateTime? endDate,
            Guid? employeeId,
            Guid? customerId,
            Guid? serviceId,
            AppointmentStatus? status)
        {
            // Başlangıçta kriterimiz yok, bütün filtreleri AND işlemi ile birleştireceğiz
            Expression<Func<Appointment, bool>> criteria = null;

            if (startDate.HasValue)
            {
                Expression<Func<Appointment, bool>> startDateFilter = a => a.StartTime >= startDate.Value;
                criteria = criteria == null ? startDateFilter : CombineWithAnd(criteria, startDateFilter);
            }

            if (endDate.HasValue)
            {
                Expression<Func<Appointment, bool>> endDateFilter = a => a.StartTime <= endDate.Value;
                criteria = criteria == null ? endDateFilter : CombineWithAnd(criteria, endDateFilter);
            }

            if (employeeId.HasValue)
            {
                Expression<Func<Appointment, bool>> employeeFilter = a => a.EmployeeId == employeeId.Value;
                criteria = criteria == null ? employeeFilter : CombineWithAnd(criteria, employeeFilter);
            }

            if (customerId.HasValue)
            {
                Expression<Func<Appointment, bool>> customerFilter = a => a.CustomerId == customerId.Value;
                criteria = criteria == null ? customerFilter : CombineWithAnd(criteria, customerFilter);
            }

            if (serviceId.HasValue)
            {
                Expression<Func<Appointment, bool>> serviceFilter = a => a.ServiceId == serviceId.Value;
                criteria = criteria == null ? serviceFilter : CombineWithAnd(criteria, serviceFilter);
            }

            if (status.HasValue)
            {
                Expression<Func<Appointment, bool>> statusFilter = a => a.Status == status.Value;
                criteria = criteria == null ? statusFilter : CombineWithAnd(criteria, statusFilter);
            }

            return criteria;
        }

        // İki kriteri AND işlemi ile birleştirmek için yardımcı metod
        private static Expression<Func<T, bool>> CombineWithAnd<T>(
            Expression<Func<T, bool>> left,
            Expression<Func<T, bool>> right)
        {
            // Bu metod sadece bir fikir vermek içindir - gerçek uygulamada
            // Belispec veya diğer kütüphaneler kullanılarak daha sağlam bir şekilde uygulanmalıdır
            var parameter = Expression.Parameter(typeof(T), "x");
            var leftVisitor = new ReplaceParameterVisitor(left.Parameters[0], parameter);
            var leftExpr = leftVisitor.Visit(left.Body);
            var rightVisitor = new ReplaceParameterVisitor(right.Parameters[0], parameter);
            var rightExpr = rightVisitor.Visit(right.Body);
            var combinedExpr = Expression.AndAlso(leftExpr, rightExpr);
            return Expression.Lambda<Func<T, bool>>(combinedExpr, parameter);
        }

        private class ReplaceParameterVisitor : System.Linq.Expressions.ExpressionVisitor
        {
            private readonly ParameterExpression _oldParameter;
            private readonly ParameterExpression _newParameter;

            public ReplaceParameterVisitor(ParameterExpression oldParameter, ParameterExpression newParameter)
            {
                _oldParameter = oldParameter;
                _newParameter = newParameter;
            }

            protected override Expression VisitParameter(ParameterExpression node)
            {
                return ReferenceEquals(node, _oldParameter) ? _newParameter : base.VisitParameter(node);
            }
        }
    }
}