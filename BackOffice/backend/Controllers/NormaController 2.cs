using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NormaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NormaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.TechnicalStandards
                .Where(n => !n.IsDeleted)
                .OrderBy(n => n.Cliente)
                .ThenBy(n => n.Processo)
                .ThenBy(n => n.Norma)
                .ThenBy(n => n.Revision)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] NormaModel payload)
        {
            var client = payload?.Cliente?.Trim();
            var process = payload?.Processo?.Trim();
            var standard = payload?.Norma?.Trim();
            var revision = payload?.Revision?.Trim();

            if (string.IsNullOrWhiteSpace(client) ||
                string.IsNullOrWhiteSpace(process) ||
                string.IsNullOrWhiteSpace(standard) ||
                string.IsNullOrWhiteSpace(revision))
            {
                return BadRequest("Cliente, Processo, Norma e Revisão são obrigatórios.");
            }

            var entity = new NormaModel
            {
                Cliente = client,
                Processo = process,
                Norma = standard,
                Revision = revision,
                CreateBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim(),
                CreateDate = DateTime.Now,
                LastUpdated = DateTime.Now,
                IsDeleted = false
            };

            _context.TechnicalStandards.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Norma criada com sucesso.", norma = entity });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] NormaModel payload)
        {
            if (payload == null || payload.Id <= 0)
            {
                return BadRequest("Norma inválida.");
            }

            var entity = await _context.TechnicalStandards.FindAsync(payload.Id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Norma não encontrada.");
            }

            if (!string.IsNullOrWhiteSpace(payload.Cliente))
            {
                entity.Cliente = payload.Cliente.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.Processo))
            {
                entity.Processo = payload.Processo.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.Norma))
            {
                entity.Norma = payload.Norma.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.Revision))
            {
                entity.Revision = payload.Revision.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.LastUpdated = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Norma atualizada com sucesso.", norma = entity });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.TechnicalStandards.FindAsync(id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Norma não encontrada.");
            }

            entity.IsDeleted = true;
            entity.LastUpdated = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Norma excluída com sucesso." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var columns = new[] { "Cliente", "Processo", "Norma", "Revisao" };
            var content = ExcelHelper.CreateTemplate("Normas", columns);
            return File(content, ExcelHelper.ExcelContentType, "normas_template.xlsx");
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportFromExcel([FromForm] IFormFile? file, [FromForm] string? createdBy)
        {
            var rows = ExcelHelper.ReadRows(file);
            if (rows.Count == 0)
            {
                return BadRequest("Arquivo vazio ou inválido.");
            }

            var now = DateTime.Now;
            var trimmedCreatedBy = string.IsNullOrWhiteSpace(createdBy) ? null : createdBy.Trim();
            var result = new BulkImportResult();

            var items = rows
                .Select(r =>
                {
                    var client = r.Get("Cliente") ?? r.Get("Client");
                    var process = r.Get("Processo") ?? r.Get("Operacao") ?? r.Get("CodigoOperacao") ?? r.Get("Operation");
                    var standard = r.Get("Norma") ?? r.Get("Standard");
                    var revision = r.Get("Revisao") ?? r.Get("Revision");

                    return new NormaModel
                    {
                        Cliente = client?.Trim() ?? string.Empty,
                        Processo = process?.Trim() ?? string.Empty,
                        Norma = standard?.Trim() ?? string.Empty,
                        Revision = revision?.Trim(),
                        CreateBy = trimmedCreatedBy ?? "Sistema",
                        CreateDate = now,
                        LastUpdated = now,
                        IsDeleted = false
                    };
                })
                .Where(n =>
                    !string.IsNullOrWhiteSpace(n.Cliente) &&
                    !string.IsNullOrWhiteSpace(n.Processo) &&
                    !string.IsNullOrWhiteSpace(n.Norma) &&
                    !string.IsNullOrWhiteSpace(n.Revision))
                .ToList();

            result.TotalRows = rows.Count;
            result.Skipped += rows.Count - items.Count;

            if (items.Count == 0)
            {
                return Ok(new { success = true, message = "Nenhum dado válido encontrado.", result });
            }

            var existing = await _context.TechnicalStandards
                .Where(n => !n.IsDeleted)
                .ToListAsync();

            var map = existing
                .Where(n => !string.IsNullOrWhiteSpace(n.Cliente) &&
                            !string.IsNullOrWhiteSpace(n.Processo) &&
                            !string.IsNullOrWhiteSpace(n.Norma))
                .GroupBy(n => BuildKey(n.Cliente, n.Processo, n.Norma))
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(n => n.LastUpdated ?? n.CreateDate)
                          .ThenByDescending(n => n.Id)
                          .First(),
                    StringComparer.OrdinalIgnoreCase);

            foreach (var item in items)
            {
                var key = BuildKey(item.Cliente, item.Processo, item.Norma);
                if (map.TryGetValue(key, out var current))
                {
                    var hasChanges = !AreEqual(current.Revision, item.Revision);

                    if (!hasChanges)
                    {
                        result.Skipped++;
                        continue;
                    }

                    current.Revision = item.Revision;
                    current.LastUpdated = now;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.CreateBy = trimmedCreatedBy;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.TechnicalStandards.Add(item);
                    map[key] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Importação concluída.", result });
        }

        private static string BuildKey(string? client, string? process, string? standard)
        {
            return $"{NormalizeValue(client).ToLowerInvariant()}::{NormalizeValue(process).ToLowerInvariant()}::{NormalizeValue(standard).ToLowerInvariant()}";
        }

        private static string NormalizeValue(string? value)
        {
            return value?.Trim() ?? string.Empty;
        }

        private static bool AreEqual(string? left, string? right)
        {
            return string.Equals(NormalizeValue(left), NormalizeValue(right), StringComparison.OrdinalIgnoreCase);
        }
    }
}
