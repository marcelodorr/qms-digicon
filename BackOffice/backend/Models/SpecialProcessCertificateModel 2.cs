using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("SpecialProcessCertificates")]
    public class SpecialProcessCertificateModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(15)]
        public string CertificateCode { get; set; }

        public int? ClienteId { get; set; }

        [MaxLength(200)]
        public string? ClienteNome { get; set; }

        public int? SpecialProcessId { get; set; }

        [MaxLength(120)]
        public string? SpecialProcess { get; set; }

        [MaxLength(150)]
        public string? Norma { get; set; }

        [MaxLength(100)]
        public string? PartNumber { get; set; }

        public DateTime EmissionDate { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [MaxLength(120)]
        public string? LotNumber { get; set; }

        [MaxLength(120)]
        public string? PurchasingOrder { get; set; }

        [MaxLength(80)]
        public string? Item { get; set; }

        [MaxLength(120)]
        public string? HardnessFound { get; set; }

        [MaxLength(120)]
        public string? HeatTreatLot { get; set; }

        public int? AnalystId { get; set; }

        [MaxLength(150)]
        public string? AnalystName { get; set; }

        public string? Observations { get; set; }

        public string CreateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
    }
}
