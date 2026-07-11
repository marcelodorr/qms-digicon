using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Utils;
using iTextSharp.text;
using iTextSharp.text.pdf;
using iTextSharp.text.pdf.draw;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public record SpecialProcessCertificateListItem(int Id, string Code, string? Cliente, string? PartNumber, string? PurchasingOrder, DateTime EmissionDate, string? UpdateBy);
    public record WeeklySpecialProcessData(DateTime WeekStart, int Total);
    public record SpecialProcessPdfResult(byte[] FileBytes, string FileName, string? SavedPath);

    public class SpecialProcessCertificateService
    {
        private readonly AppDbContext _context;
        private static readonly Regex SequenceRegex = new(@"^(\d+)", RegexOptions.Compiled);
        private static readonly object OutputPathLock = new();
        private static readonly string OutputPathConfigFile = Path.Combine(AppContext.BaseDirectory, "special_process_output_path.txt");
        private static string _outputPath = string.Empty;

        private const int SequenceDigits = 6;

        private static DateTime GetWeekStart(DateTime date)
        {
            var diff = ((int)date.DayOfWeek + 6) % 7;
            return date.Date.AddDays(-diff);
        }

        public SpecialProcessCertificateService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SpecialProcessCertificateModel>> GetAllAsync()
        {
            return await _context.SpecialProcessCertificates
                .Where(c => !c.IsDeleted)
                .AsNoTracking()
                .OrderByDescending(c => c.CreateDate)
                .ToListAsync();
        }

        public async Task<int> CountCertificatesAsync()
        {
            return await _context.SpecialProcessCertificates
                .Where(c => !c.IsDeleted)
                .CountAsync();
        }

        public async Task<List<SpecialProcessCertificateListItem>> ListCodesAsync(DateTime? from = null, DateTime? to = null, string? search = null)
        {
            var query = _context.SpecialProcessCertificates
                .Where(c => !c.IsDeleted)
                .AsNoTracking();

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
                    (c.CertificateCode != null && c.CertificateCode.Contains(term)) ||
                    (c.ClienteNome != null && c.ClienteNome.Contains(term)) ||
                    (c.PartNumber != null && c.PartNumber.Contains(term)) ||
                    (c.PurchasingOrder != null && c.PurchasingOrder.Contains(term)));
            }

            return await query
                .OrderByDescending(c => c.EmissionDate)
                .Select(c => new SpecialProcessCertificateListItem(
                    c.Id,
                    c.CertificateCode,
                    c.ClienteNome,
                    c.PartNumber,
                    c.PurchasingOrder,
                    c.EmissionDate,
                    c.UpdateBy))
                .ToListAsync();
        }

        public async Task<List<WeeklySpecialProcessData>> GetWeeklyCountsAsync(DateTime from, DateTime to)
        {
            if (to < from)
            {
                (from, to) = (to, from);
            }

            var start = from.Date;
            var endExclusive = to.Date.AddDays(1);

            var dates = await _context.SpecialProcessCertificates
                .Where(c => !c.IsDeleted && c.CreateDate >= start && c.CreateDate < endExclusive)
                .Select(c => c.CreateDate)
                .ToListAsync();

            return dates
                .Select(GetWeekStart)
                .GroupBy(d => d)
                .Select(g => new WeeklySpecialProcessData(g.Key, g.Count()))
                .OrderBy(g => g.WeekStart)
                .ToList();
        }

        public async Task<SpecialProcessCertificateModel?> GetByIdAsync(int id)
        {
            return await _context.SpecialProcessCertificates
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        }

        public async Task<SpecialProcessCertificateModel?> GetByCodeAsync(string code)
        {
            return await _context.SpecialProcessCertificates
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.CertificateCode == code && !c.IsDeleted);
        }

        public async Task<SpecialProcessCertificateModel?> UpdateAsync(int id, SpecialProcessCertificateModel model)
        {
            var existing = await _context.SpecialProcessCertificates
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (existing == null) return null;

            existing.ClienteId = model.ClienteId;
            existing.ClienteNome = string.IsNullOrWhiteSpace(model.ClienteNome) ? null : model.ClienteNome.Trim();
            existing.SpecialProcessId = model.SpecialProcessId;
            existing.SpecialProcess = string.IsNullOrWhiteSpace(model.SpecialProcess) ? null : model.SpecialProcess.Trim();
            existing.Norma = string.IsNullOrWhiteSpace(model.Norma) ? null : model.Norma.Trim();
            existing.PartNumber = string.IsNullOrWhiteSpace(model.PartNumber) ? null : model.PartNumber.Trim();
            if (model.EmissionDate != default)
            {
                existing.EmissionDate = model.EmissionDate;
            }
            existing.Quantity = model.Quantity;
            existing.LotNumber = string.IsNullOrWhiteSpace(model.LotNumber) ? null : model.LotNumber.Trim();
            existing.PurchasingOrder = string.IsNullOrWhiteSpace(model.PurchasingOrder) ? null : model.PurchasingOrder.Trim();
            existing.Item = string.IsNullOrWhiteSpace(model.Item) ? null : model.Item.Trim();
            existing.HardnessFound = string.IsNullOrWhiteSpace(model.HardnessFound) ? null : model.HardnessFound.Trim();
            existing.HeatTreatLot = string.IsNullOrWhiteSpace(model.HeatTreatLot) ? null : model.HeatTreatLot.Trim();
            existing.AnalystId = model.AnalystId;
            existing.AnalystName = string.IsNullOrWhiteSpace(model.AnalystName) ? null : model.AnalystName.Trim();
            existing.Observations = string.IsNullOrWhiteSpace(model.Observations) ? null : model.Observations.Trim();
            if (!string.IsNullOrWhiteSpace(model.CreateBy))
                existing.CreateBy = model.CreateBy.Trim();
            existing.UpdateBy = AuditHelper.ResolveUpdateBy(model.UpdateBy, model.CreateBy, existing.UpdateBy ?? existing.CreateBy ?? "Sistema");
            existing.LastUpdate = DateTime.Now;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.SpecialProcessCertificates
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

            if (existing == null) return false;

            existing.IsDeleted = true;
            existing.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> PeekNextCodeAsync(DateTime emissionDate)
        {
            var year = emissionDate.Year;
            var existing = await _context.SpecialProcessCertificates
                .Where(c => c.EmissionDate.Year == year)
                .Select(c => c.CertificateCode)
                .ToListAsync();

            var next = existing
                .Select(ParseSequence)
                .DefaultIfEmpty(0)
                .Max() + 1;

            return BuildCode(next, year);
        }

        public async Task<SpecialProcessCertificateModel> CreateAsync(SpecialProcessCertificateModel model)
        {
            await PrepareForCreateAsync(model);

            await using var tx = await _context.Database.BeginTransactionAsync();

            var year = model.EmissionDate.Year;
            var existingCodes = await _context.SpecialProcessCertificates
                .Where(c => c.EmissionDate.Year == year)
                .Select(c => c.CertificateCode)
                .ToListAsync();

            var maxSeq = existingCodes
                .Select(ParseSequence)
                .DefaultIfEmpty(0)
                .Max();

            var nextSeq = maxSeq + 1;
            model.CertificateCode = BuildCode(nextSeq, year);

            _context.SpecialProcessCertificates.Add(model);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return model;
        }

        public async Task<List<SpecialProcessCertificateModel>> CreateManyAsync(IEnumerable<SpecialProcessCertificateModel> models)
        {
            var list = models?.Where(m => m != null).ToList() ?? new List<SpecialProcessCertificateModel>();
            if (list.Count == 0)
            {
                return new List<SpecialProcessCertificateModel>();
            }

            var prepared = new List<SpecialProcessCertificateModel>();
            foreach (var model in list)
            {
                await PrepareForCreateAsync(model);
                prepared.Add(model);
            }

            await using var tx = await _context.Database.BeginTransactionAsync();

            var years = prepared
                .Select(m => m.EmissionDate.Year)
                .Distinct()
                .ToList();

            foreach (var year in years)
            {
                var existingCodes = await _context.SpecialProcessCertificates
                    .Where(c => c.EmissionDate.Year == year)
                    .Select(c => c.CertificateCode)
                    .ToListAsync();

                var maxSeq = existingCodes
                    .Select(ParseSequence)
                    .DefaultIfEmpty(0)
                    .Max();

                var nextSeq = maxSeq + 1;
                foreach (var model in prepared.Where(m => m.EmissionDate.Year == year))
                {
                    model.CertificateCode = BuildCode(nextSeq, year);
                    nextSeq++;
                }
            }

            _context.SpecialProcessCertificates.AddRange(prepared);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return prepared;
        }

        private async Task PrepareForCreateAsync(SpecialProcessCertificateModel model)
        {
            var emission = model.EmissionDate == default ? DateTime.Today : model.EmissionDate;
            model.EmissionDate = emission;
            model.CreateDate = DateTime.Now;
            model.LastUpdate = DateTime.Now;
            model.IsDeleted = false;
            model.CreateBy = string.IsNullOrWhiteSpace(model.CreateBy) ? "Sistema" : model.CreateBy.Trim();
            model.UpdateBy = AuditHelper.ResolveUpdateBy(model.UpdateBy, model.CreateBy);
            model.PartNumber = string.IsNullOrWhiteSpace(model.PartNumber) ? null : model.PartNumber.Trim();
            model.SpecialProcess = string.IsNullOrWhiteSpace(model.SpecialProcess) ? null : model.SpecialProcess.Trim();
            model.Norma = string.IsNullOrWhiteSpace(model.Norma) ? null : model.Norma.Trim();
            model.Item = string.IsNullOrWhiteSpace(model.Item) ? null : model.Item.Trim();
            model.HardnessFound = string.IsNullOrWhiteSpace(model.HardnessFound) ? null : model.HardnessFound.Trim();
            model.HeatTreatLot = string.IsNullOrWhiteSpace(model.HeatTreatLot) ? null : model.HeatTreatLot.Trim();

            SpecialProcessModel? processEntity = null;
            if (model.SpecialProcessId.HasValue)
            {
                processEntity = await _context.SpecialProcesses
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == model.SpecialProcessId && !p.IsDeleted);
            }

            if (processEntity == null && !model.SpecialProcessId.HasValue && !string.IsNullOrWhiteSpace(model.SpecialProcess))
            {
                var proc = model.SpecialProcess.Trim();
                processEntity = await _context.SpecialProcesses
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => !p.IsDeleted && p.SpecialProcess == proc);
            }

            if (processEntity != null)
            {
                model.SpecialProcessId = processEntity.Id;
                model.SpecialProcess = string.IsNullOrWhiteSpace(model.SpecialProcess)
                    ? processEntity.SpecialProcess
                    : model.SpecialProcess.Trim();
                if (string.IsNullOrWhiteSpace(model.Norma))
                {
                    model.Norma = processEntity.Specification;
                }
            }

            var isHeatTreat = (processEntity?.SpecialProcess ?? model.SpecialProcess ?? string.Empty)
                .IndexOf("heat treat", StringComparison.OrdinalIgnoreCase) >= 0;
            if (!isHeatTreat)
            {
                model.HardnessFound = null;
                model.HeatTreatLot = null;
            }
        }

        public void SetOutputPath(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                throw new ArgumentException("Caminho inválido.");

            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);

            lock (OutputPathLock)
            {
                _outputPath = path;
                try
                {
                    File.WriteAllText(OutputPathConfigFile, path);
                }
                catch
                {
                    // Ignora falha de persistência, mantendo valor na sessão atual
                }
            }
        }

        public string GetOutputPath()
        {
            lock (OutputPathLock)
            {
                if (!string.IsNullOrWhiteSpace(_outputPath))
                    return _outputPath;

                if (File.Exists(OutputPathConfigFile))
                {
                    try
                    {
                        var persisted = File.ReadAllText(OutputPathConfigFile).Trim();
                        if (!string.IsNullOrWhiteSpace(persisted))
                        {
                            if (!Directory.Exists(persisted))
                                Directory.CreateDirectory(persisted);
                            _outputPath = persisted;
                            return _outputPath;
                        }
                    }
                    catch
                    {
                        // Se leitura falhar, prossegue com padrão
                    }
                }

                var docs = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
                var def = Path.Combine(docs, "CertificadosProcessoEspecial");
                if (!Directory.Exists(def)) Directory.CreateDirectory(def);
                _outputPath = def;

                try
                {
                    File.WriteAllText(OutputPathConfigFile, _outputPath);
                }
                catch
                {
                    // Ignora falha de persistência inicial
                }

                return _outputPath;
            }
        }

        public async Task<SpecialProcessPdfResult> GeneratePdfAsync(int certificateId, bool saveOnServer = false)
        {
            var cert = await _context.SpecialProcessCertificates
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == certificateId && !c.IsDeleted);

            if (cert == null)
                throw new KeyNotFoundException("Certificate not found.");

            AnalystModel? analyst = null;
            if (cert.AnalystId.HasValue)
            {
                analyst = await _context.Analysts
                    .AsNoTracking()
                    .FirstOrDefaultAsync(a => a.Id == cert.AnalystId && !a.IsDeleted);
            }

            ClienteModel? clienteInfo = null;
            if (cert.ClienteId.HasValue)
            {
                clienteInfo = await _context.Cliente
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == cert.ClienteId && !c.IsDeleted);
            }

            var partNumberSegment = SanitizeFileSegment(cert.PartNumber);
            var poSegment = SanitizeFileSegment(cert.PurchasingOrder);
            var itemSegment = SanitizeFileSegment(cert.Item);
            var clienteSegment = SanitizeFileSegment(clienteInfo?.Cliente ?? cert.ClienteNome);
            var emissionSegment = cert.EmissionDate.ToString("yyyyMMdd", CultureInfo.InvariantCulture);

            var fileName = $"Certificate_Special_Process_{poSegment}-{itemSegment}{partNumberSegment}{clienteSegment}_{emissionSegment}.pdf";

            byte[] fileBytes;

            using var ms = new MemoryStream();
            var doc = new Document(PageSize.A4, 32f, 32f, 36f, 36f);
            var writer = PdfWriter.GetInstance(doc, ms);

            var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 14);
            var labelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8);
            var valueFont = FontFactory.GetFont(FontFactory.HELVETICA, 8);
            var sectionTitleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10);
            var infoLabelFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 9);
            var infoValueFont = FontFactory.GetFont(FontFactory.HELVETICA, 9);

            try
            {
                doc.Open();

            var processType = cert.SpecialProcess;
            var processDisplay = string.IsNullOrWhiteSpace(processType)
                ? "PROCESSO ESPECIAL"
                : processType.Trim().ToUpperInvariant();
            var processDetailValue = string.IsNullOrWhiteSpace(processType)
                ? "SPECIAL PROCESS"
                : processType.Trim();
            var isHeatTreatProcess = !string.IsNullOrWhiteSpace(processType) &&
                                     processType.IndexOf("heat treat", StringComparison.OrdinalIgnoreCase) >= 0;

            PdfPCell InfoCell(string label, string value, int colspan = 1, int horizontalAlignment = Element.ALIGN_LEFT)
            {
                var phrase = new Phrase
                {
                    new Chunk($"{label} ", infoLabelFont),
                    new Chunk(value, infoValueFont)
                };

                return new PdfPCell(phrase)
                {
                    Border = Rectangle.NO_BORDER,
                    Colspan = colspan,
                    Padding = 4f,
                    HorizontalAlignment = horizontalAlignment
                };
            }

            var headerTable = new PdfPTable(2)
            {
                WidthPercentage = 100,
                SpacingAfter = 18f
            };
            headerTable.SetWidths(new float[] { 80f, 20f });

            var logoImage = TryLoadDigiconLogo();
            PdfPCell logoCell;
            if (logoImage != null)
            {
                logoImage.ScaleToFit(110f, 50f);
                logoImage.Alignment = Element.ALIGN_RIGHT;
                logoCell = new PdfPCell(logoImage)
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT,
                    VerticalAlignment = Element.ALIGN_MIDDLE,
                    PaddingBottom = 4f,
                    PaddingLeft = 6f
                };
            }
            else
            {
                logoCell = new PdfPCell(new Phrase(string.Empty))
                {
                    Border = Rectangle.NO_BORDER,
                    HorizontalAlignment = Element.ALIGN_RIGHT
                };
            }
            headerTable.AddCell(new PdfPCell(new Phrase(string.Empty))
            {
                Border = Rectangle.NO_BORDER,
                HorizontalAlignment = Element.ALIGN_LEFT
            });

            headerTable.AddCell(logoCell);

            doc.Add(headerTable);

            var titleParagraph = new Paragraph
            {
                new Chunk("CERTIFICATE OF CONFORMANCE – ", titleFont),
                new Chunk(processDisplay, titleFont),
                new Chunk(new VerticalPositionMark()),
                new Chunk($"C OF C Nº {cert.CertificateCode}", FontFactory.GetFont(FontFactory.HELVETICA, 9))
            };
            titleParagraph.Alignment = Element.ALIGN_LEFT;
            titleParagraph.SpacingAfter = 12f;
            doc.Add(titleParagraph);

            var issuerTable = new PdfPTable(2)
            {
                WidthPercentage = 100,
                SpacingAfter = 12f
            };
            issuerTable.SetWidths(new float[] { 65f, 35f });
            issuerTable.AddCell(InfoCell("Name:", "DIGICON S/A – Controle Eletrônico para Mecânica"));
            issuerTable.AddCell(InfoCell("Supplier Code:", "163283", horizontalAlignment: Element.ALIGN_RIGHT));
            issuerTable.AddCell(InfoCell("Address:", "R. Nissin Castiel, 640 – Distrito Industrial – Gravataí/RS – Brasil – CEP 94045-420", colspan: 2));
            doc.Add(issuerTable);

            var customerName = cert.ClienteNome;
            if (string.IsNullOrWhiteSpace(customerName))
            {
                customerName = clienteInfo?.Cliente;
            }
            customerName = string.IsNullOrWhiteSpace(customerName) ? "NÃO INFORMADO" : customerName.Trim();

            var customerAddress = clienteInfo?.Endereco;
            customerAddress = string.IsNullOrWhiteSpace(customerAddress) ? "NÃO INFORMADO" : customerAddress.Trim();

            doc.Add(new Paragraph("CUSTOMER INFORMATION", sectionTitleFont)
            {
                SpacingBefore = 4f,
                SpacingAfter = 4f
            });

            var customerTable = new PdfPTable(1)
            {
                WidthPercentage = 100,
                SpacingAfter = 16f
            };
            customerTable.AddCell(InfoCell("Name:", customerName));
            customerTable.AddCell(InfoCell("Address:", customerAddress));
            doc.Add(customerTable);

            var partNumberEntry = await _context.PartNumbers
                .AsNoTracking()
                .FirstOrDefaultAsync(p => !p.IsDeleted && p.PartNumber == cert.PartNumber);

            string? specificationText = cert.Norma?.Trim();
            string? normaRevision = null;

            var procTrim = cert.SpecialProcess?.Trim();
            var normaTrim = cert.Norma?.Trim();
            var partTrim = cert.PartNumber?.Trim();

            if (!string.IsNullOrWhiteSpace(procTrim) ||
                !string.IsNullOrWhiteSpace(normaTrim) ||
                !string.IsNullOrWhiteSpace(partTrim))
            {
                var procLower = procTrim?.ToLowerInvariant();
                var normaLower = normaTrim?.ToLowerInvariant();
                var partLower = partTrim?.ToLowerInvariant();

                normaRevision = await _context.Parameters
                    .AsNoTracking()
                    .Where(p => !p.IsDeleted &&
                                !string.IsNullOrWhiteSpace(p.NormaRevision) &&
                                (partLower == null ||
                                 (p.PartNumber != null && p.PartNumber.ToLower() == partLower)) &&
                                (procLower == null ||
                                 (p.Processo != null && p.Processo.ToLower() == procLower)) &&
                                (normaLower == null ||
                                 (p.Norma != null && p.Norma.ToLower() == normaLower)))
                    .OrderByDescending(p => p.LastUpdate ?? p.CreateDate)
                    .ThenByDescending(p => p.Id)
                    .Select(p => p.NormaRevision)
                    .FirstOrDefaultAsync();
            }

            specificationText = string.IsNullOrWhiteSpace(specificationText) ? "N/A" : specificationText;

            var specificationWithRevision = string.IsNullOrWhiteSpace(normaRevision)
                ? specificationText
                : $"{specificationText} – Rev. {normaRevision.Trim()}";

            var normalizedPartNumber = string.IsNullOrWhiteSpace(cert.PartNumber)
                ? null
                : cert.PartNumber.Trim().ToLowerInvariant();
            var normalizedProcess = string.IsNullOrWhiteSpace(processType)
                ? null
                : processType.Trim().ToLowerInvariant();
            var normalizedNorma = string.IsNullOrWhiteSpace(cert.Norma)
                ? null
                : cert.Norma.Trim().ToLowerInvariant();

            var parameterEntries = await _context.Parameters
                .AsNoTracking()
                .Where(p => !p.IsDeleted &&
                            (normalizedPartNumber == null ||
                             (p.PartNumber != null && p.PartNumber.ToLower() == normalizedPartNumber)) &&
                            (normalizedProcess == null ||
                             (p.Processo != null && p.Processo.ToLower() == normalizedProcess)) &&
                            (normalizedNorma == null ||
                             (p.Norma != null && p.Norma.ToLower() == normalizedNorma)))
                .ToListAsync();

            var culture = new CultureInfo("en-US");

            doc.Add(new Paragraph("PROCESS DETAILS", sectionTitleFont)
            {
                SpacingAfter = 4f
            });

            AddDetailParagraph("Special Process", processDetailValue);
            AddDetailParagraph("Specification / Standard", specificationWithRevision);

            var detailsRow = new PdfPTable(3)
            {
                WidthPercentage = 100,
                SpacingAfter = 6f
            };
            detailsRow.SetWidths(new float[] { 33f, 34f, 33f });
            detailsRow.AddCell(MaterialCellInline("Lot Number", cert.LotNumber));
            detailsRow.AddCell(MaterialCellInline("Customer Purchase Order", FormatPurchaseOrder(cert.PurchasingOrder, cert.Item)));
            detailsRow.AddCell(MaterialCellInline("Emission Date", cert.EmissionDate.ToString("MM/dd/yyyy", culture)));
            doc.Add(detailsRow);

            if (isHeatTreatProcess)
            {
                var heatInfoTable = new PdfPTable(2)
                {
                    WidthPercentage = 100,
                    SpacingAfter = 6f
                };
                heatInfoTable.SetWidths(new float[] { 50f, 50f });
                heatInfoTable.AddCell(MaterialCellInline("Hardness Found", cert.HardnessFound));
                heatInfoTable.AddCell(MaterialCellInline("Heat Treat Lot", cert.HeatTreatLot));
                doc.Add(heatInfoTable);
            }

            doc.Add(new Paragraph("MATERIAL DETAIL", sectionTitleFont)
            {
                SpacingBefore = 10f,
                SpacingAfter = 4f
            });

            var partDescription = partNumberEntry?.Descricao ?? "N/A";
            var partRevision = partNumberEntry?.Revision ?? "N/A";

        PdfPCell MaterialCell(string label, string value)
        {
            value = string.IsNullOrWhiteSpace(value) ? "N/A" : value;

            var paragraph = new Paragraph
                {
                    new Chunk(label, infoLabelFont),
                    new Chunk(Environment.NewLine),
                    new Chunk(value, infoValueFont)
                };

                return new PdfPCell(paragraph)
                {
                    Border = Rectangle.NO_BORDER,
                    Padding = 4f,
                VerticalAlignment = Element.ALIGN_TOP
            };
        }

        PdfPCell MaterialCellInline(string label, string? value)
        {
            value = string.IsNullOrWhiteSpace(value) ? "N/A" : value;

            var paragraph = new Paragraph
            {
                new Chunk(label, infoLabelFont),
                new Chunk(Environment.NewLine),
                new Chunk(value, infoValueFont)
            };

            return new PdfPCell(paragraph)
            {
                Border = Rectangle.NO_BORDER,
                Padding = 4f,
                VerticalAlignment = Element.ALIGN_TOP
            };
        }

        static string? FormatPurchaseOrder(string? poNumber, string? item)
        {
            var poValue = string.IsNullOrWhiteSpace(poNumber) ? null : poNumber.Trim();
            var itemValue = string.IsNullOrWhiteSpace(item) ? null : item.Trim();

            if (string.IsNullOrWhiteSpace(poValue) && string.IsNullOrWhiteSpace(itemValue))
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(itemValue))
            {
                return poValue;
            }

            if (string.IsNullOrWhiteSpace(poValue))
            {
                return itemValue;
            }

            return $"{poValue} / {itemValue}";
        }

        void AddDetailParagraph(string label, string? value, float spacing = 2f)
        {
            var safeValue = string.IsNullOrWhiteSpace(value) ? "N/A" : value;
            var paragraph = new Paragraph
            {
                new Chunk($"{label}: ", infoLabelFont),
                new Chunk(safeValue, infoValueFont)
            };
            paragraph.SpacingAfter = spacing;
            doc.Add(paragraph);
        }

            var materialTable = new PdfPTable(3)
            {
                WidthPercentage = 100,
                SpacingAfter = 10f
            };
            materialTable.SetWidths(new float[] { 33f, 34f, 33f });
            materialTable.AddCell(MaterialCell("Part Number:", cert.PartNumber ?? "N/A"));
            materialTable.AddCell(MaterialCell("Description:", partDescription));
            materialTable.AddCell(MaterialCell("Revision:", partRevision));
            doc.Add(materialTable);

            doc.Add(new Paragraph("Process Parameters:", infoLabelFont)
            {
                SpacingAfter = 2f
            });
            doc.Add(new Paragraph("(Describe key process conditions or reference controlled documentation)", FontFactory.GetFont(FontFactory.HELVETICA, 7))
            {
                SpacingAfter = 4f
            });

            if (parameterEntries.Count > 0)
            {
                foreach (var parameter in parameterEntries)
                {
                    AddDetailParagraph("Parameter", parameter.Parameter);
                }
            }
            else
            {
                AddDetailParagraph("Parameter", "N/A");
            }

            string? heatConditionValue = parameterEntries
                .Select(p => p.Condition)
                .FirstOrDefault(c => !string.IsNullOrWhiteSpace(c) && !string.Equals(c, "-", StringComparison.OrdinalIgnoreCase));

            if (processDisplay.Contains("HEAT", StringComparison.OrdinalIgnoreCase))
            {
                heatConditionValue ??= "N/A";
                AddDetailParagraph("Condition", heatConditionValue);
            }

            var quantityValue = decimal.Truncate(cert.Quantity);
            var totalApprovedParagraph = new Paragraph
            {
                new Chunk("Total Approved Parts: ", infoLabelFont),
                new Chunk(quantityValue.ToString("N0", culture), infoValueFont)
            };
            totalApprovedParagraph.SpacingAfter = 12f;
            doc.Add(totalApprovedParagraph);

            var commentsValue = string.IsNullOrWhiteSpace(cert.Observations) ? "N/A" : cert.Observations.Trim();
            doc.Add(new Paragraph("Comments:", infoLabelFont)
            {
                SpacingAfter = 2f
            });
            doc.Add(new Paragraph(commentsValue, infoValueFont)
            {
                SpacingAfter = 12f
            });

            doc.Add(new Paragraph("STATEMENT OF CONFORMANCE", sectionTitleFont)
            {
                SpacingAfter = 4f
            });
            doc.Add(new Paragraph(
                $"We certify that the aforementioned part(s) were processed and tested in full compliance with the {specificationText} specification, meeting all applicable process requirements. All acceptance inspections and tests were successfully completed, confirming that the product meets the acceptance criteria and the customer's quality requirements.",
                infoValueFont)
            {
                SpacingAfter = 16f,
                Leading = 16f
            });

            if (analyst != null)
            {
                var signatureParagraph = new Paragraph
                {
                    Alignment = Element.ALIGN_CENTER,
                    SpacingBefore = 1f
                };

                var signatureImage = TryBuildSignatureImage(analyst.Signature);
                if (signatureImage != null)
                {
                    signatureImage.ScaleToFit(120f, 60f);
                    signatureImage.Alignment = Element.ALIGN_CENTER;
                    doc.Add(signatureImage);
                }

                signatureParagraph.Add(new Phrase(analyst.Analyst ?? string.Empty, labelFont));
                signatureParagraph.Add(new Phrase("\n"));
                signatureParagraph.Add(new Phrase("Quality Assurance Representative", valueFont));
                signatureParagraph.Add(new Phrase("\n"));
                signatureParagraph.Add(new Phrase("DIGICON S/A", valueFont));
                doc.Add(signatureParagraph);
            }

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

            return new SpecialProcessPdfResult(fileBytes, fileName, savedPath);
        }

        public async Task<SpecialProcessPdfResult> GenerateCombinedPdfAsync(IEnumerable<int> certificateIds, bool saveOnServer = false)
        {
            if (certificateIds == null)
                throw new ArgumentException("Ids inválidos.");

            var ids = new List<int>();
            var seen = new HashSet<int>();
            foreach (var id in certificateIds)
            {
                if (id <= 0 || !seen.Add(id))
                    continue;
                ids.Add(id);
            }

            if (ids.Count == 0)
                throw new ArgumentException("Ids inválidos.");

            using var outputStream = new MemoryStream();
            var document = new Document();
            PdfCopy? copy = null;
            SpecialProcessPdfResult? firstResult = null;

            try
            {
                copy = new PdfCopy(document, outputStream);
                document.Open();

                foreach (var id in ids)
                {
                    var result = await GeneratePdfAsync(id, false);
                    firstResult ??= result;

                    var reader = new PdfReader(result.FileBytes);
                    try
                    {
                        for (var page = 1; page <= reader.NumberOfPages; page++)
                        {
                            copy.AddPage(copy.GetImportedPage(reader, page));
                        }
                        copy.FreeReader(reader);
                    }
                    finally
                    {
                        reader.Close();
                    }
                }
            }
            finally
            {
                if (document.IsOpen())
                {
                    document.Close();
                }
                copy?.Close();
            }

            var fallbackDate = DateTime.Now.ToString("yyyyMMdd", CultureInfo.InvariantCulture);
            var fileName = firstResult?.FileName
                ?? $"Certificate_Special_Process_NA-NA_NANANA_{fallbackDate}.pdf";

            var fileBytes = outputStream.ToArray();
            string? savedPath = null;
            if (saveOnServer)
            {
                var outputDir = GetOutputPath();
                savedPath = Path.Combine(outputDir, fileName);
                await File.WriteAllBytesAsync(savedPath, fileBytes);
            }

            return new SpecialProcessPdfResult(fileBytes, fileName, savedPath);
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
            AddCandidate(currentDir, "frontend", "src", "components", "assets", "digicon_logo.png");
            AddCandidate(currentDir, "frontend", "public", "digicon_logo.png");
            AddCandidate(currentDir, "frontend", "public", "logo512.png");
            AddCandidate(currentDir, "frontend", "public", "logo192.png");

            AddCandidate(solutionDir, "frontend", "src", "assets", "digicon_logo.png");
            AddCandidate(solutionDir, "frontend", "src", "components", "assets", "digicon_logo.png");
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
                    // Ignora caminho inválido e tenta o próximo candidato.
                }
            }

            return null;
        }

        private static string SanitizeFileSegment(string? value)
        {
            const string fallback = "NA";
            if (string.IsNullOrWhiteSpace(value))
                return fallback;

            var trimmed = value.Trim();
            var invalidChars = Path.GetInvalidFileNameChars();
            var builder = new StringBuilder(trimmed.Length);

            foreach (var ch in trimmed)
            {
                if (Array.IndexOf(invalidChars, ch) >= 0)
                    continue;

                builder.Append(ch);
            }

            var result = builder.ToString().Replace(' ', '_');
            return string.IsNullOrWhiteSpace(result) ? fallback : result;
        }

        private static string BuildCode(int sequence, int year)
        {
            var yy = year % 100;
            return $"{sequence.ToString($"D{SequenceDigits}", CultureInfo.InvariantCulture)}-{yy:D2}";
        }

        private static int ParseSequence(string? code)
        {
            if (string.IsNullOrWhiteSpace(code)) return 0;
            var match = SequenceRegex.Match(code);
            if (!match.Success) return 0;
            return int.TryParse(match.Groups[1].Value, out var value) ? value : 0;
        }
    }
}
