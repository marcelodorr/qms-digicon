using System;
using System.ComponentModel.DataAnnotations;


namespace backend.Models
{
    public class ClienteModel
    {
        public int Id { get; set; }
        [Required]
        public string Cliente { get; set; }  // Alterado para 'NomeCliente'
        public string? Endereco { get; set; }
        public string CreateBy { get; set; } = "Sistema";
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public bool IsDeleted { get; set; }
        public DateTime? LastUpdate { get; set; } = DateTime.Now;
    }
}
