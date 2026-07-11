IF COL_LENGTH('PartNumbers', 'DrawingRevision') IS NULL
BEGIN
    ALTER TABLE PartNumbers
    ADD DrawingRevision NVARCHAR(50) NULL;
END;
