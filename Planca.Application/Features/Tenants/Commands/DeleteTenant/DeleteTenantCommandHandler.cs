using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Tenants.Commands.DeleteTenant
{
    public class DeleteTenantCommandHandler : IRequestHandler<DeleteTenantCommand, Result>
    {
        private readonly IRepository<Tenant> _tenantRepository;
        private readonly IRepository<Employee> _employeeRepository;
        private readonly IRepository<Customer> _customerRepository;
        private readonly IRepository<Service> _serviceRepository;
        private readonly IRepository<Appointment> _appointmentRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteTenantCommandHandler(
            IRepository<Tenant> tenantRepository,
            IRepository<Employee> employeeRepository,
            IRepository<Customer> customerRepository,
            IRepository<Service> serviceRepository,
            IRepository<Appointment> appointmentRepository,
            IUnitOfWork unitOfWork)
        {
            _tenantRepository = tenantRepository;
            _employeeRepository = employeeRepository;
            _customerRepository = customerRepository;
            _serviceRepository = serviceRepository;
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
        {
            // 1. Tenant'ı veritabanından getir
            var tenant = await _tenantRepository.GetByIdAsync(request.Id);
            if (tenant == null)
            {
                throw new NotFoundException(nameof(Tenant), request.Id);
            }

            // 2. Tenant'a ait verileri kontrol et
            // Not: Bu kısım veri tutarlılığı için önemli. Gerçek uygulamada bu kontrolü daha kapsamlı yapabilirsiniz.

            // Çalışan kontrolü
            var employeeSpecification = new TenantEntitySpecification<Employee>(request.Id);
            var employeeCount = await _employeeRepository.CountAsync(employeeSpecification);

            // Müşteri kontrolü
            var customerSpecification = new TenantEntitySpecification<Customer>(request.Id);
            var customerCount = await _customerRepository.CountAsync(customerSpecification);

            // Servis kontrolü
            var serviceSpecification = new TenantEntitySpecification<Service>(request.Id);
            var serviceCount = await _serviceRepository.CountAsync(serviceSpecification);

            // Randevu kontrolü
            var appointmentSpecification = new TenantEntitySpecification<Appointment>(request.Id);
            var appointmentCount = await _appointmentRepository.CountAsync(appointmentSpecification);

            // Tenant'a ait veriler varsa silmeyi engelle
            int totalRelatedRecords = employeeCount + customerCount + serviceCount + appointmentCount;
            if (totalRelatedRecords > 0)
            {
                return Result.Failure($"Cannot delete tenant because it has {totalRelatedRecords} related records. " +
                                     $"Please delete all employees, customers, services, and appointments first.");
            }

            // 3. Tenant'ı sil
            await _tenantRepository.DeleteAsync(tenant);

            // 4. Değişiklikleri uygula
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}