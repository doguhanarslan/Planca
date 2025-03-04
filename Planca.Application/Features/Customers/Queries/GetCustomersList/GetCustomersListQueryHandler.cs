using AutoMapper;
using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Customers.Queries.GetCustomersList
{
    public class GetCustomersListQueryHandler : IRequestHandler<GetCustomersListQuery, PaginatedList<CustomerDto>>
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IMapper _mapper;

        public GetCustomersListQueryHandler(
            IRepository<Customer> customerRepository,
            IMapper mapper)
        {
            _customerRepository = customerRepository;
            _mapper = mapper;
        }

        public async Task<PaginatedList<CustomerDto>> Handle(GetCustomersListQuery request, CancellationToken cancellationToken)
        {
            // Müşteri listesi için bir spesifikasyon oluştur
            var specification = new CustomersFilterPagingSpecification(
                request.SearchString,
                request.SortBy,
                request.SortAscending,
                request.PageSize,
                (request.PageNumber - 1) * request.PageSize
            );

            // Spesifikasyona göre müşterileri getir
            var customers = await _customerRepository.ListAsync(specification);

            // Toplam müşteri sayısını getir
            var countSpecification = new CustomersFilterSpecification(request.SearchString);
            var totalCustomers = await _customerRepository.CountAsync(countSpecification);

            // DTO'lara dönüştür
            var customerDtos = _mapper.Map<List<CustomerDto>>(customers);

            // Sayfalanmış sonuç oluştur (Application katmanında tanımlı)
            return new PaginatedList<CustomerDto>(
                customerDtos,
                totalCustomers,
                request.PageNumber,
                request.PageSize);
        }
    }
}