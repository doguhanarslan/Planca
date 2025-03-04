using AutoMapper;
using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Tenants.Queries.GetTenantsList
{
    public class GetTenantsListQueryHandler : IRequestHandler<GetTenantsListQuery, PaginatedList<TenantDto>>
    {
        private readonly IRepository<Tenant> _tenantRepository;
        private readonly IMapper _mapper;

        public GetTenantsListQueryHandler(
            IRepository<Tenant> tenantRepository,
            IMapper mapper)
        {
            _tenantRepository = tenantRepository;
            _mapper = mapper;
        }

        public async Task<PaginatedList<TenantDto>> Handle(GetTenantsListQuery request, CancellationToken cancellationToken)
        {
            // Tenant listesi için bir spesifikasyon oluştur
            var specification = new TenantsFilterPagingSpecification(
                request.SearchString,
                request.IsActive,
                request.SortBy,
                request.SortAscending,
                request.PageSize,
                (request.PageNumber - 1) * request.PageSize
            );

            // Spesifikasyona göre tenant'ları getir
            var tenants = await _tenantRepository.ListAsync(specification);

            // Toplam tenant sayısını getir
            var countSpecification = new TenantsFilterSpecification(
                request.SearchString,
                request.IsActive);
            var totalTenants = await _tenantRepository.CountAsync(countSpecification);

            // DTO'lara dönüştür
            var tenantDtos = _mapper.Map<List<TenantDto>>(tenants);

            // Sayfalanmış sonuç oluştur
            return new PaginatedList<TenantDto>(
                tenantDtos,
                totalTenants,
                request.PageNumber,
                request.PageSize);
        }
    }
}