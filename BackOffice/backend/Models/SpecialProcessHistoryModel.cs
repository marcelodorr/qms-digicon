using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("History_SpecialProcess")]
    public class SpecialProcessHistoryModel
    {
        public int Id { get; set; }

        [Required]
        public int SpecialProcessId { get; set; }

        public string? Changes { get; set; }

        public string? Observation { get; set; }

        [MaxLength(150)]
        public string ChangedBy { get; set; } = "Sistema";

        public DateTime ChangedAt { get; set; } = DateTime.Now;
    }
}
