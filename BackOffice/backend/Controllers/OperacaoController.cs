using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OperacaoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OperacaoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.Operacao
                .Where(o => !o.IsDeleted)
                .OrderBy(o => o.OperationQuantity)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OperationProcessModel payload)
        {
            var code = payload?.OperationQuantity?.Trim();
            var description = payload?.OperationDescription?.Trim();

            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(description))
            {
                return BadRequest("Código e descrição são obrigatórios.");
            }

            var createBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim();
            var updateBy = AuditHelper.ResolveUpdateBy(payload?.UpdateBy, createBy);

            var entity = new OperationProcessModel
            {
                OperationQuantity = code,
                OperationDescription = description,
                IsActivated = payload?.IsActivated ?? true,
                CreateBy = createBy,
                UpdateBy = updateBy,
                CreateDate = DateTime.Now,
                LastUpdate = DateTime.Now,
                IsDeleted = false
            };

            _context.Operacao.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Operação criada com sucesso.", operacao = entity });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] OperationProcessModel payload)
        {
            if (payload == null || payload.Id <= 0)
            {
                return BadRequest("Operação inválida.");
            }

            var entity = await _context.Operacao.FindAsync(payload.Id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Operação não encontrada.");
            }

            if (!string.IsNullOrWhiteSpace(payload.OperationQuantity))
            {
                entity.OperationQuantity = payload.OperationQuantity.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.OperationDescription))
            {
                entity.OperationDescription = payload.OperationDescription.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.UpdateBy = AuditHelper.ResolveUpdateBy(payload.UpdateBy, payload.CreateBy, entity.UpdateBy ?? entity.CreateBy ?? "Sistema");
            entity.LastUpdate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Operação atualizada com sucesso.", operacao = entity });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Operacao.FindAsync(id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Operação não encontrada.");
            }

            entity.IsDeleted = true;
            entity.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Operação excluída com sucesso." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var columns = new[] { "Codigo", "Descricao" };
            var content = ExcelHelper.CreateTemplate("Operacoes", columns);
            return File(content, ExcelHelper.ExcelContentType, "operacoes_template.xlsx");
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
            var resolvedCreatedBy = trimmedCreatedBy ?? "Sistema";
            var result = new BulkImportResult();

            var items = rows
                .Select(r =>
                {
                    var code = r.Get("Codigo") ?? r.Get("Operacao") ?? r.Get("Operation") ?? r.Get("Code") ?? r.Get("OperationQuantity");
                    var description = r.Get("Descricao") ?? r.Get("Description") ?? r.Get("OperationDescription");

                    return new OperationProcessModel
                    {
                        OperationQuantity = code?.Trim() ?? string.Empty,
                        OperationDescription = description?.Trim() ?? string.Empty,
                        IsActivated = true,
                        CreateBy = resolvedCreatedBy,
                        UpdateBy = resolvedCreatedBy,
                        CreateDate = now,
                        LastUpdate = now,
                        IsDeleted = false
                    };
                })
                .Where(o => !string.IsNullOrWhiteSpace(o.OperationQuantity) && !string.IsNullOrWhiteSpace(o.OperationDescription))
                .ToList();

            result.TotalRows = rows.Count;
            result.Skipped += rows.Count - items.Count;

            if (items.Count == 0)
            {
                return Ok(new { success = true, message = "Nenhum dado válido encontrado.", result });
            }

            var existing = await _context.Operacao
                .Where(o => !o.IsDeleted)
                .ToListAsync();

            var map = existing
                .Where(o => !string.IsNullOrWhiteSpace(o.OperationDescription))
                .GroupBy(o => BuildKey(o.OperationDescription))
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(o => o.LastUpdate ?? o.CreateDate)
                          .ThenByDescending(o => o.Id)
                          .First(),
                    StringComparer.OrdinalIgnoreCase);

            foreach (var item in items)
            {
                var key = BuildKey(item.OperationDescription);
                if (map.TryGetValue(key, out var current))
                {
                    var hasChanges =
                        !AreEqual(current.OperationQuantity, item.OperationQuantity) ||
                        !AreEqual(current.OperationDescription, item.OperationDescription) ||
                        current.IsActivated != item.IsActivated;

                    if (!hasChanges)
                    {
                        result.Skipped++;
                        continue;
                    }

                    current.OperationQuantity = item.OperationQuantity;
                    current.OperationDescription = item.OperationDescription;
                    current.IsActivated = item.IsActivated;
                    current.LastUpdate = now;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.CreateBy = trimmedCreatedBy;
                        current.UpdateBy = trimmedCreatedBy;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.Operacao.Add(item);
                    map[key] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Importação concluída.", result });
        }

        private static string BuildKey(string? description)
        {
            return NormalizeValue(description).ToLowerInvariant();
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
