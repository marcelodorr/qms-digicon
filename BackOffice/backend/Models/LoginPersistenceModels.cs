using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class LoginCertificationModel
    {
        [Key]
        [MaxLength(150)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Matricula { get; set; }

        [Required]
        [MaxLength(512)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(512)]
        public string Salt { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Type { get; set; }

        public string? Image { get; set; }
    }

    public class LoginSessionModel
    {
        [Key]
        public Guid SessionId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Username { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Email { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime LastSeen { get; set; }
        public DateTime? RevokedAt { get; set; }

        [MaxLength(64)]
        public string? IpAddress { get; set; }

        [MaxLength(256)]
        public string? UserAgent { get; set; }
    }

    public class LoginModulePermissionModel
    {
        [MaxLength(150)]
        public string Username { get; set; } = string.Empty;

        [MaxLength(150)]
        public string ModuleKey { get; set; } = string.Empty;

        public bool CanView { get; set; } = true;
        public bool CanEdit { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class LoginPasswordResetModel
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(64)]
        public string TokenHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? UsedAt { get; set; }
    }
}
