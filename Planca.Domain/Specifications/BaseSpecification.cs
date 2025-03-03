using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using Planca.Domain.Common.Interfaces;

namespace Planca.Domain.Specifications
{
    public abstract class BaseSpecification<T> : ISpecification<T>
    {
        public Expression<Func<T, bool>> Criteria { get; private set; }
        public List<Expression<Func<T, object>>> Includes { get; } = new List<Expression<Func<T, object>>>();
        public List<string> IncludeStrings { get; } = new List<string>();
        public Expression<Func<T, object>> OrderBy { get; private set; }
        public Expression<Func<T, object>> OrderByDescending { get; private set; }
        public int Take { get; private set; }
        public int Skip { get; private set; }
        public bool IsPagingEnabled { get; private set; } = false;

        protected BaseSpecification()
        {
            // Tenant filtresi infrastructure seviyesinde uygulanacağı için
            // burada boş constructor yeterli
        }

        protected BaseSpecification(Expression<Func<T, bool>> criteria)
        {
            Criteria = criteria;
            // Not: Tenant filtresi specification'da değil,
            // repository/DbContext seviyesinde global query filter olarak uygulanacak
        }

        protected virtual void AddInclude(Expression<Func<T, object>> includeExpression)
        {
            Includes.Add(includeExpression);
        }

        protected virtual void AddInclude(string includeString)
        {
            IncludeStrings.Add(includeString);
        }

        protected virtual void ApplyPaging(int skip, int take)
        {
            Skip = skip;
            Take = take;
            IsPagingEnabled = true;
        }

        protected virtual void ApplyOrderBy(Expression<Func<T, object>> orderByExpression)
        {
            OrderBy = orderByExpression;
        }

        protected virtual void ApplyOrderByDescending(Expression<Func<T, object>> orderByDescendingExpression)
        {
            OrderByDescending = orderByDescendingExpression;
        }

        // İhtiyaç durumunda iki kriteri birleştirmek için yardımcı metod
        protected virtual void AndCriteria(Expression<Func<T, bool>> criteria)
        {
            if (Criteria == null)
            {
                Criteria = criteria;
            }
            else
            {
                // Mevcut kritere AND operatörü ile yeni kriter ekler
                // Not: Gerçek implementasyonda expression tree manipülasyonu daha karmaşık olabilir
                var paramExpr = Expression.Parameter(typeof(T), "x");
                var exprBody = Expression.AndAlso(
                    Expression.Invoke(Criteria, paramExpr),
                    Expression.Invoke(criteria, paramExpr)
                );
                Criteria = Expression.Lambda<Func<T, bool>>(exprBody, paramExpr);
            }
        }
    }
}