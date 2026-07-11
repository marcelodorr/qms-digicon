// Models/ControleEleb.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("Controle_Eleb")]
    public class ControleEleb
    {
        [Key]
        public int ID { get; set; }

        [Column("OP_ELEB")]
        public string? OpEleb { get; set; }

        [Column("PO_ELEB")]
        public string? PoEleb { get; set; }

        [Column("COD_ELEB")]
        public string? CodEleb { get; set; }

        [Column("Part_Number")]
        public string? PartNumber { get; set; }

        [Column("Valor_Peca")]
        public string? ValorPeca { get; set; }

        [Column("Analise_PO")]
        public string? AnalisePo { get; set; }

        [Column("Revisao_Desenho")]
        public string? RevisaoDesenho { get; set; }

        [Column("Qtd_Saldo")]
        public string? QtdSaldo { get; set; }

        [Column("Decapagem")]
        public string? Decapagem { get; set; }

        [Column("SN_Decap")]
        public string? SnDecap { get; set; }

        [Column("CD")]
        public string? Cd { get; set; }

        [Column("SN_Peca")]
        public string? SnPeca { get; set; }

        [Column("Cliente")]
        public string? Cliente { get; set; }

        [Column("Situacao")]
        public string? Situacao { get; set; }
        [Column("Lote_ELEB")]
        public string? lote { get; set; }
        [Column("Num_Certificado")]
        public string? NumCertificado { get; set; }
    }
}