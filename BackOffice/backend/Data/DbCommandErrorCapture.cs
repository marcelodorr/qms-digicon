using System.Collections.Generic;
using System.Threading;

namespace backend.Data
{
    public sealed class DbCommandErrorCapture
    {
        private readonly AsyncLocal<DbCommandErrorInfo?> _current = new();

        public DbCommandErrorInfo? Current
        {
            get => _current.Value;
            set => _current.Value = value;
        }

        public void Clear() => _current.Value = null;
    }

    public sealed record DbCommandErrorInfo(string CommandText, IReadOnlyDictionary<string, object?> Parameters)
    {
        public static DbCommandErrorInfo FromCommand(System.Data.Common.DbCommand command)
        {
            var parameters = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
            foreach (System.Data.Common.DbParameter param in command.Parameters)
            {
                parameters[param.ParameterName] = NormalizeValue(param.Value);
            }

            return new DbCommandErrorInfo(command.CommandText, parameters);
        }

        private static object? NormalizeValue(object? value)
        {
            if (value == null || value == System.DBNull.Value)
            {
                return null;
            }

            if (value is byte[] bytes)
            {
                return $"<bytes:{bytes.Length}>";
            }

            if (value is string text && text.Length > 2000)
            {
                return text.Substring(0, 2000) + "...";
            }

            return value;
        }
    }
}
