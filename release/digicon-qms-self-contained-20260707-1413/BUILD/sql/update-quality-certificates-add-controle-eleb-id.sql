IF COL_LENGTH('QualityCertificates', 'ControleElebId') IS NULL
BEGIN
    ALTER TABLE QualityCertificates
    ADD ControleElebId INT NULL;
END;
