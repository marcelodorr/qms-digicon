SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.vw_QualityCertificateEdit', N'V') IS NOT NULL
    DROP VIEW dbo.vw_QualityCertificateEdit;
GO

CREATE VIEW dbo.vw_QualityCertificateEdit
WITH SCHEMABINDING
AS
SELECT
    Id,
    NumeroCertificado,
    Ordem,
    OC,
    Lote,
    CodigoCliente,
    PartNumber,
    ValorPeca,
    AnalisePo,
    RevisaoDesenho,
    Quantidade,
    Decapagem,
    SNDecapagem,
    CDChamado,
    Cliente,
    Fornecedor,
    RelatorioInspecao,
    CertificadoMP,
    Responsavel,
    AnalystId,
    AnalystName,
    DesenhoLP,
    Observacoes,
    SNPeca,
    TipoEnvio,
    DescricaoOperacao,
    Data,
    CreateDate,
    UpdateBy
FROM dbo.QualityCertificates
WHERE IsDeleted = 0;
GO
