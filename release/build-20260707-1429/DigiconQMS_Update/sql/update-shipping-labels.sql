BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID('dbo.ShippingLabels', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ShippingLabels
        (
            Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
            PartNumberId INT NOT NULL,
            PartNumber NVARCHAR(150) NOT NULL,
            ReferenceDate DATETIME2 NOT NULL,
            RangeStart INT NOT NULL,
            RangeEnd INT NOT NULL,
            Quantity INT NOT NULL,
            LabelModel NVARCHAR(30) NOT NULL CONSTRAINT DF_ShippingLabels_LabelModel DEFAULT ('DEFAULT'),
            BadgeFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_BadgeFontMm DEFAULT (7.50),
            HeaderFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_HeaderFontMm DEFAULT (5.60),
            CountryFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_CountryFontMm DEFAULT (6.60),
            WarningFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_WarningFontMm DEFAULT (5.60),
            ReferenceFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_ReferenceFontMm DEFAULT (4.80),
            BadgeWidthMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_BadgeWidthMm DEFAULT (21.50),
            BadgeHeightMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_BadgeHeightMm DEFAULT (13.03),
            LabelWidthMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_LabelWidthMm DEFAULT (100.00),
            LabelHeightMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_LabelHeightMm DEFAULT (50.00),
            MarginLeftMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_MarginLeftMm DEFAULT (0.00),
            MarginTopMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_MarginTopMm DEFAULT (0.00),
            MarginRightMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_MarginRightMm DEFAULT (0.00),
            MarginBottomMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabels_MarginBottomMm DEFAULT (0.00),
            BadgeBold BIT NOT NULL CONSTRAINT DF_ShippingLabels_BadgeBold DEFAULT (1),
            HeaderBold BIT NOT NULL CONSTRAINT DF_ShippingLabels_HeaderBold DEFAULT (1),
            CountryBold BIT NOT NULL CONSTRAINT DF_ShippingLabels_CountryBold DEFAULT (1),
            WarningBold BIT NOT NULL CONSTRAINT DF_ShippingLabels_WarningBold DEFAULT (0),
            ReferenceBold BIT NOT NULL CONSTRAINT DF_ShippingLabels_ReferenceBold DEFAULT (1),
            BadgeText NVARCHAR(50) NOT NULL CONSTRAINT DF_ShippingLabels_BadgeText DEFAULT ('283'),
            HeaderPrefix NVARCHAR(120) NOT NULL CONSTRAINT DF_ShippingLabels_HeaderPrefix DEFAULT ('|-S-| 73030 -'),
            AssyHeaderPrefix NVARCHAR(120) NOT NULL CONSTRAINT DF_ShippingLabels_AssyHeaderPrefix DEFAULT ('|-S-| 73030 ASSY-'),
            CountryText NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabels_CountryText DEFAULT ('BRAZIL'),
            WarningText NVARCHAR(200) NOT NULL CONSTRAINT DF_ShippingLabels_WarningText DEFAULT ('MATCHED SET DO NOT ISSUE SEPARATION'),
            BadgeFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabels_BadgeFontFamily DEFAULT ('Arial'),
            HeaderFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabels_HeaderFontFamily DEFAULT ('Arial'),
            CountryFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabels_CountryFontFamily DEFAULT ('Arial'),
            WarningFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabels_WarningFontFamily DEFAULT ('Arial'),
            ReferenceFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabels_ReferenceFontFamily DEFAULT ('Arial'),
            PrinterName NVARCHAR(200) NULL,
            CreateBy NVARCHAR(100) NOT NULL CONSTRAINT DF_ShippingLabels_CreateBy DEFAULT ('Sistema'),
            CreateDate DATETIME2 NOT NULL CONSTRAINT DF_ShippingLabels_CreateDate DEFAULT (SYSUTCDATETIME()),
            LastUpdate DATETIME2 NULL,
            IsDeleted BIT NOT NULL CONSTRAINT DF_ShippingLabels_IsDeleted DEFAULT (0)
        );

        CREATE INDEX IX_ShippingLabels_CreateDate
            ON dbo.ShippingLabels (CreateDate DESC);

        CREATE INDEX IX_ShippingLabels_PartNumber
            ON dbo.ShippingLabels (PartNumber);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'LabelModel') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD LabelModel NVARCHAR(30) NOT NULL
                CONSTRAINT DF_ShippingLabels_LabelModel DEFAULT ('DEFAULT');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'LabelModel') IS NOT NULL
    BEGIN
        EXEC('
            UPDATE dbo.ShippingLabels
               SET LabelModel = ''DEFAULT''
             WHERE NULLIF(LTRIM(RTRIM(LabelModel)), '''') IS NULL;
        ');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'BadgeFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD BadgeFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_BadgeFontMm DEFAULT (7.50);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'HeaderFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD HeaderFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_HeaderFontMm DEFAULT (5.60);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'CountryFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD CountryFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_CountryFontMm DEFAULT (6.60);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'WarningFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD WarningFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_WarningFontMm DEFAULT (5.60);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'ReferenceFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD ReferenceFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_ReferenceFontMm DEFAULT (4.80);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'BadgeWidthMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD BadgeWidthMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_BadgeWidthMm DEFAULT (21.50);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'BadgeHeightMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD BadgeHeightMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_BadgeHeightMm DEFAULT (13.03);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'MarginRightMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD MarginRightMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_MarginRightMm DEFAULT (0.00);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'MarginBottomMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD MarginBottomMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabels_MarginBottomMm DEFAULT (0.00);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'BadgeBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD BadgeBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabels_BadgeBold DEFAULT (1);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'HeaderBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD HeaderBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabels_HeaderBold DEFAULT (1);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'CountryBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD CountryBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabels_CountryBold DEFAULT (1);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'WarningBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD WarningBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabels_WarningBold DEFAULT (0);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'ReferenceBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD ReferenceBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabels_ReferenceBold DEFAULT (1);
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'BadgeText') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD BadgeText NVARCHAR(50) NOT NULL
                CONSTRAINT DF_ShippingLabels_BadgeText DEFAULT ('283');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'HeaderPrefix') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD HeaderPrefix NVARCHAR(120) NOT NULL
                CONSTRAINT DF_ShippingLabels_HeaderPrefix DEFAULT ('|-S-| 73030 -');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'AssyHeaderPrefix') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD AssyHeaderPrefix NVARCHAR(120) NOT NULL
                CONSTRAINT DF_ShippingLabels_AssyHeaderPrefix DEFAULT ('|-S-| 73030 ASSY-');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'CountryText') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD CountryText NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabels_CountryText DEFAULT ('BRAZIL');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'WarningText') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD WarningText NVARCHAR(200) NOT NULL
                CONSTRAINT DF_ShippingLabels_WarningText DEFAULT ('MATCHED SET DO NOT ISSUE SEPARATION');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'BadgeFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD BadgeFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabels_BadgeFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'HeaderFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD HeaderFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabels_HeaderFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'CountryFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD CountryFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabels_CountryFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'WarningFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD WarningFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabels_WarningFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabels', 'ReferenceFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabels
            ADD ReferenceFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabels_ReferenceFontFamily DEFAULT ('Arial');
    END

    EXEC('
        UPDATE dbo.ShippingLabels
           SET BadgeFontMm = CASE WHEN BadgeFontMm <= 0 THEN 7.50 ELSE BadgeFontMm END,
               HeaderFontMm = CASE WHEN HeaderFontMm <= 0 THEN 5.60 ELSE HeaderFontMm END,
               CountryFontMm = CASE WHEN CountryFontMm <= 0 THEN 6.60 ELSE CountryFontMm END,
               WarningFontMm = CASE WHEN WarningFontMm <= 0 THEN 5.60 ELSE WarningFontMm END,
               ReferenceFontMm = CASE WHEN ReferenceFontMm <= 0 THEN 4.80 ELSE ReferenceFontMm END,
               BadgeWidthMm = CASE WHEN BadgeWidthMm <= 0 THEN 21.50 ELSE BadgeWidthMm END,
               BadgeHeightMm = CASE WHEN BadgeHeightMm <= 0 THEN 13.03 ELSE BadgeHeightMm END,
               BadgeText = CASE WHEN NULLIF(LTRIM(RTRIM(BadgeText)), '''') IS NULL THEN ''283'' ELSE LTRIM(RTRIM(BadgeText)) END,
               HeaderPrefix = CASE WHEN NULLIF(LTRIM(RTRIM(HeaderPrefix)), '''') IS NULL THEN ''|-S-| 73030 -'' ELSE LTRIM(RTRIM(HeaderPrefix)) END,
               AssyHeaderPrefix = CASE WHEN NULLIF(LTRIM(RTRIM(AssyHeaderPrefix)), '''') IS NULL THEN ''|-S-| 73030 ASSY-'' ELSE LTRIM(RTRIM(AssyHeaderPrefix)) END,
               CountryText = CASE WHEN NULLIF(LTRIM(RTRIM(CountryText)), '''') IS NULL THEN ''BRAZIL'' ELSE LTRIM(RTRIM(CountryText)) END,
               WarningText = CASE WHEN NULLIF(LTRIM(RTRIM(WarningText)), '''') IS NULL THEN ''MATCHED SET DO NOT ISSUE SEPARATION'' ELSE LTRIM(RTRIM(WarningText)) END,
               BadgeFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(BadgeFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(BadgeFontFamily)) END,
               HeaderFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(HeaderFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(HeaderFontFamily)) END,
               CountryFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(CountryFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(CountryFontFamily)) END,
               WarningFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(WarningFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(WarningFontFamily)) END,
               ReferenceFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(ReferenceFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(ReferenceFontFamily)) END;
    ');

    IF OBJECT_ID('dbo.ShippingLabelPrintSettings', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.ShippingLabelPrintSettings
        (
            Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
            Username NVARCHAR(100) NOT NULL,
            WidthMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_WidthMm DEFAULT (100.00),
            HeightMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_HeightMm DEFAULT (50.00),
            MarginLeftMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_MarginLeftMm DEFAULT (0.00),
            MarginTopMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_MarginTopMm DEFAULT (0.00),
            MarginRightMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_MarginRightMm DEFAULT (0.00),
            MarginBottomMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_MarginBottomMm DEFAULT (0.00),
            BadgeFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_BadgeFontMm DEFAULT (7.50),
            HeaderFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_HeaderFontMm DEFAULT (5.60),
            CountryFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_CountryFontMm DEFAULT (6.60),
            WarningFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_WarningFontMm DEFAULT (5.60),
            ReferenceFontMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_ReferenceFontMm DEFAULT (4.80),
            BadgeBold BIT NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_BadgeBold DEFAULT (1),
            HeaderBold BIT NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_HeaderBold DEFAULT (1),
            CountryBold BIT NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_CountryBold DEFAULT (1),
            WarningBold BIT NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_WarningBold DEFAULT (0),
            ReferenceBold BIT NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_ReferenceBold DEFAULT (1),
            BadgeText NVARCHAR(50) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_BadgeText DEFAULT ('283'),
            HeaderPrefix NVARCHAR(120) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_HeaderPrefix DEFAULT ('|-S-| 73030 -'),
            AssyHeaderPrefix NVARCHAR(120) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_AssyHeaderPrefix DEFAULT ('|-S-| 73030 ASSY-'),
            CountryText NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_CountryText DEFAULT ('BRAZIL'),
            WarningText NVARCHAR(200) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_WarningText DEFAULT ('MATCHED SET DO NOT ISSUE SEPARATION'),
            BadgeFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_BadgeFontFamily DEFAULT ('Arial'),
            HeaderFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_HeaderFontFamily DEFAULT ('Arial'),
            CountryFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_CountryFontFamily DEFAULT ('Arial'),
            WarningFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_WarningFontFamily DEFAULT ('Arial'),
            ReferenceFontFamily NVARCHAR(80) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_ReferenceFontFamily DEFAULT ('Arial'),
            BadgeWidthMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_BadgeWidthMm DEFAULT (21.50),
            BadgeHeightMm DECIMAL(10,2) NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_BadgeHeightMm DEFAULT (13.03),
            PrinterName NVARCHAR(200) NULL,
            CreateDate DATETIME2 NOT NULL CONSTRAINT DF_ShippingLabelPrintSettings_CreateDate DEFAULT (SYSUTCDATETIME()),
            LastUpdate DATETIME2 NULL
        );

        CREATE UNIQUE INDEX UX_ShippingLabelPrintSettings_Username
            ON dbo.ShippingLabelPrintSettings (Username);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'BadgeFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD BadgeFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_BadgeFontMm DEFAULT (7.50);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'MarginRightMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD MarginRightMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_MarginRightMm DEFAULT (0.00);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'MarginBottomMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD MarginBottomMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_MarginBottomMm DEFAULT (0.00);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'BadgeBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD BadgeBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_BadgeBold DEFAULT (1);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'HeaderBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD HeaderBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_HeaderBold DEFAULT (1);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'CountryBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD CountryBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_CountryBold DEFAULT (1);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'WarningBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD WarningBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_WarningBold DEFAULT (0);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'ReferenceBold') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD ReferenceBold BIT NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_ReferenceBold DEFAULT (1);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'BadgeText') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD BadgeText NVARCHAR(50) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_BadgeText DEFAULT ('283');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'HeaderPrefix') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD HeaderPrefix NVARCHAR(120) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_HeaderPrefix DEFAULT ('|-S-| 73030 -');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'AssyHeaderPrefix') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD AssyHeaderPrefix NVARCHAR(120) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_AssyHeaderPrefix DEFAULT ('|-S-| 73030 ASSY-');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'CountryText') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD CountryText NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_CountryText DEFAULT ('BRAZIL');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'WarningText') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD WarningText NVARCHAR(200) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_WarningText DEFAULT ('MATCHED SET DO NOT ISSUE SEPARATION');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'BadgeFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD BadgeFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_BadgeFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'HeaderFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD HeaderFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_HeaderFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'CountryFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD CountryFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_CountryFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'WarningFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD WarningFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_WarningFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'ReferenceFontFamily') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD ReferenceFontFamily NVARCHAR(80) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_ReferenceFontFamily DEFAULT ('Arial');
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'HeaderFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD HeaderFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_HeaderFontMm DEFAULT (5.60);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'CountryFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD CountryFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_CountryFontMm DEFAULT (6.60);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'WarningFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD WarningFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_WarningFontMm DEFAULT (5.60);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'ReferenceFontMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD ReferenceFontMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_ReferenceFontMm DEFAULT (4.80);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'BadgeWidthMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD BadgeWidthMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_BadgeWidthMm DEFAULT (21.50);
    END

    IF COL_LENGTH('dbo.ShippingLabelPrintSettings', 'BadgeHeightMm') IS NULL
    BEGIN
        ALTER TABLE dbo.ShippingLabelPrintSettings
            ADD BadgeHeightMm DECIMAL(10,2) NOT NULL
                CONSTRAINT DF_ShippingLabelPrintSettings_BadgeHeightMm DEFAULT (13.03);
    END

    EXEC('
        UPDATE dbo.ShippingLabelPrintSettings
           SET BadgeFontMm = CASE WHEN BadgeFontMm <= 0 THEN 7.50 ELSE BadgeFontMm END,
               HeaderFontMm = CASE WHEN HeaderFontMm <= 0 THEN 5.60 ELSE HeaderFontMm END,
               CountryFontMm = CASE WHEN CountryFontMm <= 0 THEN 6.60 ELSE CountryFontMm END,
               WarningFontMm = CASE WHEN WarningFontMm <= 0 THEN 5.60 ELSE WarningFontMm END,
               ReferenceFontMm = CASE WHEN ReferenceFontMm <= 0 THEN 4.80 ELSE ReferenceFontMm END,
               BadgeWidthMm = CASE WHEN BadgeWidthMm <= 0 THEN 21.50 ELSE BadgeWidthMm END,
               BadgeHeightMm = CASE WHEN BadgeHeightMm <= 0 THEN 13.03 ELSE BadgeHeightMm END,
               BadgeText = CASE WHEN NULLIF(LTRIM(RTRIM(BadgeText)), '''') IS NULL THEN ''283'' ELSE LTRIM(RTRIM(BadgeText)) END,
               HeaderPrefix = CASE WHEN NULLIF(LTRIM(RTRIM(HeaderPrefix)), '''') IS NULL THEN ''|-S-| 73030 -'' ELSE LTRIM(RTRIM(HeaderPrefix)) END,
               AssyHeaderPrefix = CASE WHEN NULLIF(LTRIM(RTRIM(AssyHeaderPrefix)), '''') IS NULL THEN ''|-S-| 73030 ASSY-'' ELSE LTRIM(RTRIM(AssyHeaderPrefix)) END,
               CountryText = CASE WHEN NULLIF(LTRIM(RTRIM(CountryText)), '''') IS NULL THEN ''BRAZIL'' ELSE LTRIM(RTRIM(CountryText)) END,
               WarningText = CASE WHEN NULLIF(LTRIM(RTRIM(WarningText)), '''') IS NULL THEN ''MATCHED SET DO NOT ISSUE SEPARATION'' ELSE LTRIM(RTRIM(WarningText)) END,
               BadgeFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(BadgeFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(BadgeFontFamily)) END,
               HeaderFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(HeaderFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(HeaderFontFamily)) END,
               CountryFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(CountryFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(CountryFontFamily)) END,
               WarningFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(WarningFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(WarningFontFamily)) END,
               ReferenceFontFamily = CASE WHEN NULLIF(LTRIM(RTRIM(ReferenceFontFamily)), '''') IS NULL THEN ''Arial'' ELSE LTRIM(RTRIM(ReferenceFontFamily)) END;
    ');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
