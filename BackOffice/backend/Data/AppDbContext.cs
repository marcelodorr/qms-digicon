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
        public DbSet<LoginCertificationModel> LoginCertifications { get; set; }
        public DbSet<LoginSessionModel> LoginSessions { get; set; }
        public DbSet<LoginModulePermissionModel> LoginModulePermissions { get; set; }
        public DbSet<LoginPasswordResetModel> LoginPasswordResets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PurchaseOrderModel>()
                .HasIndex(p => new { p.PONumber, p.Item, p.ClienteId })
                .IsUnique()
                .HasFilter("\"IsDeleted\" = FALSE");

            modelBuilder.Entity<AnalystCertificateModel>()
                .HasOne(c => c.Analyst)
                .WithMany(a => a.Certificates)
                .HasForeignKey(c => c.AnalystsId);

            modelBuilder.Entity<AnalystCertificateModel>()
                .HasIndex(c => new { c.Certificate, c.IsDefault })
                .IsUnique()
                .HasFilter("\"IsDeleted\" = FALSE AND \"IsDefault\" = TRUE");

            ConfigureLoginTables(modelBuilder);

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

        private static void ConfigureLoginTables(ModelBuilder modelBuilder)
        {
            var certifications = modelBuilder.Entity<LoginCertificationModel>();
            certifications.ToTable("login_certification");
            certifications.HasKey(x => x.Username);
            certifications.Property(x => x.Username).HasColumnName("username");
            certifications.Property(x => x.Email).HasColumnName("email");
            certifications.Property(x => x.Matricula).HasColumnName("matricula");
            certifications.Property(x => x.Password).HasColumnName("password");
            certifications.Property(x => x.Salt).HasColumnName("salt");
            certifications.Property(x => x.Type).HasColumnName("type");
            certifications.Property(x => x.Image).HasColumnName("image");
            certifications.HasIndex(x => x.Email).IsUnique();
            certifications.HasIndex(x => x.Matricula).IsUnique().HasFilter("\"matricula\" IS NOT NULL");

            var sessions = modelBuilder.Entity<LoginSessionModel>();
            sessions.ToTable("login_sessions");
            sessions.Property(x => x.SessionId).HasColumnName("sessionid");
            sessions.Property(x => x.Username).HasColumnName("username");
            sessions.Property(x => x.Email).HasColumnName("email");
            sessions.Property(x => x.CreatedAt).HasColumnName("createdat");
            sessions.Property(x => x.LastSeen).HasColumnName("lastseen");
            sessions.Property(x => x.RevokedAt).HasColumnName("revokedat");
            sessions.Property(x => x.IpAddress).HasColumnName("ipaddress");
            sessions.Property(x => x.UserAgent).HasColumnName("useragent");
            sessions.HasIndex(x => x.Username);
            sessions.HasIndex(x => x.LastSeen);

            var permissions = modelBuilder.Entity<LoginModulePermissionModel>();
            permissions.ToTable("login_module_permissions");
            permissions.HasKey(x => new { x.Username, x.ModuleKey });
            permissions.Property(x => x.Username).HasColumnName("username");
            permissions.Property(x => x.ModuleKey).HasColumnName("modulekey");
            permissions.Property(x => x.CanView).HasColumnName("canview").HasDefaultValue(true);
            permissions.Property(x => x.CanEdit).HasColumnName("canedit").HasDefaultValue(false);
            permissions.Property(x => x.UpdatedAt).HasColumnName("updatedat");
            permissions.HasIndex(x => x.Username);

            var passwordResets = modelBuilder.Entity<LoginPasswordResetModel>();
            passwordResets.ToTable("login_password_resets");
            passwordResets.Property(x => x.Id).HasColumnName("id");
            passwordResets.Property(x => x.TokenHash).HasColumnName("tokenhash");
            passwordResets.Property(x => x.Username).HasColumnName("username");
            passwordResets.Property(x => x.Email).HasColumnName("email");
            passwordResets.Property(x => x.CreatedAt).HasColumnName("createdat");
            passwordResets.Property(x => x.ExpiresAt).HasColumnName("expiresat");
            passwordResets.Property(x => x.UsedAt).HasColumnName("usedat");
            passwordResets.HasIndex(x => x.TokenHash).IsUnique();
            passwordResets.HasIndex(x => new { x.Username, x.Email });
        }
    }
}
