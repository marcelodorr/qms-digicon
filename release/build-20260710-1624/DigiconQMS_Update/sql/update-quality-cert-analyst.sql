BEGIN TRY
    BEGIN TRANSACTION;

    IF COL_LENGTH('dbo.QualityCertificates', 'AnalystId') IS NULL
        ALTER TABLE dbo.QualityCertificates ADD AnalystId INT NULL;

    IF COL_LENGTH('dbo.QualityCertificates', 'AnalystName') IS NULL
        ALTER TABLE dbo.QualityCertificates ADD AnalystName NVARCHAR(150) NULL;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
