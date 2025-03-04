using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Services.Commands.UpdateService
{
    public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand, Result<ServiceDto>>
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public UpdateServiceCommandHandler(
            IServiceRepository serviceRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _serviceRepository = serviceRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<ServiceDto>> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
        {
            // 1. Servisi veritabanından getir
            var service = await _serviceRepository.GetByIdAsync(request.Id);
            if (service == null)
            {
                throw new NotFoundException(nameof(Service), request.Id);
            }

            // 2. Tenant güvenlik kontrolü
            if (service.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // 3. Servis adının benzersiz olup olmadığını kontrol et (kendi ID'si hariç)
            if (service.Name != request.Name)
            {
                bool isNameUnique = await _serviceRepository.IsServiceNameUniqueAsync(request.Name, request.Id);
                if (!isNameUnique)
                {
                    return Result<ServiceDto>.Failure($"A service with the name '{request.Name}' already exists.");
                }
            }

            // 4. Servisi güncelle
            service.Name = request.Name;
            service.Description = request.Description;
            service.Price = request.Price;
            service.DurationMinutes = request.DurationMinutes;
            service.IsActive = request.IsActive;
            service.Color = request.Color;
            service.LastModifiedBy = _currentUserService.UserId ?? "System";
            service.LastModifiedAt = DateTime.UtcNow;

            // 5. Repository'de güncelle
            await _serviceRepository.UpdateAsync(service);

            // 6. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 7. DTO'ya dönüştür ve sonucu döndür
            var serviceDto = _mapper.Map<ServiceDto>(service);
            return Result<ServiceDto>.Success(serviceDto);
        }
    }
}