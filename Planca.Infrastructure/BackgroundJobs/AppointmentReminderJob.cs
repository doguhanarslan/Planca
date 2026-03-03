// Planca.Infrastructure/BackgroundJobs/AppointmentReminderJob.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Planca.Application.Features.Notifications.Events;
using Planca.Domain.Common.Enums;
using Planca.Infrastructure.Persistence.Context;

namespace Planca.Infrastructure.BackgroundJobs
{
    /// <summary>
    /// Hangfire recurring job - Yaklaşan randevuları kontrol edip hatırlatma bildirimi gönderir.
    /// Her 15 dakikada bir çalışır, WhatsApp hatırlatma mesajı gönderilmesi gereken randevuları bulur.
    /// </summary>
    public class AppointmentReminderJob
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AppointmentReminderJob> _logger;

        public AppointmentReminderJob(
            IServiceScopeFactory scopeFactory,
            ILogger<AppointmentReminderJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        /// <summary>
        /// Hangfire tarafından tetiklenen ana metod.
        /// Tüm tenant'lardaki yaklaşan randevuları bulur ve hatırlatma gönderir.
        /// </summary>
        public async Task ExecuteAsync()
        {
            _logger.LogInformation("Randevu hatırlatma job'ı başlatıldı - {Time}", DateTime.UtcNow);

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                // Tüm tenant'ların bildirim ayarlarını al
                var tenantSettings = await dbContext.Settings
                    .AsNoTracking()
                    .Where(s => s.Key == "whatsapp_reminder_hours" && s.IsActive)
                    .ToListAsync();

                // Default hatırlatma süresi: 24 saat
                var defaultReminderHours = 24;

                // Tenant bazlı hatırlatma saatlerini dictionary'e al
                var tenantReminderHours = tenantSettings
                    .ToDictionary(
                        s => s.TenantId,
                        s => int.TryParse(s.Value, out var hours) ? hours : defaultReminderHours
                    );

                // Olası tüm hatırlatma pencerelerini kapsayacak şekilde randevuları çek
                // En kısa: 1 saat, en uzun: 48 saat önceden hatırlatma
                var now = DateTime.UtcNow;
                var maxWindowEnd = now.AddHours(48);

                // Onaylanmış veya zamanlanmış randevuları al (IgnoreQueryFilters: tüm tenant'lar)
                var upcomingAppointments = await dbContext.Appointments
                    .IgnoreQueryFilters()
                    .AsNoTracking()
                    .Include(a => a.Customer)
                    .Include(a => a.Employee)
                    .Include(a => a.Service)
                    .Where(a => a.StartTime > now &&
                                a.StartTime <= maxWindowEnd &&
                                (a.Status == AppointmentStatus.Confirmed ||
                                 a.Status == AppointmentStatus.Scheduled))
                    .ToListAsync();

                if (!upcomingAppointments.Any())
                {
                    _logger.LogInformation("Hatırlatma gönderilecek randevu bulunamadı");
                    return;
                }

                _logger.LogInformation("{Count} adet yaklaşan randevu bulundu, hatırlatmalar kontrol ediliyor",
                    upcomingAppointments.Count);

                var sentCount = 0;
                var skippedCount = 0;

                foreach (var appointment in upcomingAppointments)
                {
                    try
                    {
                        // Tenant'a özel hatırlatma saatini al
                        var reminderHours = tenantReminderHours.GetValueOrDefault(
                            appointment.TenantId, defaultReminderHours);

                        // Hatırlatma zamanı gelmiş mi? (15 dakikalık pencere)
                        var reminderTime = appointment.StartTime.AddHours(-reminderHours);
                        var isInReminderWindow = now >= reminderTime && now <= reminderTime.AddMinutes(15);

                        if (!isInReminderWindow)
                        {
                            skippedCount++;
                            continue;
                        }

                        // Telefon numarası var mı?
                        var customerPhone = appointment.CustomerPhone;
                        if (string.IsNullOrWhiteSpace(customerPhone))
                        {
                            _logger.LogDebug("Randevu {AppointmentId} için telefon numarası yok, atlanıyor",
                                appointment.Id);
                            skippedCount++;
                            continue;
                        }

                        // Tenant bilgilerini al
                        var tenant = await dbContext.Tenants
                            .AsNoTracking()
                            .FirstOrDefaultAsync(t => t.Id == appointment.TenantId);

                        // MediatR notification publish et
                        await mediator.Publish(new AppointmentReminderNotification
                        {
                            AppointmentId = appointment.Id,
                            TenantId = appointment.TenantId,
                            CustomerName = appointment.CustomerName,
                            CustomerPhone = customerPhone,
                            ServiceName = appointment.Service?.Name ?? "Belirtilmemiş",
                            EmployeeName = appointment.Employee != null
                                ? $"{appointment.Employee.FirstName} {appointment.Employee.LastName}"
                                : "Belirtilmemiş",
                            BusinessName = tenant?.Name ?? "İşletme",
                            AppointmentDateTime = appointment.StartTime,
                            AppointmentEndTime = appointment.EndTime,
                            ServiceDurationMinutes = appointment.Service?.DurationMinutes ?? 0,
                            HoursBeforeAppointment = reminderHours
                        });

                        sentCount++;
                        _logger.LogInformation(
                            "Hatırlatma bildirimi gönderildi - Randevu: {AppointmentId}, Müşteri: {CustomerName}",
                            appointment.Id, appointment.CustomerName);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex,
                            "Randevu {AppointmentId} için hatırlatma bildirimi gönderilirken hata oluştu",
                            appointment.Id);
                    }
                }

                _logger.LogInformation(
                    "Randevu hatırlatma job'ı tamamlandı - Gönderilen: {SentCount}, Atlanan: {SkippedCount}",
                    sentCount, skippedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Randevu hatırlatma job'ında kritik hata oluştu");
                throw; // Hangfire retry mekanizması tetiklensin
            }
        }
    }
}
