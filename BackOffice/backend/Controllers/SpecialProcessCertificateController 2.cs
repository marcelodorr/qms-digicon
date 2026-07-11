using System.Globalization;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecialProcessCertificateController : ControllerBase
    {
        private readonly SpecialProcessCertificateService _service;

        public SpecialProcessCertificateController(SpecialProcessCertificateService service)
        {
            _service = service;
        }

        public record SpecialProcessCertificateCreateDto(
            int? ClienteId,
            string? ClienteNome,
            int? SpecialProcessId,
            string? SpecialProcess,
            string? Norma,
            string? PartNumber,
            DateTime? EmissionDate,
            string? Quantity,
            string? LotNumber,
            string? PurchasingOrder,
            string? Item,
            string? HardnessFound,
            string? HeatTreatLot,
            int? AnalystId,
            string? AnalystName,
            string? Observations,
            string? CreateBy
        );

        public record SpecialProcessCertificateUpdateDto(
            int? ClienteId,
            string? ClienteNome,
            int? SpecialProcessId,
            string? SpecialProcess,
            string? Norma,
            string? PartNumber,
            DateTime? EmissionDate,
            string? Quantity,
            string? LotNumber,
            string? PurchasingOrder,
            string? Item,
            string? HardnessFound,
            string? HeatTreatLot,
            int? AnalystId,
            string? AnalystName,
            string? Observations,
            string? CreateBy
        );

        public record SpecialProcessCertificateProcessDto(
            int? SpecialProcessId,
            string? SpecialProcess,
            string? Norma,
            string? HardnessFound,
            string? HeatTreatLot
        );

        public record SpecialProcessCertificateBatchDto(
            int? ClienteId,
            string? ClienteNome,
            string? PartNumber,
            DateTime? EmissionDate,
            string? Quantity,
            string? LotNumber,
            string? PurchasingOrder,
            string? Item,
            int? AnalystId,
            string? AnalystName,
            string? Observations,
            string? CreateBy,
            List<SpecialProcessCertificateProcessDto>? Processes
        );

        public record SpecialProcessPdfRequest(int? Id, string? Disposition = null, bool? SaveOnServer = null);

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("novo")]
        public async Task<IActionResult> GetNext([FromQuery] DateTime? emissionDate)
        {
            var date = emissionDate ?? DateTime.Today;
            var code = await _service.PeekNextCodeAsync(date);
            return Ok(new { code });
        }

        [HttpGet("lista")]
        public async Task<IActionResult> List([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string? search)
        {
            var list = await _service.ListCodesAsync(from, to, search);
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SpecialProcessCertificateCreateDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Payload inválido.");
            }

            var quantity = 0m;
            if (!string.IsNullOrWhiteSpace(dto.Quantity))
            {
                var normalized = dto.Quantity.Replace(',', '.');
                decimal.TryParse(normalized, NumberStyles.Number, CultureInfo.InvariantCulture, out quantity);
            }

            var model = new SpecialProcessCertificateModel
            {
                ClienteId = dto.ClienteId,
                ClienteNome = dto.ClienteNome,
                SpecialProcessId = dto.SpecialProcessId,
                SpecialProcess = dto.SpecialProcess,
                Norma = dto.Norma,
                PartNumber = dto.PartNumber,
                EmissionDate = dto.EmissionDate ?? DateTime.Today,
                Quantity = quantity,
                LotNumber = dto.LotNumber,
                PurchasingOrder = dto.PurchasingOrder,
                Item = dto.Item,
                HardnessFound = dto.HardnessFound,
                HeatTreatLot = dto.HeatTreatLot,
                AnalystId = dto.AnalystId,
                AnalystName = dto.AnalystName,
                Observations = dto.Observations,
                CreateBy = dto.CreateBy ?? "Sistema"
            };

            var created = await _service.CreateAsync(model);
            return Ok(created);
        }

        [HttpPost("batch")]
        public async Task<IActionResult> CreateBatch([FromBody] SpecialProcessCertificateBatchDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Payload inválido.");
            }

            if (dto.Processes == null || dto.Processes.Count == 0)
            {
                return BadRequest("Informe ao menos um processo.");
            }

            var quantity = 0m;
            if (!string.IsNullOrWhiteSpace(dto.Quantity))
            {
                var normalized = dto.Quantity.Replace(',', '.');
                decimal.TryParse(normalized, NumberStyles.Number, CultureInfo.InvariantCulture, out quantity);
            }

            var emissionDate = dto.EmissionDate ?? DateTime.Today;
            var createBy = dto.CreateBy ?? "Sistema";

            var models = dto.Processes
                .Where(process => process != null)
                .Select(process => new SpecialProcessCertificateModel
                {
                    ClienteId = dto.ClienteId,
                    ClienteNome = dto.ClienteNome,
                    SpecialProcessId = process.SpecialProcessId,
                    SpecialProcess = process.SpecialProcess,
                    Norma = process.Norma,
                    PartNumber = dto.PartNumber,
                    EmissionDate = emissionDate,
                    Quantity = quantity,
                    LotNumber = dto.LotNumber,
                    PurchasingOrder = dto.PurchasingOrder,
                    Item = dto.Item,
                    HardnessFound = process.HardnessFound,
                    HeatTreatLot = process.HeatTreatLot,
                    AnalystId = dto.AnalystId,
                    AnalystName = dto.AnalystName,
                    Observations = dto.Observations,
                    CreateBy = createBy
                })
                .ToList();

            var created = await _service.CreateManyAsync(models);
            return Ok(created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] SpecialProcessCertificateUpdateDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Payload inválido.");
            }

            var quantity = 0m;
            if (!string.IsNullOrWhiteSpace(dto.Quantity))
            {
                var normalized = dto.Quantity.Replace(',', '.');
                decimal.TryParse(normalized, NumberStyles.Number, CultureInfo.InvariantCulture, out quantity);
            }

            var model = new SpecialProcessCertificateModel
            {
                ClienteId = dto.ClienteId,
                ClienteNome = dto.ClienteNome,
                SpecialProcessId = dto.SpecialProcessId,
                SpecialProcess = dto.SpecialProcess,
                Norma = dto.Norma,
                PartNumber = dto.PartNumber,
                EmissionDate = dto.EmissionDate ?? default,
                Quantity = quantity,
                LotNumber = dto.LotNumber,
                PurchasingOrder = dto.PurchasingOrder,
                Item = dto.Item,
                HardnessFound = dto.HardnessFound,
                HeatTreatLot = dto.HeatTreatLot,
                AnalystId = dto.AnalystId,
                AnalystName = dto.AnalystName,
                Observations = dto.Observations,
                CreateBy = dto.CreateBy
            };

            var updated = await _service.UpdateAsync(id, model);
            if (updated == null)
            {
                return NotFound("Certificado não encontrado.");
            }

            return Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound("Certificado não encontrado.");
            }

            return Ok(new { success = true, message = "Certificado excluído com sucesso." });
        }

        [HttpPost("gerar-pdf")]
        public async Task<IActionResult> GeneratePdf([FromBody] SpecialProcessPdfRequest req)
        {
            if (req?.Id == null || req.Id <= 0)
                return BadRequest(new { message = "Id do certificado é obrigatório." });

            var disposition = (req.Disposition ?? "attachment").Trim().ToLowerInvariant();
            var normalizedDisposition = disposition == "inline" ? "inline" : "attachment";
            var saveOnServer = req.SaveOnServer ?? false;

            try
            {
                var result = await _service.GeneratePdfAsync(req.Id.Value, saveOnServer);

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
