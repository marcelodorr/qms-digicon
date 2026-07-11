namespace backend.Models
{
    public class DbConnectionConfig
    {
        public string? Server { get; set; }
        public string? Database { get; set; }
        public string? User { get; set; }
        public string? Password { get; set; }
        public string? DefaultConnection { get; set; }
    }
}
