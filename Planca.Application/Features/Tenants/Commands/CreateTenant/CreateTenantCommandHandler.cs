using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Tenants.Commands.CreateTenant
{
    public class CreateTenantCommandHandler : IRequestHandler<CreateTenantCommand, Result<TenantDto>>
    {
        private readonly IRepository<Tenant> _tenantRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public CreateTenantCommandHandler(
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

        public async Task<Result<TenantDto>> Handle(CreateTenantCommand request, CancellationToken cancellationToken)
        {
            // 1. Subdomain benzersiz mi kontrol et
            var allTenants = await _tenantRepository.ListAllAsync();
            bool isSubdomainUnique = !allTenants.Any(t => t.Subdomain.ToLower() == request.Subdomain.ToLower());
            if (!isSubdomainUnique)
            {
                return Result<TenantDto>.Failure($"A tenant with the subdomain '{request.Subdomain}' already exists.");
            }

            // 2. Tenant entity'si oluştur
            var tenant = new Tenant
            {
                Id = Guid.NewGuid(), // Yeni GUID oluştur
                Name = request.Name,
                Subdomain = request.Subdomain.ToLower(), // Subdomainleri küçük harfe çevir
                LogoUrl = request.LogoUrl,
                PrimaryColor = request.PrimaryColor,
                ConnectionString = request.ConnectionString,
                IsActive = request.IsActive,
                CreatedBy = _currentUserService.UserId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            // Tenantlar için özel durum: TenantId, Id ile aynı olmalı
            tenant.TenantId = tenant.Id;

            // 3. Repository'ye kaydet
            await _tenantRepository.AddAsync(tenant);

            // 4. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 5. DTO'ya dönüştür ve sonucu döndür
            var tenantDto = _mapper.Map<TenantDto>(tenant);
            return Result<TenantDto>.Success(tenantDto);
        }
    }
}