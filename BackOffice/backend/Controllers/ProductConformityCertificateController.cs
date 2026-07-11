using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductConformityCertificateController : ControllerBase
    {
        private readonly ProductConformityCertificateService _service;

        public ProductConformityCertificateController(ProductConformityCertificateService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string? search)
        {
            var items = await _service.ListDetailedAsync(from, to, search);
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound("Certificado não encontrado.");
            }

            return Ok(item);
        }

        [HttpGet("next-number")]
        public async Task<IActionResult> GetNextNumber([FromQuery] DateTime? emissionDate)
        {
            var next = await _service.GetNextNumberAsync(emissionDate);
            return Ok(new { nextNumber = next });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductConformityCertificateModel payload)
        {
            if (payload == null)
            {
                return BadRequest("Dados inválidos.");
            }

            var created = await _service.CreateAsync(payload);
            return Ok(new { success = true, message = "Certificado criado com sucesso.", certificate = created });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductConformityCertificateModel payload)
        {
            if (payload == null)
            {
                return BadRequest("Dados inválidos.");
            }

            var updated = await _service.UpdateAsync(id, payload);
            if (updated == null)
            {
                return NotFound("Certificado não encontrado.");
            }

            return Ok(new { success = true, message = "Certificado atualizado com sucesso.", certificate = updated });
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

        [HttpGet("{id:int}/pdf")]
        public async Task<IActionResult> DownloadPdf(int id, [FromQuery] bool saveOnServer = false)
        {
            var result = await _service.GeneratePdfAsync(id, saveOnServer);
            return File(result.FileBytes, "application/pdf", result.FileName);
        }
    }
}
