using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class PartNumberService
    {
        private readonly AppDbContext _context;

        public PartNumberService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<PartNumberModel>> GetPartNumbersAsync()
        {
            return await _context.PartNumbers
                .Where(p => !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<PartNumberModel> CreatePartNumberAsync(PartNumberModel part)
        {
            part.CreateBy = string.IsNullOrWhiteSpace(part.CreateBy) ? "Sistema" : part.CreateBy.Trim();
            part.UpdateBy = AuditHelper.ResolveUpdateBy(part.UpdateBy, part.CreateBy);
            part.CreateDate = DateTime.Now;
            part.LastUpdated = DateTime.Now;
            part.IsDeleted = false;
            _context.PartNumbers.Add(part);
            await _context.SaveChangesAsync();
            return part;
        }

        public async Task<PartNumberModel?> UpdatePartNumberAsync(PartNumberModel part)
        {
            var existing = await _context.PartNumbers.FindAsync(part.Id);
            if (existing == null)
            {
                return null;
            }

            existing.PartNumber = part.PartNumber;
            existing.Descricao = part.Descricao;
            existing.Revision = part.Revision;
            existing.DrawingRevision = part.DrawingRevision;
            if (!string.IsNullOrWhiteSpace(part.CreateBy))
            {
                existing.CreateBy = part.CreateBy.Trim();
            }
            existing.UpdateBy = AuditHelper.ResolveUpdateBy(part.UpdateBy, part.CreateBy, existing.UpdateBy ?? existing.CreateBy ?? "Sistema");
            existing.LastUpdated = DateTime.Now;

            _context.PartNumbers.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeletePartNumberAsync(int id)
        {
            var existing = await _context.PartNumbers.FindAsync(id);
            if (existing == null)
            {
                return false;
            }
            existing.IsDeleted = true;
            _context.PartNumbers.Update(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BulkImportResult> ImportAsync(IEnumerable<PartNumberModel> itens, string? createdBy)
        {
            var result = new BulkImportResult();
            var list = itens?
                .Where(i => i != null && !string.IsNullOrWhiteSpace(i.PartNumber))
                .Select(i => new PartNumberModel
                {
                    PartNumber = i.PartNumber.Trim(),
                    Descricao = string.IsNullOrWhiteSpace(i.Descricao) ? string.Empty : i.Descricao.Trim(),
                    Revision = string.IsNullOrWhiteSpace(i.Revision) ? null : i.Revision.Trim(),
                    DrawingRevision = string.IsNullOrWhiteSpace(i.DrawingRevision) ? null : i.DrawingRevision.Trim(),
                    CreateBy = createdBy ?? i.CreateBy ?? "Sistema",
                    UpdateBy = AuditHelper.ResolveUpdateBy(i.UpdateBy, createdBy ?? i.CreateBy),
                    CreateDate = DateTime.Now,
                    LastUpdated = DateTime.Now,
                    IsDeleted = false,
                })
                .ToList() ?? new List<PartNumberModel>();

            if (list.Count == 0)
            {
                return result;
            }

            var comparer = StringComparer.OrdinalIgnoreCase;
            var keySet = new HashSet<string>(list.Select(l => l.PartNumber), comparer);
            var existing = await _context.PartNumbers
                .Where(p => !p.IsDeleted)
                .ToListAsync();
            var map = existing
                .Where(p => !string.IsNullOrWhiteSpace(p.PartNumber) && keySet.Contains(p.PartNumber))
                .ToDictionary(p => p.PartNumber!, comparer);

            foreach (var item in list)
            {
                if (map.TryGetValue(item.PartNumber, out var current))
                {
                    current.Descricao = item.Descricao;
                    current.Revision = item.Revision;
                    current.DrawingRevision = item.DrawingRevision;
                    if (!string.IsNullOrWhiteSpace(createdBy))
                    {
                        current.UpdateBy = createdBy!;
                    }
                    current.LastUpdated = DateTime.Now;
                    if (!string.IsNullOrWhiteSpace(createdBy))
                    {
                        current.CreateBy = createdBy!;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.PartNumbers.Add(item);
                    map[item.PartNumber] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }
    }
}
