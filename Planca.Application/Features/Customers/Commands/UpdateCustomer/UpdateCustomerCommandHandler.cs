using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.ValueObjects;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Customers.Commands.UpdateCustomer
{
    public class UpdateCustomerCommandHandler : IRequestHandler<UpdateCustomerCommand, Result<CustomerDto>>
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public UpdateCustomerCommandHandler(
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

        public async Task<Result<CustomerDto>> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
        {
            // 1. Müşteriyi veritabanından getir
            var customer = await _customerRepository.GetByIdAsync(request.Id);
            if (customer == null)
            {
                throw new NotFoundException(nameof(Customer), request.Id);
            }

            // 2. Tenant güvenlik kontrolü
            if (customer.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // 3. Temel bilgileri güncelle
            customer.FirstName = request.FirstName;
            customer.LastName = request.LastName;
            customer.Email = request.Email;
            customer.PhoneNumber = request.PhoneNumber;
            customer.Notes = request.Notes;
            customer.LastModifiedBy = _currentUserService.UserId ?? "System";
            customer.LastModifiedAt = DateTime.UtcNow;

            // 4. Adres bilgisini güncelle
            //if (request.Address != null)
            //{
            //    customer.Address = new Address
            //    {
            //        Street = request.Address.Street,
            //        City = request.Address.City,
            //        State = request.Address.State,
            //        ZipCode = request.Address.ZipCode,
            //        Country = request.Address.Country
            //    };
            //}

            // 5. Repository'de güncelle
            await _customerRepository.UpdateAsync(customer);

            // 6. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 7. DTO'ya dönüştür ve sonucu döndür
            var customerDto = _mapper.Map<CustomerDto>(customer);
            return Result<CustomerDto>.Success(customerDto);
        }
    }
}