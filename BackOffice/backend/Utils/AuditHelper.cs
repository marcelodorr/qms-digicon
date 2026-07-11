namespace backend.Utils
{
    public static class AuditHelper
    {
        public static string ResolveUpdateBy(string? updateBy, string? createBy, string? fallback = "Sistema")
        {
            if (!string.IsNullOrWhiteSpace(updateBy))
            {
                return updateBy.Trim();
            }

            if (!string.IsNullOrWhiteSpace(createBy))
            {
                return createBy.Trim();
            }

            return string.IsNullOrWhiteSpace(fallback) ? "Sistema" : fallback.Trim();
        }
    }
}
