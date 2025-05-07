using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Planca.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class refrestokenid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "refreshtoken",
                table: "users",
                newName: "refreshtokenid");

            migrationBuilder.AddColumn<string>(
                name: "hashedrefreshtoken",
                table: "users",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "hashedrefreshtoken",
                table: "users");

            migrationBuilder.RenameColumn(
                name: "refreshtokenid",
                table: "users",
                newName: "refreshtoken");
        }
    }
}
