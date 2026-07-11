using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.EntityFrameworkCore;
using backend.Utils;

public record QualityCertificateListItem(int Id, string Numero, string? Cliente, string? PartNumber, string? Ordem, string? OC, DateTime? Data, string? UpdateBy);
public record WeeklyCertificateData(DateTime WeekStart, int Total);
public record PdfGenerationResult(byte[] FileBytes, string FileName, string? SavedPath);

public class QualityCertificateService
{
    private readonly AppDbContext _context;
    private static readonly object OutputPathLock = new();
    private static string _outputPath = ""; // configurável via endpoint
    private static string SafeTrunc(string? s, int max) =>
        string.IsNullOrEmpty(s) ? string.Empty : (s.Length <= max ? s : s.Substring(0, max));
    private static string Clean(string? s) => s?.Trim() ?? string.Empty;

    public QualityCertificateService(AppDbContext context)
    {
        _context = context;
    }

    // =========================
    // Helpers de numeração/ano
    // =========================
    private static int SafeYear(DateTime? dt) => (dt ?? DateTime.Now).Year;

    private static string BuildNumero(int sequence, int year)
    {
        // 000-YY
        int yy = year % 100;
        return $"{sequence:D3}-{yy:D2}";
    }

    private static DateTime GetWeekStart(DateTime date)
    {
        var diff = ((int)date.DayOfWeek + 6) % 7; // Monday-first week
        return date.Date.AddDays(-diff);
    }

    private static int ParseSequence(string? numero)
    {
        // espera "000-YY"
        if (string.IsNullOrWhiteSpace(numero)) return 0;
        var dash = numero.IndexOf('-');
        if (dash <= 0) return 0;
        var left = numero.Substring(0, dash);
        return int.TryParse(left, out var seq) ? seq : 0;
    }

    private static (string Sheet, string Revision) ParseRevisaoDesenho(string? value)
    {
        var raw = value?.Trim() ?? string.Empty;
        if (string.IsNullOrEmpty(raw))
            return ("", "");

        var normalized = Regex.Replace(raw, "\\s+", " ");
        var match = Regex.Match(normalized, "folha\\s*([^\\s]+).*rev(?:is[aã]o)?\\s*([^\\s]+)", RegexOptions.IgnoreCase);
        if (match.Success)
            return (match.Groups[1].Value, match.Groups[2].Value);

        var sheetOnlyMatch = Regex.Match(normalized, "folha\\s*([^\\s]+)", RegexOptions.IgnoreCase);
        if (sheetOnlyMatch.Success)
            return (sheetOnlyMatch.Groups[1].Value, "");

        var revOnlyMatch = Regex.Match(normalized, "rev(?:is[aã]o)?\\s*([^\\s]+)", RegexOptions.IgnoreCase);
        if (revOnlyMatch.Success)
            return ("", revOnlyMatch.Groups[1].Value);

        if (normalized.Contains("|"))
        {
            var parts = normalized.Split('|');
            var sheet = parts.Length > 0 ? parts[0].Trim() : "";
            var revision = parts.Length > 1 ? parts[1].Trim() : "";
            return (sheet, revision);
        }

        if (normalized.Contains("/"))
        {
            var parts = normalized.Split('/');
            var sheet = parts.Length > 0 ? parts[0].Trim() : "";
            var revision = parts.Length > 1 ? parts[1].Trim() : "";
            return (sheet, revision);
        }

        return (normalized, "");
    }

    // Obtém o próximo sequencial para o ano, considerando Data.Year
    private async Task<int> GetNextSequenceForYearAsync(int year)
    {
        // carrega em memória para calcular o maior sequence parseando "NumeroCertificado"
        var certificadosDoAno = await _context.QualityCertificates
            .AsNoTracking()
            .Where(c => (c.Data ?? DateTime.MinValue).Year == year)
            .Select(c => c.NumeroCertificado)
            .ToListAsync();

        var maxSeq = certificadosDoAno
            .Select(ParseSequence)
            .DefaultIfEmpty(0)
            .Max();

        return maxSeq + 1;
    }

