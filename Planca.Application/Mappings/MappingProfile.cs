using AutoMapper;
using Planca.Application.DTOs;
using Planca.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Appointment mappings
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.CustomerName, opt => opt.Ignore())
                .ForMember(d => d.EmployeeName, opt => opt.Ignore())
                .ForMember(d => d.ServiceName, opt => opt.Ignore());

            // Employee mappings
            CreateMap<Employee, EmployeeDto>()
                .ForMember(d => d.FullName, opt => opt.MapFrom(s => $"{s.FirstName} {s.LastName}"));

            // Service mappings
            CreateMap<Service, ServiceDto>();

            // Customer mappings
            CreateMap<Customer, CustomerDto>()
                .ForMember(d => d.FullName, opt => opt.MapFrom(s => $"{s.FirstName} {s.LastName}"))
                .ForMember(d => d.FullAddress, opt => opt.MapFrom(s => s.Address.FullAddress));

            // Tenant mappings
            CreateMap<Tenant, TenantDto>();
            CreateMap<TenantWorkingHours, TenantWorkingHoursDto>();
        }
    }
}
