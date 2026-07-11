IF COL_LENGTH('PartNumbers', 'ClienteId') IS NULL
BEGIN
    ALTER TABLE PartNumbers
    ADD ClienteId INT NULL;
END;

IF COL_LENGTH('PartNumbers', 'ClienteNome') IS NULL
BEGIN
    ALTER TABLE PartNumbers
    ADD ClienteNome NVARCHAR(200) NULL;
END;

IF COL_LENGTH('PartNumbers', 'IsActive') IS NULL
BEGIN
    ALTER TABLE PartNumbers
    ADD IsActive BIT NOT NULL CONSTRAINT DF_PartNumbers_IsActive DEFAULT(1);
END;

IF OBJECT_ID('History_PartNumber', 'U') IS NULL
BEGIN
    CREATE TABLE History_PartNumber (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PartNumberId INT NOT NULL,
        Changes NVARCHAR(MAX) NULL,
        Observation NVARCHAR(MAX) NULL,
        ChangedBy NVARCHAR(150) NOT NULL DEFAULT('Sistema'),
        ChangedAt DATETIME2 NOT NULL DEFAULT(GETDATE())
    );

    ALTER TABLE History_PartNumber
    ADD CONSTRAINT FK_History_PartNumber_PartNumbers
        FOREIGN KEY (PartNumberId) REFERENCES PartNumbers(Id)
        ON DELETE CASCADE;

    CREATE INDEX IX_History_PartNumber_PartNumberId
    ON History_PartNumber(PartNumberId);
END;


