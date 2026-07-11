using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Parameters")]
    public class ParameterModel
    {
        public int Id { get; set; }

        [MaxLength(50)]
        public string PartNumber { get; set; }

        [MaxLength(50)]
        public string Processo { get; set; }

        [MaxLength(50)]
        public string Norma { get; set; }

        [MaxLength(10)]
        public string? NormaRevision { get; set; }

        [MaxLength(100)]
        public string Parameter { get; set; }

        [MaxLength(100)]
        public string? Condition { get; set; } = "-";

        public string CreateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
    }
}
