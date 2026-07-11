// Services/ControleElebService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ControleElebService
    {
        private readonly AppDbContext _context;

        public ControleElebService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ControleEleb>> GetOrdensFinalizadasAsync()
        {
            return await _context.ControleElebs
                .Where(c => c.Situacao == "Finalizado")
                .ToListAsync();
        }

        public async Task<ControleEleb> GetByOpAsync(string opEleb)
        {
            return await _context.ControleElebs
                .Where(c => c.OpEleb == opEleb &&
                            c.Situacao != null &&
                            c.Situacao.ToLower() == "finalizado")
                .OrderByDescending(c => c.ID)
                .FirstOrDefaultAsync();
        }

        public async Task<ControleEleb> GetByPoAsync(string poEleb)
        {
            var normalized = poEleb?.Trim();
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return null;
            }

            return await _context.ControleElebs
                .Where(c => c.Situacao == "Finalizado" && c.PoEleb == normalized)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> LiberarAsync(string opEleb, string numeroCertificado)
        {
            var ordem = await _context.ControleElebs
                .Where(x => x.OpEleb == opEleb &&
                            x.Situacao != null &&
                            x.Situacao.ToLower() == "finalizado")
                .OrderByDescending(x => x.ID)
                .FirstOrDefaultAsync();

            if (ordem == null) return false;

            ordem.Situacao = "Liberado";
            ordem.NumCertificado = numeroCertificado;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> LiberarPorIdAsync(int id, string numeroCertificado)
        {
            var ordem = await _context.ControleElebs.FirstOrDefaultAsync(x => x.ID == id);
            if (ordem == null) return false;

            if (!string.Equals(ordem.Situacao, "Finalizado", StringComparison.OrdinalIgnoreCase))
                return false;

            ordem.Situacao = "Liberado";
            ordem.NumCertificado = numeroCertificado;
            // se existir DataLiberacao:
            // ordem.DataLiberacao ??= DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public record ControleElebDetailDto(
            DateTime? DataEnvio,
            string? NotaFiscalFaturada,
            string? OrdemProducao,
            string? CodigoItem,
            string? OrdemCompra,
            string? QtdLote,
            string? QtdEnviada,
            string? QtdSaldo,
            string? Status
        );

        public async Task<List<ControleElebDetailDto>> GetDetailsByOrderAsync(string orderNumber)
        {
            var normalized = orderNumber?.Trim();
            if (string.IsNullOrWhiteSpace(normalized))
            {
                return new List<ControleElebDetailDto>();
            }

            var query = _context.ControleElebs.AsNoTracking()
                .Where(c =>
                    c.OpEleb == normalized ||
                    c.OpDigicon == normalized ||
                    c.PoEleb == normalized);

            return await query
                .OrderByDescending(c => c.DataEnvioParaEleb ?? DateTime.MinValue)
                .ThenBy(c => c.OpEleb)
                .Select(c => new ControleElebDetailDto(
                    c.DataEnvioParaEleb,
                    c.NfFaturada,
                    string.IsNullOrWhiteSpace(c.OpDigicon) ? c.OpEleb : c.OpDigicon,
                    c.PartNumber,
                    c.PoEleb,
                    c.QtdLote,
                    c.QtdSaldo,
                    c.QtdSaldo1,
                    c.Situacao
                ))
                .ToListAsync();
        }
    }
}
