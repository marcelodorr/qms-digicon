using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class NormaModel
    {
        public int Id { get; set; }

        [Required]
        public string Cliente { get; set; }

        [Required]
        public string Processo { get; set; }

        [Required]
        public string Norma { get; set; }

        public string? Revision { get; set; }
        public string CreateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdated { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
    }
}
