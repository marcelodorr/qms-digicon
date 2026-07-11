using System;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    [Keyless]
    [Table("RNC")]
    public class RncModel
    {
        [Column("CodeMach")]
        public string? Machine { get; set; }

        [Column("Operator")]
        public string? Operator { get; set; }

        [Column("IndProd1")]
        public string? ProductionOrder { get; set; }

        [Column("IndProd3")]
        public string? PartNumber { get; set; }

        [Column("QntdNC")]
        public int? NonConformityQuantity { get; set; }

        [Column("Data1")]
        public string? Reason { get; set; }

        [Column("Data2")]
        public string? Cause { get; set; }

        [Column("DataGerado")]
        public DateTime? NonConformityDate { get; set; }

        [Column("Cliente")]
        public string? Client { get; set; }

        [Column("Causador")]
        public string? Origin { get; set; }
    }
}
