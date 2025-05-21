using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Services.Queries.GetServicesList
{
    public class GetServicesListQueryHandler : IRequestHandler<GetServicesListQuery, PaginatedList<ServiceDto>>
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<GetServicesListQueryHandler> _logger;
        private readonly ICurrentTenantService _currentTenantService;
        private readonly ICacheService _cacheService;
        public GetServicesListQueryHandler(
            IServiceRepository serviceRepository,
            IMapper mapper,
            ICacheService cacheService,
            ILogger<GetServicesListQueryHandler> logger,
            ICurrentTenantService currentTenantService)
        {
            _serviceRepository = serviceRepository;
            _mapper = mapper;
            _cacheService = cacheService;
            _logger = logger;
            _currentTenantService = currentTenantService;
        }

        public async Task<PaginatedList<ServiceDto>> Handle(GetServicesListQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Fetching services for TenantId: {TenantId}", request.TenantId);
            
            // Log the CurrentTenantService's tenant ID for debugging
            var currentServiceTenantId = _currentTenantService.GetTenantId();
            _logger.LogInformation("CurrentTenantService.GetTenantId() before setting: {TenantId}", currentServiceTenantId);
            
            try 
            {
                // Tenant ID'sini kontrol et - boş olamaz
                if (request.TenantId == Guid.Empty)
                {
                    _logger.LogWarning("Empty TenantId provided in GetServicesListQuery");
                    return new PaginatedList<ServiceDto>(
                        new List<ServiceDto>(),
                        0,
                        request.PageNumber,
                        request.PageSize);
                }
                
                // Set the current tenant ID for this scope
                _currentTenantService.SetCurrentTenantId(request.TenantId);
                _logger.LogInformation("Set current tenant ID to: {TenantId}", request.TenantId);
                
                // Verify the tenant ID was set
                currentServiceTenantId = _currentTenantService.GetTenantId();
                _logger.LogInformation("CurrentTenantService.GetTenantId() after setting: {TenantId}", currentServiceTenantId);

                // Log the filter parameters
                _logger.LogDebug("Query parameters - SearchString: {SearchString}, IsActive: {IsActive}, MaxPrice: {MaxPrice}, SortBy: {SortBy}, SortAscending: {SortAscending}",
                    request.SearchString, request.IsActive, request.MaxPrice, request.SortBy, request.SortAscending);

                // Test if maxPrice is causing the issue
                decimal? maxPriceToUse = request.MaxPrice;
                
                if (maxPriceToUse.HasValue)
                {
                    _logger.LogInformation("Using MaxPrice filter with value: {MaxPrice}", maxPriceToUse);
                    
                    // If MaxPrice is very low (like 0), it might filter out all services
                    if (maxPriceToUse.Value <= 0)
                    {
                        _logger.LogWarning("MaxPrice is set to 0 or negative value, which will filter out all services. Setting to null.");
                        maxPriceToUse = null;
                    }
                }

                // Doğrudan veri tabanına erişen yeni metodu kullan
                _logger.LogDebug("Using direct database query to fetch services");
                
                var (services, totalCount) = await _serviceRepository.GetServicesByTenantIdAsync(
                    request.TenantId,
                    request.SearchString,
                    request.IsActive,
                    maxPriceToUse,
                    request.SortBy,
                    request.SortAscending,
                    request.PageSize,
                    (request.PageNumber - 1) * request.PageSize);
                
                _logger.LogInformation("Services returned by direct query: {Count}, Total: {Total}", 
                    services.Count, totalCount);
                
                // DTO'lara dönüştür
                var serviceDtos = _mapper.Map<List<ServiceDto>>(services);

                // Sayfalanmış sonuç oluştur
                return new PaginatedList<ServiceDto>(
                    serviceDtos,
                    totalCount,
                    request.PageNumber,
                    request.PageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching services for TenantId: {TenantId}", request.TenantId);
                throw;
            }
        }
    }
}