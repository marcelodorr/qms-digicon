BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.AnalystsCertificate', 'U') IS NOT NULL
    BEGIN
        ;WITH RankedDefaults AS (
            SELECT
                Id,
                ROW_NUMBER() OVER (
                    PARTITION BY Certificate
                    ORDER BY COALESCE(LastUpdated, CreateDate) DESC, CreateDate DESC, Id DESC
                ) AS rn
            FROM dbo.AnalystsCertificate
            WHERE IsDeleted = 0 AND IsDefault = 1
        )
        UPDATE ac
        SET IsDefault = 0,
            LastUpdated = SYSUTCDATETIME()
        FROM dbo.AnalystsCertificate ac
        INNER JOIN RankedDefaults rd ON rd.Id = ac.Id
        WHERE rd.rn > 1;

        IF EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE name = 'IX_AnalystsCertificate_Certificate_IsDefault'
              AND object_id = OBJECT_ID('dbo.AnalystsCertificate')
        )
        BEGIN
            DROP INDEX IX_AnalystsCertificate_Certificate_IsDefault
            ON dbo.AnalystsCertificate;
        END

        IF NOT EXISTS (
            SELECT 1
            FROM sys.indexes
            WHERE name = 'UX_AnalystsCertificate_DefaultPerCertificate'
              AND object_id = OBJECT_ID('dbo.AnalystsCertificate')
        )
        BEGIN
            CREATE UNIQUE INDEX UX_AnalystsCertificate_DefaultPerCertificate
                ON dbo.AnalystsCertificate (Certificate)
                WHERE IsDeleted = 0 AND IsDefault = 1;
        END
    END

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
