using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System.Collections.Generic;
using System.Linq;
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
            // Tüm verileri tek bir sorgu ile getirmek için daha verimli yaklaşım

            // Temel müşteri sorgusu oluştur
            var baseSpecification = new CustomersFilterSpecification(request.SearchString, request.TenantId);
            
            // IQueryable olarak al (veritabanına henüz sorgu yapmaz)
            var query = _customerRepository.GetQuery(baseSpecification);

            // Toplam sayıyı al (COUNT sorgusu)
            var totalCustomers = await query.CountAsync(cancellationToken);

            // Sıralama uygula
            if (!string.IsNullOrEmpty(request.SortBy))
            {
                query = ApplySorting(query, request.SortBy, request.SortAscending);
            }
            else
            {
                // Varsayılan sıralama
                query = query.OrderBy(c => c.LastName);
            }

            // Sayfalama uygula ve verileri getir (tek sorgu)
            var customers = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            // DTO'lara dönüştür
            var customerDtos = _mapper.Map<List<CustomerDto>>(customers);

            // Sayfalanmış sonuç oluştur
            return new PaginatedList<CustomerDto>(
                customerDtos,
                totalCustomers,
                request.PageNumber,
                request.PageSize);
        }

        private static IQueryable<Customer> ApplySorting(IQueryable<Customer> query, string sortBy, bool sortAscending)
        {
            return sortBy.ToLower() switch
            {
                "firstname" => sortAscending 
                    ? query.OrderBy(c => c.FirstName) 
                    : query.OrderByDescending(c => c.FirstName),
                
                "email" => sortAscending 
                    ? query.OrderBy(c => c.Email) 
                    : query.OrderByDescending(c => c.Email),
                
                "createdat" => sortAscending 
                    ? query.OrderBy(c => c.CreatedAt) 
                    : query.OrderByDescending(c => c.CreatedAt),
                
                _ => sortAscending // Default "LastName"
                    ? query.OrderBy(c => c.LastName) 
                    : query.OrderByDescending(c => c.LastName)
            };
        }
    }
}