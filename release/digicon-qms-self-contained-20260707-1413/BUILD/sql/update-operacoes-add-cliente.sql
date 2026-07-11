BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.Operacoes', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.Operacoes', 'Cliente') IS NULL
            ALTER TABLE dbo.Operacoes ADD Cliente NVARCHAR(200) NULL;

    IF OBJECT_ID('dbo.OperationProcess', 'U') IS NOT NULL
        IF COL_LENGTH('dbo.OperationProcess', 'Cliente') IS NULL
            ALTER TABLE dbo.OperationProcess ADD Cliente NVARCHAR(200) NULL;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
