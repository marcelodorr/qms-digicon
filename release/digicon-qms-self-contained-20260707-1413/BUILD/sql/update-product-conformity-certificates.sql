BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.ProductConformityCertificates', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ProductConformityCertificates
        (
            Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
            CertificateNumber NVARCHAR(20) NOT NULL,
            PartNumberId INT NULL,
            PartNumber NVARCHAR(100) NOT NULL,
            PartNumberDescription NVARCHAR(300) NULL,
            PartNumberRevision NVARCHAR(50) NULL,
            LotNumber NVARCHAR(100) NULL,
            Quantity NVARCHAR(50) NULL,
            CustomerPO NVARCHAR(100) NULL,
            Type NVARCHAR(50) NULL,
            SerialNumber NVARCHAR(200) NULL,
            InspectedAccording NVARCHAR(100) NOT NULL CONSTRAINT DF_ProductConformityCertificates_InspectedAccording DEFAULT ('AS9138'),
            AnalystId INT NULL,
            AnalystName NVARCHAR(150) NULL,
            DocumentNumber NVARCHAR(50) NOT NULL CONSTRAINT DF_ProductConformityCertificates_DocumentNumber DEFAULT ('HSRE-050'),
            DocumentRevision NVARCHAR(20) NOT NULL CONSTRAINT DF_ProductConformityCertificates_DocumentRevision DEFAULT ('3'),
            DocumentDate DATETIME2 NOT NULL CONSTRAINT DF_ProductConformityCertificates_DocumentDate DEFAULT ('2025-11-25'),
            CustomerId INT NULL,
            CustomerName NVARCHAR(200) NULL,
            CustomerAddress NVARCHAR(400) NULL,
            EmissionDate DATETIME2 NOT NULL,
            CreateBy NVARCHAR(100) NOT NULL DEFAULT ('Sistema'),
            UpdateBy NVARCHAR(100) NOT NULL DEFAULT ('Sistema'),
            CreateDate DATETIME2 NOT NULL,
            LastUpdate DATETIME2 NULL,
            IsDeleted BIT NOT NULL DEFAULT 0
        );

        CREATE UNIQUE INDEX UX_ProductConformityCertificates_Number
            ON dbo.ProductConformityCertificates (CertificateNumber);

        CREATE INDEX IX_ProductConformityCertificates_EmissionDate
            ON dbo.ProductConformityCertificates (EmissionDate);
    END

    -- Garante coluna InspectedAccording caso a tabela já exista
    IF COL_LENGTH('dbo.ProductConformityCertificates', 'InspectedAccording') IS NULL
    BEGIN
        ALTER TABLE dbo.ProductConformityCertificates ADD InspectedAccording NVARCHAR(100) NULL;
        UPDATE dbo.ProductConformityCertificates SET InspectedAccording = 'AS9138' WHERE InspectedAccording IS NULL;
        ALTER TABLE dbo.ProductConformityCertificates
            ADD CONSTRAINT DF_ProductConformityCertificates_InspectedAccording DEFAULT ('AS9138') FOR InspectedAccording;
    END

    IF COL_LENGTH('dbo.ProductConformityCertificates', 'AnalystId') IS NULL
        ALTER TABLE dbo.ProductConformityCertificates ADD AnalystId INT NULL;

    IF COL_LENGTH('dbo.ProductConformityCertificates', 'AnalystName') IS NULL
        ALTER TABLE dbo.ProductConformityCertificates ADD AnalystName NVARCHAR(150) NULL;

    IF COL_LENGTH('dbo.ProductConformityCertificates', 'DocumentNumber') IS NULL
    BEGIN
        ALTER TABLE dbo.ProductConformityCertificates ADD DocumentNumber NVARCHAR(50) NULL;
        UPDATE dbo.ProductConformityCertificates SET DocumentNumber = 'HSRE-050' WHERE DocumentNumber IS NULL;
        ALTER TABLE dbo.ProductConformityCertificates
            ADD CONSTRAINT DF_ProductConformityCertificates_DocumentNumber DEFAULT ('HSRE-050') FOR DocumentNumber;
    END

    IF COL_LENGTH('dbo.ProductConformityCertificates', 'DocumentRevision') IS NULL
    BEGIN
        ALTER TABLE dbo.ProductConformityCertificates ADD DocumentRevision NVARCHAR(20) NULL;
        UPDATE dbo.ProductConformityCertificates SET DocumentRevision = '3' WHERE DocumentRevision IS NULL;
        ALTER TABLE dbo.ProductConformityCertificates
            ADD CONSTRAINT DF_ProductConformityCertificates_DocumentRevision DEFAULT ('3') FOR DocumentRevision;
    END

    IF COL_LENGTH('dbo.ProductConformityCertificates', 'DocumentDate') IS NULL
    BEGIN
        ALTER TABLE dbo.ProductConformityCertificates ADD DocumentDate DATETIME2 NULL;
        UPDATE dbo.ProductConformityCertificates SET DocumentDate = '2025-11-25' WHERE DocumentDate IS NULL;
        ALTER TABLE dbo.ProductConformityCertificates
            ADD CONSTRAINT DF_ProductConformityCertificates_DocumentDate DEFAULT ('2025-11-25') FOR DocumentDate;
    END

    IF COL_LENGTH('dbo.ProductConformityCertificates', 'UpdateBy') IS NULL
    BEGIN
        ALTER TABLE dbo.ProductConformityCertificates ADD UpdateBy NVARCHAR(100) NULL;
        UPDATE dbo.ProductConformityCertificates SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
    END

    -- Tabela de controle de documento para Certificado de Produto
    IF OBJECT_ID('dbo.ProductDocumentControls', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ProductDocumentControls
        (
            Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
            DocumentNumber NVARCHAR(50) NOT NULL CONSTRAINT DF_ProductDocumentControls_DocumentNumber DEFAULT ('HSRE-050'),
            DocumentRevision NVARCHAR(20) NOT NULL CONSTRAINT DF_ProductDocumentControls_DocumentRevision DEFAULT ('3'),
            DocumentDate DATETIME2 NOT NULL CONSTRAINT DF_ProductDocumentControls_DocumentDate DEFAULT ('2025-11-25'),
            InspectedAccording NVARCHAR(100) NOT NULL CONSTRAINT DF_ProductDocumentControls_InspectedAccording DEFAULT ('AS9138'),
            UpdateBy NVARCHAR(100) NOT NULL CONSTRAINT DF_ProductDocumentControls_UpdateBy DEFAULT ('Sistema'),
            CreateDate DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
            LastUpdate DATETIME2 NULL
        );
    END

    IF COL_LENGTH('dbo.ProductDocumentControls', 'UpdateBy') IS NULL
    BEGIN
        ALTER TABLE dbo.ProductDocumentControls ADD UpdateBy NVARCHAR(100) NULL;
        UPDATE dbo.ProductDocumentControls SET UpdateBy = 'Sistema' WHERE UpdateBy IS NULL;
    END

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
