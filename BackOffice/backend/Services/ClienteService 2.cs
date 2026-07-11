using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ClienteService
    {
        private readonly AppDbContext _context;

        public ClienteService(AppDbContext context)
        {
            _context = context;
        }

        // Buscar todos os clientes não deletados
        public async Task<List<ClienteModel>> GetClientesAsync()
        {
            return await _context.Cliente
                .AsNoTracking()
                .Where(c => !c.IsDeleted)
                .OrderBy(c => c.Cliente)
                .ToListAsync();
        }

        // Criar um novo cliente
        public async Task<ClienteModel> CreateClienteAsync(ClienteModel cliente)
        {
            cliente.Cliente = cliente.Cliente?.Trim() ?? string.Empty;
            cliente.Endereco = string.IsNullOrWhiteSpace(cliente.Endereco) ? null : cliente.Endereco.Trim();
            cliente.CreateBy = string.IsNullOrWhiteSpace(cliente.CreateBy) ? "Sistema" : cliente.CreateBy.Trim();
            cliente.CreateDate = DateTime.Now;
            cliente.LastUpdate = DateTime.Now;
            cliente.IsDeleted = false;
            _context.Cliente.Add(cliente);
            await _context.SaveChangesAsync();
            return cliente;
        }

        // Editar um cliente existente
        public async Task<ClienteModel> UpdateClienteAsync(ClienteModel cliente)
        {
            var existingCliente = await _context.Cliente.FirstOrDefaultAsync(c => c.Id == cliente.Id);

            if (existingCliente == null || existingCliente.IsDeleted)
            {
                return null;
            }

            existingCliente.Cliente = cliente.Cliente?.Trim() ?? existingCliente.Cliente;
            existingCliente.Endereco = string.IsNullOrWhiteSpace(cliente.Endereco) ? null : cliente.Endereco.Trim();
            if (!string.IsNullOrWhiteSpace(cliente.CreateBy))
            {
                existingCliente.CreateBy = cliente.CreateBy.Trim();
            }
            existingCliente.LastUpdate = DateTime.Now;

            _context.Cliente.Update(existingCliente);
            await _context.SaveChangesAsync();
            return existingCliente;
        }

        // Excluir um cliente (marcando como deletado)
        public async Task<bool> DeleteClienteAsync(int id)
        {
            var cliente = await _context.Cliente.FirstOrDefaultAsync(c => c.Id == id);
            if (cliente == null || cliente.IsDeleted)
            {
                return false;
            }

            cliente.IsDeleted = true;
            cliente.LastUpdate = DateTime.Now;

            _context.Cliente.Update(cliente);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<BulkImportResult> ImportAsync(IEnumerable<ClienteModel> itens, string? createdBy)
        {
            var result = new BulkImportResult();
            var list = itens?
                .Where(i => i != null && !string.IsNullOrWhiteSpace(i.Cliente))
                .Select(i => new ClienteModel
                {
                    Cliente = i.Cliente.Trim(),
                    Endereco = string.IsNullOrWhiteSpace(i.Endereco) ? null : i.Endereco.Trim(),
                    CreateBy = createdBy ?? i.CreateBy ?? "Sistema",
                    CreateDate = DateTime.Now,
                    LastUpdate = DateTime.Now,
                    IsDeleted = false,
                })
                .ToList() ?? new List<ClienteModel>();

            if (list.Count == 0)
            {
                return result;
            }

            var comparer = StringComparer.OrdinalIgnoreCase;
            var names = new HashSet<string>(list.Select(i => i.Cliente), comparer);
            var existing = await _context.Cliente
                .Where(c => !c.IsDeleted)
                .ToListAsync();
            var map = existing
                .Where(c => !string.IsNullOrWhiteSpace(c.Cliente) && names.Contains(c.Cliente))
                .ToDictionary(c => c.Cliente!, comparer);

            foreach (var item in list)
            {
                if (map.TryGetValue(item.Cliente, out var current))
                {
                    current.Endereco = item.Endereco;
                    current.LastUpdate = DateTime.Now;
                    if (!string.IsNullOrWhiteSpace(createdBy))
                    {
                        current.CreateBy = createdBy!;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.Cliente.Add(item);
                    map[item.Cliente] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();
            return result;
        }
    }
}
