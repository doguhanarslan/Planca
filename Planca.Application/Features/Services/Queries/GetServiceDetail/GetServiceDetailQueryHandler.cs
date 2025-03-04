using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Services.Queries.GetServiceDetail
{
    public class GetServiceDetailQueryHandler : IRequestHandler<GetServiceDetailQuery, Result<ServiceDto>>
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;

        public GetServiceDetailQueryHandler(
            IServiceRepository serviceRepository,
            IMapper mapper)
        {
            _serviceRepository = serviceRepository;
            _mapper = mapper;
        }

        public async Task<Result<ServiceDto>> Handle(GetServiceDetailQuery request, CancellationToken cancellationToken)
        {
            var service = await _serviceRepository.GetByIdAsync(request.Id);

            if (service == null)
            {
                throw new NotFoundException(nameof(Service), request.Id);
            }

            // Tenant güvenlik kontrolü - TenantId'si uyuşmayan servislere erişimi engelle
            if (service.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            var serviceDto = _mapper.Map<ServiceDto>(service);

            return Result<ServiceDto>.Success(serviceDto);
        }
    }
}