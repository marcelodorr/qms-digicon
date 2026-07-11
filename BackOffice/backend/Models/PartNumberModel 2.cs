using System;
using System.ComponentModel.DataAnnotations;

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

        public string CreateBy { get; set; } = "Sistema";

        public DateTime CreateDate { get; set; } = DateTime.Now;

        public DateTime? LastUpdated { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;
    }
}
