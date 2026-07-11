// Controllers/ControleElebController.cs
using System.Threading.Tasks;
using backend.Models;
using backend.Requests;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    public record LiberarPorIdRequest(int Id, string NumeroCertificado);
    [ApiController]
    [Route("api/[controller]")]
    public class ControleElebController : ControllerBase
    {
        private readonly ControleElebService _service;
        private readonly ILogger<ControleElebController> _logger;
        

        public ControleElebController(ControleElebService service, ILogger<ControleElebController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // POST /api/ControleEleb/liberar-por-id
        [HttpPost("liberar-por-id")]
        public async Task<IActionResult> LiberarPorId([FromBody] LiberarPorIdRequest req)
        {
            if (req.Id <= 0 || string.IsNullOrWhiteSpace(req.NumeroCertificado))
                return BadRequest(new { message = "Id e NumeroCertificado são obrigatórios." });

            var ok = await _service.LiberarPorIdAsync(req.Id, req.NumeroCertificado.Trim());
            if (!ok)
                return NotFound(new { message = "Registro não encontrado ou não está 'Finalizado'." });

            return Ok(new { success = true });
        }

        [HttpGet("ordens-finalizadas")]
        public async Task<IActionResult> GetOrdensFinalizadas()
        {
            try
            {
                var result = await _service.GetOrdensFinalizadasAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha em GET /api/ControleEleb/ordens-finalizadas");
                return Problem(
                    title: "Erro ao buscar ordens finalizadas",
                    statusCode: 500
                );
            }
        }

        [HttpGet("por-po/{poEleb}")]
        public async Task<IActionResult> GetByPo(string poEleb)
        {
            try
            {
                var item = await _service.GetByPoAsync(poEleb);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha em GET /api/ControleEleb/por-po/{poEleb}", poEleb);
                return Problem(title: "Erro ao buscar a PO", statusCode: 500);
            }
        }

        [HttpGet("{opEleb}")]
        public async Task<IActionResult> GetByOp(string opEleb)
        {
            try
            {
                var item = await _service.GetByOpAsync(opEleb);
                if (item == null) return NotFound();
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha em GET /api/ControleEleb/{opEleb}", opEleb);
                return Problem(title: "Erro ao buscar a OP", statusCode: 500);
            }
        }

        [HttpPut("liberar")]
        public async Task<IActionResult> Liberar([FromBody] LiberarOrdemRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.OpEleb) ||
                string.IsNullOrWhiteSpace(req?.NumeroCertificado))
            {
                return BadRequest(new { message = "OpEleb e NumeroCertificado são obrigatórios." });
            }

            try
            {
                var ok = await _service.LiberarAsync(req.OpEleb, req.NumeroCertificado);
                if (!ok)
                    return NotFound(new { message = "OP não encontrada (ou situação inválida)." });

                return Ok(new { success = true, message = "OP liberada com sucesso." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Falha em PUT /api/ControleEleb/liberar {op} {cert}", req.OpEleb, req.NumeroCertificado);
                return Problem(title: "Erro ao liberar OP", statusCode: 500);
            }
        }
    }
}
