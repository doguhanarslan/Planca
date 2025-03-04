using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Customers.Queries.GetCustomerDetail
{
    public class GetCustomerDetailQueryHandler : IRequestHandler<GetCustomerDetailQuery, Result<CustomerDto>>
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IMapper _mapper;

        public GetCustomerDetailQueryHandler(
            IRepository<Customer> customerRepository,
            IMapper mapper)
        {
            _customerRepository = customerRepository;
            _mapper = mapper;
        }

        public async Task<Result<CustomerDto>> Handle(GetCustomerDetailQuery request, CancellationToken cancellationToken)
        {
            var customer = await _customerRepository.GetByIdAsync(request.Id);

            if (customer == null)
            {
                throw new NotFoundException(nameof(Customer), request.Id);
            }

            // Tenant güvenlik kontrolü - TenantId'si uyuşmayan müşterilere erişimi engelle
            if (customer.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            var customerDto = _mapper.Map<CustomerDto>(customer);

            return Result<CustomerDto>.Success(customerDto);
        }
    }
}