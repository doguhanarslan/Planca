using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Commands.CreateGuestAppointment
{
    public class CreateGuestAppointmentCommandValidator : AbstractValidator<CreateGuestAppointmentCommand>
    {
        public CreateGuestAppointmentCommandValidator()
        {
            RuleFor(v => v.GuestFirstName)
                .NotEmpty().WithMessage("Ad gereklidir.")
                .MaximumLength(100).WithMessage("Ad en fazla 100 karakter olabilir.")
                .Matches(@"^[a-zA-ZıİğĞüÜşŞöÖçÇ\s]+$").WithMessage("Ad sadece harf içerebilir.");

            RuleFor(v => v.GuestLastName)
                .NotEmpty().WithMessage("Soyad gereklidir.")
                .MaximumLength(100).WithMessage("Soyad en fazla 100 karakter olabilir.")
                .Matches(@"^[a-zA-ZıİğĞüÜşŞöÖçÇ\s]+$").WithMessage("Soyad sadece harf içerebilir.");

            RuleFor(v => v.GuestEmail)
                .NotEmpty().WithMessage("E-posta gereklidir.")
                .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
                .MaximumLength(255).WithMessage("E-posta en fazla 255 karakter olabilir.");

            RuleFor(v => v.GuestPhoneNumber)
                .NotEmpty().WithMessage("Telefon numarası gereklidir.")
                .MaximumLength(20).WithMessage("Telefon numarası en fazla 20 karakter olabilir.")
                .Matches(@"^[\d\s\+\-\(\)]+$").WithMessage("Geçerli bir telefon numarası giriniz.");

            RuleFor(v => v.ServiceId)
                .NotEmpty().WithMessage("Hizmet seçimi gereklidir.");

            RuleFor(v => v.EmployeeId)
                .NotEmpty().WithMessage("Personel seçimi gereklidir.");

            RuleFor(v => v.StartTime)
                .NotEmpty().WithMessage("Randevu zamanı gereklidir.")
                .GreaterThan(DateTime.UtcNow).WithMessage("Randevu zamanı gelecekte olmalıdır.");

            RuleFor(v => v.TenantId)
                .NotEmpty().WithMessage("İşletme bilgisi gereklidir.");

            RuleFor(v => v.CustomerMessage)
                .MaximumLength(1000).WithMessage("Mesaj en fazla 1000 karakter olabilir.");

            RuleFor(v => v.Notes)
                .MaximumLength(500).WithMessage("Notlar en fazla 500 karakter olabilir.");
        }
    }
}
