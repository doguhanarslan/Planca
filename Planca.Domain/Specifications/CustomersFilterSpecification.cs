using Planca.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Specifications
{
    public class CustomersFilterSpecification : BaseSpecification<Customer>
    {
        public CustomersFilterSpecification(string searchString = null, Guid tenantId = default)
            : base(CombineCriteria(CreateSearchCriteria(searchString), tenantId))
        {
            // Constructor boş kalabilir çünkü criteria base constructor'a aktarıldı
        }

        private static Expression<Func<Customer, bool>> CreateSearchCriteria(string searchString)
        {
            // Arama kriteri yoksa null döndür
            if (string.IsNullOrEmpty(searchString))
                return null;

            // Arama kriteri oluştur
            searchString = searchString.ToLower();
            return c =>
                c.FirstName.ToLower().Contains(searchString) ||
                c.LastName.ToLower().Contains(searchString) ||
                c.Email.ToLower().Contains(searchString) ||
                (c.PhoneNumber != null && c.PhoneNumber.ToLower().Contains(searchString));
        }

        private static Expression<Func<Customer, bool>> CombineCriteria(Expression<Func<Customer, bool>> searchCriteria, Guid tenantId)
        {
            // Tenant filtresi oluştur (default Guid.Empty ise filtreleme yapma)
            Expression<Func<Customer, bool>> tenantFilter = null;
            if (tenantId != Guid.Empty)
            {
                tenantFilter = c => c.TenantId == tenantId;
            }

            // Eğer search kriteri yoksa, sadece tenant filtresini döndür
            if (searchCriteria == null)
                return tenantFilter;

            // Eğer tenant filtresi yoksa, sadece search kriterini döndür
            if (tenantFilter == null)
                return searchCriteria;

            // Her iki filtre de varsa, And ile birleştir
            // Not: Burada expression tree üzerinde çalışmak gerekiyor
            // Basit implementasyon: Parametre değişkeni oluştur
            var parameter = Expression.Parameter(typeof(Customer), "c");

            // Orijinal ifadeleri bu parametre ile değiştir
            var searchBody = ReplaceParameter(searchCriteria.Body, searchCriteria.Parameters[0], parameter);
            var tenantBody = ReplaceParameter(tenantFilter.Body, tenantFilter.Parameters[0], parameter);

            // And ile birleştir
            var combinedBody = Expression.AndAlso(searchBody, tenantBody);

            // Yeni lambda oluştur
            return Expression.Lambda<Func<Customer, bool>>(combinedBody, parameter);
        }

        private static Expression ReplaceParameter(Expression expression, ParameterExpression oldParameter, ParameterExpression newParameter)
        {
            return new ParameterReplacer(oldParameter, newParameter).Visit(expression);
        }

        private class ParameterReplacer : ExpressionVisitor
        {
            private readonly ParameterExpression _oldParameter;
            private readonly ParameterExpression _newParameter;

            public ParameterReplacer(ParameterExpression oldParameter, ParameterExpression newParameter)
            {
                _oldParameter = oldParameter;
                _newParameter = newParameter;
            }

            protected override Expression VisitParameter(ParameterExpression node)
            {
                return node == _oldParameter ? _newParameter : base.VisitParameter(node);
            }
        }
    }
}
