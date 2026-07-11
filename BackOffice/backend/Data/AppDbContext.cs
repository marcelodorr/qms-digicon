using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<QualityCertificateModel> QualityCertificates { get; set; }
        public DbSet<OperationProcessModel> Operacao { get; set; }  // Tabela Operacao
        public DbSet<ClienteModel> Cliente { get; set; }    // Tabela Cliente
        public DbSet<NormaModel> TechnicalStandards { get; set; }
        public DbSet<ControleEleb> ControleElebs { get; set; }
        public DbSet<PartNumberModel> PartNumbers { get; set; }
        public DbSet<SpecialProcessModel> SpecialProcesses { get; set; }
        public DbSet<ParameterModel> Parameters { get; set; }
        public DbSet<AnalystModel> Analysts { get; set; }
        public DbSet<AnalystCertificateModel> AnalystsCertificates { get; set; }
        public DbSet<SpecialProcessCertificateModel> SpecialProcessCertificates { get; set; }
        public DbSet<ProductConformityCertificateModel> ProductConformityCertificates { get; set; }
        public DbSet<ProductDocumentControlModel> ProductDocumentControls { get; set; }
        public DbSet<PurchaseOrderModel> PurchaseOrders { get; set; }
        public DbSet<RncModel> RncEntries { get; set; }
        public DbSet<PartNumberHistoryModel> PartNumberHistory { get; set; }
        public DbSet<SpecialProcessHistoryModel> SpecialProcessHistory { get; set; }
        public DbSet<ShippingLabelModel> ShippingLabels { get; set; }
        public DbSet<ShippingLabelPrintSettingsModel> ShippingLabelPrintSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PurchaseOrderModel>()
                .HasIndex(p => new { p.PONumber, p.Item, p.ClienteId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");

            modelBuilder.Entity<AnalystCertificateModel>()
                .HasOne(c => c.Analyst)
                .WithMany(a => a.Certificates)
                .HasForeignKey(c => c.AnalystsId);

            modelBuilder.Entity<AnalystCertificateModel>()
                .HasIndex(c => new { c.Certificate, c.IsDefault })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0 AND [IsDefault] = 1");

            modelBuilder.Entity<RncModel>()
                .HasNoKey()
                .ToTable("RNC");

            modelBuilder.Entity<PartNumberHistoryModel>()
                .HasIndex(h => h.PartNumberId);

            modelBuilder.Entity<SpecialProcessHistoryModel>()
                .HasIndex(h => h.SpecialProcessId);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .HasIndex(s => s.Username)
                .IsUnique();

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.LabelWidthMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.LabelHeightMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.MarginLeftMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.MarginTopMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.MarginRightMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.MarginBottomMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.BadgeFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.HeaderFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.CountryFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.WarningFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.ReferenceFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.BadgeWidthMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.BadgeHeightMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelModel>()
                .Property(s => s.BadgeStrokeWidthMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.WidthMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.HeightMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.MarginLeftMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.MarginTopMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.MarginRightMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.MarginBottomMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.BadgeFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.HeaderFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.CountryFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.WarningFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.ReferenceFontMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.BadgeWidthMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.BadgeHeightMm)
                .HasPrecision(10, 2);

            modelBuilder.Entity<ShippingLabelPrintSettingsModel>()
                .Property(s => s.BadgeStrokeWidthMm)
                .HasPrecision(10, 2);
        }
    }
}
