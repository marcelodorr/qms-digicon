IF OBJECT_ID(N'[dbo].[login_sessions]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[login_sessions] (
        [SessionId] uniqueidentifier NOT NULL
            CONSTRAINT [PK_login_sessions] PRIMARY KEY,
        [Username] nvarchar(150) NOT NULL,
        [Email] nvarchar(255) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [LastSeen] datetime2 NOT NULL,
        [RevokedAt] datetime2 NULL,
        [IpAddress] nvarchar(64) NULL,
        [UserAgent] nvarchar(256) NULL
    );

    CREATE INDEX [IX_login_sessions_username]
        ON [dbo].[login_sessions]([Username]);

    CREATE INDEX [IX_login_sessions_lastseen]
        ON [dbo].[login_sessions]([LastSeen]);
END;
