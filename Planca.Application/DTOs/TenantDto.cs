﻿using System;
using System.Collections.Generic;

namespace Planca.Application.DTOs
{
    public class TenantDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Subdomain { get; set; }
        public string LogoUrl { get; set; }
        public string PrimaryColor { get; set; }
        public bool IsActive { get; set; }

        // Adres bilgileri
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string ZipCode { get; set; }

        // Çalışma saatleri
        public List<TenantWorkingHoursDto> WorkingHours { get; set; }
    }

    
}