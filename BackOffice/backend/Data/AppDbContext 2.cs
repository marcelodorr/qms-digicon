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
        }
    }
}
