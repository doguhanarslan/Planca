using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Tenants.Commands.UpdateTenant
{
    public class UpdateTenantCommandHandler : IRequestHandler<UpdateTenantCommand, Result<TenantDto>>
    {
        private readonly IRepository<Tenant> _tenantRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public UpdateTenantCommandHandler(
            IRepository<Tenant> tenantRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _tenantRepository = tenantRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<TenantDto>> Handle(UpdateTenantCommand request, CancellationToken cancellationToken)
        {
            // 1. Tenant'ı veritabanından getir
            var tenant = await _tenantRepository.GetByIdAsync(request.Id);
            if (tenant == null)
            {
                throw new NotFoundException(nameof(Tenant), request.Id);
            }

            // 2. Subdomain değiştiyse benzersiz mi kontrol et
            if (tenant.Subdomain != request.Subdomain)
            {
                var allTenants = await _tenantRepository.ListAllAsync();
                bool isSubdomainUnique = !allTenants.Any(t =>
                    t.Id != request.Id &&
                    t.Subdomain.ToLower() == request.Subdomain.ToLower());

                if (!isSubdomainUnique)
                {
                    return Result<TenantDto>.Failure($"A tenant with the subdomain '{request.Subdomain}' already exists.");
                }
            }

            // 3. Tenant'ı güncelle
            tenant.Name = request.Name;
            tenant.Subdomain = request.Subdomain.ToLower(); // Subdomainleri küçük harfe çevir
            tenant.LogoUrl = request.LogoUrl;
            tenant.PrimaryColor = request.PrimaryColor;
            tenant.IsActive = request.IsActive;

            // Connection string sadece null değilse güncelle
            if (request.ConnectionString != null)
            {
                tenant.ConnectionString = request.ConnectionString;
            }

            tenant.LastModifiedBy = _currentUserService.UserId ?? "System";
            tenant.LastModifiedAt = DateTime.UtcNow;

            // 4. Repository'de güncelle
            await _tenantRepository.UpdateAsync(tenant);

            // 5. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 6. DTO'ya dönüştür ve sonucu döndür
            var tenantDto = _mapper.Map<TenantDto>(tenant);
            return Result<TenantDto>.Success(tenantDto);
        }
    }
}