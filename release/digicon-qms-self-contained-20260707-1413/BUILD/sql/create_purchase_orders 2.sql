IF OBJECT_ID('dbo.PurchaseOrders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PurchaseOrders
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PurchaseOrders PRIMARY KEY,
        PONumber NVARCHAR(80) NOT NULL,
        ClienteId INT NOT NULL,
        ClienteNome NVARCHAR(200) NULL,
        Item NVARCHAR(80) NOT NULL CONSTRAINT DF_PurchaseOrders_Item DEFAULT (''),
        Status NVARCHAR(30) NOT NULL CONSTRAINT DF_PurchaseOrders_Status DEFAULT ('Em Processo'),
        Comments NVARCHAR(MAX) NULL,
        CreateBy NVARCHAR(100) NOT NULL CONSTRAINT DF_PurchaseOrders_CreateBy DEFAULT ('Sistema'),
        CreateDate DATETIME2 NOT NULL CONSTRAINT DF_PurchaseOrders_CreateDate DEFAULT (GETDATE()),
        LastUpdate DATETIME2 NULL,
        IsDeleted BIT NOT NULL CONSTRAINT DF_PurchaseOrders_IsDeleted DEFAULT (0)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_PurchaseOrders_PONumber_Item_ClienteId'
      AND object_id = OBJECT_ID('dbo.PurchaseOrders')
)
BEGIN
    CREATE UNIQUE INDEX IX_PurchaseOrders_PONumber_Item_ClienteId
        ON dbo.PurchaseOrders (PONumber, Item, ClienteId)
        WHERE IsDeleted = 0;
END;
GO
