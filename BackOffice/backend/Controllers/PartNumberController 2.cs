using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartNumberController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PartNumberController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.PartNumbers
                .Where(p => !p.IsDeleted)
                .OrderBy(p => p.PartNumber)
                .ThenBy(p => p.Revision)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PartNumberModel payload)
        {
            var partNumber = payload?.PartNumber?.Trim();
            if (string.IsNullOrWhiteSpace(partNumber))
            {
                return BadRequest("PartNumber é obrigatório.");
            }

            var entity = new PartNumberModel
            {
                PartNumber = partNumber,
                Descricao = payload?.Descricao?.Trim() ?? string.Empty,
                Revision = payload?.Revision?.Trim(),
                DrawingRevision = payload?.DrawingRevision?.Trim(),
                CreateBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim(),
                CreateDate = DateTime.Now,
                LastUpdated = DateTime.Now,
                IsDeleted = false
            };

            _context.PartNumbers.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Part Number criado com sucesso.", partNumber = entity });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] PartNumberModel payload)
        {
            if (payload == null || payload.Id <= 0)
            {
                return BadRequest("Part Number inválido.");
            }

            var entity = await _context.PartNumbers.FindAsync(payload.Id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Part Number não encontrado.");
            }

            if (!string.IsNullOrWhiteSpace(payload.PartNumber))
            {
                entity.PartNumber = payload.PartNumber.Trim();
            }

            entity.Descricao = payload.Descricao?.Trim() ?? entity.Descricao;
            entity.Revision = payload.Revision?.Trim();
            entity.DrawingRevision = payload.DrawingRevision?.Trim();
            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.LastUpdated = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Part Number atualizado com sucesso.", partNumber = entity });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.PartNumbers.FindAsync(id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Part Number não encontrado.");
            }

            entity.IsDeleted = true;
            entity.LastUpdated = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Part Number excluído com sucesso." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var columns = new[] { "PartNumber", "Revision", "DrawingRevision", "Descricao" };
            var content = ExcelHelper.CreateTemplate("PartNumbers", columns);
            return File(content, ExcelHelper.ExcelContentType, "part_numbers_template.xlsx");
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
                .Select(r => new PartNumberModel
                {
                    PartNumber = r.Get("PartNumber") ?? r.Get("Part") ?? r.Get("Codigo") ?? string.Empty,
                    Revision = r.Get("Revision") ?? r.Get("Revisao"),
                    DrawingRevision = r.Get("DrawingRevision") ?? r.Get("RevisaoDesenho") ?? r.Get("RevisaoDWG") ?? r.Get("DWG"),
                    Descricao = r.Get("Descricao") ?? r.Get("Description") ?? string.Empty,
                    CreateBy = trimmedCreatedBy ?? "Sistema",
                    CreateDate = now,
                    LastUpdated = now,
                    IsDeleted = false
                })
                .Where(p => !string.IsNullOrWhiteSpace(p.PartNumber) && !string.IsNullOrWhiteSpace(p.Revision))
                .ToList();

            result.TotalRows = rows.Count;
            result.Skipped += rows.Count - items.Count;

            if (items.Count == 0)
            {
                return Ok(new { success = true, message = "Nenhum dado válido encontrado.", result });
            }

            var existing = await _context.PartNumbers
                .Where(p => !p.IsDeleted)
                .ToListAsync();

            var map = existing
                .Where(p => !string.IsNullOrWhiteSpace(p.PartNumber))
                .GroupBy(p => BuildKey(p.PartNumber, p.Descricao))
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(p => p.LastUpdated ?? p.CreateDate)
                          .ThenByDescending(p => p.Id)
                          .First(),
                    StringComparer.OrdinalIgnoreCase);

            foreach (var item in items)
            {
                var key = BuildKey(item.PartNumber, item.Descricao);
                if (map.TryGetValue(key, out var current))
                {
                    var hasChanges =
                        !AreEqual(current.Revision, item.Revision) ||
                        !AreEqual(current.DrawingRevision, item.DrawingRevision);

                    if (!hasChanges)
                    {
                        result.Skipped++;
                        continue;
                    }

                    current.Revision = item.Revision;
                    current.DrawingRevision = item.DrawingRevision;
                    current.LastUpdated = now;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.CreateBy = trimmedCreatedBy;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.PartNumbers.Add(item);
                    map[key] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Importação concluída.", result });
        }

        private static string BuildKey(string partNumber, string? description)
        {
            return $"{NormalizeValue(partNumber).ToLowerInvariant()}::{NormalizeValue(description).ToLowerInvariant()}";
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
