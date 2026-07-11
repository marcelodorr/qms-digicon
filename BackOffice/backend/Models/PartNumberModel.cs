using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class PartNumberModel
    {
        public int Id { get; set; }

        [Required]
        public string PartNumber { get; set; }

        public string Descricao { get; set; }

        public string? Revision { get; set; }

        [MaxLength(50)]
        public string? DrawingRevision { get; set; }

        public int? ClienteId { get; set; }

        [MaxLength(200)]
        public string? ClienteNome { get; set; }

        public bool IsActive { get; set; } = true;

        public string CreateBy { get; set; } = "Sistema";
        public string UpdateBy { get; set; } = "Sistema";

        public DateTime CreateDate { get; set; } = DateTime.Now;

        public DateTime? LastUpdated { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;

        [NotMapped]
        public string? Observation { get; set; }
    }
}
