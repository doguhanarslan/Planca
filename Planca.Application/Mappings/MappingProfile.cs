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
            CreateMap<Service, ServiceDto>()
                .ForMember(d => d.Id, opt => opt.MapFrom(s => s.Id))
                .ForMember(d => d.Name, opt => opt.MapFrom(s => s.Name))
                .ForMember(d => d.Description, opt => opt.MapFrom(s => s.Description))
                .ForMember(d => d.Price, opt => opt.MapFrom(s => s.Price))
                .ForMember(d => d.DurationMinutes, opt => opt.MapFrom(s => s.DurationMinutes))
                .ForMember(d => d.IsActive, opt => opt.MapFrom(s => s.IsActive))
                .ForMember(d => d.Color, opt => opt.MapFrom(s => s.Color))
                .ForMember(d => d.TenantId, opt => opt.MapFrom(s => s.TenantId))
                .ForMember(d => d.CreatedAt, opt => opt.MapFrom(s => s.CreatedAt))
                .ForMember(d => d.CreatedBy, opt => opt.MapFrom(s => s.CreatedBy))
                .ForMember(d => d.LastModifiedBy, opt => opt.MapFrom(s => s.LastModifiedBy))
                .ForMember(d => d.LastModifiedAt, opt => opt.MapFrom(s => s.LastModifiedAt));

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
