using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Planca.Domain.Entities;
using Planca.Domain.Common.Enums;

namespace Planca.Infrastructure.Persistence.Configurations
{
    public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
    {
        public void Configure(EntityTypeBuilder<Appointment> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.TenantId)
                .IsRequired();

            builder.Property(a => a.CustomerId)
                .IsRequired();

            builder.Property(a => a.EmployeeId)
                .IsRequired();

            builder.Property(a => a.ServiceId)
                .IsRequired();

            builder.Property(a => a.StartTime)
                .IsRequired();

            builder.Property(a => a.EndTime)
                .IsRequired();

            builder.Property(a => a.Status)
                .IsRequired()
                .HasConversion<int>(); // Store enum as integer

            builder.Property(a => a.Notes)
                .HasMaxLength(500);

            // Create indexes for efficient querying
            builder.HasIndex(a => a.StartTime);
            builder.HasIndex(a => a.EmployeeId);
            builder.HasIndex(a => a.CustomerId);
            builder.HasIndex(a => a.Status);

            // Combined indexes for common query patterns
            builder.HasIndex(a => new { a.EmployeeId, a.StartTime });
            builder.HasIndex(a => new { a.CustomerId, a.StartTime });
        }
    }
}