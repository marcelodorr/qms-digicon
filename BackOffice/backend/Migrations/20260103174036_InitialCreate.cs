using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Analysts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Analyst = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Signature = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Analysts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Cliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Cliente = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Endereco = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cliente", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Controle_Eleb",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OP_ELEB = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PO_ELEB = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    COD_ELEB = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Part_Number = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Valor_Peca = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Analise_PO = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Revisao_Desenho = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Qtd_Saldo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Decapagem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SN_Decap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CD = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SN_Peca = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Cliente = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Situacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lote_ELEB = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Num_Certificado = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Controle_Eleb", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "OperationProcess",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OperationQuantity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OperationDescription = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActivated = table.Column<bool>(type: "bit", nullable: false),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationProcess", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Parameters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Processo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Norma = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Parameter = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Condition = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parameters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PartNumbers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Revision = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartNumbers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductConformityCertificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CertificateNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PartNumberId = table.Column<int>(type: "int", nullable: true),
                    PartNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PartNumberDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PartNumberRevision = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LotNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerPO = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SerialNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InspectedAccording = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnalystId = table.Column<int>(type: "int", nullable: true),
                    AnalystName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentRevision = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DocumentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CustomerAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmissionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductConformityCertificates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductDocumentControls",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocumentRevision = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DocumentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InspectedAccording = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductDocumentControls", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PONumber = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ClienteId = table.Column<int>(type: "int", nullable: false),
                    ClienteNome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Item = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QualityCertificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroCertificado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Ordem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OC = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CodigoCliente = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PartNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValorPeca = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnalisePo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RevisaoDesenho = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantidade = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Decapagem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SNDecapagem = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CDChamado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Cliente = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Fornecedor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RelatorioInspecao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CertificadoMP = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Responsavel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnalystId = table.Column<int>(type: "int", nullable: true),
                    AnalystName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    DesenhoLP = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SNPeca = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TipoEnvio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescricaoOperacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Data = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QualityCertificates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpecialProcess",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SpecialProcess = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Specification = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Revision = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecialProcess", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpecialProcessCertificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CertificateCode = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    ClienteId = table.Column<int>(type: "int", nullable: true),
                    ClienteNome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SpecialProcessId = table.Column<int>(type: "int", nullable: true),
                    SpecialProcess = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    Norma = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    PartNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EmissionDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LotNumber = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    PurchasingOrder = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    HardnessFound = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    HeatTreatLot = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: true),
                    AnalystId = table.Column<int>(type: "int", nullable: true),
                    AnalystName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Observations = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecialProcessCertificates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TechnicalStandards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Cliente = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Processo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Norma = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Revision = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreateBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechnicalStandards", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_PONumber_Item_ClienteId",
                table: "PurchaseOrders",
                columns: new[] { "PONumber", "Item", "ClienteId" },
                unique: true,
                filter: "[IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Analysts");

            migrationBuilder.DropTable(
                name: "Cliente");

            migrationBuilder.DropTable(
                name: "Controle_Eleb");

            migrationBuilder.DropTable(
                name: "OperationProcess");

            migrationBuilder.DropTable(
                name: "Parameters");

            migrationBuilder.DropTable(
                name: "PartNumbers");

            migrationBuilder.DropTable(
                name: "ProductConformityCertificates");

            migrationBuilder.DropTable(
                name: "ProductDocumentControls");

            migrationBuilder.DropTable(
                name: "PurchaseOrders");

            migrationBuilder.DropTable(
                name: "QualityCertificates");

            migrationBuilder.DropTable(
                name: "SpecialProcess");

            migrationBuilder.DropTable(
                name: "SpecialProcessCertificates");

            migrationBuilder.DropTable(
                name: "TechnicalStandards");
        }
    }
}
