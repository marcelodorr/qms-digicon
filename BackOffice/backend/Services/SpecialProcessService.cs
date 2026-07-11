using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class SpecialProcessService
    {
        private readonly AppDbContext _context;

        public SpecialProcessService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SpecialProcessModel>> GetAllAsync()
        {
            return await _context.SpecialProcesses
                .Where(x => !x.IsDeleted)
                .ToListAsync();
        }

        public async Task<SpecialProcessModel> CreateAsync(SpecialProcessModel item)
        {
            item.CreateBy = string.IsNullOrWhiteSpace(item.CreateBy) ? "Sistema" : item.CreateBy.Trim();
            item.UpdateBy = AuditHelper.ResolveUpdateBy(item.UpdateBy, item.CreateBy);
            item.CreateDate = DateTime.Now;
            item.LastUpdate = DateTime.Now;
            item.IsDeleted = false;
            _context.SpecialProcesses.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<SpecialProcessModel?> UpdateAsync(SpecialProcessModel item)
        {
            var existing = await _context.SpecialProcesses.FindAsync(item.Id);
            if (existing == null) return null;

            existing.SpecialProcess = item.SpecialProcess;
            existing.Specification = item.Specification;
            existing.Revision = item.Revision;
            existing.Comment = item.Comment;
            if (!string.IsNullOrWhiteSpace(item.CreateBy))
            {
                existing.CreateBy = item.CreateBy.Trim();
            }
            existing.UpdateBy = AuditHelper.ResolveUpdateBy(item.UpdateBy, item.CreateBy, existing.UpdateBy ?? existing.CreateBy ?? "Sistema");
            existing.LastUpdate = DateTime.Now;

            _context.SpecialProcesses.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.SpecialProcesses.FindAsync(id);
            if (existing == null) return false;
            existing.IsDeleted = true;
            _context.SpecialProcesses.Update(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BulkImportResult> ImportAsync(IEnumerable<SpecialProcessModel> itens, string? createdBy)
        {
            var result = new BulkImportResult();
            var list = itens?
                .Where(i => i != null && !string.IsNullOrWhiteSpace(i.SpecialProcess))
                .Select(i => new SpecialProcessModel
                {
                    SpecialProcess = i.SpecialProcess.Trim(),
                    Specification = string.IsNullOrWhiteSpace(i.Specification) ? null : i.Specification.Trim(),
                    Revision = string.IsNullOrWhiteSpace(i.Revision) ? null : i.Revision.Trim(),
                    Comment = string.IsNullOrWhiteSpace(i.Comment) ? null : i.Comment.Trim(),
                    CreateBy = createdBy ?? i.CreateBy ?? "Sistema",
                    UpdateBy = AuditHelper.ResolveUpdateBy(i.UpdateBy, createdBy ?? i.CreateBy),
                    CreateDate = DateTime.Now,
                    LastUpdate = DateTime.Now,
                    IsDeleted = false,
                })
                .ToList() ?? new List<SpecialProcessModel>();

            if (list.Count == 0) return result;

            var comparer = StringComparer.OrdinalIgnoreCase;
            var keySet = new HashSet<string>(list.Select(i => BuildKey(i.SpecialProcess, i.Specification)), comparer);
            var existing = await _context.SpecialProcesses
                .Where(s => !s.IsDeleted)
                .ToListAsync();
            var map = existing
                .Select(s => new { Key = BuildKey(s.SpecialProcess, s.Specification), Entity = s })
                .Where(x => keySet.Contains(x.Key))
                .ToDictionary(x => x.Key, x => x.Entity, comparer);

            foreach (var item in list)
            {
                var key = BuildKey(item.SpecialProcess, item.Specification);
                if (map.TryGetValue(key, out var current))
                {
                    current.Revision = item.Revision;
                    current.Comment = item.Comment;
                    if (!string.IsNullOrWhiteSpace(createdBy))
                    {
                        current.UpdateBy = createdBy!;
                    }
                    current.LastUpdate = DateTime.Now;
                    if (!string.IsNullOrWhiteSpace(createdBy))
                    {
                        current.CreateBy = createdBy!;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.SpecialProcesses.Add(item);
                    map[key] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }

        private static string BuildKey(string specialProcess, string? specification)
        {
            var proc = specialProcess?.Trim().ToUpperInvariant() ?? string.Empty;
            var spec = specification?.Trim().ToUpperInvariant() ?? string.Empty;
            return $"{proc}|{spec}";
        }
    }
}
