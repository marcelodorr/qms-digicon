using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ShippingLabelModel
    {
        public int Id { get; set; }

        public int PartNumberId { get; set; }

        [Required]
        [MaxLength(150)]
        public string PartNumber { get; set; } = string.Empty;

        [Required]
        public DateTime ReferenceDate { get; set; } = DateTime.Today;

        public int RangeStart { get; set; }

        public int RangeEnd { get; set; }

        public int Quantity { get; set; }

        [Required]
        [MaxLength(30)]
        public string LabelModel { get; set; } = ShippingLabelTemplateTypes.Default;

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

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeWidthMm { get; set; } = 21.5m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeHeightMm { get; set; } = 13.03m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal BadgeStrokeWidthMm { get; set; } = 0.35m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal LabelWidthMm { get; set; } = 100m;

        [Column(TypeName = "decimal(10,2)")]
        public decimal LabelHeightMm { get; set; } = 50m;

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

        [MaxLength(200)]
        public string? PrinterName { get; set; }

        [Required]
        [MaxLength(100)]
        public string CreateBy { get; set; } = "Sistema";

        [Required]
        public DateTime CreateDate { get; set; } = DateTime.Now;

        public DateTime? LastUpdate { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; }
    }
}
