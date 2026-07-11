using System;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class QualityCertificateModel
{
    public int Id { get; set; }
    // FK opcional para Controle_Eleb
    [NotMapped]
    public int? ControleElebId { get; set; }

    // "000-YY"
    public string? NumeroCertificado { get; set; }

    public string? Ordem { get; set; }
    public string? OC { get; set; }
    public string? Lote { get; set; }
    public string? CodigoCliente { get; set; }
    public string? PartNumber { get; set; }
    public string? ValorPeca { get; set; }
    public string? AnalisePo { get; set; }
    public string? RevisaoDesenho { get; set; }
    public string? Quantidade { get; set; }
    public string? Decapagem { get; set; }
    public string? SNDecapagem { get; set; }
    public string? CDChamado { get; set; }
    public string? Cliente { get; set; }
    public string? Fornecedor { get; set; }
    public string? RelatorioInspecao { get; set; }
    public string? CertificadoMP { get; set; }
    public string? Responsavel { get; set; }
    public int? AnalystId { get; set; }

    [MaxLength(150)]
    public string? AnalystName { get; set; }
    public string? DesenhoLP { get; set; }
    public string? Observacoes { get; set; }
    public string? SNPeca { get; set; }
    public string? TipoEnvio { get; set; }
    public string? DescricaoOperacao { get; set; }

    [Required]
    [JsonConverter(typeof(Newtonsoft.Json.Converters.IsoDateTimeConverter))]
    public DateTime? Data { get; set; } = DateTime.Now;

    // Campo realmente persistido no banco (NOT NULL)
    [Required]
    [Column("CreateDate")]
    public DateTime CreateDate { get; set; } = DateTime.Now;

    public string UpdateBy { get; set; } = "Sistema";

}
