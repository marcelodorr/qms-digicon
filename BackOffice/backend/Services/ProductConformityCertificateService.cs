using backend.Data;
using backend.Models;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.IO;
using backend.Utils;

namespace backend.Services
{
    public record ProductConformityCertificateListItem(
        int Id,
        string CertificateNumber,
        string? PartNumber,
        string? CustomerName,
        string? CustomerPO,
        DateTime EmissionDate,
        string? UpdateBy
    );

    public record ProductConformityPdfResult(byte[] FileBytes, string FileName, string? SavedPath);

    public class ProductConformityCertificateService
    {
        private readonly AppDbContext _context;
        private static readonly object OutputPathLock = new();
        private static string _outputPath = string.Empty;

        public ProductConformityCertificateService(AppDbContext context)
        {
            _context = context;
        }

        private async Task<ProductDocumentControlModel> GetDocumentControlAsync()
        {
            var current = await _context.ProductDocumentControls.AsNoTracking().FirstOrDefaultAsync();
            if (current != null) return current;

            var created = new ProductDocumentControlModel();
            _context.ProductDocumentControls.Add(created);
            await _context.SaveChangesAsync();
            return created;
        }

        public string GetOutputPath()
        {
            lock (OutputPathLock)
            {
                if (!string.IsNullOrWhiteSpace(_outputPath))
                    return _outputPath;

                var docs = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
                var def = Path.Combine(docs, "ProductConformityCertificates");
                if (!Directory.Exists(def)) Directory.CreateDirectory(def);
                _outputPath = def;
                return _outputPath;
            }
        }

        private static int SafeYear(DateTime date) => date.Year;
        private static string BuildNumber(int seq, int year) => $"{seq:D4}-{year % 100:D2}";

        private static int ParseSeq(string? number)
        {
            if (string.IsNullOrWhiteSpace(number)) return 0;
            var dash = number.IndexOf('-');
            if (dash <= 0) return 0;
            return int.TryParse(number[..dash], out var n) ? n : 0;
        }

        private static string SanitizeFileSegment(string? value)
        {
            const string fallback = "NA";
            if (string.IsNullOrWhiteSpace(value))
                return fallback;

            var invalidChars = Path.GetInvalidFileNameChars();
            var sanitized = new string(value.Select(ch => invalidChars.Contains(ch) ? '_' : ch).ToArray()).Trim();
            return string.IsNullOrWhiteSpace(sanitized) ? fallback : sanitized;
        }

        private static (string PoNumber, string Item) ParseCustomerPo(string? value)
        {
            var raw = value?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(raw))
                return ("", "");

            if (raw.Contains("|"))
            {
                var parts = raw.Split('|', 2);
                var poNumber = parts.Length > 0 ? parts[0].Trim() : "";
                var item = parts.Length > 1 ? parts[1].Trim() : "";
                return (poNumber, item);
            }

            return (raw, "");
        }

        private static Image? TryBuildSignatureImage(string? signatureBase64)
        {
            if (string.IsNullOrWhiteSpace(signatureBase64))
                return null;

            try
            {
                var data = signatureBase64;
                var comma = signatureBase64.IndexOf(',');
                if (comma >= 0)
                {
                    data = signatureBase64[(comma + 1)..];
                }
                var bytes = Convert.FromBase64String(data);
                return Image.GetInstance(bytes);
            }
            catch
            {
                return null;
            }
        }

        private static Image? TryLoadProductSignature()
        {
            var candidatePaths = new List<string>();

            void AddCandidate(params string[] parts)
            {
                var combined = Path.Combine(parts);
                var fullPath = Path.GetFullPath(combined);
                if (!candidatePaths.Contains(fullPath))
                {
                    candidatePaths.Add(fullPath);
                }
            }

            var baseDir = AppContext.BaseDirectory;
            var currentDir = Directory.GetCurrentDirectory();
            var solutionDir = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", ".."));

            AddCandidate(baseDir, "product_signature.png");
            AddCandidate(baseDir, "wwwroot", "product_signature.png");
            AddCandidate(baseDir, "wwwroot", "images", "product_signature.png");
            AddCandidate(currentDir, "product_signature.png");
            AddCandidate(currentDir, "wwwroot", "product_signature.png");
            AddCandidate(currentDir, "wwwroot", "images", "product_signature.png");
            AddCandidate(currentDir, "frontend", "public", "product_signature.png");
            AddCandidate(solutionDir, "frontend", "public", "product_signature.png");

            foreach (var path in candidatePaths)
            {
                if (!File.Exists(path))
                    continue;

                try
                {
                    return Image.GetInstance(path);
                }
                catch
                {
                    // ignore invalid image and keep searching
                }
            }

            return null;
        }

