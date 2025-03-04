using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System;
using System.Linq.Expressions;

namespace Planca.Domain.Specifications
{
    public class TenantsFilterSpecification : BaseSpecification<Tenant>
    {
        public TenantsFilterSpecification(string? searchString = null, bool? isActive = null)
            : base(CreateSearchCriteria(searchString, isActive))
        {
            // Constructor boş kalabilir çünkü criteria base constructor'a aktarıldı
        }

        private static Expression<Func<Tenant, bool>>? CreateSearchCriteria(string? searchString, bool? isActive)
        {
            // Başlangıçta kriterimiz yok, bütün filtreleri AND işlemi ile birleştireceğiz
            Expression<Func<Tenant, bool>>? criteria = null;

            // Arama kriteri
            if (!string.IsNullOrEmpty(searchString))
            {
                searchString = searchString.ToLower();
                Expression<Func<Tenant, bool>> searchFilter = t =>
                    t.Name.ToLower().Contains(searchString) ||
                    t.Subdomain.ToLower().Contains(searchString);

                criteria = searchFilter;
            }

            // Aktif/Pasif filtresi
            if (isActive.HasValue)
            {
                Expression<Func<Tenant, bool>> activeFilter = t => t.IsActive == isActive.Value;
                criteria = criteria == null ? activeFilter : CombineWithAnd(criteria, activeFilter);
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