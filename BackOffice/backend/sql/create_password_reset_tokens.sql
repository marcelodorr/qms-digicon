IF OBJECT_ID('dbo.login_password_resets', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.login_password_resets
    (
        Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        TokenHash NVARCHAR(64) NOT NULL,
        Username NVARCHAR(150) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
        ExpiresAt DATETIME2 NOT NULL,
        UsedAt DATETIME2 NULL
    );

    CREATE INDEX IX_login_password_resets_TokenHash
        ON dbo.login_password_resets (TokenHash);

    CREATE INDEX IX_login_password_resets_User
        ON dbo.login_password_resets (Username, Email);
END;
