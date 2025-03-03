using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Planca.Domain.Entities;

namespace Planca.Infrastructure.Persistence.Configurations
{
    public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.TenantId)
                .IsRequired();

            builder.Property(a => a.StartTime)
                .IsRequired();

            builder.Property(a => a.EndTime)
                .IsRequired();

            builder.Property(a => a.Status)
                .IsRequired();

            builder.Property(a => a.Notes)
                .HasMaxLength(500);

            // PostgreSQL'de JSON veri tipini kullanmak istersek (örnek)
            // builder.Property(a => a.SomeJsonData)
            //    .HasColumnType("jsonb");

            // İlişkiler
            // Global Query Filter bunları otomatik filtreleyeceği için
            // tenantId koşulu eklememize gerek yok
        }
    }
}