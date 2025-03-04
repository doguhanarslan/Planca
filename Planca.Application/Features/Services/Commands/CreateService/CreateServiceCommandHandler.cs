using AutoMapper;
using MediatR;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Services.Commands.CreateService
{
    public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, Result<ServiceDto>>
    {
        private readonly IServiceRepository _serviceRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public CreateServiceCommandHandler(
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

        public async Task<Result<ServiceDto>> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
        {
            // Servis adının benzersiz olup olmadığını kontrol et
            bool isNameUnique = await _serviceRepository.IsServiceNameUniqueAsync(request.Name);
            if (!isNameUnique)
            {
                return Result<ServiceDto>.Failure($"A service with the name '{request.Name}' already exists.");
            }

            // Servis entity'si oluştur
            var service = new Service
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                DurationMinutes = request.DurationMinutes,
                IsActive = request.IsActive,
                Color = request.Color,
                TenantId = request.TenantId,
                CreatedBy = _currentUserService.UserId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            // Repository'ye kaydet
            await _serviceRepository.AddAsync(service);

            // Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // DTO'ya dönüştür ve sonucu döndür
            var serviceDto = _mapper.Map<ServiceDto>(service);
            return Result<ServiceDto>.Success(serviceDto);
        }
    }
}