namespace backend.Models
{
    public class ShippingLabelPrintSettingsSaveCommand
    {
        public string? Username { get; set; }
        public decimal WidthMm { get; set; }
        public decimal HeightMm { get; set; }
        public decimal MarginLeftMm { get; set; }
        public decimal MarginTopMm { get; set; }
        public decimal MarginRightMm { get; set; }
        public decimal MarginBottomMm { get; set; }
        public decimal BadgeLeftMm { get; set; } = 1.4m;
        public decimal BadgeTopMm { get; set; } = 1.4m;
        public decimal HeaderLeftMm { get; set; } = 25.7m;
        public decimal HeaderTopMm { get; set; } = 1.4m;
        public decimal HeaderRightMm { get; set; } = 1.4m;
        public decimal CountryLeftMm { get; set; } = 25.7m;
        public decimal CountryTopMm { get; set; } = 18.8m;
        public decimal CountryRightMm { get; set; } = 1.4m;
        public decimal WarningLeftMm { get; set; } = 1.4m;
        public decimal WarningTopMm { get; set; } = 35m;
        public decimal WarningRightMm { get; set; } = 1.4m;
        public decimal ReferenceLeftMm { get; set; } = 1.4m;
        public decimal ReferenceTopMm { get; set; } = 43m;
        public decimal ReferenceRightMm { get; set; } = 1.4m;
        public decimal BadgeFontMm { get; set; }
        public decimal HeaderFontMm { get; set; }
        public decimal CountryFontMm { get; set; }
        public decimal WarningFontMm { get; set; }
        public decimal ReferenceFontMm { get; set; }
        public bool BadgeBold { get; set; } = true;
        public bool HeaderBold { get; set; } = true;
        public bool CountryBold { get; set; } = true;
        public bool WarningBold { get; set; }
        public bool ReferenceBold { get; set; } = true;
        public string? BadgeText { get; set; }
        public string? HeaderPrefix { get; set; }
        public string? AssyHeaderPrefix { get; set; }
        public string? CountryText { get; set; }
        public string? WarningText { get; set; }
        public string? BadgeFontFamily { get; set; }
        public string? HeaderFontFamily { get; set; }
        public string? CountryFontFamily { get; set; }
        public string? WarningFontFamily { get; set; }
        public string? ReferenceFontFamily { get; set; }
        public decimal BadgeWidthMm { get; set; }
        public decimal BadgeHeightMm { get; set; }
        public decimal BadgeStrokeWidthMm { get; set; } = 0.35m;
        public string? PrinterName { get; set; }
    }
}
