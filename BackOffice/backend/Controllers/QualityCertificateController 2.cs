using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Linq;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    public record DefinirCaminhoRequest(string? Path);
    public record GerarPdfRequest(string? Numero, bool? SaveOnServer = null, string? Disposition = null);

    public class QualityCertificateCreateDto
    {
        public int? ControleElebId { get; set; }
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
        public string? AnalystName { get; set; }
        public string? DesenhoLP { get; set; }
        public string? Observacoes { get; set; }
        public string? SNPeca { get; set; }
        public string? TipoEnvio { get; set; }
        public string? DescricaoOperacao { get; set; }
        public List<string>? OperacoesExecutadas { get; set; }
        public string? Data { get; set; }
    }

    public class QualityCertificateUpdateDto
    {
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
        public string? AnalystName { get; set; }
        public string? DesenhoLP { get; set; }
        public string? Observacoes { get; set; }
        public string? SNPeca { get; set; }
        public string? TipoEnvio { get; set; }
        public string? DescricaoOperacao { get; set; }
        public List<string>? OperacoesExecutadas { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class QualityCertificateController : ControllerBase
    {
        private readonly QualityCertificateService _service;
        private readonly AnalystService _analystService;

        public QualityCertificateController(QualityCertificateService service, AnalystService analystService)
        {
            _service = service;
            _analystService = analystService;
        }

        [HttpGet]
        public IActionResult Ping() => Ok(new { ok = true, controller = "QualityCertificate" });

        // GET /api/QualityCertificate/novo-certificado
        [HttpGet("novo-certificado")]
        public IActionResult GetNovoCertificado([FromQuery] string? data = null)
        {
            var year = DateTime.Now.Year;
            if (!string.IsNullOrWhiteSpace(data))
            {
                if (DateTime.TryParse(data, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var d) ||
                    DateTime.TryParse(data, new CultureInfo("pt-BR"), DateTimeStyles.AssumeLocal, out d) ||
                    DateTime.TryParse(data, new CultureInfo("en-US"), DateTimeStyles.AssumeLocal, out d))
                {
                    year = d.Year;
                }
            }
            var numero = _service.GerarNumeroCertificado(year);
            return Ok(new { numero });
        }

        // GET /api/QualityCertificate/lista
        [HttpGet("lista")]
        public async Task<IActionResult> GetLista([FromQuery] string? from = null, [FromQuery] string? to = null, [FromQuery] string? search = null)
        {
            var fromDate = ParseDate(from);
            var toDate = ParseDate(to);
            var list = await _service.ListCodesAsync(fromDate, toDate, search);
            var result = list.Select(item => new
            {
                id = item.Id,
                numero = item.Numero,
                cliente = item.Cliente,
                partNumber = item.PartNumber,
                ordem = item.Ordem,
                data = item.Data
            });
            return Ok(result);
        }

        [HttpGet("estatisticas")]
        public async Task<IActionResult> GetEstatisticas()
        {
            var total = await _service.CountCertificatesAsync();
            return Ok(new { total });
        }

        [HttpGet("estatisticas-semana")]
        public async Task<IActionResult> GetEstatisticasSemanais([FromQuery] string? from = null, [FromQuery] string? to = null)
        {
            var (start, end) = ResolveRange(from, to);
            var weekly = await _service.GetWeeklyCountsAsync(start, end);
            return Ok(new
            {
                range = new { from = start, to = end },
                total = weekly.Sum(w => w.Total),
                weekly = weekly.Select(w => new { weekStart = w.WeekStart, total = w.Total })
            });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var cert = await _service.GetByIdAsync(id);
            if (cert == null) return NotFound();
            return Ok(cert);
        }

        private static DateTime? ParseDate(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return null;

            if (DateTime.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out var parsed) ||
                DateTime.TryParse(value, new CultureInfo("pt-BR"), DateTimeStyles.AssumeLocal, out parsed) ||
                DateTime.TryParse(value, new CultureInfo("en-US"), DateTimeStyles.AssumeLocal, out parsed))
            {
                return parsed.Date;
            }

            return null;
        }

        private (DateTime from, DateTime to) ResolveRange(string? from, string? to)
        {
            var toDate = ParseDate(to) ?? DateTime.Today;
            var fromDate = ParseDate(from) ?? toDate.AddDays(-42);
            if (toDate < fromDate)
            {
                (fromDate, toDate) = (toDate, fromDate);
            }
            return (fromDate, toDate);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateCertificate(int id, [FromBody] QualityCertificateUpdateDto dto)
        {
            if (dto is null)
                return BadRequest(new { message = "Payload não informado." });

            static string Nz(string? s) => s?.Trim() ?? string.Empty;

            var operacoesExecutadas = (dto.OperacoesExecutadas ?? Enumerable.Empty<string>())
                .Select(o => o?.Trim())
                .Where(o => !string.IsNullOrWhiteSpace(o))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var descricaoOperacao = operacoesExecutadas.Count > 0
                ? string.Join(" | ", operacoesExecutadas)
                : Nz(dto.DescricaoOperacao);

            var analyst = dto.AnalystId.HasValue
                ? await _analystService.GetByIdAsync(dto.AnalystId.Value)
                : null;

            var resolvedAnalystName = !string.IsNullOrWhiteSpace(dto.AnalystName)
                ? dto.AnalystName.Trim()
                : analyst?.Analyst;

            var responsavelFinal = !string.IsNullOrWhiteSpace(resolvedAnalystName)
                ? resolvedAnalystName
                : Nz(dto.Responsavel);

            var model = new QualityCertificateModel
            {
                Ordem             = Nz(dto.Ordem),
                OC                = Nz(dto.OC),
                Lote              = Nz(dto.Lote),
                CodigoCliente     = Nz(dto.CodigoCliente),
                PartNumber        = Nz(dto.PartNumber),
                ValorPeca         = Nz(dto.ValorPeca),
                AnalisePo         = Nz(dto.AnalisePo),
                RevisaoDesenho    = Nz(dto.RevisaoDesenho),
                Quantidade        = Nz(dto.Quantidade),
                Decapagem         = Nz(dto.Decapagem),
                SNDecapagem       = Nz(dto.SNDecapagem),
                CDChamado         = Nz(dto.CDChamado),
                Cliente           = Nz(dto.Cliente),
                Fornecedor        = Nz(dto.Fornecedor),
                RelatorioInspecao = Nz(dto.RelatorioInspecao),
                CertificadoMP     = Nz(dto.CertificadoMP),
                Responsavel       = responsavelFinal,
                AnalystId         = analyst?.Id ?? dto.AnalystId,
                AnalystName       = resolvedAnalystName,
                DesenhoLP         = Nz(dto.DesenhoLP),
                Observacoes       = Nz(dto.Observacoes),
                SNPeca            = Nz(dto.SNPeca),
                TipoEnvio         = Nz(dto.TipoEnvio),
                DescricaoOperacao = descricaoOperacao
            };

            try
            {
                var updated = await _service.UpdateCertificateAsync(id, model);
                if (updated == null)
                    return NotFound(new { message = "Certificado não encontrado." });

                return Ok(updated);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbex)
            {
                var root = dbex.GetBaseException();
                return StatusCode(500, new
                {
                    message = "Falha ao salvar alterações no banco.",
                    db_error = root.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // POST /api/QualityCertificate
[HttpPost]
public async Task<IActionResult> CreateCertificate([FromBody] QualityCertificateCreateDto dto)
{
    if (dto is null)
        return BadRequest(new { message = "Payload não informado." });

    // 1) Parse de Data (aceita ISO/pt-BR/en-US), fallback Now
    var data = DateTime.Now;
    if (!string.IsNullOrWhiteSpace(dto.Data))
    {
        if (!DateTime.TryParse(dto.Data, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out data) &&
            !DateTime.TryParse(dto.Data, new CultureInfo("pt-BR"), DateTimeStyles.AssumeLocal, out data) &&
            !DateTime.TryParse(dto.Data, new CultureInfo("en-US"), DateTimeStyles.AssumeLocal, out data))
        {
            data = DateTime.Now;
        }
    }

    static string Nz(string? s) => s?.Trim() ?? string.Empty;

    var operacoesExecutadas = (dto.OperacoesExecutadas ?? Enumerable.Empty<string>())
        .Select(o => o?.Trim())
        .Where(o => !string.IsNullOrWhiteSpace(o))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToList();

    var descricaoOperacao = operacoesExecutadas.Count > 0
        ? string.Join(" | ", operacoesExecutadas)
        : Nz(dto.DescricaoOperacao);

    var analyst = dto.AnalystId.HasValue
        ? await _analystService.GetByIdAsync(dto.AnalystId.Value)
        : null;

    var resolvedAnalystName = !string.IsNullOrWhiteSpace(dto.AnalystName)
        ? dto.AnalystName.Trim()
        : analyst?.Analyst;

    var responsavelFinal = !string.IsNullOrWhiteSpace(resolvedAnalystName)
        ? resolvedAnalystName
        : Nz(dto.Responsavel);

    var model = new QualityCertificateModel
    {
        ControleElebId    = dto.ControleElebId,
        NumeroCertificado = string.IsNullOrWhiteSpace(dto.NumeroCertificado) ? null : dto.NumeroCertificado!.Trim(),
        Ordem             = Nz(dto.Ordem),
        OC                = Nz(dto.OC),
        Lote              = Nz(dto.Lote),
        CodigoCliente     = Nz(dto.CodigoCliente),
        PartNumber        = Nz(dto.PartNumber),
        ValorPeca         = Nz(dto.ValorPeca),
        AnalisePo         = Nz(dto.AnalisePo),
        RevisaoDesenho    = Nz(dto.RevisaoDesenho),
        Quantidade        = Nz(dto.Quantidade),
        Decapagem         = Nz(dto.Decapagem),
        SNDecapagem       = Nz(dto.SNDecapagem),
        CDChamado         = Nz(dto.CDChamado),
        Cliente           = Nz(dto.Cliente),
        Fornecedor        = Nz(dto.Fornecedor),
        RelatorioInspecao = Nz(dto.RelatorioInspecao),
        CertificadoMP     = Nz(dto.CertificadoMP),
        Responsavel       = responsavelFinal,
        AnalystId         = analyst?.Id ?? dto.AnalystId,
        AnalystName       = resolvedAnalystName,
        DesenhoLP         = Nz(dto.DesenhoLP),
        Observacoes       = Nz(dto.Observacoes),
        SNPeca            = Nz(dto.SNPeca),
        TipoEnvio         = Nz(dto.TipoEnvio),
        DescricaoOperacao = descricaoOperacao,
        Data              = data
    };

    try
    {
        var created = await _service.CreateCertificate(model);
        return Created($"/api/QualityCertificate/{created.NumeroCertificado}", created);
    }
    catch (Microsoft.EntityFrameworkCore.DbUpdateException dbex)
    {
        // extrai mensagens úteis da causa raiz
        var root = dbex.GetBaseException();
        return StatusCode(500, new
        {
            message = "Falha ao salvar alterações no banco.",
            db_error = root.Message
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = ex.Message });
    }
}


        // POST /api/QualityCertificate/caminho
        [HttpPost("caminho")]
        public IActionResult DefinirCaminho([FromBody] DefinirCaminhoRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.Path))
                return BadRequest(new { message = "Caminho inválido." });

            try
            {
                _service.SetOutputPath(req.Path!);
                return Ok(new { success = true, path = _service.GetOutputPath() });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // POST /api/QualityCertificate/gerar-pdf
        [HttpPost("gerar-pdf")]
        public async Task<IActionResult> GerarPdf([FromBody] GerarPdfRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.Numero))
                return BadRequest(new { message = "Número do certificado é obrigatório." });

            var disposition = (req.Disposition ?? "attachment").Trim().ToLowerInvariant();
            var normalizedDisposition = disposition == "inline" ? "inline" : "attachment";
            var saveOnServer = req.SaveOnServer ?? false;

            try
            {
                var result = await _service.GerarPdfAsync(req.Numero!, saveOnServer);

                Response.Headers["Content-Disposition"] = $"{normalizedDisposition}; filename=\"{result.FileName}\"";
                if (!string.IsNullOrWhiteSpace(result.SavedPath))
                {
                    Response.Headers["X-Saved-Path"] = result.SavedPath!;
                }

                return File(result.FileBytes, "application/pdf");
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Certificado não encontrado." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
