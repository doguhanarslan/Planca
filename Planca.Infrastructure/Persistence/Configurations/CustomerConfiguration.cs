﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Planca.Domain.Entities;
using Planca.Domain.ValueObjects;
using System.Text.Json;

namespace Planca.Infrastructure.Persistence.Configurations
{
    public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
    {
        public void Configure(EntityTypeBuilder<Customer> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.TenantId)
                .IsRequired();

            builder.Property(c => c.FirstName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(c => c.LastName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(c => c.Email)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(c => c.PhoneNumber)
                .HasMaxLength(20);

            builder.Property(c => c.Notes)
                .HasMaxLength(1000);

            builder.Property(c => c.UserId)
                .HasMaxLength(36);

            // Store Address as a JSON object in PostgreSQL
            builder.Property(c => c.Address)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }),
                    v => JsonSerializer.Deserialize<Address>(v, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));

            // Create an index for faster email searches
            builder.HasIndex(c => c.Email);

            // Create an index for faster name-based searches
            builder.HasIndex(c => new { c.FirstName, c.LastName });
        }
    }
}