        public async Task<string> GetNextNumberAsync(DateTime? emissionDate)
        {
            var date = emissionDate ?? DateTime.Now;
            var year = SafeYear(date);

            var numbers = await _context.ProductConformityCertificates
                .AsNoTracking()
                .Where(c => (c.EmissionDate).Year == year)
                .Select(c => c.CertificateNumber)
                .ToListAsync();

            var next = numbers.Select(ParseSeq).DefaultIfEmpty(0).Max() + 1;
            return BuildNumber(next, year);
        }

        private static Image? TryLoadDigiconLogo()
        {
            var candidatePaths = new List<string>();

            void AddCandidate(params string[] parts)
            {
                var combined = Path.Combine(parts);
                var fullPath = Path.GetFullPath(combined);
                if (!candidatePaths.Contains(fullPath))
                {
                    candidatePaths.Add(fullPath);
                }
            }

            var baseDir = AppContext.BaseDirectory;
            var currentDir = Directory.GetCurrentDirectory();
            var solutionDir = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", ".."));

            AddCandidate(baseDir, "digicon_logo.png");
            AddCandidate(baseDir, "logo-digicon.png");
            AddCandidate(baseDir, "public", "digicon_logo.png");
            AddCandidate(baseDir, "wwwroot", "digicon_logo.png");
            AddCandidate(baseDir, "wwwroot", "logo-digicon.png");
            AddCandidate(baseDir, "wwwroot", "images", "digicon_logo.png");
            AddCandidate(baseDir, "wwwroot", "images", "logo-digicon.png");

            AddCandidate(currentDir, "logo-digicon.png");
            AddCandidate(currentDir, "wwwroot", "logo-digicon.png");
            AddCandidate(currentDir, "wwwroot", "images", "logo-digicon.png");
            AddCandidate(currentDir, "frontend", "src", "assets", "digicon_logo.png");
            AddCandidate(currentDir, "frontend", "public", "digicon_logo.png");
            AddCandidate(currentDir, "frontend", "public", "logo512.png");
            AddCandidate(currentDir, "frontend", "public", "logo192.png");

            AddCandidate(solutionDir, "frontend", "src", "assets", "digicon_logo.png");
            AddCandidate(solutionDir, "frontend", "public", "digicon_logo.png");
            AddCandidate(solutionDir, "frontend", "public", "logo512.png");
            AddCandidate(solutionDir, "frontend", "public", "logo192.png");

            foreach (var path in candidatePaths)
            {
                if (!File.Exists(path))
                    continue;

                try
                {
                    return Image.GetInstance(path);
                }
                catch
                {
                    // ignore and try next
                }
            }

            return null;
        }

        public async Task<List<ProductConformityCertificateListItem>> ListAsync(DateTime? from = null, DateTime? to = null, string? search = null)
        {
            var query = _context.ProductConformityCertificates
                .AsNoTracking()
                .Where(c => !c.IsDeleted);

            if (from.HasValue)
            {
                var start = from.Value.Date;
                query = query.Where(c => c.EmissionDate >= start);
            }

            if (to.HasValue)
            {
                var endExclusive = to.Value.Date.AddDays(1);
                query = query.Where(c => c.EmissionDate < endExclusive);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(c =>
                    (c.CertificateNumber != null && c.CertificateNumber.Contains(term)) ||
                    (c.PartNumber != null && c.PartNumber.Contains(term)) ||
                    (c.CustomerName != null && c.CustomerName.Contains(term)) ||
                    (c.CustomerPO != null && c.CustomerPO.Contains(term)));
            }

            return await query
                .OrderByDescending(c => c.EmissionDate)
                .ThenByDescending(c => c.Id)
                .Select(c => new ProductConformityCertificateListItem(
                    c.Id,
                    c.CertificateNumber,
                    c.PartNumber,
                    c.CustomerName,
                    c.CustomerPO,
                    c.EmissionDate,
                    c.UpdateBy
                ))
                .ToListAsync();
        }

