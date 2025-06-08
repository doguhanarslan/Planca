using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Planca.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSettingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    key = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    datatype = table.Column<string>(type: "text", nullable: false),
                    isactive = table.Column<bool>(type: "boolean", nullable: false),
                    issystemsetting = table.Column<bool>(type: "boolean", nullable: false),
                    displayorder = table.Column<int>(type: "integer", nullable: false),
                    tenantid = table.Column<Guid>(type: "uuid", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    createdby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    isdeleted = table.Column<bool>(type: "boolean", nullable: false),
                    deletedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deletedby = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_settings", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "settings");
        }
    }
}
