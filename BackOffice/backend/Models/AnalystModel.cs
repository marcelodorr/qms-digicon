using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Analysts")]
    public class AnalystModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Analyst { get; set; }

        [MaxLength(150)]
        public string? Email { get; set; }

        public string? Signature { get; set; }

        public string CreateBy { get; set; } = "Sistema";
        public string UpdateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;

        public ICollection<AnalystCertificateModel> Certificates { get; set; } = new List<AnalystCertificateModel>();
    }
}
