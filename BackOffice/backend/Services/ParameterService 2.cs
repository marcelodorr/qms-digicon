using System;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ParameterService
    {
        private readonly AppDbContext _context;

        public ParameterService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ParameterModel>> GetAllAsync()
        {
            var items = await _context.Parameters.Where(p => !p.IsDeleted).ToListAsync();
            foreach (var item in items)
            {
                item.Condition = NormalizeCondition(item.Processo, item.Condition);
            }
            return items;
        }

        public async Task<List<string>> GetPartNumbersAsync()
        {
            return await _context.Parameters
                .Where(p => !p.IsDeleted && !string.IsNullOrWhiteSpace(p.PartNumber))
                .Select(p => p.PartNumber!)
                .Distinct()
                .OrderBy(p => p)
                .ToListAsync();
        }

        public async Task<List<string>> GetProcessosByPartNumberAsync(string partNumber)
        {
            if (string.IsNullOrWhiteSpace(partNumber))
                return new List<string>();

            var normalized = partNumber.Trim();

            return await _context.Parameters
                .Where(p => !p.IsDeleted && p.PartNumber == normalized && !string.IsNullOrWhiteSpace(p.Processo))
                .Select(p => p.Processo!)
                .Distinct()
                .OrderBy(p => p)
                .ToListAsync();
        }

        public async Task<List<string>> GetNormasByPartNumberAndProcessoAsync(string partNumber, string processo)
        {
            if (string.IsNullOrWhiteSpace(partNumber) || string.IsNullOrWhiteSpace(processo))
                return new List<string>();

            var pn = partNumber.Trim();
            var proc = processo.Trim();

            return await _context.Parameters
                .Where(p => !p.IsDeleted && p.PartNumber == pn && p.Processo == proc && !string.IsNullOrWhiteSpace(p.Norma))
                .Select(p => p.Norma!)
                .Distinct()
                .OrderBy(n => n)
                .ToListAsync();
        }

        public async Task<ParameterModel> CreateAsync(ParameterModel item)
        {
            item.CreateBy = string.IsNullOrWhiteSpace(item.CreateBy) ? "Sistema" : item.CreateBy.Trim();
            item.CreateDate = DateTime.Now;
            item.LastUpdate = DateTime.Now;
            item.IsDeleted = false;
            item.Condition = NormalizeCondition(item.Processo, item.Condition);
            _context.Parameters.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<ParameterModel?> UpdateAsync(ParameterModel item)
        {
            var existing = await _context.Parameters.FindAsync(item.Id);
            if (existing == null) return null;

            existing.PartNumber = item.PartNumber;
            existing.Processo = item.Processo;
            existing.Norma = item.Norma;
            existing.Parameter = item.Parameter;
            existing.Condition = NormalizeCondition(existing.Processo, item.Condition);
            if (!string.IsNullOrWhiteSpace(item.CreateBy))
            {
                existing.CreateBy = item.CreateBy.Trim();
            }
            existing.LastUpdate = DateTime.Now;

            _context.Parameters.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        private static string NormalizeCondition(string? processo, string? condition)
        {
            if (!string.IsNullOrWhiteSpace(processo) && string.Equals(processo, "Heat Treating", StringComparison.OrdinalIgnoreCase))
                return string.IsNullOrWhiteSpace(condition) ? "-" : condition;

            return "-";
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.Parameters.FindAsync(id);
            if (existing == null) return false;
            existing.IsDeleted = true;
            _context.Parameters.Update(existing);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BulkImportResult> ImportAsync(IEnumerable<ParameterModel> itens, string? createdBy)
        {
            var result = new BulkImportResult();
            var list = itens?
                .Where(i => i != null && !string.IsNullOrWhiteSpace(i.PartNumber) && !string.IsNullOrWhiteSpace(i.Processo) && !string.IsNullOrWhiteSpace(i.Norma) && !string.IsNullOrWhiteSpace(i.Parameter))
                .Select(i => new ParameterModel
                {
                    PartNumber = i.PartNumber.Trim(),
                    Processo = i.Processo.Trim(),
                    Norma = i.Norma.Trim(),
                    Parameter = i.Parameter.Trim(),
                    Condition = NormalizeCondition(i.Processo, string.IsNullOrWhiteSpace(i.Condition) ? "-" : i.Condition.Trim()),
                    CreateBy = createdBy ?? i.CreateBy ?? "Sistema",
                    CreateDate = DateTime.Now,
                    LastUpdate = DateTime.Now,
                    IsDeleted = false,
                })
                .ToList() ?? new List<ParameterModel>();

            if (list.Count == 0)
            {
                return result;
            }

            var comparer = StringComparer.OrdinalIgnoreCase;
            var keySet = new HashSet<string>(list.Select(item => BuildKey(item.PartNumber, item.Processo, item.Norma, item.Parameter)), comparer);

            var existing = await _context.Parameters
                .Where(p => !p.IsDeleted)
                .ToListAsync();
            var map = existing
                .Select(p => new { Key = BuildKey(p.PartNumber, p.Processo, p.Norma, p.Parameter), Entity = p })
                .Where(x => keySet.Contains(x.Key))
                .ToDictionary(x => x.Key, x => x.Entity, comparer);

            foreach (var item in list)
            {
                var key = BuildKey(item.PartNumber, item.Processo, item.Norma, item.Parameter);
                if (map.TryGetValue(key, out var current))
                {
                    current.Condition = NormalizeCondition(current.Processo, item.Condition);
                    current.LastUpdate = DateTime.Now;
                    if (!string.IsNullOrWhiteSpace(createdBy))
                    {
                        current.CreateBy = createdBy!;
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
            return result;
        }

        private static string BuildKey(string? partNumber, string? processo, string? norma, string? parameter)
        {
            var pn = partNumber?.Trim().ToUpperInvariant() ?? string.Empty;
            var proc = processo?.Trim().ToUpperInvariant() ?? string.Empty;
            var norm = norma?.Trim().ToUpperInvariant() ?? string.Empty;
            var param = parameter?.Trim().ToUpperInvariant() ?? string.Empty;
            return $"{pn}|{proc}|{norm}|{param}";
        }
    }
}
