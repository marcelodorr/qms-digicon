using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParameterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParameterController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.Parameters
                .Where(p => !p.IsDeleted)
                .OrderBy(p => p.PartNumber)
                .ThenBy(p => p.Processo)
                .ThenBy(p => p.Norma)
                .ThenBy(p => p.Parameter)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ParameterModel payload)
        {
            var partNumber = payload?.PartNumber?.Trim();
            var process = payload?.Processo?.Trim();
            var norm = payload?.Norma?.Trim();
            var parameter = payload?.Parameter?.Trim();

            if (string.IsNullOrWhiteSpace(partNumber) ||
                string.IsNullOrWhiteSpace(process) ||
                string.IsNullOrWhiteSpace(norm) ||
                string.IsNullOrWhiteSpace(parameter))
            {
                return BadRequest("Part Number, Processo, Norma e Parâmetro são obrigatórios.");
            }

            var normaRevision = await ResolveNormaRevisionAsync(process, norm);
            var createBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim();
            var updateBy = AuditHelper.ResolveUpdateBy(payload?.UpdateBy, createBy);

            var entity = new ParameterModel
            {
                PartNumber = partNumber,
                Processo = process,
                Norma = norm,
                NormaRevision = normaRevision ?? payload?.NormaRevision?.Trim(),
                Parameter = parameter,
                Condition = string.IsNullOrWhiteSpace(payload?.Condition) ? null : payload.Condition.Trim(),
                CreateBy = createBy,
                UpdateBy = updateBy,
                CreateDate = DateTime.Now,
                LastUpdate = DateTime.Now,
                IsDeleted = false
            };

            _context.Parameters.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Parâmetro criado com sucesso.", parameter = entity });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ParameterModel payload)
        {
            if (payload == null || payload.Id <= 0)
            {
                return BadRequest("Parâmetro inválido.");
            }

            var entity = await _context.Parameters.FindAsync(payload.Id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Parâmetro não encontrado.");
            }

            if (!string.IsNullOrWhiteSpace(payload.PartNumber))
            {
                entity.PartNumber = payload.PartNumber.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.Processo))
            {
                entity.Processo = payload.Processo.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.Norma))
            {
                entity.Norma = payload.Norma.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.Parameter))
            {
                entity.Parameter = payload.Parameter.Trim();
            }

            entity.Condition = string.IsNullOrWhiteSpace(payload.Condition) ? null : payload.Condition.Trim();
            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.UpdateBy = AuditHelper.ResolveUpdateBy(payload.UpdateBy, payload.CreateBy, entity.UpdateBy ?? entity.CreateBy ?? "Sistema");
            entity.NormaRevision = await ResolveNormaRevisionAsync(entity.Processo, entity.Norma)
                ?? (string.IsNullOrWhiteSpace(payload.NormaRevision) ? null : payload.NormaRevision.Trim());
            entity.LastUpdate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Parâmetro atualizado com sucesso.", parameter = entity });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Parameters.FindAsync(id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Parâmetro não encontrado.");
            }

            entity.IsDeleted = true;
            entity.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Parâmetro excluído com sucesso." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var columns = new[] { "PartNumber", "Processo", "Norma", "Parametro", "Condicao" };
            var content = ExcelHelper.CreateTemplate("Parametros", columns);
            return File(content, ExcelHelper.ExcelContentType, "parametros_template.xlsx");
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

            var normaRevisionMap = await BuildSpecialNormRevisionMapAsync();
            var items = rows
                .Select(r =>
                {
                    var partNumber = r.Get("PartNumber") ?? r.Get("Part") ?? r.Get("Codigo");
                    var process = r.Get("Processo") ?? r.Get("CodigoOperacao") ?? r.Get("Operacao") ?? r.Get("Operation");
                    var norm = r.Get("Norma") ?? r.Get("NormaEspecial") ?? r.Get("NormaProcEspecial");
                    var parameter = r.Get("Parametro") ?? r.Get("Parameter");
                    var condition = r.Get("Condicao") ?? r.Get("Condition");
                    var normaRevision = ResolveNormaRevisionFromMap(normaRevisionMap, process, norm);

                    return new ParameterModel
                    {
                        PartNumber = partNumber?.Trim() ?? string.Empty,
                        Processo = process?.Trim() ?? string.Empty,
                        Norma = norm?.Trim() ?? string.Empty,
                        NormaRevision = normaRevision,
                        Parameter = parameter?.Trim() ?? string.Empty,
                        Condition = string.IsNullOrWhiteSpace(condition) ? null : condition.Trim(),
                        CreateBy = resolvedCreatedBy,
                        UpdateBy = resolvedCreatedBy,
                        CreateDate = now,
                        LastUpdate = now,
                        IsDeleted = false
                    };
                })
                .Where(p =>
                    !string.IsNullOrWhiteSpace(p.PartNumber) &&
                    !string.IsNullOrWhiteSpace(p.Processo) &&
                    !string.IsNullOrWhiteSpace(p.Norma) &&
                    !string.IsNullOrWhiteSpace(p.Parameter))
                .ToList();

            result.TotalRows = rows.Count;
            result.Skipped += rows.Count - items.Count;

            if (items.Count == 0)
            {
                return Ok(new { success = true, message = "Nenhum dado válido encontrado.", result });
            }

            var existing = await _context.Parameters
                .Where(p => !p.IsDeleted)
                .ToListAsync();

            var map = existing
                .Where(p => !string.IsNullOrWhiteSpace(p.PartNumber) &&
                            !string.IsNullOrWhiteSpace(p.Processo) &&
                            !string.IsNullOrWhiteSpace(p.Norma))
                .GroupBy(p => BuildKey(p.PartNumber, p.Processo, p.Norma))
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(p => p.LastUpdate ?? p.CreateDate)
                          .ThenByDescending(p => p.Id)
                          .First(),
                    StringComparer.OrdinalIgnoreCase);

            foreach (var item in items)
            {
                var key = BuildKey(item.PartNumber, item.Processo, item.Norma);
                if (map.TryGetValue(key, out var current))
                {
                    var hasChanges =
                        !AreEqual(current.Parameter, item.Parameter) ||
                        !AreEqual(current.Condition, item.Condition) ||
                        !AreEqual(current.NormaRevision, item.NormaRevision);

                    if (!hasChanges)
                    {
                        result.Skipped++;
                        continue;
                    }

                    current.Parameter = item.Parameter;
                    current.Condition = item.Condition;
                    current.NormaRevision = item.NormaRevision;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.UpdateBy = trimmedCreatedBy;
                    }
                    current.LastUpdate = now;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.CreateBy = trimmedCreatedBy;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.Parameters.Add(item);
                    map[key] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Importação concluída.", result });
        }

        private static string BuildKey(string partNumber, string process, string norm)
        {
            return $"{NormalizeValue(partNumber).ToLowerInvariant()}::{NormalizeValue(process).ToLowerInvariant()}::{NormalizeValue(norm).ToLowerInvariant()}";
        }

        private static string NormalizeValue(string? value)
        {
            return value?.Trim() ?? string.Empty;
        }

        private static bool AreEqual(string? left, string? right)
        {
            return string.Equals(NormalizeValue(left), NormalizeValue(right), StringComparison.OrdinalIgnoreCase);
        }

        private async Task<string?> ResolveNormaRevisionAsync(string process, string norm)
        {
            var revision = await _context.SpecialProcesses
                .AsNoTracking()
                .Where(s => !s.IsDeleted && s.SpecialProcess == process && s.Specification == norm)
                .OrderByDescending(s => s.LastUpdate ?? s.CreateDate)
                .ThenByDescending(s => s.Id)
                .Select(s => s.Revision)
                .FirstOrDefaultAsync();

            return string.IsNullOrWhiteSpace(revision) ? null : revision.Trim();
        }

        private async Task<Dictionary<string, string?>> BuildSpecialNormRevisionMapAsync()
        {
            var norms = await _context.SpecialProcesses
                .AsNoTracking()
                .Where(s => !s.IsDeleted && !string.IsNullOrWhiteSpace(s.SpecialProcess) && !string.IsNullOrWhiteSpace(s.Specification))
                .ToListAsync();

            var map = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
            foreach (var group in norms.GroupBy(n => BuildSpecialNormKey(n.SpecialProcess, n.Specification)))
            {
                var latest = group
                    .OrderByDescending(n => n.LastUpdate ?? n.CreateDate)
                    .ThenByDescending(n => n.Id)
                    .FirstOrDefault();
                if (latest != null && !string.IsNullOrWhiteSpace(latest.Revision))
                {
                    map[group.Key] = latest.Revision.Trim();
                }
            }

            return map;
        }

        private static string? ResolveNormaRevisionFromMap(Dictionary<string, string?> map, string? process, string? norm)
        {
            var key = BuildSpecialNormKey(process, norm);
            if (map.TryGetValue(key, out var revision) && !string.IsNullOrWhiteSpace(revision))
            {
                return revision;
            }

            return null;
        }

        private static string BuildSpecialNormKey(string? process, string? norm)
        {
            var proc = process?.Trim().ToLowerInvariant() ?? string.Empty;
            var spec = norm?.Trim().ToLowerInvariant() ?? string.Empty;
            return $"{proc}::{spec}";
        }
    }
}
