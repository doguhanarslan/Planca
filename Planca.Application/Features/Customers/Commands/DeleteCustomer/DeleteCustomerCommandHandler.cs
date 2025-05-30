using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Customers.Commands.DeleteCustomer
{
    public class DeleteCustomerCommandHandler : IRequestHandler<DeleteCustomerCommand, Result>
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteCustomerCommandHandler(
            IRepository<Customer> customerRepository,
            IUnitOfWork unitOfWork)
        {
            _customerRepository = customerRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
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

            // 3. Soft delete yaparak müşteriyi sil
            // Randevu kontrolü artık gerekli değil çünkü soft delete yapıyoruz
            // Müşteri silindiğinde randevular görünmez olacak ama veri kaybolmayacak
            await _customerRepository.DeleteAsync(customer);

            // 4. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}