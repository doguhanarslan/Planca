using AutoMapper;
using MediatR;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.ValueObjects;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Customers.Commands.CreateCustomer
{
    public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, Result<CustomerDto>>
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public CreateCustomerCommandHandler(
            IRepository<Customer> customerRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _customerRepository = customerRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<Result<CustomerDto>> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
        {
            // 1. Müşteri entity'si oluştur
            var customer = new Customer
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                UserId = request.UserId,
                Notes = request.Notes,
                TenantId = request.TenantId,
                CreatedBy = _currentUserService.UserId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            // 2. Adres bilgisi varsa ekle
            if (request.Address != null)
            {
                customer.Address = new Address
                {
                    Street = request.Address.Street,
                    City = request.Address.City,
                    State = request.Address.State,
                    ZipCode = request.Address.ZipCode,
                    Country = request.Address.Country
                };
            }

            // 3. Repository'ye kaydet
            await _customerRepository.AddAsync(customer);

            // 4. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 5. DTO'ya dönüştür ve sonucu döndür
            var customerDto = _mapper.Map<CustomerDto>(customer);
            return Result<CustomerDto>.Success(customerDto);
        }
    }
}