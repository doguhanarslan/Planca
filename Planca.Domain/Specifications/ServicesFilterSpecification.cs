using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System;
using System.Linq.Expressions;

namespace Planca.Domain.Specifications
{
    public class ServicesFilterSpecification : BaseSpecification<Service>
    {
        public ServicesFilterSpecification(string? searchString = null, bool? isActive = null, decimal? maxPrice = null, Guid? tenantId = null)
        {
            // Başlangıçta bir kriter belirle
            if (tenantId.HasValue && tenantId.Value != Guid.Empty)
            {
                // Tenant filtresi (her zaman uygulanmalı)
                Criteria = s => s.TenantId == tenantId.Value;
            }
            else
            {
                // Tenant filtresi yoksa (olmamalı), hata durumuna düşmemek için boş kriter
                Criteria = s => true;
            }

            // Arama kriteri
            if (!string.IsNullOrEmpty(searchString))
            {
                searchString = searchString.ToLower();
                AndCriteria(s => s.Name.ToLower().Contains(searchString) ||
                    (s.Description != null && s.Description.ToLower().Contains(searchString)));
            }

            // Aktif/Pasif filtresi
            if (isActive.HasValue)
            {
                AndCriteria(s => s.IsActive == isActive.Value);
            }

            // Maksimum fiyat filtresi
            if (maxPrice.HasValue)
            {
                AndCriteria(s => s.Price <= maxPrice.Value);
            }
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