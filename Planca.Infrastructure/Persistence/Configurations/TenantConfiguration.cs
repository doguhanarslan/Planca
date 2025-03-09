using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Planca.Domain.Entities;

namespace Planca.Infrastructure.Persistence.Configurations
{
    public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
    {
        public void Configure(EntityTypeBuilder<Tenant> builder)
        {
            builder.HasKey(t => t.Id);

            // For Tenant entity, TenantId is the same as Id
            builder.Property(t => t.TenantId)
                .IsRequired();

            builder.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(t => t.Subdomain)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(t => t.ConnectionString)
                .HasMaxLength(500).IsRequired(false);

            builder.Property(t => t.LogoUrl)
                .HasMaxLength(1000);

            builder.Property(t => t.PrimaryColor)
                .IsRequired()
                .HasMaxLength(10);  // For hex colors like #RRGGBB

            // Yeni alanlar
            builder.Property(t => t.Address)
                .HasMaxLength(500);

            builder.Property(t => t.City)
                .HasMaxLength(100);

            builder.Property(t => t.State)
                .HasMaxLength(100);

            builder.Property(t => t.ZipCode)
                .HasMaxLength(20);

            // Create a unique index for subdomains to ensure they're unique
            builder.HasIndex(t => t.Subdomain)
                .IsUnique();

            // Create an index for active tenants
            builder.HasIndex(t => t.IsActive);

            // Tenant ve WorkingHours arasında ilişki
            builder.HasMany(t => t.WorkingHours)
                .WithOne(w => w.Tenant)
                .HasForeignKey(w => w.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}