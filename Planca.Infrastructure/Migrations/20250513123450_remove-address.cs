using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Planca.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class removeaddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "customers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "customers",
                type: "jsonb",
                nullable: false,
                defaultValue: "");
        }
    }
}
