using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Planca.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestAppointmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "IX_appointments_employeeid",
                table: "appointments",
                newName: "ix_appointments_employeeid");

            migrationBuilder.RenameIndex(
                name: "IX_appointments_customerid",
                table: "appointments",
                newName: "ix_appointments_customerid");

            migrationBuilder.AlterColumn<string>(
                name: "notes",
                table: "appointments",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<string>(
                name: "customermessage",
                table: "appointments",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guestemail",
                table: "appointments",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guestfirstname",
                table: "appointments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guestlastname",
                table: "appointments",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "guestphonenumber",
                table: "appointments",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "isguestappointment",
                table: "appointments",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_appointments_guestemail",
                table: "appointments",
                column: "guestemail");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_isguestappointment",
                table: "appointments",
                column: "isguestappointment");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_tenantid",
                table: "appointments",
                column: "tenantid");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_tenantid_isguestappointment_status",
                table: "appointments",
                columns: new[] { "tenantid", "isguestappointment", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_appointments_tenantid_status_starttime",
                table: "appointments",
                columns: new[] { "tenantid", "status", "starttime" });

            migrationBuilder.CreateIndex(
                name: "ix_appointments_serviceid",
                table: "appointments",
                column: "serviceid");

            migrationBuilder.AddForeignKey(
                name: "fk_appointments_customers_customerid",
                table: "appointments",
                column: "customerid",
                principalTable: "customers",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "fk_appointments_employees_employeeid",
                table: "appointments",
                column: "employeeid",
                principalTable: "employees",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "fk_appointments_services_serviceid",
                table: "appointments",
                column: "serviceid",
                principalTable: "services",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_appointments_customers_customerid",
                table: "appointments");

            migrationBuilder.DropForeignKey(
                name: "fk_appointments_employees_employeeid",
                table: "appointments");

            migrationBuilder.DropForeignKey(
                name: "fk_appointments_services_serviceid",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "IX_appointments_guestemail",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "IX_appointments_isguestappointment",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "IX_appointments_tenantid",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "IX_appointments_tenantid_isguestappointment_status",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "IX_appointments_tenantid_status_starttime",
                table: "appointments");

            migrationBuilder.DropIndex(
                name: "ix_appointments_serviceid",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "customermessage",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "guestemail",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "guestfirstname",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "guestlastname",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "guestphonenumber",
                table: "appointments");

            migrationBuilder.DropColumn(
                name: "isguestappointment",
                table: "appointments");

            migrationBuilder.RenameIndex(
                name: "ix_appointments_employeeid",
                table: "appointments",
                newName: "IX_appointments_employeeid");

            migrationBuilder.RenameIndex(
                name: "ix_appointments_customerid",
                table: "appointments",
                newName: "IX_appointments_customerid");

            migrationBuilder.AlterColumn<string>(
                name: "notes",
                table: "appointments",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldDefaultValue: "");
        }
    }
}
