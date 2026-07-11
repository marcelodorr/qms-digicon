using System.Collections.Generic;

namespace backend.Models
{
    public record ShippingLabelPrintItem(
        int Sequence,
        string SerialNumber,
        string ReferenceText,
        string PartNumber
    );

    public record ShippingLabelPrintJob(
        int RecordId,
        string PartNumber,
        string LabelModel,
        string? PrinterName,
        decimal BadgeFontMm,
        decimal HeaderFontMm,
        decimal CountryFontMm,
        decimal WarningFontMm,
        decimal ReferenceFontMm,
        decimal BadgeWidthMm,
        decimal BadgeHeightMm,
        decimal BadgeStrokeWidthMm,
        decimal WidthMm,
        decimal HeightMm,
        decimal MarginLeftMm,
        decimal MarginTopMm,
        decimal MarginRightMm,
        decimal MarginBottomMm,
        decimal BadgeLeftMm,
        decimal BadgeTopMm,
        decimal HeaderLeftMm,
        decimal HeaderTopMm,
        decimal HeaderRightMm,
        decimal CountryLeftMm,
        decimal CountryTopMm,
        decimal CountryRightMm,
        decimal WarningLeftMm,
        decimal WarningTopMm,
        decimal WarningRightMm,
        decimal ReferenceLeftMm,
        decimal ReferenceTopMm,
        decimal ReferenceRightMm,
        bool BadgeBold,
        bool HeaderBold,
        bool CountryBold,
        bool WarningBold,
        bool ReferenceBold,
        string BadgeText,
        string HeaderPrefix,
        string AssyHeaderPrefix,
        string CountryText,
        string WarningText,
        string BadgeFontFamily,
        string HeaderFontFamily,
        string CountryFontFamily,
        string WarningFontFamily,
        string ReferenceFontFamily,
        IReadOnlyList<ShippingLabelPrintItem> Labels
    );
}
