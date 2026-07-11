using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        public record DashboardStatsDto(
            int PartNumbers,
            int Normas,
            int SpecialProcesses,
            int PurchaseOrders,
            int Clientes
        );

        public record DashboardCertificateStatsDto(
            int Quality,
            int SpecialProcess,
            int ProductConformity,
            int Total
        );

        public record DashboardActivityDto(
            string Type,
            string Label,
            string Code,
            string Actor,
            DateTime Date,
            int Id
        );

        public record DashboardOverviewDto(
            DashboardStatsDto Stats,
            DashboardCertificateStatsDto Certificates,
            List<DashboardActivityDto> RecentActivities
        );

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var partNumbers = await _context.PartNumbers.CountAsync(p => !p.IsDeleted);
            var normas = await _context.TechnicalStandards.CountAsync(n => !n.IsDeleted);
            var specialProcesses = await _context.SpecialProcesses.CountAsync(s => !s.IsDeleted);
            var purchaseOrders = await _context.PurchaseOrders.CountAsync(p => !p.IsDeleted);
            var clientes = await _context.Cliente.CountAsync(c => !c.IsDeleted);

            return Ok(new
            {
                PartNumbers = partNumbers,
                Normas = normas,
                SpecialProcesses = specialProcesses,
                PurchaseOrders = purchaseOrders,
                Clientes = clientes
            });
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int? take)
        {
            var safeTake = take.HasValue && take.Value > 0 ? Math.Min(take.Value, 50) : 5;
            if (from.HasValue && to.HasValue && to.Value.Date < from.Value.Date)
            {
                (from, to) = (to, from);
            }

            var partNumbers = await _context.PartNumbers.CountAsync(p => !p.IsDeleted);
            var normas = await _context.TechnicalStandards.CountAsync(n => !n.IsDeleted);
            var specialProcesses = await _context.SpecialProcesses.CountAsync(s => !s.IsDeleted);
            var purchaseOrders = await _context.PurchaseOrders.CountAsync(p => !p.IsDeleted);
            var clientes = await _context.Cliente.CountAsync(c => !c.IsDeleted);

            var qualityQuery = _context.QualityCertificates.AsNoTracking();
            var specialQuery = _context.SpecialProcessCertificates.AsNoTracking().Where(c => !c.IsDeleted);
            var productQuery = _context.ProductConformityCertificates.AsNoTracking().Where(c => !c.IsDeleted);

            if (from.HasValue)
            {
                var start = from.Value.Date;
                qualityQuery = qualityQuery.Where(c => (c.Data ?? c.CreateDate) >= start);
                specialQuery = specialQuery.Where(c => c.EmissionDate >= start);
                productQuery = productQuery.Where(c => c.EmissionDate >= start);
            }

            if (to.HasValue)
            {
                var endExclusive = to.Value.Date.AddDays(1);
                qualityQuery = qualityQuery.Where(c => (c.Data ?? c.CreateDate) < endExclusive);
                specialQuery = specialQuery.Where(c => c.EmissionDate < endExclusive);
                productQuery = productQuery.Where(c => c.EmissionDate < endExclusive);
            }

            var qualityCount = await qualityQuery.CountAsync();
            var specialCount = await specialQuery.CountAsync();
            var productCount = await productQuery.CountAsync();
            var totalCount = qualityCount + specialCount + productCount;

            var qualityRecent = await qualityQuery
                .OrderByDescending(c => c.Data ?? c.CreateDate)
                .ThenByDescending(c => c.Id)
                .Select(c => new DashboardActivityDto(
                    "quality",
                    "Qualidade",
                    c.NumeroCertificado ?? string.Empty,
                    c.AnalystName ?? c.Responsavel ?? "Sistema",
                    c.Data ?? c.CreateDate,
                    c.Id))
                .Take(safeTake)
                .ToListAsync();

            var specialRecent = await specialQuery
                .OrderByDescending(c => c.EmissionDate)
                .ThenByDescending(c => c.Id)
                .Select(c => new DashboardActivityDto(
                    "specialProcess",
                    "Processo Especial",
                    c.CertificateCode ?? string.Empty,
                    c.AnalystName ?? c.CreateBy ?? "Sistema",
                    c.EmissionDate,
                    c.Id))
                .Take(safeTake)
                .ToListAsync();

            var productRecent = await productQuery
                .OrderByDescending(c => c.EmissionDate)
                .ThenByDescending(c => c.Id)
                .Select(c => new DashboardActivityDto(
                    "productConformity",
                    "Conformidade de Produto",
                    c.CertificateNumber ?? string.Empty,
                    c.AnalystName ?? c.CreateBy ?? "Sistema",
                    c.EmissionDate,
                    c.Id))
                .Take(safeTake)
                .ToListAsync();

            var recent = qualityRecent
                .Concat(specialRecent)
                .Concat(productRecent)
                .OrderByDescending(item => item.Date)
                .ThenByDescending(item => item.Id)
                .Take(safeTake)
                .ToList();

            var overview = new DashboardOverviewDto(
                new DashboardStatsDto(partNumbers, normas, specialProcesses, purchaseOrders, clientes),
                new DashboardCertificateStatsDto(qualityCount, specialCount, productCount, totalCount),
                recent
            );

            return Ok(overview);
        }
    }
}
