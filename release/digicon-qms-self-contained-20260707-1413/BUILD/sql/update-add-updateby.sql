BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.Analysts', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.Analysts', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.Analysts ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.Analysts SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.AnalystsCertificate', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.AnalystsCertificate', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.AnalystsCertificate ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.AnalystsCertificate SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.Cliente', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.Cliente', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.Cliente ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.Cliente SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.OperationProcess', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.OperationProcess', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.OperationProcess ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.OperationProcess SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.Operacoes', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.Operacoes', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.Operacoes ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.Operacoes SET UpdateBy = 'Sistema' WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.Parameters', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.Parameters', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.Parameters ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.Parameters SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.PartNumbers', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.PartNumbers', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.PartNumbers ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.PartNumbers SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.ProductConformityCertificates', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.ProductConformityCertificates', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.ProductConformityCertificates ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.ProductConformityCertificates SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.ProductDocumentControls', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.ProductDocumentControls', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.ProductDocumentControls ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.ProductDocumentControls SET UpdateBy = 'Sistema' WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.PurchaseOrders', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.PurchaseOrders', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.PurchaseOrders ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.PurchaseOrders SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.QualityCertificates', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.QualityCertificates', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.QualityCertificates ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.QualityCertificates SET UpdateBy = 'Sistema' WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.SpecialProcess', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.SpecialProcess', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.SpecialProcess ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.SpecialProcess SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.SpecialProcessCertificates', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.SpecialProcessCertificates', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.SpecialProcessCertificates ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.SpecialProcessCertificates SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.TechnicalStandards', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.TechnicalStandards', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.TechnicalStandards ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.TechnicalStandards SET UpdateBy = COALESCE(CreateBy, 'Sistema') WHERE UpdateBy IS NULL;
        END

    IF OBJECT_ID('dbo.Controle_Eleb', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.Controle_Eleb', 'UpdateBy') IS NULL
        BEGIN
            ALTER TABLE dbo.Controle_Eleb ADD UpdateBy NVARCHAR(100) NULL;
            UPDATE dbo.Controle_Eleb SET UpdateBy = 'Sistema' WHERE UpdateBy IS NULL;
        END

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
