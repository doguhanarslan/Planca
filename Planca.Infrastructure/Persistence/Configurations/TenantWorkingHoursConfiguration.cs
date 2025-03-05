using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Planca.Domain.Entities;

namespace Planca.Infrastructure.Persistence.Configurations
{
    public class TenantWorkingHoursConfiguration : IEntityTypeConfiguration<TenantWorkingHours>
    {
        public void Configure(EntityTypeBuilder<TenantWorkingHours> builder)
        {
            builder.HasKey(w => w.Id);

            builder.Property(w => w.TenantId)
                .IsRequired();

            builder.Property(w => w.DayOfWeek)
                .IsRequired();

            builder.Property(w => w.OpenTime)
                .IsRequired();

            builder.Property(w => w.CloseTime)
                .IsRequired();

            // TenantId ve DayOfWeek için birleşik unique index
            builder.HasIndex(w => new { w.TenantId, w.DayOfWeek })
                .IsUnique();
        }
    }
}