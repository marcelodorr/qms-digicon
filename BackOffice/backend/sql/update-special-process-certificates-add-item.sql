IF COL_LENGTH('SpecialProcessCertificates', 'Item') IS NULL
BEGIN
    ALTER TABLE SpecialProcessCertificates
    ADD Item NVARCHAR(80) NULL;
END;
