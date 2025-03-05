using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Planca.Domain.Entities;
using Planca.Domain.ValueObjects;
using System.Text.Json;
using System.Collections.Generic;

namespace Planca.Infrastructure.Persistence.Configurations
{
    public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
    {
        public void Configure(EntityTypeBuilder<Employee> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.TenantId)
                .IsRequired();

            builder.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(e => e.PhoneNumber)
                .HasMaxLength(20);

            builder.Property(e => e.Title)
                .HasMaxLength(100);

            builder.Property(e => e.UserId)
                .HasMaxLength(36);

            // Store ServiceIds as a JSON array in PostgreSQL with Value Comparer
            builder.Property(e => e.ServiceIds)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                    v => JsonSerializer.Deserialize<List<Guid>>(v, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }) ?? new List<Guid>())
                .Metadata.SetValueComparer(
                    new ValueComparer<List<Guid>>(
                        (c1, c2) => c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()
                    ));

            // Store WorkingHours as a JSON array in PostgreSQL with Value Comparer
            builder.Property(e => e.WorkingHours)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                    v => JsonSerializer.Deserialize<List<WorkingHours>>(v, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }) ?? new List<WorkingHours>())
                .Metadata.SetValueComparer(
                    new ValueComparer<List<WorkingHours>>(
                        (c1, c2) => c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()
                    ));
        }
    }
}