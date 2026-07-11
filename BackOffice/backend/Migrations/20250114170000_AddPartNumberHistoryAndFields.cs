using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPartNumberHistoryAndFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClienteId",
                table: "PartNumbers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClienteNome",
                table: "PartNumbers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "PartNumbers",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "History_PartNumber",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartNumberId = table.Column<int>(type: "int", nullable: false),
                    Changes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Observation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_History_PartNumber", x => x.Id);
                    table.ForeignKey(
                        name: "FK_History_PartNumber_PartNumbers_PartNumberId",
                        column: x => x.PartNumberId,
                        principalTable: "PartNumbers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_History_PartNumber_PartNumberId",
                table: "History_PartNumber",
                column: "PartNumberId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "History_PartNumber");

            migrationBuilder.DropColumn(
                name: "ClienteId",
                table: "PartNumbers");

            migrationBuilder.DropColumn(
                name: "ClienteNome",
                table: "PartNumbers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "PartNumbers");
        }
    }
}
