using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System;
using System.Linq.Expressions;

namespace Planca.Domain.Specifications
{
    public class ServicesFilterSpecification : BaseSpecification<Service>
    {
        public ServicesFilterSpecification(string? searchString = null, bool? isActive = null, decimal? maxPrice = null)
            : base(CreateSearchCriteria(searchString, isActive, maxPrice))
        {
            // Constructor boş kalabilir çünkü criteria base constructor'a aktarıldı
        }

        private static Expression<Func<Service, bool>>? CreateSearchCriteria(string? searchString, bool? isActive, decimal? maxPrice)
        {
            // Başlangıçta kriterimiz yok, bütün filtreleri AND işlemi ile birleştireceğiz
            Expression<Func<Service, bool>>? criteria = null;

            // Arama kriteri
            if (!string.IsNullOrEmpty(searchString))
            {
                searchString = searchString.ToLower();
                Expression<Func<Service, bool>> searchFilter = s =>
                    s.Name.ToLower().Contains(searchString) ||
                    (s.Description != null && s.Description.ToLower().Contains(searchString));

                criteria = searchFilter;
            }

            // Aktif/Pasif filtresi
            if (isActive.HasValue)
            {
                Expression<Func<Service, bool>> activeFilter = s => s.IsActive == isActive.Value;
                criteria = criteria == null ? activeFilter : CombineWithAnd(criteria, activeFilter);
            }

            // Maksimum fiyat filtresi
            if (maxPrice.HasValue)
            {
                Expression<Func<Service, bool>> priceFilter = s => s.Price <= maxPrice.Value;
                criteria = criteria == null ? priceFilter : CombineWithAnd(criteria, priceFilter);
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