    // ===== Caminho de saída =====
    public void SetOutputPath(string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            throw new ArgumentException("Caminho inválido.");

        lock (OutputPathLock)
        {
            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);

            _outputPath = path;
        }
    }

    public string GetOutputPath()
    {
        lock (OutputPathLock)
        {
            if (!string.IsNullOrWhiteSpace(_outputPath))
                return _outputPath;

            var docs = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
            var def = Path.Combine(docs, "Certificados");
            if (!Directory.Exists(def)) Directory.CreateDirectory(def);
            _outputPath = def;
            return _outputPath;
        }
    }

    // ===== Lista de números salvos =====
    public async Task<List<string>> ListarNumerosAsync()
    {
        return await _context.QualityCertificates
            .AsNoTracking()
            .Where(c => !string.IsNullOrEmpty(c.NumeroCertificado))
            .Select(c => c.NumeroCertificado)
            .Distinct()
            .OrderByDescending(n => n)
            .ToListAsync();
    }

    public async Task<int> CountCertificatesAsync() =>
        await _context.QualityCertificates.CountAsync();

    public async Task<QualityCertificateModel?> GetByIdAsync(int id)
    {
        return await _context.QualityCertificates
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<List<QualityCertificateListItem>> ListCodesAsync(DateTime? from = null, DateTime? to = null, string? search = null)
    {
        var query = _context.QualityCertificates
            .AsNoTracking();

        if (from.HasValue)
        {
            var start = from.Value.Date;
            query = query.Where(c => (c.Data ?? (DateTime?)c.CreateDate) >= start);
        }

        if (to.HasValue)
        {
            var endExclusive = to.Value.Date.AddDays(1);
            query = query.Where(c => (c.Data ?? (DateTime?)c.CreateDate) < endExclusive);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(c =>
                (c.NumeroCertificado != null && c.NumeroCertificado.Contains(term)) ||
                (c.Cliente != null && c.Cliente.Contains(term)) ||
                (c.PartNumber != null && c.PartNumber.Contains(term)) ||
                (c.Ordem != null && c.Ordem.Contains(term)) ||
                (c.OC != null && c.OC.Contains(term)) ||
                (c.Lote != null && c.Lote.Contains(term)));
        }

        return await query
            .OrderByDescending(c => c.Data ?? (DateTime?)c.CreateDate)
            .Select(c => new QualityCertificateListItem(
                c.Id,
                c.NumeroCertificado ?? string.Empty,
                c.Cliente,
                c.PartNumber,
                c.Ordem,
                c.OC,
                c.Data ?? (DateTime?)c.CreateDate,
                c.UpdateBy))
            .ToListAsync();
    }

    public async Task<List<WeeklyCertificateData>> GetWeeklyCountsAsync(DateTime from, DateTime to)
    {
        if (to < from)
        {
            (from, to) = (to, from);
        }

        var start = from.Date;
        var endExclusive = to.Date.AddDays(1);

        var dates = await _context.QualityCertificates
            .AsNoTracking()
            .Where(c => c.CreateDate >= start && c.CreateDate < endExclusive)
            .Select(c => c.CreateDate)
            .ToListAsync();

        return dates
            .Select(GetWeekStart)
            .GroupBy(d => d)
            .Select(g => new WeeklyCertificateData(g.Key, g.Count()))
            .OrderBy(g => g.WeekStart)
            .ToList();
    }

    // ===== Sequencial por ano (opcional: gera para o ano atual) =====
    public string GerarNumeroCertificado(int? ano = null)
    {
        int year = ano ?? DateTime.Now.Year;

        // Como é usado em endpoint GET, manter síncrono aqui.
        // Para evitar acesso concorrente, apenas consulta; o incremento real
        // fica na criação/salvamento que é transacional.
        var certificadosDoAno = _context.QualityCertificates
            .AsNoTracking()
            .Where(c => (c.Data ?? DateTime.MinValue).Year == year)
            .Select(c => c.NumeroCertificado)
            .ToList();

        var maxSeq = certificadosDoAno
            .Select(ParseSequence)
            .DefaultIfEmpty(0)
            .Max();

        var nextSeq = maxSeq + 1;
        return BuildNumero(nextSeq, year);
    }

    // ===== Criar certificado (gera número se não vier) =====
    public async Task<QualityCertificateModel> CreateCertificate(QualityCertificateModel model)
{
    // 0) Helpers locais
    static string Trunc(string? s, int max) => string.IsNullOrEmpty(s) ? string.Empty : (s.Length <= max ? s : s.Substring(0, max));
    static int SafeYear(DateTime? dt) => (dt ?? DateTime.Now).Year;
    static string BuildNumero(int seq, int year) => $"{seq:D3}-{(year % 100):D2}";
    static int ParseSeq(string? numero)
    {
        if (string.IsNullOrWhiteSpace(numero)) return 0;
        var i = numero.IndexOf('-');
        if (i <= 0) return 0;
        return int.TryParse(numero.Substring(0, i), out var n) ? n : 0;
    }

    // 1) Data e ano
    var dataValidada = model.Data ?? DateTime.Now;
    model.Data = dataValidada;
    int year = SafeYear(dataValidada);

    // 2) Normaliza strings e (opcional) trunca para evitar "String or binary data would be truncated"
    // Ajuste os limites conforme seu schema real (255 é seguro como guarda-chuva)
    model.Ordem             = Trunc(model.Ordem, 255);
    model.OC                = Trunc(model.OC, 255);
    model.Lote              = Trunc(model.Lote, 255);
    model.CodigoCliente     = Trunc(model.CodigoCliente, 255);
    model.PartNumber        = Trunc(model.PartNumber, 255);
    model.ValorPeca         = Trunc(model.ValorPeca, 255);
    model.AnalisePo         = Trunc(model.AnalisePo, 255);
    model.RevisaoDesenho    = Trunc(model.RevisaoDesenho, 255);
    model.Quantidade        = Trunc(model.Quantidade, 255);
    model.Decapagem         = Trunc(model.Decapagem, 255);
    model.SNDecapagem       = Trunc(model.SNDecapagem, 255);
    model.CDChamado         = Trunc(model.CDChamado, 255);
    model.Cliente           = Trunc(model.Cliente, 255);
    model.Fornecedor        = Trunc(model.Fornecedor, 255);
    model.RelatorioInspecao = Trunc(model.RelatorioInspecao, 255);
    model.CertificadoMP     = Trunc(model.CertificadoMP, 255);
    model.Responsavel       = Trunc(model.Responsavel, 255);
    model.DesenhoLP         = Trunc(model.DesenhoLP, 255);
    model.Observacoes       = Trunc(model.Observacoes, 4000); // geralmente maior
    model.SNPeca            = Trunc(model.SNPeca, 255);
    model.TipoEnvio         = Trunc(model.TipoEnvio, 255);
    model.DescricaoOperacao = Trunc(model.DescricaoOperacao, 4000);

    void ApplyChanges(QualityCertificateModel target)
    {
        target.Ordem             = model.Ordem;
        target.OC                = model.OC;
        target.Lote              = model.Lote;
        target.CodigoCliente     = model.CodigoCliente;
        target.PartNumber        = model.PartNumber;
        target.ValorPeca         = model.ValorPeca;
        target.AnalisePo         = model.AnalisePo;
        target.RevisaoDesenho    = model.RevisaoDesenho;
        target.Quantidade        = model.Quantidade;
        target.Decapagem         = model.Decapagem;
        target.SNDecapagem       = model.SNDecapagem;
        target.CDChamado         = model.CDChamado;
        target.Cliente           = model.Cliente;
        target.Fornecedor        = model.Fornecedor;
        target.RelatorioInspecao = model.RelatorioInspecao;
        target.CertificadoMP     = model.CertificadoMP;
        target.Responsavel       = model.Responsavel;
        target.AnalystId         = model.AnalystId;
        target.AnalystName       = model.AnalystName;
        target.DesenhoLP         = model.DesenhoLP;
        target.Observacoes       = model.Observacoes;
        target.SNPeca            = model.SNPeca;
        target.TipoEnvio         = model.TipoEnvio;
        target.DescricaoOperacao = model.DescricaoOperacao;
        target.Data              = dataValidada;
        target.CreateDate        = dataValidada;
        target.UpdateBy          = AuditHelper.ResolveUpdateBy(model.UpdateBy, null, target.UpdateBy ?? "Sistema");
    }

    QualityCertificateModel? existing = null;
    if (!string.IsNullOrWhiteSpace(model.NumeroCertificado))
    {
        existing = await _context.QualityCertificates
            .FirstOrDefaultAsync(c => c.NumeroCertificado == model.NumeroCertificado);
    }

    if (existing != null)
    {
        ApplyChanges(existing);
        await _context.SaveChangesAsync();
        return existing;
    }

    // 3) (Re)gerar número consistente com o ano e garantir UNICIDADE em transação
    await using var tx = await _context.Database.BeginTransactionAsync();

    // pega maior sequência do ano
    var existentesNoAno = await _context.QualityCertificates
        .AsNoTracking()
        .Where(c => (c.Data ?? DateTime.MinValue).Year == year)
        .Select(c => c.NumeroCertificado)
        .ToListAsync();

    int maxSeq = existentesNoAno.Select(ParseSeq).DefaultIfEmpty(0).Max();
    int seq;

    if (string.IsNullOrWhiteSpace(model.NumeroCertificado))
    {
        seq = maxSeq + 1;
        model.NumeroCertificado = BuildNumero(seq, year);
    }
    else
    {
        // se vier número, valida sufixo de ano; se não bater, recalcula
        var expectedSuffix = (year % 100).ToString("D2", CultureInfo.InvariantCulture);
        var okSuffix = model.NumeroCertificado.Contains("-") &&
                       model.NumeroCertificado.Split('-').Last().Equals(expectedSuffix, StringComparison.Ordinal);

        if (!okSuffix)
        {
            seq = maxSeq + 1;
            model.NumeroCertificado = BuildNumero(seq, year);
        }
        else
        {
            // mantém seq informado, mas se já existir igual, incrementa até ficar único
            seq = ParseSeq(model.NumeroCertificado);
            if (existentesNoAno.Contains(model.NumeroCertificado))
            {
                do
                {
                    seq++;
                    model.NumeroCertificado = BuildNumero(seq, year);
                } while (existentesNoAno.Contains(model.NumeroCertificado));
            }
        }
    }

    // 4) Garante Data
    model.CreateDate = dataValidada;
    model.Data = dataValidada;
    model.UpdateBy = AuditHelper.ResolveUpdateBy(model.UpdateBy, null);

    // 5) Persiste
    _context.QualityCertificates.Add(model);

    try
    {
        await _context.SaveChangesAsync();
        await tx.CommitAsync();
        return model;
    }
    catch
    {
        await tx.RollbackAsync();
        throw; // será capturado no Controller e retornará com inner exception
    }
}

    public async Task<QualityCertificateModel?> UpdateCertificateAsync(int id, QualityCertificateModel model)
    {
        var existing = await _context.QualityCertificates.FirstOrDefaultAsync(c => c.Id == id);
        if (existing == null) return null;

        existing.Ordem             = SafeTrunc(Clean(model.Ordem), 255);
        existing.OC                = SafeTrunc(Clean(model.OC), 255);
        existing.Lote              = SafeTrunc(Clean(model.Lote), 255);
        existing.CodigoCliente     = SafeTrunc(Clean(model.CodigoCliente), 255);
        existing.PartNumber        = SafeTrunc(Clean(model.PartNumber), 255);
        existing.ValorPeca         = SafeTrunc(Clean(model.ValorPeca), 255);
        existing.AnalisePo         = SafeTrunc(Clean(model.AnalisePo), 255);
        existing.RevisaoDesenho    = SafeTrunc(Clean(model.RevisaoDesenho), 255);
        existing.Quantidade        = SafeTrunc(Clean(model.Quantidade), 255);
        existing.Decapagem         = SafeTrunc(Clean(model.Decapagem), 255);
        existing.SNDecapagem       = SafeTrunc(Clean(model.SNDecapagem), 255);
        existing.CDChamado         = SafeTrunc(Clean(model.CDChamado), 255);
        existing.Cliente           = SafeTrunc(Clean(model.Cliente), 255);
        existing.Fornecedor        = SafeTrunc(Clean(model.Fornecedor), 255);
        existing.RelatorioInspecao = SafeTrunc(Clean(model.RelatorioInspecao), 255);
        existing.CertificadoMP     = SafeTrunc(Clean(model.CertificadoMP), 255);
        existing.Responsavel       = SafeTrunc(Clean(model.Responsavel), 255);
        existing.AnalystId         = model.AnalystId;
        existing.AnalystName       = string.IsNullOrWhiteSpace(model.AnalystName) ? null : SafeTrunc(model.AnalystName, 150);
        existing.DesenhoLP         = SafeTrunc(Clean(model.DesenhoLP), 255);
        existing.Observacoes       = SafeTrunc(Clean(model.Observacoes), 4000);
        existing.SNPeca            = SafeTrunc(Clean(model.SNPeca), 255);
        existing.TipoEnvio         = SafeTrunc(Clean(model.TipoEnvio), 255);
        existing.DescricaoOperacao = SafeTrunc(Clean(model.DescricaoOperacao), 4000);
        existing.UpdateBy = AuditHelper.ResolveUpdateBy(model.UpdateBy, null, existing.UpdateBy ?? "Sistema");

        // NumeroCertificado, Data e CreateDate permanecem inalterados.
        await _context.SaveChangesAsync();
        return existing;
    }


    // ===== GERAR PDF (layout do anexo) =====
    public async Task<PdfGenerationResult> GerarPdfAsync(string numeroCertificado, bool saveOnServer = false)
    {
        var cert = await _context.QualityCertificates
    .AsNoTracking()
    .Where(c => c.NumeroCertificado == numeroCertificado)
    .Select(c => new
    {
        c.NumeroCertificado,
        c.PartNumber,
        c.Cliente,
        c.OC,
        c.Lote,
        c.Ordem,
        c.CodigoCliente,
        c.CDChamado,
        c.SNPeca,
        c.DesenhoLP,
        c.RevisaoDesenho,
        c.Quantidade,
        c.DescricaoOperacao,
        c.Observacoes,
        c.TipoEnvio,
        c.Fornecedor,
        c.CertificadoMP,
        c.RelatorioInspecao,
        c.Responsavel,
        c.AnalystId,
        c.AnalystName,
        c.ValorPeca,
        c.AnalisePo,
        c.Decapagem,
        c.SNDecapagem,
        c.Data,
        c.CreateDate // ← usamos esta data
    })
    .FirstOrDefaultAsync();
        if (cert == null) throw new KeyNotFoundException("Certificado não encontrado.");

        AnalystModel? analystEntity = null;
        if (cert.AnalystId.HasValue)
        {
            analystEntity = await _context.Analysts
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == cert.AnalystId.Value);
        }

        var nameDate = (cert.Data ?? cert.CreateDate);
        var dateForName = (nameDate == default ? DateTime.Now : nameDate).ToString("dd-MM-yyyy", new CultureInfo("pt-BR"));
        string Segment(string? value) => string.IsNullOrWhiteSpace(value) ? "NA" : value.Trim();
        var fileName = $"Certificado_Qualidade_{Segment(cert.NumeroCertificado)}_{Segment(cert.PartNumber)}_{Segment(cert.Ordem)}_{dateForName}.pdf";
        var safeName = SanitizeFileName(fileName);

        byte[] fileBytes;

        using (var ms = new MemoryStream())
        {
            var culture = new CultureInfo("pt-BR");
            var dt = cert.CreateDate == default ? DateTime.Now : cert.CreateDate;
            var dataStr = dt.ToString("dd/MM/yyyy", culture);

            // Fontes
            BaseFont bf;
            string fontPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Fonts), "arial.ttf");
            if (File.Exists(fontPath))
            {
                bf = BaseFont.CreateFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            }
            else
            {
                var fallbackFontPath = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
                if (File.Exists(fallbackFontPath))
                {
                    bf = BaseFont.CreateFont(fallbackFontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                }
                else
                {
                    bf = BaseFont.CreateFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                }
            }

            var fTitle        = new iTextSharp.text.Font(bf, 13, iTextSharp.text.Font.BOLD);
            var fH1           = new iTextSharp.text.Font(bf, 8,  iTextSharp.text.Font.BOLD);
            var fLabel        = new iTextSharp.text.Font(bf, 7,  iTextSharp.text.Font.BOLD);
            var fLabel2       = new iTextSharp.text.Font(bf, 7,  iTextSharp.text.Font.NORMAL);
            var fText         = new iTextSharp.text.Font(bf, 7,  iTextSharp.text.Font.NORMAL);
            var fSmall        = new iTextSharp.text.Font(bf, 6,  iTextSharp.text.Font.NORMAL);
            var fEmpresa      = new iTextSharp.text.Font(bf, 6,  iTextSharp.text.Font.NORMAL);
            var fTableHeader  = new iTextSharp.text.Font(bf, 6,  iTextSharp.text.Font.BOLD);
            var fTableContent = new iTextSharp.text.Font(bf, 5.5f, iTextSharp.text.Font.NORMAL);

            // helpers
            Paragraph KV(string label, string value, float spacingAfter = 2f, float indent = 0f)
            {
                var p = new Paragraph { SpacingAfter = spacingAfter, IndentationLeft = indent };
                p.Add(new Chunk(label + " ", fLabel));
                p.Add(new Chunk(string.IsNullOrWhiteSpace(value) ? "N/A" : value, fText));
                return p;
            }
            Paragraph SectionTitle(string text, float spacingBefore = 8f, float spacingAfter = 6f)
                => new Paragraph(text, fH1) { SpacingBefore = spacingBefore, SpacingAfter = spacingAfter };

            var doc = new Document(PageSize.A4, 24, 24, 24, 24);
            var writer = PdfWriter.GetInstance(doc, ms);
            try
            {
                doc.Open();

            // ===== Cabeçalho =====
            iTextSharp.text.Image logoImg = null;
            try
            {
                var logoPath = TryLocateDigiconLogo();
                if (!string.IsNullOrWhiteSpace(logoPath) && File.Exists(logoPath))
                {
                    logoImg = iTextSharp.text.Image.GetInstance(logoPath);
                    logoImg.ScaleToFit(100f, 32f);
                    logoImg.Alignment = iTextSharp.text.Image.ALIGN_LEFT;
                }
            }
            catch { /* ignore */ }

            var head = new PdfPTable(2) { WidthPercentage = 100 };
            head.SetWidths(new float[] { 70, 30 });

            var leftCell = new PdfPCell { Border = Rectangle.NO_BORDER, Padding = 0f };
            if (logoImg != null) leftCell.AddElement(logoImg);
            head.AddCell(leftCell);

            var right = new PdfPTable(1) { WidthPercentage = 100 };
            right.AddCell(new PdfPCell(new Phrase($"Nº {cert.NumeroCertificado}", fLabel))
            { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_RIGHT, Padding = 0f });
            right.AddCell(new PdfPCell(new Phrase(dataStr, fLabel2))
            { Border = Rectangle.NO_BORDER, HorizontalAlignment = Element.ALIGN_RIGHT, PaddingTop = 0f, PaddingBottom = 6f });
            head.AddCell(new PdfPCell(right) { Border = Rectangle.NO_BORDER, Padding = 0f });
            doc.Add(head);

            // Título
            doc.Add(new Paragraph("CERTIFICADO DE CONFORMIDADE", fTitle)
            { Alignment = Element.ALIGN_CENTER, SpacingBefore = 4f, SpacingAfter = 6f });

            // Bloco da empresa (linhas simples)
            var empresaLines = new[]
            {
                "Razão Social: Digicon S/A",
                "Inscrição Estadual: 570028779",
                "CNPJ: 88.020.102/0001-10",
                "Endereço completo: Rua Nissin Castiel, Nº 640 - Gravataí/RS - Brasil"
            };
            foreach (var line in empresaLines)
                doc.Add(new Paragraph(line, fEmpresa) { SpacingAfter = 1f });

            // Frase centralizada em negrito com o cliente
            doc.Add(new Paragraph($"Emitido pelo nosso Controle de Qualidade, que se destina à {cert.Cliente}", fH1)
            { Alignment = Element.ALIGN_CENTER, SpacingBefore = 4f, SpacingAfter = 6f });

            // ===== 1. DADOS DE ORIGEM (sem tabela)
            doc.Add(SectionTitle("1. DADOS DE ORIGEM"));
            doc.Add(KV("1.1 OC CLIENTE n°:", cert.OC ?? ""));
            doc.Add(KV("1.2 LOTE CLIENTE n°:", cert.Lote ?? ""));
            doc.Add(KV("1.3 ORDEM n°:", cert.Ordem ?? "", spacingAfter: 2f));
            // ===== 2. DADOS DESSA REMESSA (sem tabela)
            doc.Add(SectionTitle("2. DADOS DESSA REMESSA"));
            doc.Add(KV("2.1 CÓDIGO CLIENTE n°:", cert.CodigoCliente ?? "", spacingAfter: 2f));

            doc.Add(KV("2.2 PN n°:", cert.PartNumber ?? ""));
            doc.Add(KV("      SN:", cert.SNPeca ?? "", spacingAfter: 2f));

            // 2.3 Revisões
            doc.Add(new Paragraph("2.3 REVISÃO:", fLabel));
            doc.Add(KV("      DESENHO (LP) - Revisão:", cert.DesenhoLP ?? ""));
            var (sheet, revision) = ParseRevisaoDesenho(cert.RevisaoDesenho);
            var folhaValue = string.IsNullOrWhiteSpace(sheet) ? "—" : sheet;
            var revisionValue = string.IsNullOrWhiteSpace(revision) ? "—" : revision;
            var pl = new Paragraph { SpacingAfter = 2f };
            pl.Add(new Chunk("      DESENHO (2D / MBD) - Folha: ", fLabel));
            pl.Add(new Chunk(folhaValue, fText));
            pl.Add(new Chunk("      Revisão: ", fLabel));
            pl.Add(new Chunk(revisionValue, fText));
            doc.Add(pl);

            doc.Add(KV("2.4 QUANTIDADE:", cert.Quantidade ?? ""));
            doc.Add(KV("2.5 OPERAÇÕES EXECUTADAS:", FormatOperacoesParaDisplay(cert.DescricaoOperacao)));
            doc.Add(new Paragraph("") { SpacingAfter = 2f });

            // ===== 3. OBSERVAÇÕES
            doc.Add(SectionTitle("3. OBSERVAÇÕES"));
            doc.Add(new Paragraph(cert.Observacoes ?? "", fText));

            var envio = new Paragraph { SpacingAfter = 2f };
            envio.Add(new Chunk("TIPO DE ENVIO: ", fLabel));
            envio.Add(new Chunk(cert.TipoEnvio ?? "—", fText));
            doc.Add(envio);

            string fornecedor = string.IsNullOrWhiteSpace(cert.Fornecedor) ? "N/A" : cert.Fornecedor!;
            string certMP    = string.IsNullOrWhiteSpace(cert.CertificadoMP) ? "N/A" : cert.CertificadoMP!;
            string relInsp   = string.IsNullOrWhiteSpace(cert.RelatorioInspecao) ? cert.NumeroCertificado ?? "—" : cert.RelatorioInspecao!;

            doc.Add(new Paragraph(
                $"Certificamos que a Matéria-Prima foi recebida do fornecedor {fornecedor}, estando a mesma aprovada conforme Certificado de Conformidade nº: {certMP}.",
                fSmall) { SpacingAfter = 1f, SpacingBefore = 4f });

            doc.Add(new Paragraph(
                $"Certificamos que o PN {cert.PartNumber ?? "N/A"} acima mencionado foi inspecionado e aprovado pelo nosso Controle de Qualidade, estando conforme desenho e revisões mencionados.",
                fSmall) { SpacingAfter = 1f });

            doc.Add(new Paragraph(
                $"Os requisitos de projeto executados em nossa empresa e por nossos fornecedores foram aprovados em todas as características conforme evidências reportadas no relatório de inspeção nº {relInsp} e dados abaixo:",
                fSmall) { SpacingAfter = 4f });

            // ===== Tabela final
            //doc.Add(new Paragraph(" ", fText) { SpacingAfter = 6f });

            PdfPCell H(string txt, int colspan = 1, int rowspan = 1)
            {
                return new PdfPCell(new Phrase(txt, fTableHeader))
                {
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    BackgroundColor = new BaseColor(230, 230, 230),
                    PaddingTop = 2f,
                    PaddingBottom = 2f,
                    Colspan = colspan,
                    Rowspan = rowspan
                };
            }
            PdfPCell D(string txt, int align = Element.ALIGN_LEFT)
            {
                return new PdfPCell(new Phrase(string.IsNullOrWhiteSpace(txt) ? "---" : txt, fTableContent))
                {
                    HorizontalAlignment = align,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    PaddingTop = 2f,
                    PaddingBottom = 2f
                };
            }

            var table = new PdfPTable(5) { WidthPercentage = 100 };
            table.SetWidths(new float[] { 14, 10, 36, 20, 20 });

            // Cabeçalho (linha 1)
            table.AddCell(H("ESPECIFICAÇÃO EDE", colspan: 2)); // NE/NI + REVISÃO
            table.AddCell(H("DESCRIÇÃO DO REQUISITO"));
            table.AddCell(H("FORNECEDOR"));
            table.AddCell(H("CERTIFICADO DE CONFORMIDADE"));
            // Cabeçalho (linha 2)
            table.AddCell(H("NE/NI"));
            table.AddCell(H("REVISÃO"));
            table.AddCell(H("---"));
            table.AddCell(H("---"));
            table.AddCell(H("---"));

            // ===== Dados (Normas) =====
            var normasRows = new List<(string Especificacao, string Revisao, string Descricao)>();
            var operacoesSelecionadas = SplitOperacoes(cert.DescricaoOperacao);
            if (!string.IsNullOrWhiteSpace(cert.Cliente) && operacoesSelecionadas.Count > 0)
            {
                var cliente = cert.Cliente.Trim();

                // Otimização: busca todas as normas de uma vez em vez de fazer N consultas
                try
                {
                    var normas = await _context.TechnicalStandards
                        .AsNoTracking()
                        .Where(n => !n.IsDeleted &&
                                    n.Cliente == cliente &&
                                    operacoesSelecionadas.Contains(n.Processo))
                        .Select(n => new { n.Norma, n.Revision, n.Processo })
                        .ToListAsync();

                    foreach (var n in normas)
                    {
                        normasRows.Add((
                            Especificacao: n.Norma ?? "—",
                            Revisao: n.Revision ?? "—",
                            Descricao: $"Processo: {n.Processo}"
                        ));
                    }
                }
                catch
                {
                    // ignora falhas e continua
                }
            }

            if (normasRows.Count == 0)
            {
                table.AddCell(D("—"));
                table.AddCell(D("—", Element.ALIGN_CENTER));
                table.AddCell(D("---"));
                table.AddCell(D("---", Element.ALIGN_CENTER));
                table.AddCell(D("---", Element.ALIGN_CENTER));
            }
            else
            {
                bool firstRow = true;
                foreach (var r in normasRows)
                {
                    table.AddCell(D(r.Especificacao));                 // NE/NI
                    table.AddCell(D(r.Revisao, Element.ALIGN_CENTER)); // REVISÃO
                    table.AddCell(D(r.Descricao));                     // DESCRIÇÃO

                    if (firstRow)
                    {
                        var fornCell = D(fornecedor, Element.ALIGN_CENTER);
                        fornCell.Rowspan = normasRows.Count;
                        table.AddCell(fornCell);

                        var certCell = D(cert.NumeroCertificado ?? "---", Element.ALIGN_CENTER);
                        certCell.Rowspan = normasRows.Count;
                        table.AddCell(certCell);

                        firstRow = false;
                    }
                }
            }

            doc.Add(table);

            // Frase de arquivo por 7 anos
            doc.Add(new Paragraph(
                "Toda a documentação permanecerá arquivada nesta Empresa pelo prazo mínimo de 07 (sete) anos à disposição do Contratante.",
                fText) { Alignment = Element.ALIGN_CENTER, SpacingAfter = 8f, SpacingBefore = 8f });

            // ===== Assinatura fixa no rodapé =====
            var footerTable = new PdfPTable(1)
            {
                TotalWidth = doc.PageSize.Width - doc.LeftMargin - doc.RightMargin
            };
            footerTable.DefaultCell.Border = Rectangle.NO_BORDER;

            iTextSharp.text.Image assinaturaImg = LoadSignatureImage(analystEntity?.Signature)
                ?? LoadSignatureFromFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "assinatura-muller.png"));

            if (assinaturaImg != null)
            {
                assinaturaImg.ScaleToFit(160f, 80f);
                assinaturaImg.Alignment = Element.ALIGN_CENTER;

                footerTable.AddCell(new PdfPCell(assinaturaImg)
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    PaddingBottom = -10f,
                    PaddingTop = 0f
                });
            }
            else
            {
                footerTable.AddCell(new PdfPCell(new Phrase("______________________________", fText))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    PaddingTop = 0f,
                    PaddingBottom = 0f
                });
            }

            var responsavelNome = cert.AnalystName ?? cert.Responsavel ?? "Responsável";
            footerTable.AddCell(new PdfPCell(new Phrase(responsavelNome, fText))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_CENTER,
                PaddingTop = 6f,
                PaddingBottom = 0f
            });

            footerTable.AddCell(new PdfPCell(new Phrase(cert.AnalystName != null ? "Responsável Técnico" : "Responsável", fSmall))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_CENTER,
                PaddingTop = 0f,
                PaddingBottom = 0f
            });

            footerTable.WriteSelectedRows(
                0, -1,
                doc.LeftMargin,
                doc.BottomMargin + 120f, // deixa ~50px adicionais visíveis acima da margem inferior
                writer.DirectContent
            );

            }
            finally
            {
                if (doc.IsOpen())
                {
                    doc.Close();
                }
                writer.Close();
            }

            fileBytes = ms.ToArray();
        }

        string? savedPath = null;
        if (saveOnServer)
        {
            var basePath = GetOutputPath();
            savedPath = Path.Combine(basePath, safeName);
            await File.WriteAllBytesAsync(savedPath, fileBytes);
        }

        return new PdfGenerationResult(fileBytes, safeName, savedPath);
    }

    // ===== Util =====
    private static string SanitizeFileName(string name)
    {
        foreach (var ch in Path.GetInvalidFileNameChars())
            name = name.Replace(ch, '_');
        return name;
    }

    // (Opcional) Exemplo de busca de normas (ajuste DbSet/colunas)
    private static List<string> SplitOperacoes(string? descricao)
    {
        if (string.IsNullOrWhiteSpace(descricao))
            return new List<string>();

        var separators = new[] { "|", ";", "\n", "," };

        return descricao
            .Split(separators, StringSplitOptions.RemoveEmptyEntries)
            .Select(op => op.Trim())
            .Where(op => !string.IsNullOrWhiteSpace(op))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string FormatOperacoesParaDisplay(string? descricao)
    {
        var operacoes = SplitOperacoes(descricao);
        return operacoes.Count == 0 ? string.Empty : string.Join(" | ", operacoes);
    }

    private static iTextSharp.text.Image? LoadSignatureImage(string? signatureData)
    {
        if (string.IsNullOrWhiteSpace(signatureData))
            return null;

        try
        {
            if (signatureData.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            {
                var commaIndex = signatureData.IndexOf(',');
                if (commaIndex >= 0)
                    signatureData = signatureData.Substring(commaIndex + 1);
            }

            var bytes = Convert.FromBase64String(signatureData);
            var img = iTextSharp.text.Image.GetInstance(bytes);
            img.ScaleToFit(110f, 36f);
            img.Alignment = iTextSharp.text.Image.ALIGN_CENTER;
            return img;
        }
        catch
        {
            return LoadSignatureFromFile(signatureData);
        }
    }

    private static iTextSharp.text.Image? LoadSignatureFromFile(string? path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return null;

        string resolvedPath = path;
        if (!File.Exists(resolvedPath))
        {
            resolvedPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", path);
            if (!File.Exists(resolvedPath))
                return null;
        }

        try
        {
            var img = iTextSharp.text.Image.GetInstance(resolvedPath);
            img.ScaleToFit(110f, 36f);
            img.Alignment = iTextSharp.text.Image.ALIGN_CENTER;
            return img;
        }
        catch
        {
            return null;
        }
    }

    private static string? TryLocateDigiconLogo()
    {
        var candidates = new List<string>();
        void AddCandidate(params string[] segments)
        {
            var safeSegments = segments.Where(s => !string.IsNullOrWhiteSpace(s)).ToArray();
            if (safeSegments.Length == 0) return;
            var fullPath = Path.Combine(safeSegments);
            candidates.Add(fullPath);
        }

        var baseDir = AppContext.BaseDirectory;
        var currentDir = Directory.GetCurrentDirectory();
        var solutionDir = Directory.GetParent(currentDir)?.FullName ?? currentDir;

        AddCandidate(baseDir, "logo-digicon.png");
        AddCandidate(baseDir, "wwwroot", "logo-digicon.png");
        AddCandidate(baseDir, "wwwroot", "images", "logo-digicon.png");
        AddCandidate(baseDir, "wwwroot", "images", "digicon_logo.png");

        AddCandidate(currentDir, "logo-digicon.png");
        AddCandidate(currentDir, "wwwroot", "images", "logo-digicon.png");
        AddCandidate(currentDir, "wwwroot", "images", "digicon_logo.png");
        AddCandidate(currentDir, "frontend", "src", "assets", "digicon_logo.png");
        AddCandidate(currentDir, "frontend", "src", "components", "assets", "digicon_logo.png");
        AddCandidate(currentDir, "frontend", "public", "digicon_logo.png");
        AddCandidate(currentDir, "frontend", "public", "logo512.png");
        AddCandidate(currentDir, "frontend", "public", "logo192.png");

        AddCandidate(solutionDir, "frontend", "src", "assets", "digicon_logo.png");
        AddCandidate(solutionDir, "frontend", "src", "components", "assets", "digicon_logo.png");
        AddCandidate(solutionDir, "frontend", "public", "digicon_logo.png");
        AddCandidate(solutionDir, "frontend", "public", "logo512.png");
        AddCandidate(solutionDir, "frontend", "public", "logo192.png");

        return candidates.FirstOrDefault(File.Exists);
    }
}
