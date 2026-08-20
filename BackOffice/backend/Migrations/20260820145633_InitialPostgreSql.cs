using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgreSql : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Analysts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Analyst = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Signature = table.Column<string>(type: "text", nullable: true),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Analysts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Cliente",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Cliente = table.Column<string>(type: "text", nullable: false),
                    Endereco = table.Column<string>(type: "text", nullable: true),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cliente", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Controle_Eleb",
                columns: table => new
                {
                    ID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OP_ELEB = table.Column<string>(type: "text", nullable: true),
                    OP_Digicon = table.Column<string>(type: "text", nullable: true),
                    PO_ELEB = table.Column<string>(type: "text", nullable: true),
                    COD_ELEB = table.Column<string>(type: "text", nullable: true),
                    Part_Number = table.Column<string>(type: "text", nullable: true),
                    Valor_Peca = table.Column<string>(type: "text", nullable: true),
                    Analise_PO = table.Column<string>(type: "text", nullable: true),
                    Revisao_Desenho = table.Column<string>(type: "text", nullable: true),
                    Qtd_Saldo = table.Column<string>(type: "text", nullable: true),
                    Qtd_Lote = table.Column<string>(type: "text", nullable: true),
                    Qtd_Saldo1 = table.Column<string>(type: "text", nullable: true),
                    Data_Envio_para_ELEB = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    NF_Faturada = table.Column<string>(type: "text", nullable: true),
                    Decapagem = table.Column<string>(type: "text", nullable: true),
                    SN_Decap = table.Column<string>(type: "text", nullable: true),
                    CD = table.Column<string>(type: "text", nullable: true),
                    SN_Peca = table.Column<string>(type: "text", nullable: true),
                    Cliente = table.Column<string>(type: "text", nullable: true),
                    Situacao = table.Column<string>(type: "text", nullable: true),
                    Lote_ELEB = table.Column<string>(type: "text", nullable: true),
                    Num_Certificado = table.Column<string>(type: "text", nullable: true),
                    UpdateBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Controle_Eleb", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "History_PartNumber",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartNumberId = table.Column<int>(type: "integer", nullable: false),
                    Changes = table.Column<string>(type: "text", nullable: true),
                    Observation = table.Column<string>(type: "text", nullable: true),
                    ChangedBy = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_History_PartNumber", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "History_SpecialProcess",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SpecialProcessId = table.Column<int>(type: "integer", nullable: false),
                    Changes = table.Column<string>(type: "text", nullable: true),
                    Observation = table.Column<string>(type: "text", nullable: true),
                    ChangedBy = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_History_SpecialProcess", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "login_certification",
                columns: table => new
                {
                    username = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    salt = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    image = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_login_certification", x => x.username);
                });

            migrationBuilder.CreateTable(
                name: "login_module_permissions",
                columns: table => new
                {
                    username = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    modulekey = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    canview = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    canedit = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    updatedat = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_login_module_permissions", x => new { x.username, x.modulekey });
                });

            migrationBuilder.CreateTable(
                name: "login_password_resets",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tokenhash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    username = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    createdat = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    expiresat = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    usedat = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_login_password_resets", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "login_sessions",
                columns: table => new
                {
                    sessionid = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    createdat = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    lastseen = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    revokedat = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ipaddress = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    useragent = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_login_sessions", x => x.sessionid);
                });

            migrationBuilder.CreateTable(
                name: "OperationProcess",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OperationQuantity = table.Column<string>(type: "text", nullable: false),
                    OperationDescription = table.Column<string>(type: "text", nullable: false),
                    IsActivated = table.Column<bool>(type: "boolean", nullable: false),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationProcess", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Parameters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Processo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Norma = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    NormaRevision = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Parameter = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Condition = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parameters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PartNumbers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartNumber = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Revision = table.Column<string>(type: "text", nullable: true),
                    DrawingRevision = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ClienteId = table.Column<int>(type: "integer", nullable: true),
                    ClienteNome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartNumbers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductConformityCertificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CertificateNumber = table.Column<string>(type: "text", nullable: false),
                    PartNumberId = table.Column<int>(type: "integer", nullable: true),
                    PartNumber = table.Column<string>(type: "text", nullable: false),
                    PartNumberDescription = table.Column<string>(type: "text", nullable: true),
                    PartNumberRevision = table.Column<string>(type: "text", nullable: true),
                    LotNumber = table.Column<string>(type: "text", nullable: true),
                    Quantity = table.Column<string>(type: "text", nullable: true),
                    CustomerPO = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: true),
                    SerialNumber = table.Column<string>(type: "text", nullable: true),
                    InspectedAccording = table.Column<string>(type: "text", nullable: true),
                    AnalystId = table.Column<int>(type: "integer", nullable: true),
                    AnalystName = table.Column<string>(type: "text", nullable: true),
                    DocumentNumber = table.Column<string>(type: "text", nullable: true),
                    DocumentRevision = table.Column<string>(type: "text", nullable: true),
                    DocumentDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CustomerId = table.Column<int>(type: "integer", nullable: true),
                    CustomerName = table.Column<string>(type: "text", nullable: true),
                    CustomerAddress = table.Column<string>(type: "text", nullable: true),
                    EmissionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductConformityCertificates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductDocumentControls",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DocumentNumber = table.Column<string>(type: "text", nullable: false),
                    DocumentRevision = table.Column<string>(type: "text", nullable: false),
                    DocumentDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    InspectedAccording = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductDocumentControls", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PONumber = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    ClienteId = table.Column<int>(type: "integer", nullable: false),
                    ClienteNome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Item = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Comments = table.Column<string>(type: "text", nullable: true),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QualityCertificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ControleElebId = table.Column<int>(type: "integer", nullable: true),
                    NumeroCertificado = table.Column<string>(type: "text", nullable: true),
                    Ordem = table.Column<string>(type: "text", nullable: true),
                    OC = table.Column<string>(type: "text", nullable: true),
                    Lote = table.Column<string>(type: "text", nullable: true),
                    CodigoCliente = table.Column<string>(type: "text", nullable: true),
                    PartNumber = table.Column<string>(type: "text", nullable: true),
                    ValorPeca = table.Column<string>(type: "text", nullable: true),
                    AnalisePo = table.Column<string>(type: "text", nullable: true),
                    RevisaoDesenho = table.Column<string>(type: "text", nullable: true),
                    Quantidade = table.Column<string>(type: "text", nullable: true),
                    Decapagem = table.Column<string>(type: "text", nullable: true),
                    SNDecapagem = table.Column<string>(type: "text", nullable: true),
                    CDChamado = table.Column<string>(type: "text", nullable: true),
                    Cliente = table.Column<string>(type: "text", nullable: true),
                    Fornecedor = table.Column<string>(type: "text", nullable: true),
                    RelatorioInspecao = table.Column<string>(type: "text", nullable: true),
                    CertificadoMP = table.Column<string>(type: "text", nullable: true),
                    Responsavel = table.Column<string>(type: "text", nullable: true),
                    AnalystId = table.Column<int>(type: "integer", nullable: true),
                    AnalystName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    DesenhoLP = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    SNPeca = table.Column<string>(type: "text", nullable: true),
                    TipoEnvio = table.Column<string>(type: "text", nullable: true),
                    DescricaoOperacao = table.Column<string>(type: "text", nullable: true),
                    Data = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QualityCertificates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RNC",
                columns: table => new
                {
                    CodeMach = table.Column<string>(type: "text", nullable: true),
                    Operator = table.Column<string>(type: "text", nullable: true),
                    IndProd1 = table.Column<string>(type: "text", nullable: true),
                    IndProd3 = table.Column<string>(type: "text", nullable: true),
                    QntdNC = table.Column<int>(type: "integer", nullable: true),
                    Data1 = table.Column<string>(type: "text", nullable: true),
                    Data2 = table.Column<string>(type: "text", nullable: true),
                    DataGerado = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Cliente = table.Column<string>(type: "text", nullable: true),
                    Causador = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "ShippingLabelPrintSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    WidthMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    HeightMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MarginLeftMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MarginTopMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MarginRightMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MarginBottomMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BadgeLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    BadgeTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    HeaderLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    HeaderTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    HeaderRightMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CountryLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CountryTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CountryRightMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    WarningLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    WarningTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    WarningRightMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ReferenceLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ReferenceTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ReferenceRightMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    BadgeFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    HeaderFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    CountryFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    WarningFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ReferenceFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BadgeBold = table.Column<bool>(type: "boolean", nullable: false),
                    HeaderBold = table.Column<bool>(type: "boolean", nullable: false),
                    CountryBold = table.Column<bool>(type: "boolean", nullable: false),
                    WarningBold = table.Column<bool>(type: "boolean", nullable: false),
                    ReferenceBold = table.Column<bool>(type: "boolean", nullable: false),
                    BadgeText = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HeaderPrefix = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    AssyHeaderPrefix = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    CountryText = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    WarningText = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BadgeFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    HeaderFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    CountryFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    WarningFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    ReferenceFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    BadgeWidthMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BadgeHeightMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BadgeStrokeWidthMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    PrinterName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingLabelPrintSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ShippingLabels",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartNumberId = table.Column<int>(type: "integer", nullable: false),
                    PartNumber = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ReferenceDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    RangeStart = table.Column<int>(type: "integer", nullable: false),
                    RangeEnd = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    LabelModel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    BadgeFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    HeaderFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    CountryFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    WarningFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ReferenceFontMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BadgeWidthMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BadgeHeightMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BadgeStrokeWidthMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    LabelWidthMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    LabelHeightMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MarginLeftMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MarginTopMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MarginRightMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    MarginBottomMm = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    BadgeLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    BadgeTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    HeaderLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    HeaderTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    HeaderRightMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CountryLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CountryTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CountryRightMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    WarningLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    WarningTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    WarningRightMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ReferenceLeftMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ReferenceTopMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    ReferenceRightMm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    BadgeBold = table.Column<bool>(type: "boolean", nullable: false),
                    HeaderBold = table.Column<bool>(type: "boolean", nullable: false),
                    CountryBold = table.Column<bool>(type: "boolean", nullable: false),
                    WarningBold = table.Column<bool>(type: "boolean", nullable: false),
                    ReferenceBold = table.Column<bool>(type: "boolean", nullable: false),
                    BadgeText = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    HeaderPrefix = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    AssyHeaderPrefix = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    CountryText = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    WarningText = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    BadgeFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    HeaderFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    CountryFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    WarningFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    ReferenceFontFamily = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    PrinterName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreateBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingLabels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpecialProcess",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SpecialProcess = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Specification = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Revision = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Comment = table.Column<string>(type: "text", nullable: true),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecialProcess", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SpecialProcessCertificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CertificateCode = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    ClienteId = table.Column<int>(type: "integer", nullable: true),
                    ClienteNome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SpecialProcessId = table.Column<int>(type: "integer", nullable: true),
                    SpecialProcess = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Norma = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    PartNumber = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EmissionDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    LotNumber = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    PurchasingOrder = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Item = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    HardnessFound = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    HeatTreatLot = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    AnalystId = table.Column<int>(type: "integer", nullable: true),
                    AnalystName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Observations = table.Column<string>(type: "text", nullable: true),
                    CreateBy = table.Column<string>(type: "text", nullable: true),
                    UpdateBy = table.Column<string>(type: "text", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SpecialProcessCertificates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TechnicalStandards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Cliente = table.Column<string>(type: "text", nullable: false),
                    Processo = table.Column<string>(type: "text", nullable: false),
                    Norma = table.Column<string>(type: "text", nullable: false),
                    Revision = table.Column<string>(type: "text", nullable: true),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechnicalStandards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AnalystsCertificate",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Certificate = table.Column<int>(type: "integer", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    AnalystsId = table.Column<int>(type: "integer", nullable: false),
                    CreateBy = table.Column<string>(type: "text", nullable: false),
                    UpdateBy = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnalystsCertificate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnalystsCertificate_Analysts_AnalystsId",
                        column: x => x.AnalystsId,
                        principalTable: "Analysts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnalystsCertificate_AnalystsId",
                table: "AnalystsCertificate",
                column: "AnalystsId");

            migrationBuilder.CreateIndex(
                name: "IX_AnalystsCertificate_Certificate_IsDefault",
                table: "AnalystsCertificate",
                columns: new[] { "Certificate", "IsDefault" },
                unique: true,
                filter: "\"IsDeleted\" = FALSE AND \"IsDefault\" = TRUE");

            migrationBuilder.CreateIndex(
                name: "IX_History_PartNumber_PartNumberId",
                table: "History_PartNumber",
                column: "PartNumberId");

            migrationBuilder.CreateIndex(
                name: "IX_History_SpecialProcess_SpecialProcessId",
                table: "History_SpecialProcess",
                column: "SpecialProcessId");

            migrationBuilder.CreateIndex(
                name: "IX_login_certification_email",
                table: "login_certification",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_login_module_permissions_username",
                table: "login_module_permissions",
                column: "username");

            migrationBuilder.CreateIndex(
                name: "IX_login_password_resets_tokenhash",
                table: "login_password_resets",
                column: "tokenhash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_login_password_resets_username_email",
                table: "login_password_resets",
                columns: new[] { "username", "email" });

            migrationBuilder.CreateIndex(
                name: "IX_login_sessions_lastseen",
                table: "login_sessions",
                column: "lastseen");

            migrationBuilder.CreateIndex(
                name: "IX_login_sessions_username",
                table: "login_sessions",
                column: "username");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseOrders_PONumber_Item_ClienteId",
                table: "PurchaseOrders",
                columns: new[] { "PONumber", "Item", "ClienteId" },
                unique: true,
                filter: "\"IsDeleted\" = FALSE");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingLabelPrintSettings_Username",
                table: "ShippingLabelPrintSettings",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnalystsCertificate");

            migrationBuilder.DropTable(
                name: "Cliente");

            migrationBuilder.DropTable(
                name: "Controle_Eleb");

            migrationBuilder.DropTable(
                name: "History_PartNumber");

            migrationBuilder.DropTable(
                name: "History_SpecialProcess");

            migrationBuilder.DropTable(
                name: "login_certification");

            migrationBuilder.DropTable(
                name: "login_module_permissions");

            migrationBuilder.DropTable(
                name: "login_password_resets");

            migrationBuilder.DropTable(
                name: "login_sessions");

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
                name: "RNC");

            migrationBuilder.DropTable(
                name: "ShippingLabelPrintSettings");

            migrationBuilder.DropTable(
                name: "ShippingLabels");

            migrationBuilder.DropTable(
                name: "SpecialProcess");

            migrationBuilder.DropTable(
                name: "SpecialProcessCertificates");

            migrationBuilder.DropTable(
                name: "TechnicalStandards");

            migrationBuilder.DropTable(
                name: "Analysts");
        }
    }
}
