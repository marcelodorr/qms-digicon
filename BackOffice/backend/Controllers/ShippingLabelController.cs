using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShippingLabelController : ControllerBase
    {
        private readonly ShippingLabelService _service;

        public ShippingLabelController(ShippingLabelService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _service.ListAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Etiqueta não encontrada." });
            }

            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ShippingLabelSaveCommand payload)
        {
            if (payload == null)
            {
                return BadRequest(new { message = "Dados inválidos." });
            }

            try
            {
                var item = await _service.CreateAsync(payload);
                return Ok(new
                {
                    success = true,
                    message = "Etiqueta criada com sucesso.",
                    shippingLabel = item,
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ShippingLabelSaveCommand payload)
        {
            if (payload == null)
            {
                return BadRequest(new { message = "Dados inválidos." });
            }

            try
            {
                var item = await _service.UpdateAsync(id, payload);
                if (item == null)
                {
                    return NotFound(new { message = "Etiqueta não encontrada." });
                }

                return Ok(new
                {
                    success = true,
                    message = "Etiqueta atualizada com sucesso.",
                    shippingLabel = item,
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Etiqueta não encontrada." });
            }

            return Ok(new { success = true, message = "Etiqueta excluída com sucesso." });
        }

        [HttpGet("print-settings")]
        public async Task<IActionResult> GetPrintSettings([FromQuery] string? username = null)
        {
            try
            {
                var settings = await _service.GetPrintSettingsAsync(username);
                return Ok(settings);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("print-settings")]
        public async Task<IActionResult> SavePrintSettings([FromBody] ShippingLabelPrintSettingsSaveCommand payload)
        {
            if (payload == null)
            {
                return BadRequest(new { message = "Dados inválidos." });
            }

            try
            {
                var settings = await _service.SavePrintSettingsAsync(payload);
                return Ok(new
                {
                    success = true,
                    message = "Configuração de impressão salva com sucesso.",
                    settings,
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("printers")]
        public IActionResult GetPrinters()
        {
            return Ok(_service.GetAvailablePrinters());
        }

        [HttpGet("{id:int}/print-job")]
        public async Task<IActionResult> GetPrintJob(int id)
        {
            try
            {
                var printJob = await _service.BuildPrintJobAsync(id);
                return Ok(printJob);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
