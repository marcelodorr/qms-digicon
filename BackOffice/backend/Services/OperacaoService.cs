using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class OperacaoService
    {
        private readonly AppDbContext _context;

        public OperacaoService(AppDbContext context)
        {
            _context = context;
        }

        // Buscar todas as operações ativas e não deletadas
        public async Task<List<OperationProcessModel>> GetOperacoesAsync()
        {
            return await _context.Operacao
                .Where(o => o.IsActivated && !o.IsDeleted)
                .OrderBy(o => o.OperationDescription)
                .ToListAsync();
        }

        // Criar uma nova operação
        public async Task<OperationProcessModel> CreateOperacaoAsync(OperationProcessModel operacao)
        {
            operacao.CreateBy = string.IsNullOrWhiteSpace(operacao.CreateBy) ? "Sistema" : operacao.CreateBy.Trim();
            operacao.UpdateBy = AuditHelper.ResolveUpdateBy(operacao.UpdateBy, operacao.CreateBy);
            operacao.CreateDate = DateTime.Now;
            operacao.LastUpdate = DateTime.Now;
            operacao.IsDeleted = false;
            _context.Operacao.Add(operacao);  // Corrigido para OperationProcesses
            await _context.SaveChangesAsync();
            return operacao;
        }

        // Editar uma operação existente
        public async Task<OperationProcessModel> UpdateOperacaoAsync(OperationProcessModel operacao)
        {
            var existingOperacao = await _context.Operacao.FindAsync(operacao.Id);  // Corrigido para OperationProcesses

            if (existingOperacao == null)
            {
                return null;  // Operação não encontrada
            }

            existingOperacao.OperationQuantity = operacao.OperationQuantity;
            existingOperacao.OperationDescription = operacao.OperationDescription;
            if (!string.IsNullOrWhiteSpace(operacao.CreateBy))
            {
                existingOperacao.CreateBy = operacao.CreateBy.Trim();
            }
            existingOperacao.UpdateBy = AuditHelper.ResolveUpdateBy(operacao.UpdateBy, operacao.CreateBy, existingOperacao.UpdateBy ?? existingOperacao.CreateBy ?? "Sistema");
            existingOperacao.LastUpdate = DateTime.Now;

            _context.Operacao.Update(existingOperacao);  // Corrigido para OperationProcesses
            await _context.SaveChangesAsync();
            return existingOperacao;
        }

        // Excluir uma operação (marcando como deletada)
        public async Task<bool> DeleteOperacaoAsync(int id)
        {
            var operacao = await _context.Operacao.FindAsync(id);  // Corrigido para OperationProcesses

            if (operacao == null)
            {
                return false;  // Operação não encontrada
            }

            operacao.IsDeleted = true;
            _context.Operacao.Update(operacao);  // Corrigido para OperationProcesses
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BulkImportResult> ImportAsync(IEnumerable<OperationProcessModel> itens, string? createdBy)
        {
            var result = new BulkImportResult();
            var list = itens?
                .Where(i => i != null && !string.IsNullOrWhiteSpace(i.OperationQuantity) && !string.IsNullOrWhiteSpace(i.OperationDescription))
                .Select(i => new OperationProcessModel
                {
                    OperationQuantity = i.OperationQuantity.Trim(),
                    OperationDescription = i.OperationDescription.Trim(),
                    CreateBy = createdBy ?? i.CreateBy ?? "Sistema",
                    UpdateBy = AuditHelper.ResolveUpdateBy(i.UpdateBy, createdBy ?? i.CreateBy),
                    CreateDate = DateTime.Now,
                    LastUpdate = DateTime.Now,
                    IsDeleted = false,
                    IsActivated = true,
                })
                .ToList() ?? new List<OperationProcessModel>();

            if (list.Count == 0)
            {
                return result;
            }

            var keys = list.Select(i => i.OperationQuantity).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
            var existing = await _context.Operacao
                .Where(o => o.IsActivated && !o.IsDeleted)
                .ToListAsync();
            var map = existing
                .Where(o => !string.IsNullOrWhiteSpace(o.OperationQuantity) && keys.Contains(o.OperationQuantity))
                .ToDictionary(o => o.OperationQuantity, StringComparer.OrdinalIgnoreCase);

            foreach (var item in list)
            {
                if (map.TryGetValue(item.OperationQuantity, out var current))
                {
                    current.OperationDescription = item.OperationDescription;
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
                    _context.Operacao.Add(item);
                    map[item.OperationQuantity] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }
    }
}
