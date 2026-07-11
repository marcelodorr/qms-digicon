using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class ProductDocumentControlService
    {
        private readonly AppDbContext _context;

        public ProductDocumentControlService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProductDocumentControlModel> GetAsync()
        {
            var existing = await _context.ProductDocumentControls.AsNoTracking().FirstOrDefaultAsync();
            if (existing != null)
                return existing;

            var defaults = new ProductDocumentControlModel();
            _context.ProductDocumentControls.Add(defaults);
            await _context.SaveChangesAsync();
            return defaults;
        }

        public async Task<ProductDocumentControlModel> SaveAsync(ProductDocumentControlModel model)
        {
            var current = await _context.ProductDocumentControls.FirstOrDefaultAsync();
            if (current == null)
            {
                model.CreateDate = DateTime.Now;
                model.LastUpdate = DateTime.Now;
                _context.ProductDocumentControls.Add(model);
            }
            else
            {
                current.DocumentNumber = model.DocumentNumber?.Trim() ?? current.DocumentNumber;
                current.DocumentRevision = model.DocumentRevision?.Trim() ?? current.DocumentRevision;
                current.InspectedAccording = model.InspectedAccording?.Trim() ?? current.InspectedAccording;
                current.DocumentDate = model.DocumentDate == default ? current.DocumentDate : model.DocumentDate;
                current.LastUpdate = DateTime.Now;
                _context.ProductDocumentControls.Update(current);
            }

            await _context.SaveChangesAsync();
            return await GetAsync();
        }
    }
}
