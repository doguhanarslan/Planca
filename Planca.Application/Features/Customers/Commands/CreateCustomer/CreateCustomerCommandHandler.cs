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
        private readonly ICustomerRepository _customerRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public CreateCustomerCommandHandler(
            ICustomerRepository customerRepository,
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
            // Check if email already exists
            var isEmailUnique = true;
            if (request.Email != null)
            {
                isEmailUnique = await _customerRepository.IsEmailUniqueAsync(request.Email);
                if (!isEmailUnique)
                {
                    return Result<CustomerDto>.Failure("Email is already in use.");
                }
            }

            // Create a new customer
            var customer = new Customer
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PhoneNumber = request.PhoneNumber,
                Notes = request.Notes,
                UserId = request.UserId,
                TenantId = request.TenantId,
                CreatedBy = _currentUserService.UserId ?? "System",
                CreatedAt = DateTime.UtcNow
            };

            // Set address if provided
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

            // Add to repository
            await _customerRepository.AddAsync(customer);

            // Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Map back to DTO and return
            var customerDto = _mapper.Map<CustomerDto>(customer);
            return Result<CustomerDto>.Success(customerDto);
        }
    }
}