namespace backend.Models
{
    public class SmtpConfig
    {
        public string? Host { get; set; }
        public int? Port { get; set; }
        public string? User { get; set; }
        public string? Password { get; set; }
        public string? FromEmail { get; set; }
        public string? FromName { get; set; }
        public bool? UseSsl { get; set; }
    }
}
