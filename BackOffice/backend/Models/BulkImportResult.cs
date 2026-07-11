namespace backend.Models
{
    public class BulkImportResult
    {
        public int TotalRows { get; set; }
        public int Inserted { get; set; }
        public int Updated { get; set; }
        public int Skipped { get; set; }
        public List<string> Errors { get; } = new();

        public void AddError(string message)
        {
            if (!string.IsNullOrWhiteSpace(message))
            {
                Errors.Add(message);
            }
        }
    }
}
