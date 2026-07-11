using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class NormaService
    {
        private readonly AppDbContext _context;

        public NormaService(AppDbContext context)
        {
            _context = context;
        }

        // Buscar todas as normas não deletadas
        public async Task<List<NormaModel>> GetNormasAsync()
        {
            return await _context.TechnicalStandards
                .Where(n => !n.IsDeleted)
                .OrderBy(n => n.Cliente)
                .ThenBy(n => n.Processo)
                .ThenBy(n => n.Norma)
                .Select(n => new NormaModel
                {
                    Id = n.Id,
                    Cliente = n.Cliente,
                    Processo = n.Processo,
                    Norma = n.Norma,
                    Revision = n.Revision,
                    CreateBy = n.CreateBy,
                    CreateDate = n.CreateDate,
                    LastUpdated = n.LastUpdated,
                    IsDeleted = n.IsDeleted
                })
                .ToListAsync();
        }

        public async Task<List<NormaModel>> GetNormasByClienteProcessoAsync(string cliente, string processo)
        {
            var normalizedCliente = cliente?.Trim() ?? string.Empty;
            var normalizedProcesso = processo?.Trim() ?? string.Empty;

            if (string.IsNullOrWhiteSpace(normalizedCliente) || string.IsNullOrWhiteSpace(normalizedProcesso))
            {
                return new List<NormaModel>();
            }

            return await _context.TechnicalStandards
                .Where(n => !n.IsDeleted &&
                            n.Cliente == normalizedCliente &&
                            n.Processo == normalizedProcesso)
                .OrderBy(n => n.Norma)
                .ToListAsync();
        }

        public async Task<List<string>> GetProcessosByClienteAsync(string cliente)
        {
            var normalizedCliente = cliente?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(normalizedCliente))
            {
                return new List<string>();
            }

            return await _context.TechnicalStandards
                .Where(n => !n.IsDeleted && n.Cliente == normalizedCliente && n.Processo != null && n.Processo != "")
                .Select(n => n.Processo!)
                .Distinct()
                .OrderBy(p => p)
                .ToListAsync();
        }

        // Criar uma nova norma
        public async Task<NormaModel> CreateNormaAsync(NormaModel norma)
        {
            norma.Cliente = norma.Cliente.Trim();
            norma.Processo = norma.Processo.Trim();
            norma.Norma = norma.Norma.Trim();
            norma.CreateBy = string.IsNullOrWhiteSpace(norma.CreateBy) ? "Sistema" : norma.CreateBy.Trim();
            norma.CreateDate = DateTime.Now;
            norma.LastUpdated = DateTime.Now;
            norma.IsDeleted = false;

            _context.TechnicalStandards.Add(norma);
            await _context.SaveChangesAsync();

            return norma;
        }

        // Atualizar uma norma existente
        public async Task<NormaModel> UpdateNormaAsync(NormaModel norma)
        {
            var existingNorma = await _context.TechnicalStandards.FindAsync(norma.Id);

            if (existingNorma == null)
            {
                return null;
            }

            existingNorma.Cliente = norma.Cliente.Trim();
            existingNorma.Processo = norma.Processo.Trim();
            existingNorma.Norma = norma.Norma.Trim();
            existingNorma.Revision = norma.Revision;
            if (!string.IsNullOrWhiteSpace(norma.CreateBy))
            {
                existingNorma.CreateBy = norma.CreateBy.Trim();
            }
            existingNorma.LastUpdated = DateTime.Now;

            _context.TechnicalStandards.Update(existingNorma);
            await _context.SaveChangesAsync();

            return norma;
        }

        // Excluir uma norma (marcando como deletada)
        public async Task<bool> DeleteNormaAsync(int id)
        {
            var norma = await _context.TechnicalStandards.FindAsync(id);

            if (norma == null)
            {
                return false;
            }

            norma.IsDeleted = true;
            _context.TechnicalStandards.Update(norma);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BulkImportResult> ImportAsync(IEnumerable<NormaModel> itens, string? createdBy)
        {
            var result = new BulkImportResult();
            var list = itens?
                .Where(i => i != null && !string.IsNullOrWhiteSpace(i.Cliente) && !string.IsNullOrWhiteSpace(i.Processo) && !string.IsNullOrWhiteSpace(i.Norma))
                .Select(i => new NormaModel
                {
                    Cliente = i.Cliente.Trim(),
                    Processo = i.Processo.Trim(),
                    Norma = i.Norma.Trim(),
                    Revision = string.IsNullOrWhiteSpace(i.Revision) ? null : i.Revision.Trim(),
                    CreateBy = createdBy ?? i.CreateBy ?? "Sistema",
                    CreateDate = DateTime.Now,
                    LastUpdated = DateTime.Now,
                    IsDeleted = false,
                })
                .ToList() ?? new List<NormaModel>();

            if (list.Count == 0)
            {
                return result;
            }

            var comparer = StringComparer.OrdinalIgnoreCase;
            var keySet = new HashSet<string>(list.Select(i => BuildKey(i.Cliente, i.Processo, i.Norma)), comparer);
            var existing = await _context.TechnicalStandards
                .Where(n => !n.IsDeleted)
                .ToListAsync();
            var map = existing
                .Select(n => new { Key = BuildKey(n.Cliente, n.Processo, n.Norma), Entity = n })
                .Where(x => keySet.Contains(x.Key))
                .ToDictionary(x => x.Key, x => x.Entity, comparer);

            foreach (var item in list)
            {
                var key = BuildKey(item.Cliente, item.Processo, item.Norma);
                if (map.TryGetValue(key, out var current))
                {
                    current.Revision = item.Revision;
                    current.LastUpdated = DateTime.Now;
                    if (!string.IsNullOrWhiteSpace(createdBy))
                    {
                        current.CreateBy = createdBy!;
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
            return result;
        }

        private static string BuildKey(string cliente, string processo, string norma)
        {
            var c = cliente?.Trim().ToUpperInvariant() ?? string.Empty;
            var p = processo?.Trim().ToUpperInvariant() ?? string.Empty;
            var n = norma?.Trim().ToUpperInvariant() ?? string.Empty;
            return $"{c}|{p}|{n}";
        }
    }
}
