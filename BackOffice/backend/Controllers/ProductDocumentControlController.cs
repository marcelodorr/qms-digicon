using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductDocumentControlController : ControllerBase
    {
        private readonly ProductDocumentControlService _service;

        public ProductDocumentControlController(ProductDocumentControlService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var current = await _service.GetAsync();
            return Ok(current);
        }

        [HttpPut]
        public async Task<IActionResult> Save([FromBody] ProductDocumentControlModel payload)
        {
            if (payload == null)
            {
                return BadRequest("Dados inválidos.");
            }

            var saved = await _service.SaveAsync(payload);
            return Ok(new { success = true, message = "Controle de documento atualizado com sucesso.", documentControl = saved });
        }
    }
}
