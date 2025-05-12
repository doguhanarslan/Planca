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

namespace Planca.Application.Features.Services.Queries.GetServicesList
{
    public class GetServicesListQueryHandler : IRequestHandler<GetServicesListQuery, PaginatedList<ServiceDto>>
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<GetServicesListQueryHandler> _logger;

        public GetServicesListQueryHandler(
            IServiceRepository serviceRepository,
            IMapper mapper,
            ILogger<GetServicesListQueryHandler> logger)
        {
            _serviceRepository = serviceRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<PaginatedList<ServiceDto>> Handle(GetServicesListQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Fetching services for TenantId: {TenantId}", request.TenantId);
            
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

                // Servis listesi için bir spesifikasyon oluştur
                var specification = new ServicesFilterPagingSpecification(
                    request.SearchString,
                    request.IsActive,
                    request.MaxPrice,
                    request.SortBy,
                    request.SortAscending,
                    request.PageSize,
                    (request.PageNumber - 1) * request.PageSize,
                    request.TenantId
                );

                // Spesifikasyona göre servisleri getir
                var services = await _serviceRepository.ListAsync(specification);
                _logger.LogInformation("Services returned by specification: {Count}", services.Count);

                // Toplam servis sayısını getir
                var countSpecification = new ServicesFilterSpecification(
                    request.SearchString,
                    request.IsActive,
                    request.MaxPrice,
                    request.TenantId);
                var totalServices = await _serviceRepository.CountAsync(countSpecification);
                _logger.LogInformation("Total service count from CountAsync: {Count}", totalServices);

                // DTO'lara dönüştür
                var serviceDtos = _mapper.Map<List<ServiceDto>>(services);

                // Sayfalanmış sonuç oluştur
                return new PaginatedList<ServiceDto>(
                    serviceDtos,
                    totalServices,
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