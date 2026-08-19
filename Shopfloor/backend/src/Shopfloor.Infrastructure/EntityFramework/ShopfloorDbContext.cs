using Microsoft.EntityFrameworkCore;
using Shopfloor.Domain.Common;
using Shopfloor.Domain.Entities;

namespace Shopfloor.Infrastructure.EntityFramework;

public sealed class ShopfloorDbContext(DbContextOptions<ShopfloorDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Machine> Machines => Set<Machine>();
    public DbSet<ProductionOrder> ProductionOrders => Set<ProductionOrder>();
    public DbSet<Operation> Operations => Set<Operation>();
    public DbSet<Defect> Defects => Set<Defect>();
    public DbSet<Cause> Causes => Set<Cause>();
    public DbSet<Quota> Quotas => Set<Quota>();
    public DbSet<QuotaOption> QuotaOptions => Set<QuotaOption>();
    public DbSet<DefectRecord> DefectRecords => Set<DefectRecord>();
    public DbSet<MeasurementRecord> MeasurementRecords => Set<MeasurementRecord>();
    public DbSet<MeasurementResult> MeasurementResults => Set<MeasurementResult>();
    public DbSet<MeasurementSample> MeasurementSamples => Set<MeasurementSample>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        foreach (var entity in modelBuilder.Model.GetEntityTypes().Where(e => typeof(BaseEntity).IsAssignableFrom(e.ClrType)))
        {
            modelBuilder.Entity(entity.ClrType).HasKey(nameof(BaseEntity.Id));
            modelBuilder.Entity(entity.ClrType).Property(nameof(BaseEntity.CreatedAt)).IsRequired();
        }
        modelBuilder.Entity<User>().HasIndex(x => x.ExternalId).IsUnique();
        modelBuilder.Entity<User>().HasIndex(x => x.Username).IsUnique();
        modelBuilder.Entity<Machine>().HasIndex(x => x.Code).IsUnique();
        modelBuilder.Entity<ProductionOrder>().HasIndex(x => x.Code).IsUnique();
        modelBuilder.Entity<Defect>().HasIndex(x => x.Code).IsUnique();
        modelBuilder.Entity<Cause>().HasIndex(x => x.Code).IsUnique();
        modelBuilder.Entity<Operation>().HasIndex(x => new { x.ProductionOrderId, x.Code }).IsUnique();
        modelBuilder.Entity<Quota>().HasIndex(x => new { x.OperationId, x.Number }).IsUnique();
        modelBuilder.Entity<Quota>().Property(x => x.Nominal).HasPrecision(18, 4);
        modelBuilder.Entity<Quota>().Property(x => x.TolerancePlus).HasPrecision(18, 4);
        modelBuilder.Entity<Quota>().Property(x => x.ToleranceMinus).HasPrecision(18, 4);
        modelBuilder.Entity<Quota>().HasMany(x => x.Options).WithOne(x => x.Quota).HasForeignKey(x => x.QuotaId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<MeasurementRecord>().HasMany(x => x.Results).WithOne(x => x.MeasurementRecord).HasForeignKey(x => x.MeasurementRecordId).OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<MeasurementResult>().HasMany(x => x.Samples).WithOne(x => x.MeasurementResult).HasForeignKey(x => x.MeasurementResultId).OnDelete(DeleteBehavior.Cascade);

        ApplySoftDelete<User>(modelBuilder); ApplySoftDelete<Machine>(modelBuilder); ApplySoftDelete<ProductionOrder>(modelBuilder);
        ApplySoftDelete<Operation>(modelBuilder); ApplySoftDelete<Defect>(modelBuilder); ApplySoftDelete<Cause>(modelBuilder);
        ApplySoftDelete<Quota>(modelBuilder); ApplySoftDelete<QuotaOption>(modelBuilder); ApplySoftDelete<DefectRecord>(modelBuilder);
        ApplySoftDelete<MeasurementRecord>(modelBuilder); ApplySoftDelete<MeasurementResult>(modelBuilder); ApplySoftDelete<MeasurementSample>(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>().Where(x => x.State == EntityState.Modified))
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        return base.SaveChangesAsync(cancellationToken);
    }

    private static void ApplySoftDelete<T>(ModelBuilder builder) where T : BaseEntity => builder.Entity<T>().HasQueryFilter(x => !x.IsDeleted);
}
