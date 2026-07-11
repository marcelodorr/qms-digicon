using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecialProcessController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SpecialProcessController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.SpecialProcesses
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.SpecialProcess)
                .ThenBy(s => s.Specification)
                .ThenBy(s => s.Revision)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SpecialProcessModel payload)
        {
            var process = payload?.SpecialProcess?.Trim();
            var specification = payload?.Specification?.Trim();
            var revision = payload?.Revision?.Trim();

            if (string.IsNullOrWhiteSpace(process) ||
                string.IsNullOrWhiteSpace(specification) ||
                string.IsNullOrWhiteSpace(revision))
            {
                return BadRequest("Processo Especial, Especificação e Revisão são obrigatórios.");
            }

            var entity = new SpecialProcessModel
            {
                SpecialProcess = process,
                Specification = specification,
                Revision = revision,
                Comment = string.IsNullOrWhiteSpace(payload?.Comment) ? null : payload.Comment.Trim(),
                CreateBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim(),
                CreateDate = DateTime.Now,
                LastUpdate = DateTime.Now,
                IsDeleted = false
            };

            _context.SpecialProcesses.Add(entity);
            await _context.SaveChangesAsync();
            await UpdateParametersRevisionAsync(entity.SpecialProcess, entity.Specification, entity.Revision, payload?.CreateBy);

            return Ok(new { success = true, message = "Norma de processo especial criada com sucesso.", specialProcess = entity });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] SpecialProcessModel payload)
        {
            if (payload == null || payload.Id <= 0)
            {
                return BadRequest("Norma de processo especial inválida.");
            }

            var entity = await _context.SpecialProcesses.FindAsync(payload.Id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Norma de processo especial não encontrada.");
            }

            if (!string.IsNullOrWhiteSpace(payload.SpecialProcess))
            {
                entity.SpecialProcess = payload.SpecialProcess.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.Specification))
            {
                entity.Specification = payload.Specification.Trim();
            }

            if (!string.IsNullOrWhiteSpace(payload.Revision))
            {
                entity.Revision = payload.Revision.Trim();
            }

            entity.Comment = string.IsNullOrWhiteSpace(payload.Comment) ? null : payload.Comment.Trim();
            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.LastUpdate = DateTime.Now;

            await _context.SaveChangesAsync();
            await UpdateParametersRevisionAsync(entity.SpecialProcess, entity.Specification, entity.Revision, payload?.CreateBy);

            return Ok(new { success = true, message = "Norma de processo especial atualizada com sucesso.", specialProcess = entity });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.SpecialProcesses.FindAsync(id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Norma de processo especial não encontrada.");
            }

            entity.IsDeleted = true;
            entity.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Norma de processo especial excluída com sucesso." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var columns = new[] { "ProcessoEspecial", "Especificacao", "Revisao", "Comentario" };
            var content = ExcelHelper.CreateTemplate("NormasProcessoEspecial", columns);
            return File(content, ExcelHelper.ExcelContentType, "template_normas_especiais.xlsx");
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
                    var process = r.Get("ProcessoEspecial") ?? r.Get("Processo") ?? r.Get("SpecialProcess");
                    var specification = r.Get("Especificacao") ?? r.Get("Specification");
                    var revision = r.Get("Revisao") ?? r.Get("Revision");
                    var comment = r.Get("Comentario") ?? r.Get("Comment");

                    return new SpecialProcessModel
                    {
                        SpecialProcess = process?.Trim() ?? string.Empty,
                        Specification = specification?.Trim(),
                        Revision = revision?.Trim(),
                        Comment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim(),
                        CreateBy = trimmedCreatedBy ?? "Sistema",
                        CreateDate = now,
                        LastUpdate = now,
                        IsDeleted = false
                    };
                })
                .Where(s =>
                    !string.IsNullOrWhiteSpace(s.SpecialProcess) &&
                    !string.IsNullOrWhiteSpace(s.Specification) &&
                    !string.IsNullOrWhiteSpace(s.Revision))
                .ToList();

            result.TotalRows = rows.Count;
            result.Skipped += rows.Count - items.Count;

            if (items.Count == 0)
            {
                return Ok(new { success = true, message = "Nenhum dado válido encontrado.", result });
            }

            var existing = await _context.SpecialProcesses
                .Where(s => !s.IsDeleted)
                .ToListAsync();

            var map = existing
                .Where(s => !string.IsNullOrWhiteSpace(s.SpecialProcess) &&
                            !string.IsNullOrWhiteSpace(s.Specification))
                .GroupBy(s => BuildKey(s.SpecialProcess, s.Specification))
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(s => s.LastUpdate ?? s.CreateDate)
                          .ThenByDescending(s => s.Id)
                          .First(),
                    StringComparer.OrdinalIgnoreCase);

            var revisionUpdates = new List<SpecialProcessModel>();

            foreach (var item in items)
            {
                var key = BuildKey(item.SpecialProcess, item.Specification);
                if (map.TryGetValue(key, out var current))
                {
                    var revisionChanged = !AreEqual(current.Revision, item.Revision);
                    var commentChanged = !AreEqual(current.Comment, item.Comment);

                    if (!revisionChanged && !commentChanged)
                    {
                        result.Skipped++;
                        continue;
                    }

                    current.Revision = item.Revision;
                    current.Comment = item.Comment;
                    current.LastUpdate = now;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.CreateBy = trimmedCreatedBy;
                    }
                    result.Updated++;
                    if (revisionChanged)
                    {
                        revisionUpdates.Add(current);
                    }
                }
                else
                {
                    _context.SpecialProcesses.Add(item);
                    map[key] = item;
                    result.Inserted++;
                    revisionUpdates.Add(item);
                }
            }

            await _context.SaveChangesAsync();
            await UpdateParametersRevisionForImportAsync(revisionUpdates, trimmedCreatedBy);

            return Ok(new { success = true, message = "Importação concluída.", result });
        }

        private static string BuildKey(string? process, string? specification)
        {
            return $"{NormalizeValue(process).ToLowerInvariant()}::{NormalizeValue(specification).ToLowerInvariant()}";
        }

        private static string NormalizeValue(string? value)
        {
            return value?.Trim() ?? string.Empty;
        }

        private static bool AreEqual(string? left, string? right)
        {
            return string.Equals(NormalizeValue(left), NormalizeValue(right), StringComparison.OrdinalIgnoreCase);
        }

        private async Task UpdateParametersRevisionAsync(string? process, string? specification, string? revision, string? updatedBy)
        {
            if (string.IsNullOrWhiteSpace(process) || string.IsNullOrWhiteSpace(specification) || string.IsNullOrWhiteSpace(revision))
            {
                return;
            }

            var trimmedProcess = process.Trim();
            var trimmedSpecification = specification.Trim();
            var trimmedRevision = revision.Trim();
            var now = DateTime.Now;

            var parameters = await _context.Parameters
                .Where(p => !p.IsDeleted && p.Processo == trimmedProcess && p.Norma == trimmedSpecification)
                .ToListAsync();

            if (parameters.Count == 0)
            {
                return;
            }

            foreach (var parameter in parameters)
            {
                parameter.NormaRevision = trimmedRevision;
                parameter.LastUpdate = now;
                if (!string.IsNullOrWhiteSpace(updatedBy))
                {
                    parameter.CreateBy = updatedBy.Trim();
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task UpdateParametersRevisionForImportAsync(IEnumerable<SpecialProcessModel> items, string? updatedBy)
        {
            var revisionMap = new Dictionary<string, (string Process, string Specification, string Revision)>(StringComparer.OrdinalIgnoreCase);

            foreach (var item in items)
            {
                if (string.IsNullOrWhiteSpace(item.SpecialProcess) ||
                    string.IsNullOrWhiteSpace(item.Specification) ||
                    string.IsNullOrWhiteSpace(item.Revision))
                {
                    continue;
                }

                var process = item.SpecialProcess.Trim();
                var specification = item.Specification.Trim();
                var revision = item.Revision.Trim();
                var key = $"{process.ToLowerInvariant()}::{specification.ToLowerInvariant()}";
                revisionMap[key] = (process, specification, revision);
            }

            foreach (var entry in revisionMap.Values)
            {
                await UpdateParametersRevisionAsync(entry.Process, entry.Specification, entry.Revision, updatedBy);
            }
        }
    }
}
