using System.Linq.Expressions;
using backend.Data;
using backend.Models;
using backend.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    public class AnalystCertificateDto
    {
        public int Certificate { get; set; }
        public bool IsDefault { get; set; }
    }

    public class AnalystUpsertDto
    {
        public int Id { get; set; }
        public string? Analyst { get; set; }
        public string? Email { get; set; }
        public string? Signature { get; set; }
        public string? CreateBy { get; set; }
        public List<AnalystCertificateDto>? Certificates { get; set; }
    }

    public class AnalystCertificateResponseDto
    {
        public long Id { get; set; }
        public int Certificate { get; set; }
        public bool IsDefault { get; set; }
    }

    public class AnalystResponseDto
    {
        public int Id { get; set; }
        public string? Analyst { get; set; }
        public string? Email { get; set; }
        public string? Signature { get; set; }
        public string? CreateBy { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime? LastUpdate { get; set; }
        public bool IsDeleted { get; set; }
        public List<AnalystCertificateResponseDto> Certificates { get; set; } = new();
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AnalystController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalystController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var items = await _context.Analysts
                .Where(a => !a.IsDeleted)
                .Include(a => a.Certificates)
                .OrderBy(a => a.Analyst)
                .ToListAsync();

            var result = items.Select(MapAnalyst).ToList();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AnalystUpsertDto payload)
        {
            var name = payload?.Analyst?.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Analista é obrigatório.");
            }

            var entity = new AnalystModel
            {
                Analyst = name,
                Email = string.IsNullOrWhiteSpace(payload?.Email) ? null : payload.Email.Trim(),
                Signature = string.IsNullOrWhiteSpace(payload?.Signature) ? null : payload.Signature.Trim(),
                CreateBy = string.IsNullOrWhiteSpace(payload?.CreateBy) ? "Sistema" : payload.CreateBy.Trim(),
                CreateDate = DateTime.Now,
                LastUpdate = DateTime.Now,
                IsDeleted = false
            };

            _context.Analysts.Add(entity);
            await _context.SaveChangesAsync();

            if (payload?.Certificates != null)
            {
                await SyncCertificatesAsync(entity.Id, payload.Certificates, entity.CreateBy);
            }

            var response = await LoadAnalystResponseAsync(entity.Id) ?? MapAnalyst(entity);
            return Ok(new { success = true, message = "Analista criado com sucesso.", analyst = response });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] AnalystUpsertDto payload)
        {
            if (payload == null || payload.Id <= 0)
            {
                return BadRequest("Analista inválido.");
            }

            var entity = await _context.Analysts.FindAsync(payload.Id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Analista não encontrado.");
            }

            if (!string.IsNullOrWhiteSpace(payload.Analyst))
            {
                entity.Analyst = payload.Analyst.Trim();
            }

            entity.Email = string.IsNullOrWhiteSpace(payload.Email) ? null : payload.Email.Trim();
            entity.Signature = string.IsNullOrWhiteSpace(payload.Signature) ? null : payload.Signature.Trim();
            if (!string.IsNullOrWhiteSpace(payload.CreateBy))
            {
                entity.CreateBy = payload.CreateBy.Trim();
            }
            entity.LastUpdate = DateTime.Now;

            await _context.SaveChangesAsync();

            if (payload.Certificates != null)
            {
                var createBy = string.IsNullOrWhiteSpace(payload.CreateBy) ? entity.CreateBy : payload.CreateBy.Trim();
                await SyncCertificatesAsync(entity.Id, payload.Certificates, createBy);
            }

            var response = await LoadAnalystResponseAsync(entity.Id) ?? MapAnalyst(entity);
            return Ok(new { success = true, message = "Analista atualizado com sucesso.", analyst = response });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entity = await _context.Analysts.FindAsync(id);
            if (entity == null || entity.IsDeleted)
            {
                return NotFound("Analista não encontrado.");
            }

            entity.IsDeleted = true;
            entity.LastUpdate = DateTime.Now;

            var certificates = await _context.AnalystsCertificates
                .Where(c => c.AnalystsId == id && !c.IsDeleted)
                .ToListAsync();

            if (certificates.Count > 0)
            {
                var now = DateTime.Now;
                foreach (var cert in certificates)
                {
                    cert.IsDeleted = true;
                    cert.LastUpdated = now;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Analista excluído com sucesso." });
        }

        [HttpGet("template")]
        public IActionResult DownloadTemplate()
        {
            var columns = new[] { "Nome", "Email", "Assinatura" };
            var content = ExcelHelper.CreateTemplate("Analistas", columns);
            return File(content, ExcelHelper.ExcelContentType, "analistas_template.xlsx");
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

            var items = rows
                .Select(r => new AnalystModel
                {
                    Analyst = r.Get("Nome") ?? r.Get("Name") ?? r.Get("Analyst") ?? r.Get("Analista") ?? string.Empty,
                    Email = r.Get("Email") ?? r.Get("E-mail"),
                    Signature = r.Get("Assinatura") ?? r.Get("Signature"),
                    CreateBy = trimmedCreatedBy ?? "Sistema",
                    CreateDate = now,
                    LastUpdate = now,
                    IsDeleted = false
                })
                .Where(a => !string.IsNullOrWhiteSpace(a.Analyst))
                .ToList();

            result.TotalRows = rows.Count;
            result.Skipped += rows.Count - items.Count;

            if (items.Count == 0)
            {
                return Ok(new { success = true, message = "Nenhum dado válido encontrado.", result });
            }

            var existing = await _context.Analysts
                .Where(a => !a.IsDeleted)
                .ToListAsync();

            var map = existing.ToDictionary(
                a => a.Analyst.Trim(),
                a => a,
                StringComparer.OrdinalIgnoreCase);

            foreach (var item in items)
            {
                if (map.TryGetValue(item.Analyst.Trim(), out var current))
                {
                    current.Email = item.Email;
                    current.Signature = item.Signature;
                    current.LastUpdate = now;
                    if (!string.IsNullOrWhiteSpace(trimmedCreatedBy))
                    {
                        current.CreateBy = trimmedCreatedBy;
                    }
                    result.Updated++;
                }
                else
                {
                    _context.Analysts.Add(item);
                    map[item.Analyst.Trim()] = item;
                    result.Inserted++;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Importação concluída.", result });
        }

        private static AnalystResponseDto MapAnalyst(AnalystModel analyst)
        {
            return new AnalystResponseDto
            {
                Id = analyst.Id,
                Analyst = analyst.Analyst,
                Email = analyst.Email,
                Signature = analyst.Signature,
                CreateBy = analyst.CreateBy,
                CreateDate = analyst.CreateDate,
                LastUpdate = analyst.LastUpdate,
                IsDeleted = analyst.IsDeleted,
                Certificates = analyst.Certificates
                    .Where(c => !c.IsDeleted)
                    .OrderBy(c => c.Certificate)
                    .Select(c => new AnalystCertificateResponseDto
                    {
                        Id = c.Id,
                        Certificate = c.Certificate,
                        IsDefault = c.IsDefault
                    })
                    .ToList()
            };
        }

        private static List<AnalystCertificateDto> NormalizeCertificates(IEnumerable<AnalystCertificateDto>? items)
        {
            if (items == null)
            {
                return new List<AnalystCertificateDto>();
            }

            return items
                .Where(c => c != null && c.Certificate > 0)
                .GroupBy(c => c.Certificate)
                .Select(g => new AnalystCertificateDto
                {
                    Certificate = g.Key,
                    IsDefault = g.Any(c => c.IsDefault)
                })
                .ToList();
        }

        private async Task SyncCertificatesAsync(int analystId, List<AnalystCertificateDto> items, string? createBy)
        {
            var now = DateTime.Now;
            var normalized = NormalizeCertificates(items);

            var existing = await _context.AnalystsCertificates
                .Where(c => c.AnalystsId == analystId)
                .ToListAsync();

            foreach (var group in existing.GroupBy(c => c.Certificate))
            {
                foreach (var duplicate in group.Skip(1))
                {
                    duplicate.IsDeleted = true;
                    duplicate.LastUpdated = now;
                }
            }

            var existingMap = existing
                .GroupBy(c => c.Certificate)
                .ToDictionary(g => g.Key, g => g.First());
            var requestedSet = new HashSet<int>(normalized.Select(c => c.Certificate));

            foreach (var cert in normalized)
            {
                if (existingMap.TryGetValue(cert.Certificate, out var current))
                {
                    current.IsDeleted = false;
                    current.IsDefault = cert.IsDefault;
                    current.LastUpdated = now;
                }
                else
                {
                    _context.AnalystsCertificates.Add(new AnalystCertificateModel
                    {
                        Certificate = cert.Certificate,
                        IsDefault = cert.IsDefault,
                        AnalystsId = analystId,
                        CreateBy = string.IsNullOrWhiteSpace(createBy) ? "Sistema" : createBy,
                        CreateDate = now,
                        LastUpdated = now,
                        IsDeleted = false
                    });
                }
            }

            foreach (var current in existing)
            {
                if (!requestedSet.Contains(current.Certificate))
                {
                    current.IsDeleted = true;
                    current.LastUpdated = now;
                }
            }

            var defaultCertificates = normalized
                .Where(c => c.IsDefault)
                .Select(c => c.Certificate)
                .Distinct()
                .ToList();

            if (defaultCertificates.Count > 0)
            {
                var certificateFilter = BuildCertificateFilter(defaultCertificates);
                var otherDefaults = await _context.AnalystsCertificates
                    .Where(c => !c.IsDeleted &&
                        c.IsDefault &&
                        c.AnalystsId != analystId)
                    .Where(certificateFilter)
                    .ToListAsync();

                foreach (var other in otherDefaults)
                {
                    other.IsDefault = false;
                    other.LastUpdated = now;
                }
            }

            await _context.SaveChangesAsync();
        }

        private static Expression<Func<AnalystCertificateModel, bool>> BuildCertificateFilter(IEnumerable<int> certificates)
        {
            var list = certificates?.Distinct().ToList() ?? new List<int>();
            if (list.Count == 0)
            {
                return _ => false;
            }

            var parameter = Expression.Parameter(typeof(AnalystCertificateModel), "c");
            Expression? body = null;
            foreach (var cert in list)
            {
                var left = Expression.Property(parameter, nameof(AnalystCertificateModel.Certificate));
                var right = Expression.Constant(cert);
                var equals = Expression.Equal(left, right);
                body = body == null ? equals : Expression.OrElse(body, equals);
            }

            return Expression.Lambda<Func<AnalystCertificateModel, bool>>(body!, parameter);
        }

        private async Task<AnalystResponseDto?> LoadAnalystResponseAsync(int id)
        {
            var analyst = await _context.Analysts
                .Include(a => a.Certificates)
                .FirstOrDefaultAsync(a => a.Id == id);
            return analyst == null ? null : MapAnalyst(analyst);
        }
    }
}