        public async Task<List<ProductConformityCertificateModel>> ListDetailedAsync(DateTime? from = null, DateTime? to = null, string? search = null)
        {
            var query = _context.ProductConformityCertificates
                .AsNoTracking()
                .Where(c => !c.IsDeleted);

            if (from.HasValue)
            {
                var start = from.Value.Date;
                query = query.Where(c => c.EmissionDate >= start);
            }

            if (to.HasValue)
            {
                var endExclusive = to.Value.Date.AddDays(1);
                query = query.Where(c => c.EmissionDate < endExclusive);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(c =>
                    (c.CertificateNumber != null && c.CertificateNumber.Contains(term)) ||
                    (c.PartNumber != null && c.PartNumber.Contains(term)) ||
                    (c.CustomerName != null && c.CustomerName.Contains(term)) ||
                    (c.CustomerPO != null && c.CustomerPO.Contains(term)) ||
                    (c.LotNumber != null && c.LotNumber.Contains(term)));
            }

            return await query
                .OrderByDescending(c => c.EmissionDate)
                .ThenByDescending(c => c.Id)
                .ToListAsync();
        }

        public async Task<ProductConformityCertificateModel?> GetByIdAsync(int id)
        {
            return await _context.ProductConformityCertificates
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        }

        public async Task<ProductConformityPdfResult> GeneratePdfAsync(int certificateId, bool saveOnServer = false)
        {
            var cert = await _context.ProductConformityCertificates
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == certificateId && !c.IsDeleted);

            if (cert == null)
                throw new KeyNotFoundException("Certificate not found.");

            var docControl = await GetDocumentControlAsync();

            AnalystModel? analyst = null;
            if (cert.AnalystId.HasValue)
            {
                analyst = await _context.Analysts
                    .AsNoTracking()
                    .FirstOrDefaultAsync(a => a.Id == cert.AnalystId && !a.IsDeleted);
            }

