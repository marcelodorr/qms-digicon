using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ProductConformityCertificateModel
    {
        public int Id { get; set; }

        [Required]
        public string CertificateNumber { get; set; } = string.Empty; // formato NNNN-YY

        public int? PartNumberId { get; set; }
        public string PartNumber { get; set; } = string.Empty;
        public string? PartNumberDescription { get; set; }
        public string? PartNumberRevision { get; set; }

        public string? LotNumber { get; set; }
        public string? Quantity { get; set; }
        public string? CustomerPO { get; set; }
        public string? Type { get; set; } = "N/A";
        public string? SerialNumber { get; set; }
        public string? InspectedAccording { get; set; } = "AS9138";
        public int? AnalystId { get; set; }
        public string? AnalystName { get; set; }
        public string? DocumentNumber { get; set; } = "HSRE-050";
        public string? DocumentRevision { get; set; } = "3";
        public DateTime DocumentDate { get; set; } = new DateTime(2025, 11, 25);

        public int? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerAddress { get; set; }

        [Required]
        public DateTime EmissionDate { get; set; } = DateTime.Now;

        public string CreateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
    }
}
