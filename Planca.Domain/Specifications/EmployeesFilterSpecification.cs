using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System;
using System.Linq.Expressions;

namespace Planca.Domain.Specifications
{
    public class EmployeesFilterSpecification : BaseSpecification<Employee>
    {
        public Guid? ServiceIdFilter { get; private set; }

        public EmployeesFilterSpecification(string? searchString = null, bool? isActive = null, Guid? serviceId = null, Guid? tenantId = null)
            : base(CreateSearchCriteria(searchString, isActive, tenantId))
        {
            // ServiceId filtresini ayrı tutuyoruz çünkü bunu SQL sorgusu içinde kullanamayız
            // Repository tarafında manual işlenecek
            ServiceIdFilter = serviceId;

            // Diğer filtreler normal şekilde ekleniyor
        }

        private static Expression<Func<Employee, bool>>? CreateSearchCriteria(string? searchString, bool? isActive, Guid? tenantId)
        {
            // Başlangıçta kriterimiz yok, bütün filtreleri AND işlemi ile birleştireceğiz
            Expression<Func<Employee, bool>>? criteria = null;

            // Tenant filtresi (en önemli - her zaman uygulanmalı)
            if (tenantId.HasValue && tenantId.Value != Guid.Empty)
            {
                Expression<Func<Employee, bool>> tenantFilter = e => e.TenantId == tenantId.Value;
                criteria = tenantFilter;
            }

            // Arama kriteri
            if (!string.IsNullOrEmpty(searchString))
            {
                searchString = searchString.ToLower();
                Expression<Func<Employee, bool>> searchFilter = e =>
                    e.FirstName.ToLower().Contains(searchString) ||
                    e.LastName.ToLower().Contains(searchString) ||
                    e.Email.ToLower().Contains(searchString) ||
                    (e.PhoneNumber != null && e.PhoneNumber.ToLower().Contains(searchString)) ||
                    (e.Title != null && e.Title.ToLower().Contains(searchString));

                criteria = criteria == null ? searchFilter : CombineWithAnd(criteria, searchFilter);
            }

            // Aktif/Pasif filtresi
            if (isActive.HasValue)
            {
                Expression<Func<Employee, bool>> activeFilter = e => e.IsActive == isActive.Value;
                criteria = criteria == null ? activeFilter : CombineWithAnd(criteria, activeFilter);
            }

            // ServiceId filtresi artık CreateSearchCriteria içinde oluşturulmuyor
            // Bu filtreleme repository tarafında in-memory olarak yapılacak

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