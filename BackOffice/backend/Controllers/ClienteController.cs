using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ClienteController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClienteController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.Cliente
                .Where(c => !c.IsDeleted)
                .OrderBy(c => c.Cliente)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClienteModel payload)
        {
            var name = payload?.Cliente?.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Cliente é obrigatório.");
            }

            var createBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim();
            var updateBy = AuditHelper.ResolveUpdateBy(payload?.UpdateBy, createBy);

            var entity = new ClienteModel
            {
                Cliente = name,
                Endereco = payload?.Endereco?.Trim(),
                CreateBy = createBy,
                UpdateBy = updateBy,
                CreateDate = DateTime.Now,
                LastUpdate = DateTime.Now,
                IsDeleted = false
            };

            _context.Cliente.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cliente criado com sucesso.", cliente = entity });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] ClienteModel payload)
        {
            if (payload == null || payload.Id <= 0)
            {
                return BadRequest("Cliente inválido.");
            }

            var entity = await _context.Cliente.FindAsync(payload.Id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Cliente não encontrado.");
            }

            if (!string.IsNullOrWhiteSpace(payload.Cliente))
            {
                entity.Cliente = payload.Cliente.Trim();
            }

            entity.Endereco = payload.Endereco?.Trim();
            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.UpdateBy = AuditHelper.ResolveUpdateBy(payload.UpdateBy, payload.CreateBy, entity.UpdateBy ?? entity.CreateBy ?? "Sistema");
            entity.LastUpdate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cliente atualizado com sucesso.", cliente = entity });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Cliente.FindAsync(id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Cliente não encontrado.");
            }

            entity.IsDeleted = true;
            entity.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Cliente excluído com sucesso." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var columns = new[] { "Nome", "Endereco" };
            var content = ExcelHelper.CreateTemplate("Clientes", columns);
            return File(content, ExcelHelper.ExcelContentType, "clientes_template.xlsx");
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
                .Select(r => new ClienteModel
                {
                    Cliente = r.Get("Nome") ?? r.Get("Cliente") ?? string.Empty,
                    Endereco = r.Get("Endereco") ?? r.Get("Endereço"),
                    CreateBy = resolvedCreatedBy,
                    UpdateBy = resolvedCreatedBy,
                    CreateDate = now,
                    LastUpdate = now,
                    IsDeleted = false
                })
                .Where(c => !string.IsNullOrWhiteSpace(c.Cliente))
                .ToList();

            result.TotalRows = rows.Count;
            result.Skipped += rows.Count - items.Count;

            if (items.Count == 0)
            {
                return Ok(new { success = true, message = "Nenhum dado válido encontrado.", result });
            }

            var existing = await _context.Cliente
                .Where(c => !c.IsDeleted)
                .ToListAsync();

            var map = existing.ToDictionary(
                c => c.Cliente.Trim(),
                c => c,
                StringComparer.OrdinalIgnoreCase);

            foreach (var item in items)
            {
                if (map.TryGetValue(item.Cliente.Trim(), out var current))
                {
                    var hasChanges = !AreEqual(current.Endereco, item.Endereco);
                    if (!hasChanges)
                    {
                        result.Skipped++;
                        continue;
                    }

                    current.Endereco = item.Endereco;
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
                    _context.Cliente.Add(item);
                    map[item.Cliente.Trim()] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Importação concluída.", result });
        }

        private static bool AreEqual(string? left, string? right)
        {
            return string.Equals(left?.Trim() ?? string.Empty, right?.Trim() ?? string.Empty, StringComparison.OrdinalIgnoreCase);
        }
    }
}
