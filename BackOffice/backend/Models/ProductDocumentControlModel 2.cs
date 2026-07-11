using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ProductDocumentControlModel
    {
        public int Id { get; set; }

        [Required]
        public string DocumentNumber { get; set; } = "HSRE-050";

        [Required]
        public string DocumentRevision { get; set; } = "3";

        [Required]
        public DateTime DocumentDate { get; set; } = new DateTime(2025, 11, 25);

        [Required]
        public string InspectedAccording { get; set; } = "AS9138";

        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdate { get; set; } = DateTime.Now;
    }
}
