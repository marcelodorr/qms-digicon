using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("PurchaseOrders")]
    public class PurchaseOrderModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(80)]
        public string PONumber { get; set; } = string.Empty;

        [Required]
        public int ClienteId { get; set; }

        [MaxLength(200)]
        public string? ClienteNome { get; set; }

        [Required]
        [MaxLength(80)]
        public string Item { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string Status { get; set; } = "Em Processo";

        public string? Comments { get; set; }

        public string CreateBy { get; set; } = "Sistema";
        public string UpdateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? LastUpdate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; } = false;
    }
}
