﻿using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Appointments.Commands.CancelAppointment
{
    public class CancelAppointmentCommand : IRequest<Result<AppointmentDto>>, ITenantRequest
    {
        // İptal edilecek randevu ID'si
        public Guid Id { get; set; }

        // İptal nedeni (opsiyonel)
        public string CancellationReason { get; set; }

        // İptal eden kullanıcı türü (Customer, Employee, Admin vb.)
        public string CanceledBy { get; set; }

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }
    }
}