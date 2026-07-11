using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseOrderController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.PurchaseOrders
                .Where(p => !p.IsDeleted)
                .OrderBy(p => p.PONumber)
                .ThenBy(p => p.Item)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseOrderModel payload)
        {
            var poNumber = payload?.PONumber?.Trim();
            var item = payload?.Item?.Trim() ?? string.Empty;
            var status = string.IsNullOrWhiteSpace(payload?.Status) ? "Em Processo" : payload.Status.Trim();

            if (string.IsNullOrWhiteSpace(poNumber) || payload?.ClienteId <= 0)
            {
                return BadRequest("Número da PO e cliente são obrigatórios.");
            }

            var client = await _context.Cliente
                .FirstOrDefaultAsync(c => c.Id == payload.ClienteId && !c.IsDeleted);

            if (client == null)
            {
                return BadRequest("Cliente inválido.");
            }

            var exists = await _context.PurchaseOrders.AnyAsync(p =>
                !p.IsDeleted &&
                p.PONumber == poNumber &&
                p.Item == item &&
                p.ClienteId == client.Id);

            if (exists)
            {
                return BadRequest("Já existe uma PO com o mesmo número, item e cliente.");
            }

            var entity = new PurchaseOrderModel
            {
                PONumber = poNumber,
                ClienteId = client.Id,
                ClienteNome = client.Cliente?.Trim(),
                Item = item,
                Status = status,
                Comments = string.IsNullOrWhiteSpace(payload?.Comments) ? null : payload.Comments.Trim(),
                CreateBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim(),
                CreateDate = DateTime.Now,
                LastUpdate = DateTime.Now,
                IsDeleted = false
            };

            _context.PurchaseOrders.Add(entity);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "PO criada com sucesso.", purchaseOrder = entity });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] PurchaseOrderModel payload)
        {
            if (payload == null || payload.Id <= 0)
            {
                return BadRequest("PO inválida.");
            }

            var entity = await _context.PurchaseOrders.FindAsync(payload.Id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("PO não encontrada.");
            }

            var nextPoNumber = string.IsNullOrWhiteSpace(payload.PONumber) ? entity.PONumber : payload.PONumber.Trim();
            var nextItem = payload.Item == null ? entity.Item : payload.Item.Trim();
            if (string.IsNullOrWhiteSpace(nextItem))
            {
                nextItem = string.Empty;
            }

            var nextClientId = payload.ClienteId > 0 ? payload.ClienteId : entity.ClienteId;
            if (nextClientId <= 0)
            {
                return BadRequest("Cliente inválido.");
            }

            var client = await _context.Cliente
                .FirstOrDefaultAsync(c => c.Id == nextClientId && !c.IsDeleted);

            if (client == null)
            {
                return BadRequest("Cliente inválido.");
            }

            var exists = await _context.PurchaseOrders.AnyAsync(p =>
                !p.IsDeleted &&
                p.Id != entity.Id &&
                p.PONumber == nextPoNumber &&
                p.Item == nextItem &&
                p.ClienteId == nextClientId);

            if (exists)
            {
                return BadRequest("Já existe uma PO com o mesmo número, item e cliente.");
            }

            entity.PONumber = nextPoNumber;
            entity.Item = nextItem;
            entity.ClienteId = nextClientId;
            entity.ClienteNome = client.Cliente?.Trim();

            if (!string.IsNullOrWhiteSpace(payload.Status))
            {
                entity.Status = payload.Status.Trim();
            }

            entity.Comments = string.IsNullOrWhiteSpace(payload.Comments) ? null : payload.Comments.Trim();
            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.LastUpdate = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "PO atualizada com sucesso.", purchaseOrder = entity });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.PurchaseOrders.FindAsync(id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("PO não encontrada.");
            }

            entity.IsDeleted = true;
            entity.LastUpdate = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "PO excluída com sucesso." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var columns = new[] { "PONumber", "ClienteId", "Cliente", "Item", "Status", "Comentarios" };
            var content = ExcelHelper.CreateTemplate("PurchaseOrders", columns);
            return File(content, ExcelHelper.ExcelContentType, "purchase_orders_template.xlsx");
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

            var clients = await _context.Cliente
                .Where(c => !c.IsDeleted)
                .ToListAsync();

            var clientsById = clients.ToDictionary(c => c.Id);
            var clientsByName = clients
                .Where(c => !string.IsNullOrWhiteSpace(c.Cliente))
                .ToDictionary(c => c.Cliente.Trim(), c => c, StringComparer.OrdinalIgnoreCase);

            var items = new List<PurchaseOrderModel>();

            foreach (var row in rows)
            {
                var poNumber = row.Get("PONumber") ?? row.Get("PO") ?? row.Get("NumeroPO") ?? row.Get("Numero");
                var item = row.Get("Item") ?? row.Get("ItemPO") ?? row.Get("ItemPedido");
                var status = row.Get("Status");
                var comments = row.Get("Comentarios") ?? row.Get("Comments");
                var clientIdRaw = row.Get("ClienteId") ?? row.Get("ClientId");
                var clientName = row.Get("Cliente") ?? row.Get("Client");

                if (string.IsNullOrWhiteSpace(poNumber))
                {
                    result.Skipped++;
                    continue;
                }

                var clientId = 0;
                if (!string.IsNullOrWhiteSpace(clientIdRaw) && int.TryParse(clientIdRaw, out var parsed))
                {
                    clientId = parsed;
                }

                if (clientId <= 0 && !string.IsNullOrWhiteSpace(clientName))
                {
                    if (clientsByName.TryGetValue(clientName.Trim(), out var client))
                    {
                        clientId = client.Id;
                    }
                }

                if (clientId <= 0 || !clientsById.TryGetValue(clientId, out var resolvedClient))
                {
                    result.AddError($"Cliente não encontrado para a PO {poNumber}.");
                    result.Skipped++;
                    continue;
                }

                items.Add(new PurchaseOrderModel
                {
                    PONumber = poNumber.Trim(),
                    ClienteId = resolvedClient.Id,
                    ClienteNome = resolvedClient.Cliente?.Trim(),
                    Item = item?.Trim() ?? string.Empty,
                    Status = string.IsNullOrWhiteSpace(status) ? "Em Processo" : status.Trim(),
                    Comments = string.IsNullOrWhiteSpace(comments) ? null : comments.Trim(),
                    CreateBy = trimmedCreatedBy ?? "Sistema",
                    CreateDate = now,
                    LastUpdate = now,
                    IsDeleted = false
                });
            }

            result.TotalRows = rows.Count;

            if (items.Count == 0)
            {
                return Ok(new { success = true, message = "Nenhum dado válido encontrado.", result });
            }

            var existing = await _context.PurchaseOrders
                .Where(p => !p.IsDeleted)
                .ToListAsync();

            var map = existing
                .Where(p => !string.IsNullOrWhiteSpace(p.PONumber))
                .GroupBy(p => BuildKey(p.PONumber, p.ClienteId))
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(p => p.LastUpdate ?? p.CreateDate)
                          .ThenByDescending(p => p.Id)
                          .First(),
                    StringComparer.OrdinalIgnoreCase);

            foreach (var item in items)
            {
                var key = BuildKey(item.PONumber, item.ClienteId);
                if (map.TryGetValue(key, out var current))
                {
                    var hasChanges =
                        !AreEqual(current.Item, item.Item) ||
                        !AreEqual(current.Status, item.Status) ||
                        !AreEqual(current.Comments, item.Comments) ||
                        !AreEqual(current.ClienteNome, item.ClienteNome);

                    if (!hasChanges)
                    {
                        result.Skipped++;
                        continue;
                    }

                    current.Item = item.Item;
                    current.Status = item.Status;
                    current.Comments = item.Comments;
                    current.ClienteNome = item.ClienteNome;
                    current.LastUpdate = now;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.CreateBy = trimmedCreatedBy;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.PurchaseOrders.Add(item);
                    map[key] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Importação concluída.", result });
        }

        private static string BuildKey(string poNumber, int clientId)
        {
            return $"{NormalizeValue(poNumber).ToLowerInvariant()}::{clientId}";
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
