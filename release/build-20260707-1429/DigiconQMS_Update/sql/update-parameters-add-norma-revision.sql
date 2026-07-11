IF COL_LENGTH('Parameters', 'NormaRevision') IS NULL
BEGIN
    ALTER TABLE Parameters
    ADD NormaRevision NVARCHAR(10) NULL;
END;

UPDATE p
SET NormaRevision = sp.Revision
FROM Parameters p
OUTER APPLY (
    SELECT TOP 1 s.Revision
    FROM SpecialProcess s
    WHERE s.IsDeleted = 0
      AND LTRIM(RTRIM(s.SpecialProcess)) = LTRIM(RTRIM(p.Processo))
      AND LTRIM(RTRIM(s.Specification)) = LTRIM(RTRIM(p.Norma))
    ORDER BY COALESCE(s.LastUpdate, s.CreateDate) DESC, s.Id DESC
) sp
WHERE p.NormaRevision IS NULL
  AND sp.Revision IS NOT NULL;
