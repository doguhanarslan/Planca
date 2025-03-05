using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Planca.Domain.Entities;

namespace Planca.Infrastructure.Persistence.Configurations
{
    public class ServiceConfiguration : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.TenantId)
                .IsRequired();

            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.Description)
                .HasMaxLength(500);

            builder.Property(s => s.Price)
                .IsRequired()
                .HasPrecision(10, 2);  // For currency values, specify precision and scale

            builder.Property(s => s.DurationMinutes)
                .IsRequired();

            builder.Property(s => s.Color)
                .IsRequired()
                .HasMaxLength(10);  // For hex colors like #RRGGBB

            // Create an index for faster name-based searches
            builder.HasIndex(s => s.Name);

            // Create an index for active services
            builder.HasIndex(s => s.IsActive);
        }
    }
}