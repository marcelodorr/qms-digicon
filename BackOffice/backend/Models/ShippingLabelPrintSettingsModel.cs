using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ShippingLabelPrintSettingsModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Username { get; set; } = "Sistema";

        [Column(TypeName = "decimal(10,2)")]
        public decimal WidthMm { get; set; } = 100m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal HeightMm { get; set; } = 50m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal MarginLeftMm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MarginTopMm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MarginRightMm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal MarginBottomMm { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeLeftMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeTopMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal HeaderLeftMm { get; set; } = 25.7m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal HeaderTopMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal HeaderRightMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal CountryLeftMm { get; set; } = 25.7m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal CountryTopMm { get; set; } = 18.8m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal CountryRightMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal WarningLeftMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal WarningTopMm { get; set; } = 35m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal WarningRightMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal ReferenceLeftMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal ReferenceTopMm { get; set; } = 43m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal ReferenceRightMm { get; set; } = 1.4m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeFontMm { get; set; } = 7.5m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal HeaderFontMm { get; set; } = 5.6m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal CountryFontMm { get; set; } = 6.6m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal WarningFontMm { get; set; } = 5.6m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal ReferenceFontMm { get; set; } = 4.8m;

        public bool BadgeBold { get; set; } = true;

        public bool HeaderBold { get; set; } = true;

        public bool CountryBold { get; set; } = true;

        public bool WarningBold { get; set; }

        public bool ReferenceBold { get; set; } = true;

        [MaxLength(50)]
        public string BadgeText { get; set; } = "283";

        [MaxLength(120)]
        public string HeaderPrefix { get; set; } = "|-S-| 73030 -";

        [MaxLength(120)]
        public string AssyHeaderPrefix { get; set; } = "|-S-| 73030 ASSY-";

        [MaxLength(80)]
        public string CountryText { get; set; } = "BRAZIL";

        [MaxLength(200)]
        public string WarningText { get; set; } = "MATCHED SET DO NOT ISSUE SEPARATION";

        [MaxLength(80)]
        public string BadgeFontFamily { get; set; } = "Arial";

        [MaxLength(80)]
        public string HeaderFontFamily { get; set; } = "Arial";

        [MaxLength(80)]
        public string CountryFontFamily { get; set; } = "Arial";

        [MaxLength(80)]
        public string WarningFontFamily { get; set; } = "Arial";

        [MaxLength(80)]
        public string ReferenceFontFamily { get; set; } = "Arial";

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeWidthMm { get; set; } = 21.5m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeHeightMm { get; set; } = 13.03m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeStrokeWidthMm { get; set; } = 0.35m;

        [MaxLength(200)]
        public string? PrinterName { get; set; }

        [Required]
        public DateTime CreateDate { get; set; } = DateTime.Now;

        public DateTime? LastUpdate { get; set; } = DateTime.Now;
    }
}
