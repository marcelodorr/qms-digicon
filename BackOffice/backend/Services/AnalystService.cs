using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class AnalystService
    {
        private readonly AppDbContext _context;

        public AnalystService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AnalystModel>> GetAllAsync()
        {
            return await _context.Analysts
                .Where(a => !a.IsDeleted)
                .AsNoTracking()
                .OrderBy(a => a.Analyst)
                .ToListAsync();
        }

        public async Task<AnalystModel?> GetByIdAsync(int id)
        {
            return await _context.Analysts
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted);
        }

        public async Task<AnalystModel> CreateAsync(AnalystModel model)
        {
            model.Analyst = model.Analyst?.Trim() ?? string.Empty;
            model.Email = string.IsNullOrWhiteSpace(model.Email) ? null : model.Email.Trim();
            model.CreateBy = string.IsNullOrWhiteSpace(model.CreateBy) ? "Sistema" : model.CreateBy.Trim();
            model.UpdateBy = AuditHelper.ResolveUpdateBy(model.UpdateBy, model.CreateBy);
            model.CreateDate = DateTime.Now;
            model.LastUpdate = DateTime.Now;
            model.IsDeleted = false;
            _context.Analysts.Add(model);
            await _context.SaveChangesAsync();
            return model;
        }

        public async Task<AnalystModel?> UpdateAsync(AnalystModel model)
        {
            var existing = await _context.Analysts.FirstOrDefaultAsync(a => a.Id == model.Id);
            if (existing == null || existing.IsDeleted) return null;

            existing.Analyst = model.Analyst?.Trim() ?? existing.Analyst;
            existing.Email = string.IsNullOrWhiteSpace(model.Email) ? null : model.Email.Trim();
            if (model.Signature != null)
            {
                existing.Signature = model.Signature;
            }
            if (!string.IsNullOrWhiteSpace(model.CreateBy))
            {
                existing.CreateBy = model.CreateBy.Trim();
            }
            existing.UpdateBy = AuditHelper.ResolveUpdateBy(model.UpdateBy, model.CreateBy, existing.UpdateBy ?? existing.CreateBy ?? "Sistema");
            existing.LastUpdate = DateTime.Now;

            _context.Analysts.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.Analysts.FirstOrDefaultAsync(a => a.Id == id);
            if (existing == null || existing.IsDeleted) return false;
            existing.IsDeleted = true;
            existing.LastUpdate = DateTime.Now;
            _context.Analysts.Update(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BulkImportResult> ImportAsync(IEnumerable<AnalystModel> itens, string? createdBy)
        {
            var result = new BulkImportResult();
            var list = itens?
                .Where(i => i != null && !string.IsNullOrWhiteSpace(i.Analyst))
                .Select(i => new AnalystModel
                {
                    Analyst = i.Analyst.Trim(),
                    Email = string.IsNullOrWhiteSpace(i.Email) ? null : i.Email.Trim(),
                    Signature = string.IsNullOrWhiteSpace(i.Signature) ? null : i.Signature,
                    CreateBy = createdBy ?? i.CreateBy ?? "Sistema",
                    UpdateBy = AuditHelper.ResolveUpdateBy(i.UpdateBy, createdBy ?? i.CreateBy),
                    CreateDate = DateTime.Now,
                    LastUpdate = DateTime.Now,
                    IsDeleted = false,
                })
                .ToList() ?? new List<AnalystModel>();

            if (list.Count == 0)
            {
                return result;
            }

            var comparer = StringComparer.OrdinalIgnoreCase;
            var names = new HashSet<string>(list.Select(l => l.Analyst), comparer);
            var existing = await _context.Analysts
                .Where(a => !a.IsDeleted)
                .ToListAsync();
            var map = existing
                .Where(a => !string.IsNullOrWhiteSpace(a.Analyst) && names.Contains(a.Analyst))
                .ToDictionary(a => a.Analyst!, comparer);

            foreach (var item in list)
            {
                if (map.TryGetValue(item.Analyst, out var current))
                {
                    current.Email = item.Email;
                    if (!string.IsNullOrWhiteSpace(item.Signature))
                    {
                        current.Signature = item.Signature;
                    }
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
                    _context.Analysts.Add(item);
                    map[item.Analyst] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }
    }
}
