namespace Planca.Application.DTOs
{
    public class AppointmentDto
    {
        public Guid Id { get; set; }

        // Customer bilgileri - nullable çünkü guest appointment olabilir
        public Guid? CustomerId { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }

        // Employee ve Service bilgileri
        public Guid EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal? ServicePrice { get; set; }
        public int? ServiceDuration { get; set; }

        // Appointment detayları
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }

        // YENİ: Guest appointment alanları
        public bool IsGuestAppointment { get; set; }
        public string GuestFirstName { get; set; }
        public string GuestLastName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhoneNumber { get; set; }
        public string CustomerMessage { get; set; }

        // Audit bilgileri
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public string LastModifiedBy { get; set; }

        // Hesaplanan alanlar
        public string FormattedStartTime => StartTime.ToString("dd.MM.yyyy HH:mm");
        public string FormattedEndTime => EndTime.ToString("dd.MM.yyyy HH:mm");
        public string FormattedDate => StartTime.ToString("dd.MM.yyyy");
        public string FormattedTimeRange => $"{StartTime:HH:mm} - {EndTime:HH:mm}";
        public int DurationMinutes => (int)(EndTime - StartTime).TotalMinutes;

        // Status kontrolleri
        public bool CanBeCanceled => Status == "Scheduled" || Status == "Confirmed" || Status == "Pending";
        public bool CanBeConfirmed => Status == "Pending" || Status == "Scheduled";
        public bool CanBeRejected => Status == "Pending";
        public bool IsCompleted => Status == "Completed";
        public bool IsPending => Status == "Pending";
        public bool IsActive => Status == "Scheduled" || Status == "Confirmed" || Status == "InProgress";

        // Renk kodları (frontend için)
        public string StatusColor
        {
            get
            {
                return Status switch
                {
                    "Pending" => "#f59e0b", // amber-500
                    "Scheduled" => "#3b82f6", // blue-500
                    "Confirmed" => "#10b981", // emerald-500
                    "InProgress" => "#8b5cf6", // violet-500
                    "Completed" => "#059669", // emerald-600
                    "Canceled" => "#ef4444", // red-500
                    "NoShow" => "#9ca3af", // gray-400
                    "Rejected" => "#dc2626", // red-600
                    _ => "#6b7280" // gray-500
                };
            }
        }

        // Status metinleri (Türkçe)
        public string StatusText
        {
            get
            {
                return Status switch
                {
                    "Pending" => "Onay Bekliyor",
                    "Scheduled" => "Zamanlandı",
                    "Confirmed" => "Onaylandı",
                    "InProgress" => "Devam Ediyor",
                    "Completed" => "Tamamlandı",
                    "Canceled" => "İptal Edildi",
                    "NoShow" => "Gelmedi",
                    "Rejected" => "Reddedildi",
                    _ => "Bilinmiyor"
                };
            }
        }
    }

    // Guest appointment oluşturma için özel DTO
    public class CreateGuestAppointmentDto
    {
        // Guest customer bilgileri
        public string GuestFirstName { get; set; }
        public string GuestLastName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhoneNumber { get; set; }
        public string CustomerMessage { get; set; }

        // Appointment bilgileri
        public Guid ServiceId { get; set; }
        public Guid EmployeeId { get; set; }
        public DateTime StartTime { get; set; }
        public string Notes { get; set; }

        // Tenant bilgisi
        public Guid TenantId { get; set; }
    }

    // Business public info için DTO
    public class BusinessPublicInfoDto
    {
        public Guid Id { get; set; }
        public string BusinessName { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public string Website { get; set; }
        public List<string> WorkingDays { get; set; } = new();
        public string WorkingHours { get; set; }
    }

    // Appointment request response DTO
    public class AppointmentRequestResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public Guid? AppointmentId { get; set; }
        public string ConfirmationCode { get; set; } // Müşteriye verilen takip kodu
    }
}