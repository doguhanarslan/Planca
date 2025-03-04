using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Customers.Commands.DeleteCustomer
{
    public class DeleteCustomerCommandHandler : IRequestHandler<DeleteCustomerCommand, Result>
    {
        private readonly IRepository<Customer> _customerRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAppointmentRepository _appointmentRepository;

        public DeleteCustomerCommandHandler(
            IRepository<Customer> customerRepository,
            IUnitOfWork unitOfWork,
            IAppointmentRepository appointmentRepository)
        {
            _customerRepository = customerRepository;
            _unitOfWork = unitOfWork;
            _appointmentRepository = appointmentRepository;
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

            // 3. Müşterinin randevuları var mı kontrol et
            var appointments = await _appointmentRepository.GetAppointmentsForCustomerAsync(request.Id);
            if (appointments.Any()) // Count() yerine Any() kullanmak daha verimli
            {
                return Result.Failure("Cannot delete customer with existing appointments. Please delete the appointments first.");
            }

            // 4. Müşteriyi sil
            await _customerRepository.DeleteAsync(customer);

            // 5. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}