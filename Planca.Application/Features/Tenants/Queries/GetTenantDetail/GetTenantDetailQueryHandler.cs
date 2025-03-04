using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Tenants.Queries.GetTenantDetail
{
    public class GetTenantDetailQueryHandler : IRequestHandler<GetTenantDetailQuery, Result<TenantDto>>
    {
        private readonly IRepository<Tenant> _tenantRepository;
        private readonly IMapper _mapper;

        public GetTenantDetailQueryHandler(
            IRepository<Tenant> tenantRepository,
            IMapper mapper)
        {
            _tenantRepository = tenantRepository;
            _mapper = mapper;
        }

        public async Task<Result<TenantDto>> Handle(GetTenantDetailQuery request, CancellationToken cancellationToken)
        {
            var tenant = await _tenantRepository.GetByIdAsync(request.Id);

            if (tenant == null)
            {
                throw new NotFoundException(nameof(Tenant), request.Id);
            }

            var tenantDto = _mapper.Map<TenantDto>(tenant);

            

            return Result<TenantDto>.Success(tenantDto);
        }
    }
}