using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Planca.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigurationsAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "appointments",
                columns: table => new
                {
                    ıd = table.Column<Guid>(type: "uuid", nullable: false),
                    customerıd = table.Column<Guid>(type: "uuid", nullable: false),
                    employeeıd = table.Column<Guid>(type: "uuid", nullable: false),
                    serviceıd = table.Column<Guid>(type: "uuid", nullable: false),
                    starttime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    endtime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false),
                    notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    tenantıd = table.Column<Guid>(type: "uuid", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    createdby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_appointments", x => x.ıd);
                });

            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    ıd = table.Column<Guid>(type: "uuid", nullable: false),
                    userıd = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    firstname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    lastname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phonenumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "jsonb", nullable: false),
                    notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    tenantıd = table.Column<Guid>(type: "uuid", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    createdby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_customers", x => x.ıd);
                });

            migrationBuilder.CreateTable(
                name: "employees",
                columns: table => new
                {
                    ıd = table.Column<Guid>(type: "uuid", nullable: false),
                    userıd = table.Column<string>(type: "character varying(36)", maxLength: 36, nullable: false),
                    firstname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    lastname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    phonenumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ısactive = table.Column<bool>(type: "boolean", nullable: false),
                    serviceıds = table.Column<string>(type: "jsonb", nullable: false),
                    WorkingHours = table.Column<string>(type: "jsonb", nullable: false),
                    tenantıd = table.Column<Guid>(type: "uuid", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    createdby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_employees", x => x.ıd);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    ıd = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalizedname = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    concurrencystamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_aspnetroles", x => x.ıd);
                });

            migrationBuilder.CreateTable(
                name: "services",
                columns: table => new
                {
                    ıd = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    durationminutes = table.Column<int>(type: "integer", nullable: false),
                    ısactive = table.Column<bool>(type: "boolean", nullable: false),
                    color = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    tenantıd = table.Column<Guid>(type: "uuid", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    createdby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_services", x => x.ıd);
                });

            migrationBuilder.CreateTable(
                name: "tenants",
                columns: table => new
                {
                    ıd = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    subdomain = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    connectionstring = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    logourl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    primarycolor = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ısactive = table.Column<bool>(type: "boolean", nullable: false),
                    tenantıd = table.Column<Guid>(type: "uuid", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    createdby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedby = table.Column<string>(type: "text", nullable: false),
                    lastmodifiedat = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tenants", x => x.ıd);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    ıd = table.Column<string>(type: "text", nullable: false),
                    firstname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    lastname = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    tenantıd = table.Column<Guid>(type: "uuid", nullable: true),
                    refreshtoken = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    refreshtokenexpirytime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ısactive = table.Column<bool>(type: "boolean", nullable: false),
                    username = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalizedusername = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    normalizedemail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    emailconfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    passwordhash = table.Column<string>(type: "text", nullable: true),
                    securitystamp = table.Column<string>(type: "text", nullable: true),
                    concurrencystamp = table.Column<string>(type: "text", nullable: true),
                    phonenumber = table.Column<string>(type: "text", nullable: true),
                    phonenumberconfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    twofactorenabled = table.Column<bool>(type: "boolean", nullable: false),
                    lockoutend = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    lockoutenabled = table.Column<bool>(type: "boolean", nullable: false),
                    accessfailedcount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_aspnetusers", x => x.ıd);
                });

            migrationBuilder.CreateTable(
                name: "role_claims",
                columns: table => new
                {
                    ıd = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    roleıd = table.Column<string>(type: "text", nullable: false),
                    claimtype = table.Column<string>(type: "text", nullable: true),
                    claimvalue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_aspnetroleclaims", x => x.ıd);
                    table.ForeignKey(
                        name: "fk_aspnetroleclaims_aspnetroles_roleıd",
                        column: x => x.roleıd,
                        principalTable: "roles",
                        principalColumn: "ıd",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_claims",
                columns: table => new
                {
                    ıd = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    userıd = table.Column<string>(type: "text", nullable: false),
                    claimtype = table.Column<string>(type: "text", nullable: true),
                    claimvalue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_aspnetuserclaims", x => x.ıd);
                    table.ForeignKey(
                        name: "fk_aspnetuserclaims_aspnetusers_userıd",
                        column: x => x.userıd,
                        principalTable: "users",
                        principalColumn: "ıd",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_logins",
                columns: table => new
                {
                    loginprovider = table.Column<string>(type: "text", nullable: false),
                    providerkey = table.Column<string>(type: "text", nullable: false),
                    providerdisplayname = table.Column<string>(type: "text", nullable: true),
                    userıd = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_aspnetuserlogins", x => new { x.loginprovider, x.providerkey });
                    table.ForeignKey(
                        name: "fk_aspnetuserlogins_aspnetusers_userıd",
                        column: x => x.userıd,
                        principalTable: "users",
                        principalColumn: "ıd",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_roles",
                columns: table => new
                {
                    userıd = table.Column<string>(type: "text", nullable: false),
                    roleıd = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_aspnetuserroles", x => new { x.userıd, x.roleıd });
                    table.ForeignKey(
                        name: "fk_aspnetuserroles_aspnetroles_roleıd",
                        column: x => x.roleıd,
                        principalTable: "roles",
                        principalColumn: "ıd",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_aspnetuserroles_aspnetusers_userıd",
                        column: x => x.userıd,
                        principalTable: "users",
                        principalColumn: "ıd",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_tokens",
                columns: table => new
                {
                    userıd = table.Column<string>(type: "text", nullable: false),
                    loginprovider = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_aspnetusertokens", x => new { x.userıd, x.loginprovider, x.name });
                    table.ForeignKey(
                        name: "fk_aspnetusertokens_aspnetusers_userıd",
                        column: x => x.userıd,
                        principalTable: "users",
                        principalColumn: "ıd",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_appointments_customerıd",
                table: "appointments",
                column: "customerıd");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_customerıd_starttime",
                table: "appointments",
                columns: new[] { "customerıd", "starttime" });

            migrationBuilder.CreateIndex(
                name: "IX_appointments_employeeıd",
                table: "appointments",
                column: "employeeıd");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_employeeıd_starttime",
                table: "appointments",
                columns: new[] { "employeeıd", "starttime" });

            migrationBuilder.CreateIndex(
                name: "IX_appointments_starttime",
                table: "appointments",
                column: "starttime");

            migrationBuilder.CreateIndex(
                name: "IX_appointments_status",
                table: "appointments",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_customers_email",
                table: "customers",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "IX_customers_firstname_lastname",
                table: "customers",
                columns: new[] { "firstname", "lastname" });

            migrationBuilder.CreateIndex(
                name: "ıx_aspnetroleclaims_roleıd",
                table: "role_claims",
                column: "roleıd");

            migrationBuilder.CreateIndex(
                name: "rolenameındex",
                table: "roles",
                column: "normalizedname",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_services_ısactive",
                table: "services",
                column: "ısactive");

            migrationBuilder.CreateIndex(
                name: "IX_services_name",
                table: "services",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_tenants_ısactive",
                table: "tenants",
                column: "ısactive");

            migrationBuilder.CreateIndex(
                name: "IX_tenants_subdomain",
                table: "tenants",
                column: "subdomain",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ıx_aspnetuserclaims_userıd",
                table: "user_claims",
                column: "userıd");

            migrationBuilder.CreateIndex(
                name: "ıx_aspnetuserlogins_userıd",
                table: "user_logins",
                column: "userıd");

            migrationBuilder.CreateIndex(
                name: "ıx_aspnetuserroles_roleıd",
                table: "user_roles",
                column: "roleıd");

            migrationBuilder.CreateIndex(
                name: "emailındex",
                table: "users",
                column: "normalizedemail");

            migrationBuilder.CreateIndex(
                name: "usernameındex",
                table: "users",
                column: "normalizedusername",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "appointments");

            migrationBuilder.DropTable(
                name: "customers");

            migrationBuilder.DropTable(
                name: "employees");

            migrationBuilder.DropTable(
                name: "role_claims");

            migrationBuilder.DropTable(
                name: "services");

            migrationBuilder.DropTable(
                name: "tenants");

            migrationBuilder.DropTable(
                name: "user_claims");

            migrationBuilder.DropTable(
                name: "user_logins");

            migrationBuilder.DropTable(
                name: "user_roles");

            migrationBuilder.DropTable(
                name: "user_tokens");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
