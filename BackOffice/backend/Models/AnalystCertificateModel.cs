using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("AnalystsCertificate")]
    public class AnalystCertificateModel
    {
        public long Id { get; set; }

        [Required]
        public int Certificate { get; set; }

        public bool IsDefault { get; set; } = false;

        [Column("AnalystsId")]
        public int AnalystsId { get; set; }

        public string CreateBy { get; set; } = "Sistema";
        public string UpdateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdated { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;

        public AnalystModel? Analyst { get; set; }
    }
}
