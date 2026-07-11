using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NormaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static readonly object ColumnLengthLock = new();
        private static Dictionary<string, int?>? ColumnLengths;

        public NormaController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<Dictionary<string, int?>> GetColumnLengthsAsync()
        {
            if (ColumnLengths != null)
            {
                return ColumnLengths;
            }

            var result = new Dictionary<string, int?>(StringComparer.OrdinalIgnoreCase);
            var connection = _context.Database.GetDbConnection();
            var shouldClose = connection.State == ConnectionState.Closed;

            try
            {
                if (shouldClose)
                {
                    await connection.OpenAsync();
                }

                using var command = connection.CreateCommand();
                command.CommandText = "SELECT COLUMN_NAME, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TechnicalStandards'";
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var name = reader.GetString(0);
                    int? maxLength = reader.IsDBNull(1) ? null : reader.GetInt32(1);
                    if (maxLength <= 0)
                    {
                        maxLength = null;
                    }
                    result[name] = maxLength;
                }
            }
            catch
            {
                result.Clear();
            }
            finally
            {
                if (shouldClose)
                {
                    await connection.CloseAsync();
                }
            }

            lock (ColumnLengthLock)
            {
                ColumnLengths ??= result;
            }

            return ColumnLengths;
        }

        private static string Truncate(string? value, int? maxLength)
        {
            var trimmed = value?.Trim() ?? string.Empty;
            if (maxLength.HasValue && maxLength.Value > 0 && trimmed.Length > maxLength.Value)
            {
                return trimmed.Substring(0, maxLength.Value);
            }
            return trimmed;
        }

        private static int? ResolveLength(Dictionary<string, int?> lengths, string column)
        {
            return lengths.TryGetValue(column, out var length) ? length : null;
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
            var lengths = await GetColumnLengthsAsync();
            var client = Truncate(payload?.Cliente, ResolveLength(lengths, "Cliente"));
            var process = Truncate(payload?.Processo, ResolveLength(lengths, "Processo"));
            var standard = Truncate(payload?.Norma, ResolveLength(lengths, "Norma"));
            var revision = Truncate(payload?.Revision, ResolveLength(lengths, "Revision"));

            if (string.IsNullOrWhiteSpace(client) ||
                string.IsNullOrWhiteSpace(process))
            {
                return BadRequest("Cliente e Processo são obrigatórios.");
            }

            standard = string.IsNullOrWhiteSpace(standard) ? "-" : standard;
            revision = string.IsNullOrWhiteSpace(revision) ? "-" : revision;

            var createBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : Truncate(payload.CreateBy, ResolveLength(lengths, "CreateBy"));
            var updateBy = AuditHelper.ResolveUpdateBy(payload?.UpdateBy, createBy);
            updateBy = Truncate(updateBy, ResolveLength(lengths, "UpdateBy"));

            var entity = new NormaModel
            {
                Cliente = client,
                Processo = process,
                Norma = standard,
                Revision = revision,
                CreateBy = createBy,
                UpdateBy = updateBy,
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

            var lengths = await GetColumnLengthsAsync();

            if (!string.IsNullOrWhiteSpace(payload.Cliente))
            {
                entity.Cliente = Truncate(payload.Cliente, ResolveLength(lengths, "Cliente"));
            }

            if (!string.IsNullOrWhiteSpace(payload.Processo))
            {
                entity.Processo = Truncate(payload.Processo, ResolveLength(lengths, "Processo"));
            }

            if (payload.Norma != null)
            {
                var normalizedNorma = Truncate(payload.Norma, ResolveLength(lengths, "Norma"));
                entity.Norma = string.IsNullOrWhiteSpace(normalizedNorma) ? "-" : normalizedNorma;
            }

            if (payload.Revision != null)
            {
                var normalizedRevision = Truncate(payload.Revision, ResolveLength(lengths, "Revision"));
                entity.Revision = string.IsNullOrWhiteSpace(normalizedRevision) ? "-" : normalizedRevision;
            }

            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = Truncate(payload.CreateBy, ResolveLength(lengths, "CreateBy"));
            }
            var resolvedUpdateBy = AuditHelper.ResolveUpdateBy(payload.UpdateBy, payload.CreateBy, entity.UpdateBy ?? entity.CreateBy ?? "Sistema");
            entity.UpdateBy = Truncate(resolvedUpdateBy, ResolveLength(lengths, "UpdateBy"));
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
            var lengths = await GetColumnLengthsAsync();
            var trimmedCreatedBy = string.IsNullOrWhiteSpace(createdBy) ? null : createdBy.Trim();
            var resolvedCreatedBy = Truncate(trimmedCreatedBy ?? "Sistema", ResolveLength(lengths, "CreateBy"));
            var result = new BulkImportResult();

            var items = rows
                .Select(r =>
                {
                    var client = r.Get("Cliente") ?? r.Get("Client");
                    var process = r.Get("Processo") ?? r.Get("Operacao") ?? r.Get("CodigoOperacao") ?? r.Get("Operation");
                    var standard = r.Get("Norma") ?? r.Get("Standard");
                    var revision = r.Get("Revisao") ?? r.Get("Revision");
                    var clientUpper = string.IsNullOrWhiteSpace(client) ? client : client.Trim().ToUpperInvariant();

                    return new NormaModel
                    {
                        Cliente = Truncate(clientUpper, ResolveLength(lengths, "Cliente")),
                        Processo = Truncate(process, ResolveLength(lengths, "Processo")),
                        Norma = string.IsNullOrWhiteSpace(standard) ? "-" : Truncate(standard, ResolveLength(lengths, "Norma")),
                        Revision = string.IsNullOrWhiteSpace(revision) ? "-" : Truncate(revision, ResolveLength(lengths, "Revision")),
                        CreateBy = resolvedCreatedBy,
                        UpdateBy = Truncate(resolvedCreatedBy, ResolveLength(lengths, "UpdateBy")),
                        CreateDate = now,
                        LastUpdated = now,
                        IsDeleted = false
                    };
                })
                .Where(n =>
                    !string.IsNullOrWhiteSpace(n.Cliente) &&
                    !string.IsNullOrWhiteSpace(n.Processo))
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
