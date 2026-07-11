IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Cliente] (
    [Id] int NOT NULL IDENTITY,
    [Cliente] nvarchar(max) NOT NULL,
    [CreateBy] nvarchar(max) NOT NULL,
    [UpdateBy] nvarchar(max) NOT NULL,
    [CreateDate] datetime2 NOT NULL,
    [IsDeleted] bit NOT NULL,
    [LastUpdate] datetime2 NULL,
    CONSTRAINT [PK_Cliente] PRIMARY KEY ([Id])
);

CREATE TABLE [Operacoes] (
    [Id] int NOT NULL IDENTITY,
    [Numero_op] nvarchar(max) NOT NULL,
    [Descricao_op] nvarchar(max) NOT NULL,
    [UpdateBy] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Operacoes] PRIMARY KEY ([Id])
);

CREATE TABLE [QualityCertificates] (
    [Id] int NOT NULL IDENTITY,
    [NumeroCertificado] nvarchar(max) NOT NULL,
    [Ordem] nvarchar(max) NOT NULL,
    [OC] nvarchar(max) NOT NULL,
    [Lote] nvarchar(max) NOT NULL,
    [CodigoCliente] nvarchar(max) NOT NULL,
    [PartNumber] nvarchar(max) NOT NULL,
    [ValorPeca] nvarchar(max) NOT NULL,
    [AnalisePo] nvarchar(max) NOT NULL,
    [RevisaoDesenho] nvarchar(max) NOT NULL,
    [Quantidade] nvarchar(max) NOT NULL,
    [Decapagem] nvarchar(max) NOT NULL,
    [SNDecapagem] nvarchar(max) NOT NULL,
    [CDChamado] nvarchar(max) NOT NULL,
    [Cliente] nvarchar(max) NOT NULL,
    [Fornecedor] nvarchar(max) NOT NULL,
    [RelatorioInspecao] nvarchar(max) NOT NULL,
    [CertificadoMP] nvarchar(max) NOT NULL,
    [Responsavel] nvarchar(max) NOT NULL,
    [DesenhoLP] nvarchar(max) NOT NULL,
    [Observacoes] nvarchar(max) NOT NULL,
    [SNPeca] nvarchar(max) NOT NULL,
    [TipoEnvio] nvarchar(max) NOT NULL,
    [DescricaoOperacao] nvarchar(max) NOT NULL,
    [Data] nvarchar(max) NOT NULL,
    [CreateDate] datetime2 NOT NULL,
    [UpdateBy] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_QualityCertificates] PRIMARY KEY ([Id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20250805135519_RenomearClienteParaNomeCliente', N'9.0.7');

CREATE TABLE [PartNumbers] (
    [Id] int NOT NULL IDENTITY,
    [PartNumber] nvarchar(max) NOT NULL,
    [Descricao] nvarchar(max) NULL,
    [CreateBy] nvarchar(max) NULL,
    [UpdateBy] nvarchar(max) NULL,
    [CreateDate] datetime2 NOT NULL,
    [LastUpdated] datetime2 NULL,
    [IsDeleted] bit NOT NULL,
    CONSTRAINT [PK_PartNumbers] PRIMARY KEY ([Id])
);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20251030120000_AddPartNumber', N'9.0.7');

COMMIT;
GO
