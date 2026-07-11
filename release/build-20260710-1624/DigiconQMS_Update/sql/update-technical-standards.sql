BEGIN TRY
    BEGIN TRANSACTION;

    -- Garantir novas colunas
    IF COL_LENGTH('dbo.TechnicalStandards', 'Cliente') IS NULL
        ALTER TABLE dbo.TechnicalStandards ADD Cliente NVARCHAR(200) NULL;

    IF COL_LENGTH('dbo.TechnicalStandards', 'Processo') IS NULL
        ALTER TABLE dbo.TechnicalStandards ADD Processo NVARCHAR(150) NULL;

    -- Preenche colunas a partir dos dados existentes (se houver)
    UPDATE dbo.TechnicalStandards
       SET Cliente = COALESCE(Cliente, PartNumber, ''),
           Processo = COALESCE(Processo, Requirement, '');

    -- Garante NOT NULL após a migração
    ALTER TABLE dbo.TechnicalStandards ALTER COLUMN Cliente NVARCHAR(200) NOT NULL;
    ALTER TABLE dbo.TechnicalStandards ALTER COLUMN Processo NVARCHAR(150) NOT NULL;

    -- Renomeia a coluna TechnicalStandard para Norma (se ainda não renomeada)
    IF COL_LENGTH('dbo.TechnicalStandards', 'Norma') IS NULL
        EXEC sp_rename 'dbo.TechnicalStandards.TechnicalStandard', 'Norma', 'COLUMN';

    -- Remove colunas antigas que não são mais usadas
    IF COL_LENGTH('dbo.TechnicalStandards', 'PartNumber') IS NOT NULL
        ALTER TABLE dbo.TechnicalStandards DROP COLUMN PartNumber;

    IF COL_LENGTH('dbo.TechnicalStandards', 'Requirement') IS NOT NULL
        ALTER TABLE dbo.TechnicalStandards DROP COLUMN Requirement;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
