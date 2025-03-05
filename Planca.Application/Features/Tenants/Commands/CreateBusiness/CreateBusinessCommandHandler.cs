using AutoMapper;
using MediatR;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.ValueObjects;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Tenants.Commands.CreateBusiness
{
    public class CreateBusinessCommandHandler : IRequestHandler<CreateBusinessCommand, Result<TenantDto>>
    {
        private readonly IRepository<Tenant> _tenantRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IIdentityService _identityService;

        public CreateBusinessCommandHandler(
            IRepository<Tenant> tenantRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IIdentityService identityService)
        {
            _tenantRepository = tenantRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _identityService = identityService;
        }

        public async Task<Result<TenantDto>> Handle(CreateBusinessCommand request, CancellationToken cancellationToken)
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
                Id = Guid.NewGuid(),
                Name = request.Name,
                Subdomain = request.Subdomain.ToLower(), // Subdomainleri küçük harfe çevir
                LogoUrl = request.LogoUrl,
                PrimaryColor = request.PrimaryColor,
                IsActive = request.IsActive,
                ConnectionString = null, // Varsayılan olarak null
                                         // Adres bilgileri
                Address = request.Address,
                City = request.City,
                State = request.State,
                ZipCode = request.ZipCode,
                CreatedBy = request.UserId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            // Tenantlar için özel durum: TenantId, Id ile aynı olmalı
            tenant.TenantId = tenant.Id;

            // 3. Çalışma saatlerini ekle
            if (request.WorkSchedule != null && request.WorkSchedule.Any())
            {
                tenant.WorkingHours = request.WorkSchedule.Select(ws => new TenantWorkingHours
                {
                    TenantId = tenant.Id,
                    DayOfWeek = ws.Day,
                    OpenTime = ws.OpenTime,
                    CloseTime = ws.CloseTime,
                    IsActive = true,
                    CreatedBy = request.UserId ?? "System",
                    CreatedAt = DateTime.UtcNow
                }).ToList();
            }

            // 4. Repository'ye kaydet
            await _tenantRepository.AddAsync(tenant);

            // 5. Kullanıcıyı tenant ile ilişkilendir
            await _identityService.UpdateUserTenantAsync(request.UserId, tenant.Id);

            // 6. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 7. DTO'ya dönüştür ve sonucu döndür
            var tenantDto = _mapper.Map<TenantDto>(tenant);
            return Result<TenantDto>.Success(tenantDto);
        }
    }
}