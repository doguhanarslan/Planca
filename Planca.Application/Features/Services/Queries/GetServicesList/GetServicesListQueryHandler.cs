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

namespace Planca.Application.Features.Services.Queries.GetServicesList
{
    public class GetServicesListQueryHandler : IRequestHandler<GetServicesListQuery, PaginatedList<ServiceDto>>
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;

        public GetServicesListQueryHandler(
            IServiceRepository serviceRepository,
            IMapper mapper)
        {
            _serviceRepository = serviceRepository;
            _mapper = mapper;
        }

        public async Task<PaginatedList<ServiceDto>> Handle(GetServicesListQuery request, CancellationToken cancellationToken)
        {
            // Servis listesi için bir spesifikasyon oluştur
            var specification = new ServicesFilterPagingSpecification(
                request.SearchString,
                request.IsActive,
                request.MaxPrice,
                request.SortBy,
                request.SortAscending,
                request.PageSize,
                (request.PageNumber - 1) * request.PageSize
            );

            // Spesifikasyona göre servisleri getir
            var services = await _serviceRepository.ListAsync(specification);

            // Toplam servis sayısını getir
            var countSpecification = new ServicesFilterSpecification(
                request.SearchString,
                request.IsActive,
                request.MaxPrice);
            var totalServices = await _serviceRepository.CountAsync(countSpecification);

            // DTO'lara dönüştür
            var serviceDtos = _mapper.Map<List<ServiceDto>>(services);

            // Sayfalanmış sonuç oluştur
            return new PaginatedList<ServiceDto>(
                serviceDtos,
                totalServices,
                request.PageNumber,
                request.PageSize);
        }
    }
}