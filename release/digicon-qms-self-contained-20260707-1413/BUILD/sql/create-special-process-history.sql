IF OBJECT_ID('History_SpecialProcess', 'U') IS NULL
BEGIN
    CREATE TABLE History_SpecialProcess (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        SpecialProcessId INT NOT NULL,
        Changes NVARCHAR(MAX) NULL,
        Observation NVARCHAR(MAX) NULL,
        ChangedBy NVARCHAR(150) NOT NULL DEFAULT('Sistema'),
        ChangedAt DATETIME2 NOT NULL DEFAULT(GETDATE())
    );

    ALTER TABLE History_SpecialProcess
    ADD CONSTRAINT FK_History_SpecialProcess_SpecialProcess
        FOREIGN KEY (SpecialProcessId) REFERENCES SpecialProcess(Id)
        ON DELETE CASCADE;

    CREATE INDEX IX_History_SpecialProcess_SpecialProcessId
    ON History_SpecialProcess(SpecialProcessId);
END;
