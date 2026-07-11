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

        private static string FormatActive(bool isActive) => isActive ? "Ativo" : "Inativo";

        private static string BuildChangeSummary(
            PartNumberModel before,
            PartNumberModel after,
            string? beforeClienteNome,
            string? afterClienteNome
        )
        {
            var changes = new List<string>();

            if (!AreEqual(before.PartNumber, after.PartNumber))
                changes.Add($"Part Number: {before.PartNumber} -> {after.PartNumber}");

            if (!AreEqual(before.Descricao, after.Descricao))
                changes.Add($"Descrição: {before.Descricao} -> {after.Descricao}");

            if (!AreEqual(before.Revision, after.Revision))
                changes.Add($"Revisão: {before.Revision ?? "—"} -> {after.Revision ?? "—"}");

            if (!AreEqual(before.DrawingRevision, after.DrawingRevision))
                changes.Add($"LP: {before.DrawingRevision ?? "—"} -> {after.DrawingRevision ?? "—"}");

            if (before.ClienteId != after.ClienteId || !AreEqual(beforeClienteNome, afterClienteNome))
                changes.Add($"Cliente: {beforeClienteNome ?? "—"} -> {afterClienteNome ?? "—"}");

            if (before.IsActive != after.IsActive)
                changes.Add($"Ativo: {FormatActive(before.IsActive)} -> {FormatActive(after.IsActive)}");

            return changes.Count > 0 ? string.Join("; ", changes) : "Sem alterações";
        }

        private async Task<ClienteModel?> ResolveClientAsync(int? clientId)
        {
            if (!clientId.HasValue)
                return null;

            return await _context.Cliente
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == clientId.Value && !c.IsDeleted);
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

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entity = await _context.PartNumbers
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

            if (entity == null)
            {
                return NotFound(new { success = false, message = "Part Number não encontrado." });
            }

            return Ok(new { success = true, partNumber = entity });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PartNumberModel payload)
        {
            var partNumber = payload?.PartNumber?.Trim();
            if (string.IsNullOrWhiteSpace(partNumber))
            {
                return BadRequest("PartNumber é obrigatório.");
            }

            var client = await ResolveClientAsync(payload?.ClienteId);
            if (payload?.ClienteId.HasValue == true && client == null)
            {
                return BadRequest("Cliente inválido.");
            }

            var createBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim();
            var updateBy = AuditHelper.ResolveUpdateBy(payload?.UpdateBy, createBy);

            var entity = new PartNumberModel
            {
                PartNumber = partNumber,
                Descricao = payload?.Descricao?.Trim() ?? string.Empty,
                Revision = payload?.Revision?.Trim(),
                DrawingRevision = payload?.DrawingRevision?.Trim(),
                ClienteId = payload?.ClienteId,
                ClienteNome = client?.Cliente,
                IsActive = payload?.IsActive ?? true,
                CreateBy = createBy,
                UpdateBy = updateBy,
                CreateDate = DateTime.Now,
                LastUpdated = DateTime.Now,
                IsDeleted = false
            };

            _context.PartNumbers.Add(entity);
            await _context.SaveChangesAsync();

            var history = new PartNumberHistoryModel
            {
                PartNumberId = entity.Id,
                Changes = "Cadastro inicial",
                Observation = payload?.Observation?.Trim(),
                ChangedBy = entity.UpdateBy,
                ChangedAt = DateTime.Now
            };
            _context.PartNumberHistory.Add(history);
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

            var before = new PartNumberModel
            {
                Id = entity.Id,
                PartNumber = entity.PartNumber,
                Descricao = entity.Descricao,
                Revision = entity.Revision,
                DrawingRevision = entity.DrawingRevision,
                ClienteId = entity.ClienteId,
                ClienteNome = entity.ClienteNome,
                IsActive = entity.IsActive
            };

            if (!string.IsNullOrWhiteSpace(payload.PartNumber))
            {
                entity.PartNumber = payload.PartNumber.Trim();
            }

            entity.Descricao = payload.Descricao?.Trim() ?? entity.Descricao;
            entity.Revision = payload.Revision?.Trim();
            entity.DrawingRevision = payload.DrawingRevision?.Trim();

            if (payload.ClienteId.HasValue)
            {
                var client = await ResolveClientAsync(payload.ClienteId);
                if (client == null)
                {
                    return BadRequest("Cliente inválido.");
                }
                entity.ClienteId = client.Id;
                entity.ClienteNome = client.Cliente;
            }

            entity.IsActive = payload.IsActive;

            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.UpdateBy = AuditHelper.ResolveUpdateBy(payload.UpdateBy, payload.CreateBy, entity.UpdateBy ?? entity.CreateBy ?? "Sistema");
            entity.LastUpdated = DateTime.Now;

            await _context.SaveChangesAsync();

            var changeSummary = BuildChangeSummary(before, entity, before.ClienteNome, entity.ClienteNome);
            
            // Só salva histórico se houver alterações
            if (changeSummary != "Sem alterações")
            {
                var history = new PartNumberHistoryModel
                {
                    PartNumberId = entity.Id,
                    Changes = changeSummary,
                    Observation = payload.Observation?.Trim(),
                    ChangedBy = entity.UpdateBy,
                    ChangedAt = DateTime.Now
                };
                _context.PartNumberHistory.Add(history);
                await _context.SaveChangesAsync();
            }

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
            var columns = new[] { "PartNumber", "Revision", "DrawingRevision", "Descricao", "Cliente", "Ativo" };
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
            var resolvedCreatedBy = trimmedCreatedBy ?? "Sistema";
            var result = new BulkImportResult();

            static bool ParseActive(string? value)
            {
                var raw = value?.Trim().ToLowerInvariant();
                if (string.IsNullOrWhiteSpace(raw)) return true;
                return raw is "1" or "true" or "sim" or "s" or "ativo" or "yes" or "y";
            }

            var items = rows
                .Select(r => new PartNumberModel
                {
                    PartNumber = r.Get("PartNumber") ?? r.Get("Part") ?? r.Get("Codigo") ?? string.Empty,
                    Revision = r.Get("Revision") ?? r.Get("Revisao"),
                    DrawingRevision = r.Get("DrawingRevision") ?? r.Get("RevisaoDesenho") ?? r.Get("RevisaoDWG") ?? r.Get("DWG"),
                    Descricao = r.Get("Descricao") ?? r.Get("Description") ?? string.Empty,
                    ClienteNome = r.Get("Cliente") ?? r.Get("Client"),
                    IsActive = ParseActive(r.Get("Ativo") ?? r.Get("Active")),
                    CreateBy = resolvedCreatedBy,
                    UpdateBy = resolvedCreatedBy,
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
                        !AreEqual(current.DrawingRevision, item.DrawingRevision) ||
                        !AreEqual(current.ClienteNome, item.ClienteNome) ||
                        current.IsActive != item.IsActive;

                    if (!hasChanges)
                    {
                        result.Skipped++;
                        continue;
                    }

                    current.Revision = item.Revision;
                    current.DrawingRevision = item.DrawingRevision;
                    current.ClienteNome = item.ClienteNome;
                    current.IsActive = item.IsActive;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.UpdateBy = trimmedCreatedBy;
                    }
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

        [HttpGet("{id:int}/history")]
        public async Task<IActionResult> GetHistory(int id)
        {
            var exists = await _context.PartNumbers
                .AsNoTracking()
                .AnyAsync(p => p.Id == id && !p.IsDeleted);
            if (!exists)
            {
                return NotFound("Part Number não encontrado.");
            }

            var history = await _context.PartNumberHistory
                .AsNoTracking()
                .Where(h => h.PartNumberId == id)
                .OrderByDescending(h => h.ChangedAt)
                .ToListAsync();

            return Ok(history);
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
