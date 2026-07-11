using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("OperationProcess")]  // Mapeamento da tabela no banco de dados
    public class OperationProcessModel
    {
        public int Id { get; set; }

        [Required]
        public string OperationQuantity { get; set; }

        [Required]
        public string OperationDescription { get; set; }

        public bool IsActivated { get; set; } = true;

        public string CreateBy { get; set; } = "Sistema";

        public DateTime CreateDate { get; set; } = DateTime.Now;

        public DateTime? LastUpdate { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;
    }
}
