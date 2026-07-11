using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDeletedToQualityCertificate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AnalystsCertificate_Certificate_IsDefault",
                table: "AnalystsCertificate");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "TechnicalStandards",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Item",
                table: "SpecialProcessCertificates",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "SpecialProcessCertificates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "SpecialProcess",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "QualityCertificates",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "QualityCertificates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "PurchaseOrders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "ProductDocumentControls",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "ProductConformityCertificates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

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

            migrationBuilder.AddColumn<string>(
                name: "DrawingRevision",
                table: "PartNumbers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "PartNumbers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "PartNumbers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NormaRevision",
                table: "Parameters",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "Parameters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "OperationProcess",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "Controle_Eleb",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "Cliente",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "AnalystsCertificate",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "AnalystsCertificate",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UpdateBy",
                table: "Analysts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

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
                });

            migrationBuilder.CreateTable(
                name: "History_SpecialProcess",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SpecialProcessId = table.Column<int>(type: "int", nullable: false),
                    Changes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Observation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_History_SpecialProcess", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RNC",
                columns: table => new
                {
                    CodeMach = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Operator = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IndProd1 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IndProd3 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    QntdNC = table.Column<int>(type: "int", nullable: true),
                    Data1 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Data2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DataGerado = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Cliente = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Causador = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnalystsCertificate_Certificate_IsDefault",
                table: "AnalystsCertificate",
                columns: new[] { "Certificate", "IsDefault" },
                unique: true,
                filter: "[IsDeleted] = 0 AND [IsDefault] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_History_PartNumber_PartNumberId",
                table: "History_PartNumber",
                column: "PartNumberId");

            migrationBuilder.CreateIndex(
                name: "IX_History_SpecialProcess_SpecialProcessId",
                table: "History_SpecialProcess",
                column: "SpecialProcessId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "History_PartNumber");

            migrationBuilder.DropTable(
                name: "History_SpecialProcess");

            migrationBuilder.DropTable(
                name: "RNC");

            migrationBuilder.DropIndex(
                name: "IX_AnalystsCertificate_Certificate_IsDefault",
                table: "AnalystsCertificate");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "TechnicalStandards");

            migrationBuilder.DropColumn(
                name: "Item",
                table: "SpecialProcessCertificates");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "SpecialProcessCertificates");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "SpecialProcess");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "QualityCertificates");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "QualityCertificates");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "PurchaseOrders");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "ProductDocumentControls");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "ProductConformityCertificates");

            migrationBuilder.DropColumn(
                name: "ClienteId",
                table: "PartNumbers");

            migrationBuilder.DropColumn(
                name: "ClienteNome",
                table: "PartNumbers");

            migrationBuilder.DropColumn(
                name: "DrawingRevision",
                table: "PartNumbers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "PartNumbers");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "PartNumbers");

            migrationBuilder.DropColumn(
                name: "NormaRevision",
                table: "Parameters");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "Parameters");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "OperationProcess");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "Controle_Eleb");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "Cliente");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "AnalystsCertificate");

            migrationBuilder.DropColumn(
                name: "UpdateBy",
                table: "Analysts");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "AnalystsCertificate",
                type: "int",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.CreateIndex(
                name: "IX_AnalystsCertificate_Certificate_IsDefault",
                table: "AnalystsCertificate",
                columns: new[] { "Certificate", "IsDefault" },
                filter: "[IsDeleted] = 0 AND [IsDefault] = 1");
        }
    }
}
