using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("SpecialProcess")]
    public class SpecialProcessModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string SpecialProcess { get; set; }

        [MaxLength(20)]
        public string? Specification { get; set; }

        [MaxLength(10)]
        public string? Revision { get; set; }

        public string? Comment { get; set; }

        public string CreateBy { get; set; } = "Sistema";

        public DateTime CreateDate { get; set; } = DateTime.Now;

        public DateTime? LastUpdate { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;
    }
}

