using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Planca.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "deletedat",
                table: "tenantworkinghours",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "deletedby",
                table: "tenantworkinghours",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isdeleted",
                table: "tenantworkinghours",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deletedat",
                table: "tenants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "deletedby",
                table: "tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isdeleted",
                table: "tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deletedat",
                table: "services",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "deletedby",
                table: "services",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isdeleted",
                table: "services",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deletedat",
                table: "employees",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "deletedby",
                table: "employees",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isdeleted",
                table: "employees",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deletedat",
                table: "customers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "deletedby",
                table: "customers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isdeleted",
                table: "customers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deletedat",
                table: "appointments",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "deletedby",
                table: "appointments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isdeleted",
                table: "appointments",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "deletedat",
                table: "tenantworkinghours");

            migrationBuilder.DropColumn(
                name: "deletedby",
                table: "tenantworkinghours");

            migrationBuilder.DropColumn(
                name: "isdeleted",
                table: "tenantworkinghours");

            migrationBuilder.DropColumn(
                name: "deletedat",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "deletedby",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "isdeleted",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "deletedat",
                table: "services");

            migrationBuilder.DropColumn(
                name: "deletedby",
                table: "services");

            migrationBuilder.DropColumn(
                name: "isdeleted",
                table: "services");

            migrationBuilder.DropColumn(
                name: "deletedat",
                table: "employees");

            migrationBuilder.DropColumn(
                name: "deletedby",
                table: "employees");

            migrationBuilder.DropColumn(
                name: "isdeleted",
                table: "employees");

            migrationBuilder.DropColumn(
                name: "deletedat",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "deletedby",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "isdeleted",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "deletedat",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "deletedby",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "isdeleted",
                table: "appointments");
        }
    }
}
