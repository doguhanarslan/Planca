using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Planca.Infrastructure.Persistence.Context;

namespace Planca.API.Middleware
{
    public class TenantResolutionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<TenantResolutionMiddleware> _logger;
        private const string TenantIdHeaderName = "X-TenantId";
        private const string TenantNameHeaderName = "X-TenantName";

        public TenantResolutionMiddleware(RequestDelegate next, ILogger<TenantResolutionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
        {
            var tenantIdClaim = context.User?.FindFirst("TenantId");
            if (tenantIdClaim != null && Guid.TryParse(tenantIdClaim.Value, out var tenantIdFromToken))
            {
                var tenant = await dbContext.Tenants.FindAsync(tenantIdFromToken);
                if (tenant != null && tenant.IsActive)
                {
                    context.Items["TenantId"] = tenantIdFromToken;
                    context.Items["TenantName"] = tenant.Name;
                    _logger.LogInformation("Tenant resolved from token: {TenantName} ({TenantId})",
                        tenant.Name, tenantIdFromToken);
                }
            }

            // Check header for tenant ID
            if (context.Request.Headers.TryGetValue(TenantIdHeaderName, out var tenantIdHeader) &&
                Guid.TryParse(tenantIdHeader, out var tenantId))
            {
                // Look up tenant by ID to verify it exists and is active
                var tenant = await dbContext.Tenants.FindAsync(tenantId);
                if (tenant != null && tenant.IsActive)
                {
                    // Store tenant info in HttpContext.Items for later use
                    context.Items["TenantId"] = tenantId;
                    context.Items["TenantName"] = tenant.Name;
                    _logger.LogInformation("Tenant resolved: {TenantName} ({TenantId})", tenant.Name, tenantId);
                }
                else
                {
                    _logger.LogWarning("Invalid tenant ID provided: {TenantId}", tenantId);
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync("Invalid tenant ID");
                    return;
                }
            }
            // Check for tenant by subdomain (alternative approach)
            else if (context.Request.Host.Host.Contains('.'))
            {
                // Extract subdomain from host
                var subdomain = context.Request.Host.Host.Split('.')[0];

                // Skip for common non-tenant subdomains
                if (subdomain != "www" && subdomain != "api")
                {
                    // Try to find tenant by subdomain
                    var tenant = await dbContext.Tenants
                        .FirstOrDefaultAsync(t => t.Subdomain == subdomain && t.IsActive);

                    if (tenant != null)
                    {
                        // Store tenant info in HttpContext.Items for later use
                        context.Items["TenantId"] = tenant.Id;
                        context.Items["TenantName"] = tenant.Name;
                        _logger.LogInformation("Tenant resolved by subdomain: {TenantName} ({TenantId})", tenant.Name, tenant.Id);
                    }
                }
            }

            // Continue with the request pipeline
            await _next(context);
        }
    }
}