            PartNumberModel? partEntity = null;
            if (!string.IsNullOrWhiteSpace(cert.PartNumber))
            {
                partEntity = await _context.PartNumbers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => !p.IsDeleted && p.PartNumber == cert.PartNumber);
            }

            ClienteModel? clienteInfo = null;
            if (cert.CustomerId.HasValue)
            {
                clienteInfo = await _context.Cliente
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == cert.CustomerId && !c.IsDeleted);
            }

            var partName = string.IsNullOrWhiteSpace(cert.PartNumberDescription)
                ? partEntity?.Descricao ?? "N/A"
                : cert.PartNumberDescription;
            var partRev = string.IsNullOrWhiteSpace(cert.PartNumberRevision)
                ? partEntity?.Revision ?? "N/A"
                : cert.PartNumberRevision;

            var customerName = string.IsNullOrWhiteSpace(cert.CustomerName)
                ? clienteInfo?.Cliente ?? "N/A"
                : cert.CustomerName;
            var customerAddress = string.IsNullOrWhiteSpace(cert.CustomerAddress)
                ? clienteInfo?.Endereco ?? "N/A"
                : cert.CustomerAddress;

            var inspectedAccording = string.IsNullOrWhiteSpace(docControl.InspectedAccording)
                ? "AS9138"
                : docControl.InspectedAccording;

            var culture = new CultureInfo("en-US");

            var (poNumber, poItem) = ParseCustomerPo(cert.CustomerPO);
            var poSegment = SanitizeFileSegment(poNumber);
            var itemSegment = SanitizeFileSegment(poItem);
            var partNumberSegment = SanitizeFileSegment(cert.PartNumber);
            var customerSegment = SanitizeFileSegment(customerName);
            var emissionSegment = cert.EmissionDate.ToString("yyyyMMdd", CultureInfo.InvariantCulture);
            var fileName = $"Certificate_Product_{poSegment}-{itemSegment}{partNumberSegment}_{emissionSegment}.pdf";
            byte[] fileBytes;

            using var ms = new MemoryStream();
            var doc = new Document(PageSize.A4, 32f, 32f, 36f, 36f);
            var writer = PdfWriter.GetInstance(doc, ms);

            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 15);
            var labelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
            var valueFont = FontFactory.GetFont(FontFactory.HELVETICA, 10);

            try
            {
                doc.Open();

            var headerTable = new PdfPTable(2)
            {
                WidthPercentage = 100,
                SpacingAfter = 14f
            };
            headerTable.SetWidths(new float[] { 70f, 30f });

            PdfPCell CellNoBorder(Paragraph p, int align = Element.ALIGN_LEFT, int vAlign = Element.ALIGN_MIDDLE)
                => new(p)
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = align,
                    VerticalAlignment = vAlign
                };

            var docInfoParagraph = new Paragraph
            {
                Alignment = Element.ALIGN_LEFT,
                Leading = 12f
            };
            docInfoParagraph.Add(new Chunk(docControl.DocumentNumber ?? "HSRE-050", labelFont));
            docInfoParagraph.Add(new Chunk("\n"));
            docInfoParagraph.Add(new Chunk($"Rev. {docControl.DocumentRevision ?? "3"}", valueFont));
            docInfoParagraph.Add(new Chunk("\n"));
            docInfoParagraph.Add(new Chunk(docControl.DocumentDate.ToString("MM/dd/yyyy", culture), valueFont));

            var leftCell = CellNoBorder(docInfoParagraph, Element.ALIGN_LEFT, Element.ALIGN_MIDDLE);

            var logoImg = TryLoadDigiconLogo();
            var rightStack = new PdfPTable(1) { WidthPercentage = 100 };
            var pageCell = CellNoBorder(new Paragraph("Page 1-1", valueFont), Element.ALIGN_RIGHT, Element.ALIGN_BOTTOM);
            var logoCell = logoImg != null
                ? new PdfPCell(logoImg)
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_TOP,
                    PaddingTop = 2f
                }
                : CellNoBorder(new Paragraph(string.Empty), Element.ALIGN_RIGHT);
            if (logoImg != null)
            {
                logoImg.ScaleToFit(100f, 40f);
                logoImg.Alignment = Element.ALIGN_RIGHT;
            }
            rightStack.AddCell(pageCell);
            rightStack.AddCell(logoCell);

            headerTable.AddCell(leftCell);
            headerTable.AddCell(new PdfPCell(rightStack) { Border = Rectangle.NO_BORDER });
            doc.Add(headerTable);

            var line3 = new PdfPTable(2) { WidthPercentage = 100, SpacingAfter = 30f };
            line3.SetWidths(new float[] { 70f, 30f });
            line3.AddCell(CellNoBorder(new Paragraph("CERTIFICATE OF CONFORMANCE", titleFont)));
            line3.AddCell(CellNoBorder(new Paragraph($"C OF C No.: {cert.CertificateNumber}", labelFont), Element.ALIGN_RIGHT));
            doc.Add(line3);

            var line4 = new PdfPTable(2) { WidthPercentage = 100, SpacingAfter = 6f };
            line4.SetWidths(new float[] { 70f, 30f });
            var supplierNameParagraph = new Paragraph { Alignment = Element.ALIGN_LEFT };
            supplierNameParagraph.Add(new Chunk("Supplier Name: ", labelFont));
            supplierNameParagraph.Add(new Chunk("DIGICON S/A – Controle Eletrônico para Mecânica", valueFont));

            var supplierCodeParagraph = new Paragraph { Alignment = Element.ALIGN_RIGHT };
            supplierCodeParagraph.Add(new Chunk("Supplier Code: ", labelFont));
            supplierCodeParagraph.Add(new Chunk("163283", valueFont));
            line4.AddCell(CellNoBorder(supplierNameParagraph, Element.ALIGN_LEFT));
            line4.AddCell(CellNoBorder(supplierCodeParagraph, Element.ALIGN_RIGHT));
            doc.Add(line4);

            var line5 = new Paragraph { Alignment = Element.ALIGN_LEFT };
            line5.Add(new Chunk("Supplier Address: ", labelFont));
            line5.Add(new Chunk("R. Nissin Castiel, 640 – Distrito Industrial – Gravataí/RS – Brasil – CEP 94045-420", valueFont));
            line5.SpacingAfter = 30f;
            doc.Add(line5);

            PdfPCell LabeledCell(string label, string value)
            {
                value = string.IsNullOrWhiteSpace(value) ? "N/A" : value;
                var p = new Paragraph
                {
                    new Chunk($"{label} ", labelFont),
                    new Chunk(value, valueFont)
                };
                return new PdfPCell(p)
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 4f,
                    VerticalAlignment = Element.ALIGN_MIDDLE
                };
            }

            var line6 = new PdfPTable(3) { WidthPercentage = 100, SpacingAfter = 8f };
            line6.SetWidths(new float[] { 40f, 35f, 25f });
            line6.AddCell(LabeledCell("Part Name:", partName));
            line6.AddCell(LabeledCell("Part Number:", cert.PartNumber ?? "N/A"));
            line6.AddCell(LabeledCell("Part Rev.:", partRev ?? "N/A"));
            doc.Add(line6);

            var line7 = new PdfPTable(4) { WidthPercentage = 100, SpacingAfter = 8f };
            line7.SetWidths(new float[] { 25f, 20f, 30f, 25f });
            line7.AddCell(LabeledCell("Lot No.:", cert.LotNumber ?? "N/A"));
            line7.AddCell(LabeledCell("Qty:", cert.Quantity ?? "N/A"));
            line7.AddCell(LabeledCell("Customer PO:", cert.CustomerPO ?? "N/A"));
            line7.AddCell(LabeledCell("Type:", cert.Type ?? "N/A"));
            doc.Add(line7);

            var line8 = new PdfPTable(1) { WidthPercentage = 100, SpacingAfter = 6f };
            line8.AddCell(LabeledCell("S/No:", cert.SerialNumber ?? "N/A"));
            doc.Add(line8);

            var line9 = new PdfPTable(1) { WidthPercentage = 100, SpacingAfter = 6f };
            line9.AddCell(LabeledCell("Customer Name:", customerName ?? "N/A"));
            doc.Add(line9);

            var line10 = new PdfPTable(1) { WidthPercentage = 100, SpacingAfter = 30f };
            line10.AddCell(LabeledCell("Customer Address:", customerAddress ?? "N/A"));
            doc.Add(line10);

            var statement = new Paragraph(
                $"We certify that the product here described was manufactured in agreement with the technical specifications supplied by the customer and inspected according {inspectedAccording}. All manufacturing records related to this certificate are properly documented and available for review upon request by the customer.",
                valueFont)
            {
                SpacingAfter = 24f,
                Leading = 14f
            };
            doc.Add(statement);

            var documentsParagraph = new Paragraph(
                "This certified is applied to the following documents:\n- COL-ASQR-PRO-0003, HSM17 and HSM19.",
                valueFont)
            {
                SpacingAfter = 24f,
                Leading = 14f
            };
            doc.Add(documentsParagraph);

            // Espaço extra para afastar a assinatura do conteúdo
            doc.Add(new Paragraph(" ") { SpacingAfter = 80f });

            var signatureTable = new PdfPTable(1)
            {
                WidthPercentage = 100,
                HorizontalAlignment = Element.ALIGN_CENTER
            };

            var signatureImg = TryBuildSignatureImage(analyst?.Signature) ?? TryLoadProductSignature();
            if (signatureImg != null)
            {
                signatureImg.ScaleToFit(160f, 70f);
                signatureImg.Alignment = Element.ALIGN_CENTER;
                var imgCell = new PdfPCell(signatureImg)
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_CENTER,
                    PaddingBottom = 4f
                };
                signatureTable.AddCell(imgCell);
            }

            var dateCell = new PdfPCell(new Paragraph($"Date: {cert.EmissionDate.ToString("MM/dd/yyyy", culture)}", valueFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_CENTER,
                PaddingBottom = 2f
            };
            signatureTable.AddCell(dateCell);

            var labelCell = new PdfPCell(new Paragraph("Quality Assurance Product - Sign and date", labelFont))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_CENTER
            };
            signatureTable.AddCell(labelCell);

            signatureTable.SpacingBefore = 80f;
            doc.Add(signatureTable);

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

            string? savedPath = null;
            if (saveOnServer)
            {
                var outputDir = GetOutputPath();
                savedPath = Path.Combine(outputDir, fileName);
                await File.WriteAllBytesAsync(savedPath, fileBytes);
            }

            return new ProductConformityPdfResult(fileBytes, fileName, savedPath);
        }

        public async Task<ProductConformityCertificateModel> CreateAsync(ProductConformityCertificateModel model)
        {
            var emission = model.EmissionDate == default ? DateTime.Now : model.EmissionDate;
            model.EmissionDate = emission;
            model.Type = string.IsNullOrWhiteSpace(model.Type) ? "N/A" : model.Type;
            model.PartNumber = model.PartNumber?.Trim() ?? string.Empty;
            model.PartNumberDescription = model.PartNumberDescription?.Trim();
            model.PartNumberRevision = model.PartNumberRevision?.Trim();
            if (string.IsNullOrWhiteSpace(model.PartNumberRevision))
            {
                var parameterRevision = await ResolveParameterRevisionByPartNumberAsync(model.PartNumber);
                if (!string.IsNullOrWhiteSpace(parameterRevision))
                {
                    model.PartNumberRevision = parameterRevision;
                }
            }
            model.LotNumber = model.LotNumber?.Trim();
            model.Quantity = model.Quantity?.Trim();
            model.CustomerPO = model.CustomerPO?.Trim();
            model.SerialNumber = model.SerialNumber?.Trim();
            model.AnalystName = model.AnalystName?.Trim();
            model.CustomerName = model.CustomerName?.Trim();
            model.CustomerAddress = model.CustomerAddress?.Trim();
            model.CreateBy = string.IsNullOrWhiteSpace(model.CreateBy) ? "Sistema" : model.CreateBy.Trim();
            model.UpdateBy = AuditHelper.ResolveUpdateBy(model.UpdateBy, model.CreateBy);
            model.CreateDate = emission;
            model.LastUpdate = emission;
            model.IsDeleted = false;

            var year = SafeYear(emission);

            await using var tx = await _context.Database.BeginTransactionAsync();

            var existingNumbers = await _context.ProductConformityCertificates
                .AsNoTracking()
                .Where(c => c.EmissionDate.Year == year)
                .Select(c => c.CertificateNumber)
                .ToListAsync();

            var docControl = await GetDocumentControlAsync();

            model.DocumentNumber = string.IsNullOrWhiteSpace(model.DocumentNumber)
                ? docControl.DocumentNumber
                : model.DocumentNumber.Trim();

            model.DocumentRevision = string.IsNullOrWhiteSpace(model.DocumentRevision)
                ? docControl.DocumentRevision
                : model.DocumentRevision.Trim();

            model.DocumentDate = model.DocumentDate == default
                ? docControl.DocumentDate
                : model.DocumentDate;

            model.InspectedAccording = string.IsNullOrWhiteSpace(model.InspectedAccording)
                ? docControl.InspectedAccording
                : model.InspectedAccording.Trim();

            int seq;
            var requestedNumber = model.CertificateNumber?.Trim();
            var expectedSuffix = $"{year % 100:D2}";
            var hasValidSuffix = !string.IsNullOrWhiteSpace(requestedNumber) &&
                                 requestedNumber.Contains("-") &&
                                 requestedNumber.Split('-').Last().Equals(expectedSuffix, StringComparison.Ordinal);

            if (string.IsNullOrWhiteSpace(requestedNumber) || !hasValidSuffix)
            {
                seq = existingNumbers.Select(ParseSeq).DefaultIfEmpty(0).Max() + 1;
                model.CertificateNumber = BuildNumber(seq, year);
            }
            else
            {
                seq = ParseSeq(requestedNumber);
                if (existingNumbers.Contains(requestedNumber))
                {
                    do
                    {
                        seq++;
                        requestedNumber = BuildNumber(seq, year);
                    } while (existingNumbers.Contains(requestedNumber));

                    model.CertificateNumber = requestedNumber;
                }
            }

            _context.ProductConformityCertificates.Add(model);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return model;
        }

        public async Task<ProductConformityCertificateModel?> UpdateAsync(int id, ProductConformityCertificateModel model)
        {
            var existing = await _context.ProductConformityCertificates
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (existing == null)
            {
                return null;
            }

            if (!string.IsNullOrWhiteSpace(model.CertificateNumber))
            {
                existing.CertificateNumber = model.CertificateNumber.Trim();
            }

            if (model.EmissionDate != default)
            {
                existing.EmissionDate = model.EmissionDate;
            }

            existing.PartNumberId = model.PartNumberId;
            if (!string.IsNullOrWhiteSpace(model.PartNumber))
            {
                existing.PartNumber = model.PartNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.PartNumberDescription))
            {
                existing.PartNumberDescription = model.PartNumberDescription.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.PartNumberRevision))
            {
                existing.PartNumberRevision = model.PartNumberRevision.Trim();
            }
            else
            {
                var parameterRevision = await ResolveParameterRevisionByPartNumberAsync(existing.PartNumber);
                if (!string.IsNullOrWhiteSpace(parameterRevision))
                {
                    existing.PartNumberRevision = parameterRevision;
                }
            }

            if (!string.IsNullOrWhiteSpace(model.LotNumber))
            {
                existing.LotNumber = model.LotNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.Quantity))
            {
                existing.Quantity = model.Quantity.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.CustomerPO))
            {
                existing.CustomerPO = model.CustomerPO.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.Type))
            {
                existing.Type = model.Type.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.SerialNumber))
            {
                existing.SerialNumber = model.SerialNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.InspectedAccording))
            {
                existing.InspectedAccording = model.InspectedAccording.Trim();
            }

            existing.AnalystId = model.AnalystId;
            if (!string.IsNullOrWhiteSpace(model.AnalystName))
            {
                existing.AnalystName = model.AnalystName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.DocumentNumber))
            {
                existing.DocumentNumber = model.DocumentNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.DocumentRevision))
            {
                existing.DocumentRevision = model.DocumentRevision.Trim();
            }

            if (model.DocumentDate != default)
            {
                existing.DocumentDate = model.DocumentDate;
            }

            existing.CustomerId = model.CustomerId;
            if (!string.IsNullOrWhiteSpace(model.CustomerName))
            {
                existing.CustomerName = model.CustomerName.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.CustomerAddress))
            {
                existing.CustomerAddress = model.CustomerAddress.Trim();
            }

            if (!string.IsNullOrWhiteSpace(model.CreateBy))
            {
                existing.CreateBy = model.CreateBy.Trim();
            }

            existing.UpdateBy = AuditHelper.ResolveUpdateBy(model.UpdateBy, model.CreateBy, existing.UpdateBy ?? existing.CreateBy ?? "Sistema");
            existing.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.ProductConformityCertificates
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (existing == null)
            {
                return false;
            }

            existing.IsDeleted = true;
            existing.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<string?> ResolveParameterRevisionByPartNumberAsync(string? partNumber)
        {
            if (string.IsNullOrWhiteSpace(partNumber))
            {
                return null;
            }

            var partLower = partNumber.Trim().ToLowerInvariant();

            var revision = await _context.Parameters
                .AsNoTracking()
                .Where(p => !p.IsDeleted &&
                            !string.IsNullOrWhiteSpace(p.NormaRevision) &&
                            p.PartNumber != null &&
                            p.PartNumber.ToLower() == partLower)
                .OrderByDescending(p => p.LastUpdate ?? p.CreateDate)
                .ThenByDescending(p => p.Id)
                .Select(p => p.NormaRevision)
                .FirstOrDefaultAsync();

            return string.IsNullOrWhiteSpace(revision) ? null : revision.Trim();
        }
    }
}
