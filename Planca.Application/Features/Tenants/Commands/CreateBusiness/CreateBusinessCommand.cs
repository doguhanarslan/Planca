using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;

namespace Planca.Application.Features.Tenants.Commands.CreateBusiness
{
    public class CreateBusinessCommand : IRequest<Result<TenantDto>>
    {
        public string Name { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string PrimaryColor { get; set; } = "#3498db"; // Default renk
        public string UserId { get; set; } // İlişkilendirilecek kullanıcı
        public bool IsActive { get; set; } = true;

        // İşletme Adres Bilgileri
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }

        // Çalışma Saatleri
        public List<WorkDayScheduleDto> WorkSchedule { get; set; } = new List<WorkDayScheduleDto>();
    }
}