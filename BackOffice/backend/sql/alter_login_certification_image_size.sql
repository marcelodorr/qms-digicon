IF OBJECT_ID(N'[dbo].[login_certification]', N'U') IS NOT NULL
BEGIN
    DECLARE @dataType sysname;
    DECLARE @maxLength int;
    DECLARE @isNullable bit;
    DECLARE @nullSql nvarchar(8);
    DECLARE @sql nvarchar(4000);

    SELECT
        @dataType = DATA_TYPE,
        @maxLength = CHARACTER_MAXIMUM_LENGTH,
        @isNullable = CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'dbo'
      AND TABLE_NAME = 'login_certification'
      AND COLUMN_NAME = 'Image';

    IF @dataType IS NOT NULL
    BEGIN
        SET @nullSql = CASE WHEN @isNullable = 1 THEN N'NULL' ELSE N'NOT NULL' END;

        IF @dataType IN (N'varbinary', N'binary', N'image')
        BEGIN
            IF @maxLength IS NULL OR @maxLength <> -1
            BEGIN
                SET @sql = N'ALTER TABLE dbo.login_certification ALTER COLUMN [Image] varbinary(max) ' + @nullSql;
                EXEC sp_executesql @sql;
            END
        END
        ELSE IF @dataType IN (N'varchar', N'nvarchar', N'char', N'nchar', N'text', N'ntext')
        BEGIN
            IF @maxLength IS NULL OR @maxLength <> -1
            BEGIN
                SET @sql = N'ALTER TABLE dbo.login_certification ALTER COLUMN [Image] nvarchar(max) ' + @nullSql;
                EXEC sp_executesql @sql;
            END
        END
    END
END



IF COL_LENGTH('login_certification', 'Image') IS NOT NULL
BEGIN
    ALTER TABLE login_certification
    ALTER COLUMN Image NVARCHAR(MAX) NULL;
END;


IF COL_LENGTH('login_certification', 'Type') IS NULL
BEGIN
    ALTER TABLE login_certification
    ADD type NVARCHAR(50) NULL;
END;

IF COL_LENGTH('login_certification', 'Image') IS NULL
BEGIN
    ALTER TABLE login_certification
    ADD image VARBINARY(MAX) NULL;
END;