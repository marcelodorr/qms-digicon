using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ShippingLabelService
    {
        private const decimal DefaultWidthMm = 100m;
        private const decimal DefaultHeightMm = 50m;
        private const decimal DefaultBadgeFontMm = 7.5m;
        private const decimal DefaultHeaderFontMm = 5.6m;
        private const decimal DefaultCountryFontMm = 6.6m;
        private const decimal DefaultWarningFontMm = 5.6m;
        private const decimal DefaultReferenceFontMm = 4.8m;
        private const decimal DefaultBadgeWidthMm = 21.5m;
        private const decimal DefaultBadgeHeightMm = 13.03m;
        private const decimal DefaultBadgeStrokeWidthMm = 0.35m;
        private const decimal DefaultBadgeLeftMm = 1.4m;
        private const decimal DefaultBadgeTopMm = 1.4m;
        private const decimal DefaultHeaderLeftMm = 25.7m;
        private const decimal DefaultHeaderTopMm = 1.4m;
        private const decimal DefaultHeaderRightMm = 1.4m;
        private const decimal DefaultCountryLeftMm = 25.7m;
        private const decimal DefaultCountryTopMm = 18.8m;
        private const decimal DefaultCountryRightMm = 1.4m;
        private const decimal DefaultWarningLeftMm = 1.4m;
        private const decimal DefaultWarningTopMm = 35m;
        private const decimal DefaultWarningRightMm = 1.4m;
        private const decimal DefaultReferenceLeftMm = 1.4m;
        private const decimal DefaultReferenceTopMm = 43m;
        private const decimal DefaultReferenceRightMm = 1.4m;
        private const string DefaultBadgeText = "283";
        private const string DefaultHeaderPrefix = "|-S-| 73030 -";
        private const string DefaultAssyHeaderPrefix = "|-S-| 73030 ASSY-";
        private const string DefaultCountryText = "BRAZIL";
        private const string DefaultWarningText = "MATCHED SET DO NOT ISSUE SEPARATION";
        private const string DefaultFontFamily = "Arial";
        private readonly AppDbContext _context;

        public ShippingLabelService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ShippingLabelModel>> ListAsync()
        {
            return await _context.ShippingLabels
                .AsNoTracking()
                .Where(label => !label.IsDeleted)
                .OrderByDescending(label => label.CreateDate)
                .ThenByDescending(label => label.Id)
                .ToListAsync();
        }

        public async Task<ShippingLabelModel?> GetByIdAsync(int id)
        {
            return await _context.ShippingLabels
                .AsNoTracking()
                .FirstOrDefaultAsync(label => label.Id == id && !label.IsDeleted);
        }

        public async Task<ShippingLabelModel> CreateAsync(ShippingLabelSaveCommand command)
        {
            var partNumber = await ResolvePartNumberAsync(command.PartNumberId);

            var entity = new ShippingLabelModel
            {
                PartNumberId = partNumber.Id,
                PartNumber = partNumber.PartNumber.Trim(),
                ReferenceDate = (command.ReferenceDate ?? DateTime.Today).Date,
                RangeStart = command.RangeStart,
                RangeEnd = command.RangeEnd,
                LabelModel = NormalizeLabelModel(command.LabelModel),
                BadgeFontMm = command.BadgeFontMm,
                HeaderFontMm = command.HeaderFontMm,
                CountryFontMm = command.CountryFontMm,
                WarningFontMm = command.WarningFontMm,
                ReferenceFontMm = command.ReferenceFontMm,
                BadgeWidthMm = command.BadgeWidthMm,
                BadgeHeightMm = command.BadgeHeightMm,
                BadgeStrokeWidthMm = command.BadgeStrokeWidthMm,
                LabelWidthMm = command.LabelWidthMm,
                LabelHeightMm = command.LabelHeightMm,
                MarginLeftMm = command.MarginLeftMm,
                MarginTopMm = command.MarginTopMm,
                MarginRightMm = command.MarginRightMm,
                MarginBottomMm = command.MarginBottomMm,
                BadgeLeftMm = command.BadgeLeftMm,
                BadgeTopMm = command.BadgeTopMm,
                HeaderLeftMm = command.HeaderLeftMm,
                HeaderTopMm = command.HeaderTopMm,
                HeaderRightMm = command.HeaderRightMm,
                CountryLeftMm = command.CountryLeftMm,
                CountryTopMm = command.CountryTopMm,
                CountryRightMm = command.CountryRightMm,
                WarningLeftMm = command.WarningLeftMm,
                WarningTopMm = command.WarningTopMm,
                WarningRightMm = command.WarningRightMm,
                ReferenceLeftMm = command.ReferenceLeftMm,
                ReferenceTopMm = command.ReferenceTopMm,
                ReferenceRightMm = command.ReferenceRightMm,
                BadgeBold = command.BadgeBold,
                HeaderBold = command.HeaderBold,
                CountryBold = command.CountryBold,
                WarningBold = command.WarningBold,
                ReferenceBold = command.ReferenceBold,
                BadgeText = command.BadgeText ?? string.Empty,
                HeaderPrefix = command.HeaderPrefix ?? string.Empty,
                AssyHeaderPrefix = command.AssyHeaderPrefix ?? string.Empty,
                CountryText = command.CountryText ?? string.Empty,
                WarningText = command.WarningText ?? string.Empty,
                BadgeFontFamily = command.BadgeFontFamily ?? string.Empty,
                HeaderFontFamily = command.HeaderFontFamily ?? string.Empty,
                CountryFontFamily = command.CountryFontFamily ?? string.Empty,
                WarningFontFamily = command.WarningFontFamily ?? string.Empty,
                ReferenceFontFamily = command.ReferenceFontFamily ?? string.Empty,
                PrinterName = command.PrinterName,
                CreateBy = string.IsNullOrWhiteSpace(command.CreateBy) ? "Sistema" : command.CreateBy.Trim(),
                CreateDate = DateTime.Now,
                LastUpdate = DateTime.Now,
                IsDeleted = false,
            };

            NormalizeLabel(entity);

            _context.ShippingLabels.Add(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<ShippingLabelModel?> UpdateAsync(int id, ShippingLabelSaveCommand command)
        {
            var entity = await _context.ShippingLabels
                .FirstOrDefaultAsync(label => label.Id == id && !label.IsDeleted);
            if (entity == null)
            {
                return null;
            }

            var partNumber = await ResolvePartNumberAsync(command.PartNumberId);

            entity.PartNumberId = partNumber.Id;
            entity.PartNumber = partNumber.PartNumber.Trim();
            entity.ReferenceDate = (command.ReferenceDate ?? entity.ReferenceDate).Date;
            entity.RangeStart = command.RangeStart;
            entity.RangeEnd = command.RangeEnd;
            entity.LabelModel = NormalizeLabelModel(command.LabelModel);
            entity.BadgeFontMm = command.BadgeFontMm;
            entity.HeaderFontMm = command.HeaderFontMm;
            entity.CountryFontMm = command.CountryFontMm;
            entity.WarningFontMm = command.WarningFontMm;
            entity.ReferenceFontMm = command.ReferenceFontMm;
            entity.BadgeWidthMm = command.BadgeWidthMm;
            entity.BadgeHeightMm = command.BadgeHeightMm;
            entity.BadgeStrokeWidthMm = command.BadgeStrokeWidthMm;
            entity.LabelWidthMm = command.LabelWidthMm;
            entity.LabelHeightMm = command.LabelHeightMm;
            entity.MarginLeftMm = command.MarginLeftMm;
            entity.MarginTopMm = command.MarginTopMm;
            entity.MarginRightMm = command.MarginRightMm;
            entity.MarginBottomMm = command.MarginBottomMm;
            entity.BadgeLeftMm = command.BadgeLeftMm;
            entity.BadgeTopMm = command.BadgeTopMm;
            entity.HeaderLeftMm = command.HeaderLeftMm;
            entity.HeaderTopMm = command.HeaderTopMm;
            entity.HeaderRightMm = command.HeaderRightMm;
            entity.CountryLeftMm = command.CountryLeftMm;
            entity.CountryTopMm = command.CountryTopMm;
            entity.CountryRightMm = command.CountryRightMm;
            entity.WarningLeftMm = command.WarningLeftMm;
            entity.WarningTopMm = command.WarningTopMm;
            entity.WarningRightMm = command.WarningRightMm;
            entity.ReferenceLeftMm = command.ReferenceLeftMm;
            entity.ReferenceTopMm = command.ReferenceTopMm;
            entity.ReferenceRightMm = command.ReferenceRightMm;
            entity.BadgeBold = command.BadgeBold;
            entity.HeaderBold = command.HeaderBold;
            entity.CountryBold = command.CountryBold;
            entity.WarningBold = command.WarningBold;
            entity.ReferenceBold = command.ReferenceBold;
            entity.BadgeText = command.BadgeText ?? string.Empty;
            entity.HeaderPrefix = command.HeaderPrefix ?? string.Empty;
            entity.AssyHeaderPrefix = command.AssyHeaderPrefix ?? string.Empty;
            entity.CountryText = command.CountryText ?? string.Empty;
            entity.WarningText = command.WarningText ?? string.Empty;
            entity.BadgeFontFamily = command.BadgeFontFamily ?? string.Empty;
            entity.HeaderFontFamily = command.HeaderFontFamily ?? string.Empty;
            entity.CountryFontFamily = command.CountryFontFamily ?? string.Empty;
            entity.WarningFontFamily = command.WarningFontFamily ?? string.Empty;
            entity.ReferenceFontFamily = command.ReferenceFontFamily ?? string.Empty;
            entity.PrinterName = command.PrinterName;
            entity.CreateBy = string.IsNullOrWhiteSpace(command.CreateBy) ? entity.CreateBy : command.CreateBy.Trim();
            entity.LastUpdate = DateTime.Now;

            NormalizeLabel(entity);

            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.ShippingLabels
                .FirstOrDefaultAsync(label => label.Id == id && !label.IsDeleted);
            if (entity == null)
            {
                return false;
            }

            entity.IsDeleted = true;
            entity.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ShippingLabelPrintSettingsModel> GetPrintSettingsAsync(string? username)
        {
            var normalizedUsername = NormalizeUsername(username);

            var existing = await _context.ShippingLabelPrintSettings
                .FirstOrDefaultAsync(settings => settings.Username == normalizedUsername);
            if (existing != null)
            {
                NormalizeSettings(existing);
                if (_context.Entry(existing).State == EntityState.Modified)
                {
                    await _context.SaveChangesAsync();
                }
                return existing;
            }

            var defaults = new ShippingLabelPrintSettingsModel
            {
                Username = normalizedUsername,
                WidthMm = DefaultWidthMm,
                HeightMm = DefaultHeightMm,
                MarginLeftMm = 0m,
                MarginTopMm = 0m,
                MarginRightMm = 0m,
                MarginBottomMm = 0m,
                BadgeLeftMm = DefaultBadgeLeftMm,
                BadgeTopMm = DefaultBadgeTopMm,
                HeaderLeftMm = DefaultHeaderLeftMm,
                HeaderTopMm = DefaultHeaderTopMm,
                HeaderRightMm = DefaultHeaderRightMm,
                CountryLeftMm = DefaultCountryLeftMm,
                CountryTopMm = DefaultCountryTopMm,
                CountryRightMm = DefaultCountryRightMm,
                WarningLeftMm = DefaultWarningLeftMm,
                WarningTopMm = DefaultWarningTopMm,
                WarningRightMm = DefaultWarningRightMm,
                ReferenceLeftMm = DefaultReferenceLeftMm,
                ReferenceTopMm = DefaultReferenceTopMm,
                ReferenceRightMm = DefaultReferenceRightMm,
                BadgeFontMm = DefaultBadgeFontMm,
                HeaderFontMm = DefaultHeaderFontMm,
                CountryFontMm = DefaultCountryFontMm,
                WarningFontMm = DefaultWarningFontMm,
                ReferenceFontMm = DefaultReferenceFontMm,
                BadgeBold = true,
                HeaderBold = true,
                CountryBold = true,
                WarningBold = false,
                ReferenceBold = true,
                BadgeText = DefaultBadgeText,
                HeaderPrefix = DefaultHeaderPrefix,
                AssyHeaderPrefix = DefaultAssyHeaderPrefix,
                CountryText = DefaultCountryText,
                WarningText = DefaultWarningText,
                BadgeFontFamily = DefaultFontFamily,
                HeaderFontFamily = DefaultFontFamily,
                CountryFontFamily = DefaultFontFamily,
                WarningFontFamily = DefaultFontFamily,
                ReferenceFontFamily = DefaultFontFamily,
                BadgeWidthMm = DefaultBadgeWidthMm,
                BadgeHeightMm = DefaultBadgeHeightMm,
                BadgeStrokeWidthMm = DefaultBadgeStrokeWidthMm,
                PrinterName = string.Empty,
                CreateDate = DateTime.Now,
                LastUpdate = DateTime.Now,
            };

            NormalizeSettings(defaults);
            _context.ShippingLabelPrintSettings.Add(defaults);
            await _context.SaveChangesAsync();
            return defaults;
        }

        public async Task<ShippingLabelPrintSettingsModel> SavePrintSettingsAsync(ShippingLabelPrintSettingsSaveCommand command)
        {
            var normalizedUsername = NormalizeUsername(command.Username);

            var settings = await _context.ShippingLabelPrintSettings
                .FirstOrDefaultAsync(item => item.Username == normalizedUsername);

            if (settings == null)
            {
                settings = new ShippingLabelPrintSettingsModel
                {
                    Username = normalizedUsername,
                    CreateDate = DateTime.Now,
                };
                _context.ShippingLabelPrintSettings.Add(settings);
            }

            settings.WidthMm = command.WidthMm;
            settings.HeightMm = command.HeightMm;
            settings.MarginLeftMm = command.MarginLeftMm;
            settings.MarginTopMm = command.MarginTopMm;
            settings.MarginRightMm = command.MarginRightMm;
            settings.MarginBottomMm = command.MarginBottomMm;
            settings.BadgeLeftMm = command.BadgeLeftMm;
            settings.BadgeTopMm = command.BadgeTopMm;
            settings.HeaderLeftMm = command.HeaderLeftMm;
            settings.HeaderTopMm = command.HeaderTopMm;
            settings.HeaderRightMm = command.HeaderRightMm;
            settings.CountryLeftMm = command.CountryLeftMm;
            settings.CountryTopMm = command.CountryTopMm;
            settings.CountryRightMm = command.CountryRightMm;
            settings.WarningLeftMm = command.WarningLeftMm;
            settings.WarningTopMm = command.WarningTopMm;
            settings.WarningRightMm = command.WarningRightMm;
            settings.ReferenceLeftMm = command.ReferenceLeftMm;
            settings.ReferenceTopMm = command.ReferenceTopMm;
            settings.ReferenceRightMm = command.ReferenceRightMm;
            settings.BadgeFontMm = command.BadgeFontMm;
            settings.HeaderFontMm = command.HeaderFontMm;
            settings.CountryFontMm = command.CountryFontMm;
            settings.WarningFontMm = command.WarningFontMm;
            settings.ReferenceFontMm = command.ReferenceFontMm;
            settings.BadgeBold = command.BadgeBold;
            settings.HeaderBold = command.HeaderBold;
            settings.CountryBold = command.CountryBold;
            settings.WarningBold = command.WarningBold;
            settings.ReferenceBold = command.ReferenceBold;
            settings.BadgeText = command.BadgeText ?? string.Empty;
            settings.HeaderPrefix = command.HeaderPrefix ?? string.Empty;
            settings.AssyHeaderPrefix = command.AssyHeaderPrefix ?? string.Empty;
            settings.CountryText = command.CountryText ?? string.Empty;
            settings.WarningText = command.WarningText ?? string.Empty;
            settings.BadgeFontFamily = command.BadgeFontFamily ?? string.Empty;
            settings.HeaderFontFamily = command.HeaderFontFamily ?? string.Empty;
            settings.CountryFontFamily = command.CountryFontFamily ?? string.Empty;
            settings.WarningFontFamily = command.WarningFontFamily ?? string.Empty;
            settings.ReferenceFontFamily = command.ReferenceFontFamily ?? string.Empty;
            settings.BadgeWidthMm = command.BadgeWidthMm;
            settings.BadgeHeightMm = command.BadgeHeightMm;
            settings.BadgeStrokeWidthMm = command.BadgeStrokeWidthMm;
            settings.PrinterName = command.PrinterName;
            settings.LastUpdate = DateTime.Now;

            NormalizeSettings(settings);

            await _context.SaveChangesAsync();
            return settings;
        }

        public IReadOnlyList<string> GetAvailablePrinters()
        {
            var printers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            CollectInstalledPrinters(printers);
            CollectWindowsNetworkPrinters(printers);

            return printers.OrderBy(name => name).ToList();
        }

        public async Task<ShippingLabelPrintJob> BuildPrintJobAsync(int id)
        {
            var entity = await _context.ShippingLabels
                .AsNoTracking()
                .FirstOrDefaultAsync(label => label.Id == id && !label.IsDeleted);
            if (entity == null)
            {
                throw new KeyNotFoundException("Etiqueta não encontrada.");
            }

            NormalizeLabel(entity);
            return BuildPrintJob(entity);
        }

        private async Task<PartNumberModel> ResolvePartNumberAsync(int partNumberId)
        {
            if (partNumberId <= 0)
            {
                throw new ArgumentException("Part Number é obrigatório.");
            }

            var partNumber = await _context.PartNumbers
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == partNumberId && !item.IsDeleted);
            if (partNumber == null)
            {
                throw new KeyNotFoundException("Part Number não encontrado.");
            }

            return partNumber;
        }

        private static ShippingLabelPrintJob BuildPrintJob(ShippingLabelModel entity)
        {
            var referenceMonth = entity.ReferenceDate.ToString("yyyyMM", CultureInfo.InvariantCulture);
            var labels = new List<ShippingLabelPrintItem>();

            for (var sequence = entity.RangeStart; sequence <= entity.RangeEnd; sequence++)
            {
                var serialNumber = sequence.ToString(CultureInfo.InvariantCulture);
                labels.Add(new ShippingLabelPrintItem(
                    sequence,
                    serialNumber,
                    $"{referenceMonth}{serialNumber}",
                    entity.PartNumber
                ));
            }

            return new ShippingLabelPrintJob(
                entity.Id,
                entity.PartNumber,
                entity.LabelModel,
                string.IsNullOrWhiteSpace(entity.PrinterName) ? null : entity.PrinterName.Trim(),
                entity.BadgeFontMm,
                entity.HeaderFontMm,
                entity.CountryFontMm,
                entity.WarningFontMm,
                entity.ReferenceFontMm,
                entity.BadgeWidthMm,
                entity.BadgeHeightMm,
                entity.BadgeStrokeWidthMm,
                entity.LabelWidthMm,
                entity.LabelHeightMm,
                entity.MarginLeftMm,
                entity.MarginTopMm,
                entity.MarginRightMm,
                entity.MarginBottomMm,
                entity.BadgeLeftMm,
                entity.BadgeTopMm,
                entity.HeaderLeftMm,
                entity.HeaderTopMm,
                entity.HeaderRightMm,
                entity.CountryLeftMm,
                entity.CountryTopMm,
                entity.CountryRightMm,
                entity.WarningLeftMm,
                entity.WarningTopMm,
                entity.WarningRightMm,
                entity.ReferenceLeftMm,
                entity.ReferenceTopMm,
                entity.ReferenceRightMm,
                entity.BadgeBold,
                entity.HeaderBold,
                entity.CountryBold,
                entity.WarningBold,
                entity.ReferenceBold,
                entity.BadgeText,
                entity.HeaderPrefix,
                entity.AssyHeaderPrefix,
                entity.CountryText,
                entity.WarningText,
                entity.BadgeFontFamily,
                entity.HeaderFontFamily,
                entity.CountryFontFamily,
                entity.WarningFontFamily,
                entity.ReferenceFontFamily,
                labels
            );
        }

        private static void NormalizeLabel(ShippingLabelModel entity)
        {
            entity.PartNumber = entity.PartNumber?.Trim() ?? string.Empty;
            entity.LabelModel = NormalizeLabelModel(entity.LabelModel);
            entity.PrinterName = entity.PrinterName?.Trim();
            entity.CreateBy = string.IsNullOrWhiteSpace(entity.CreateBy) ? "Sistema" : entity.CreateBy.Trim();
            entity.ReferenceDate = entity.ReferenceDate.Date;
            entity.Quantity = ComputeQuantity(entity.RangeStart, entity.RangeEnd);
            entity.BadgeFontMm = NormalizeFontSize(entity.BadgeFontMm, DefaultBadgeFontMm);
            entity.HeaderFontMm = NormalizeFontSize(entity.HeaderFontMm, DefaultHeaderFontMm);
            entity.CountryFontMm = NormalizeFontSize(entity.CountryFontMm, DefaultCountryFontMm);
            entity.WarningFontMm = NormalizeFontSize(entity.WarningFontMm, DefaultWarningFontMm);
            entity.ReferenceFontMm = NormalizeFontSize(entity.ReferenceFontMm, DefaultReferenceFontMm);
            entity.BadgeWidthMm = NormalizeFontSize(entity.BadgeWidthMm, DefaultBadgeWidthMm);
            entity.BadgeHeightMm = NormalizeFontSize(entity.BadgeHeightMm, DefaultBadgeHeightMm);
            entity.BadgeStrokeWidthMm = NormalizeFontSize(entity.BadgeStrokeWidthMm, DefaultBadgeStrokeWidthMm);
            entity.BadgeLeftMm = NormalizePosition(entity.BadgeLeftMm, DefaultBadgeLeftMm);
            entity.BadgeTopMm = NormalizePosition(entity.BadgeTopMm, DefaultBadgeTopMm);
            entity.HeaderLeftMm = NormalizePosition(entity.HeaderLeftMm, DefaultHeaderLeftMm);
            entity.HeaderTopMm = NormalizePosition(entity.HeaderTopMm, DefaultHeaderTopMm);
            entity.HeaderRightMm = NormalizePosition(entity.HeaderRightMm, DefaultHeaderRightMm);
            entity.CountryLeftMm = NormalizePosition(entity.CountryLeftMm, DefaultCountryLeftMm);
            entity.CountryTopMm = NormalizePosition(entity.CountryTopMm, DefaultCountryTopMm);
            entity.CountryRightMm = NormalizePosition(entity.CountryRightMm, DefaultCountryRightMm);
            entity.WarningLeftMm = NormalizePosition(entity.WarningLeftMm, DefaultWarningLeftMm);
            entity.WarningTopMm = NormalizePosition(entity.WarningTopMm, DefaultWarningTopMm);
            entity.WarningRightMm = NormalizePosition(entity.WarningRightMm, DefaultWarningRightMm);
            entity.ReferenceLeftMm = NormalizePosition(entity.ReferenceLeftMm, DefaultReferenceLeftMm);
            entity.ReferenceTopMm = NormalizePosition(entity.ReferenceTopMm, DefaultReferenceTopMm);
            entity.ReferenceRightMm = NormalizePosition(entity.ReferenceRightMm, DefaultReferenceRightMm);
            entity.BadgeText = NormalizeText(entity.BadgeText, DefaultBadgeText, 50);
            entity.HeaderPrefix = NormalizeText(entity.HeaderPrefix, DefaultHeaderPrefix, 120);
            entity.AssyHeaderPrefix = NormalizeText(entity.AssyHeaderPrefix, DefaultAssyHeaderPrefix, 120);
            entity.CountryText = NormalizeText(entity.CountryText, DefaultCountryText, 80);
            entity.WarningText = NormalizeText(entity.WarningText, DefaultWarningText, 200);
            entity.BadgeFontFamily = NormalizeText(entity.BadgeFontFamily, DefaultFontFamily, 80);
            entity.HeaderFontFamily = NormalizeText(entity.HeaderFontFamily, DefaultFontFamily, 80);
            entity.CountryFontFamily = NormalizeText(entity.CountryFontFamily, DefaultFontFamily, 80);
            entity.WarningFontFamily = NormalizeText(entity.WarningFontFamily, DefaultFontFamily, 80);
            entity.ReferenceFontFamily = NormalizeText(entity.ReferenceFontFamily, DefaultFontFamily, 80);

            if (string.IsNullOrWhiteSpace(entity.PartNumber))
            {
                throw new ArgumentException("Part Number é obrigatório.");
            }

            if (entity.RangeStart <= 0)
            {
                throw new ArgumentException("O número inicial da etiqueta deve ser maior que zero.");
            }

            if (entity.RangeEnd < entity.RangeStart)
            {
                throw new ArgumentException("O número final da etiqueta deve ser maior ou igual ao número inicial.");
            }

            if (entity.LabelWidthMm <= 0m || entity.LabelHeightMm <= 0m)
            {
                throw new ArgumentException("A largura e a altura da etiqueta devem ser maiores que zero.");
            }

            if (entity.BadgeWidthMm <= 0m || entity.BadgeHeightMm <= 0m)
            {
                throw new ArgumentException("A largura e a altura do badge devem ser maiores que zero.");
            }

            if (entity.BadgeStrokeWidthMm <= 0m)
            {
                throw new ArgumentException("A espessura do contorno do oval deve ser maior que zero.");
            }

            if (entity.MarginLeftMm < 0m || entity.MarginTopMm < 0m || entity.MarginRightMm < 0m || entity.MarginBottomMm < 0m)
            {
                throw new ArgumentException("As margens da etiqueta não podem ser negativas.");
            }

            if (entity.MarginLeftMm + entity.MarginRightMm >= entity.LabelWidthMm)
            {
                throw new ArgumentException("A soma das margens esquerda e direita deve ser menor que a largura da etiqueta.");
            }

            if (entity.MarginTopMm + entity.MarginBottomMm >= entity.LabelHeightMm)
            {
                throw new ArgumentException("A soma das margens superior e inferior deve ser menor que a altura da etiqueta.");
            }
        }

        private static void CollectInstalledPrinters(ISet<string> printers)
        {
            foreach (var assemblyName in new[] { "System.Drawing.Common", "System.Drawing" })
            {
                try
                {
                    var printerSettingsType = Type.GetType(
                        $"System.Drawing.Printing.PrinterSettings, {assemblyName}",
                        throwOnError: false
                    );
                    if (printerSettingsType == null)
                    {
                        continue;
                    }

                    var installedPrinters = printerSettingsType.GetProperty(
                        "InstalledPrinters",
                        BindingFlags.Public | BindingFlags.Static
                    );

                    if (installedPrinters?.GetValue(null) is not IEnumerable printerCollection)
                    {
                        continue;
                    }

                    foreach (var printer in printerCollection)
                    {
                        AddPrinterCandidate(printers, printer?.ToString());
                    }
                }
                catch
                {
                    // Ignora ambientes sem provider de impressora instalado.
                }
            }
        }

        private static void CollectWindowsNetworkPrinters(ISet<string> printers)
        {
            if (!OperatingSystem.IsWindows())
            {
                return;
            }

            try
            {
                var searcherType = Type.GetType(
                    "System.Management.ManagementObjectSearcher, System.Management",
                    throwOnError: false
                );
                if (searcherType == null)
                {
                    return;
                }

                using var searcher = Activator.CreateInstance(
                    searcherType,
                    "SELECT Name, Network, ShareName, SystemName FROM Win32_Printer"
                ) as IDisposable;

                var getMethod = searcherType.GetMethod("Get", Type.EmptyTypes);
                if (searcher == null || getMethod?.Invoke(searcher, null) is not IEnumerable results)
                {
                    return;
                }

                foreach (var item in results)
                {
                    if (item == null)
                    {
                        continue;
                    }

                    AddPrinterCandidate(printers, GetManagementValue(item, "Name"));

                    var isNetwork = bool.TryParse(GetManagementValue(item, "Network"), out var network) && network;
                    if (!isNetwork)
                    {
                        continue;
                    }

                    var shareName = GetManagementValue(item, "ShareName");
                    var systemName = GetManagementValue(item, "SystemName");
                    if (!string.IsNullOrWhiteSpace(shareName) && !string.IsNullOrWhiteSpace(systemName))
                    {
                        var normalizedServer = systemName.Trim().TrimStart('\\');
                        AddPrinterCandidate(printers, $@"\\{normalizedServer}\{shareName.Trim()}");
                    }
                }
            }
            catch
            {
                // Ignora ambientes onde o provedor WMI não está disponível.
            }
        }

        private static string? GetManagementValue(object item, string propertyName)
        {
            var method = item.GetType().GetMethod("GetPropertyValue", new[] { typeof(string) });
            var value = method?.Invoke(item, new object[] { propertyName });
            return value?.ToString()?.Trim();
        }

        private static void AddPrinterCandidate(ISet<string> printers, string? value)
        {
            var normalized = value?.Trim();
            if (!string.IsNullOrWhiteSpace(normalized))
            {
                printers.Add(normalized);
            }
        }

        private static string NormalizeLabelModel(string? labelModel)
        {
            var normalized = string.IsNullOrWhiteSpace(labelModel)
                ? ShippingLabelTemplateTypes.Default
                : labelModel.Trim().ToUpperInvariant();

            return normalized switch
            {
                ShippingLabelTemplateTypes.Default => ShippingLabelTemplateTypes.Default,
                ShippingLabelTemplateTypes.Assy => ShippingLabelTemplateTypes.Assy,
                _ => throw new ArgumentException("Modelo da etiqueta inválido."),
            };
        }

        private static void NormalizeSettings(ShippingLabelPrintSettingsModel settings)
        {
            settings.Username = NormalizeUsername(settings.Username);
            settings.PrinterName = settings.PrinterName?.Trim();
            settings.BadgeFontMm = NormalizeFontSize(settings.BadgeFontMm, DefaultBadgeFontMm);
            settings.HeaderFontMm = NormalizeFontSize(settings.HeaderFontMm, DefaultHeaderFontMm);
            settings.CountryFontMm = NormalizeFontSize(settings.CountryFontMm, DefaultCountryFontMm);
            settings.WarningFontMm = NormalizeFontSize(settings.WarningFontMm, DefaultWarningFontMm);
            settings.ReferenceFontMm = NormalizeFontSize(settings.ReferenceFontMm, DefaultReferenceFontMm);
            settings.BadgeWidthMm = NormalizeFontSize(settings.BadgeWidthMm, DefaultBadgeWidthMm);
            settings.BadgeHeightMm = NormalizeFontSize(settings.BadgeHeightMm, DefaultBadgeHeightMm);
            settings.BadgeStrokeWidthMm = NormalizeFontSize(settings.BadgeStrokeWidthMm, DefaultBadgeStrokeWidthMm);
            settings.BadgeLeftMm = NormalizePosition(settings.BadgeLeftMm, DefaultBadgeLeftMm);
            settings.BadgeTopMm = NormalizePosition(settings.BadgeTopMm, DefaultBadgeTopMm);
            settings.HeaderLeftMm = NormalizePosition(settings.HeaderLeftMm, DefaultHeaderLeftMm);
            settings.HeaderTopMm = NormalizePosition(settings.HeaderTopMm, DefaultHeaderTopMm);
            settings.HeaderRightMm = NormalizePosition(settings.HeaderRightMm, DefaultHeaderRightMm);
            settings.CountryLeftMm = NormalizePosition(settings.CountryLeftMm, DefaultCountryLeftMm);
            settings.CountryTopMm = NormalizePosition(settings.CountryTopMm, DefaultCountryTopMm);
            settings.CountryRightMm = NormalizePosition(settings.CountryRightMm, DefaultCountryRightMm);
            settings.WarningLeftMm = NormalizePosition(settings.WarningLeftMm, DefaultWarningLeftMm);
            settings.WarningTopMm = NormalizePosition(settings.WarningTopMm, DefaultWarningTopMm);
            settings.WarningRightMm = NormalizePosition(settings.WarningRightMm, DefaultWarningRightMm);
            settings.ReferenceLeftMm = NormalizePosition(settings.ReferenceLeftMm, DefaultReferenceLeftMm);
            settings.ReferenceTopMm = NormalizePosition(settings.ReferenceTopMm, DefaultReferenceTopMm);
            settings.ReferenceRightMm = NormalizePosition(settings.ReferenceRightMm, DefaultReferenceRightMm);
            settings.BadgeText = NormalizeText(settings.BadgeText, DefaultBadgeText, 50);
            settings.HeaderPrefix = NormalizeText(settings.HeaderPrefix, DefaultHeaderPrefix, 120);
            settings.AssyHeaderPrefix = NormalizeText(settings.AssyHeaderPrefix, DefaultAssyHeaderPrefix, 120);
            settings.CountryText = NormalizeText(settings.CountryText, DefaultCountryText, 80);
            settings.WarningText = NormalizeText(settings.WarningText, DefaultWarningText, 200);
            settings.BadgeFontFamily = NormalizeText(settings.BadgeFontFamily, DefaultFontFamily, 80);
            settings.HeaderFontFamily = NormalizeText(settings.HeaderFontFamily, DefaultFontFamily, 80);
            settings.CountryFontFamily = NormalizeText(settings.CountryFontFamily, DefaultFontFamily, 80);
            settings.WarningFontFamily = NormalizeText(settings.WarningFontFamily, DefaultFontFamily, 80);
            settings.ReferenceFontFamily = NormalizeText(settings.ReferenceFontFamily, DefaultFontFamily, 80);

            if (settings.WidthMm <= 0m)
            {
                settings.WidthMm = DefaultWidthMm;
            }

            if (settings.HeightMm <= 0m)
            {
                settings.HeightMm = DefaultHeightMm;
            }

            if (settings.BadgeWidthMm <= 0m)
            {
                settings.BadgeWidthMm = DefaultBadgeWidthMm;
            }

            if (settings.BadgeHeightMm <= 0m)
            {
                settings.BadgeHeightMm = DefaultBadgeHeightMm;
            }

            if (settings.BadgeStrokeWidthMm <= 0m)
            {
                settings.BadgeStrokeWidthMm = DefaultBadgeStrokeWidthMm;
            }

            if (settings.MarginLeftMm < 0m)
            {
                settings.MarginLeftMm = 0m;
            }

            if (settings.MarginTopMm < 0m)
            {
                settings.MarginTopMm = 0m;
            }

            if (settings.MarginRightMm < 0m)
            {
                settings.MarginRightMm = 0m;
            }

            if (settings.MarginBottomMm < 0m)
            {
                settings.MarginBottomMm = 0m;
            }

            if (settings.MarginLeftMm + settings.MarginRightMm >= settings.WidthMm)
            {
                throw new ArgumentException("A soma das margens esquerda e direita deve ser menor que a largura da etiqueta.");
            }

            if (settings.MarginTopMm + settings.MarginBottomMm >= settings.HeightMm)
            {
                throw new ArgumentException("A soma das margens superior e inferior deve ser menor que a altura da etiqueta.");
            }
        }

        private static decimal NormalizeFontSize(decimal value, decimal fallback)
        {
            return value <= 0m ? fallback : value;
        }

        private static decimal NormalizePosition(decimal value, decimal fallback)
        {
            return value < 0m ? fallback : value;
        }

        private static string NormalizeText(string? value, string fallback, int maxLength)
        {
            var normalized = string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
            return normalized.Length <= maxLength ? normalized : normalized[..maxLength];
        }

        private static string NormalizeUsername(string? username)
        {
            return string.IsNullOrWhiteSpace(username) ? "Sistema" : username.Trim();
        }

        private static int ComputeQuantity(int rangeStart, int rangeEnd)
        {
            if (rangeStart <= 0 || rangeEnd < rangeStart)
            {
                return 0;
            }

            return rangeEnd - rangeStart + 1;
        }
    }
}
