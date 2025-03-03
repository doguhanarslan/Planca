using System;
using Microsoft.AspNetCore.Http;
using Planca.Application.Common.Interfaces;

namespace Planca.Infrastructure.Identity.Services
{
    public class CurrentTenantService : ICurrentTenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string TenantIdHeaderName = "X-TenantId";
        private const string TenantNameHeaderName = "X-TenantName";

        public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid GetTenantId()
        {
            if (_httpContextAccessor.HttpContext?.Items["TenantId"] is Guid guid)
            {
                return guid;
            }

            // Try to get from header
            if (_httpContextAccessor.HttpContext?.Request.Headers.ContainsKey(TenantIdHeaderName) == true)
            {
                var headerValue = _httpContextAccessor.HttpContext.Request.Headers[TenantIdHeaderName].ToString();
                if (Guid.TryParse(headerValue, out var tenantId))
                {
                    return tenantId;
                }
            }

            return Guid.Empty;
        }

        public string GetTenantName()
        {
            if (_httpContextAccessor.HttpContext?.Items["TenantName"] is string name)
            {
                return name;
            }

            // Try to get from header
            if (_httpContextAccessor.HttpContext?.Request.Headers.ContainsKey(TenantNameHeaderName) == true)
            {
                return _httpContextAccessor.HttpContext.Request.Headers[TenantNameHeaderName].ToString();
            }

            return null;
        }

        public bool IsValid()
        {
            return GetTenantId() != Guid.Empty;
        }
    }
}