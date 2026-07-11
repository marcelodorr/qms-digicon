IF OBJECT_ID(N'[dbo].[login_module_permissions]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[login_module_permissions] (
        [Username] nvarchar(150) NOT NULL,
        [ModuleKey] nvarchar(150) NOT NULL,
        [CanView] bit NOT NULL
            CONSTRAINT [DF_login_module_permissions_CanView] DEFAULT(1),
        [CanEdit] bit NOT NULL
            CONSTRAINT [DF_login_module_permissions_CanEdit] DEFAULT(0),
        [UpdatedAt] datetime2 NOT NULL
            CONSTRAINT [DF_login_module_permissions_UpdatedAt] DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT [PK_login_module_permissions] PRIMARY KEY ([Username], [ModuleKey])
    );

    CREATE INDEX [IX_login_module_permissions_username]
        ON [dbo].[login_module_permissions]([Username]);
END;
