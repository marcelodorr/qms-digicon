using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using System.Text;

namespace backend.Utils
{
    public static class ExcelHelper
    {
        public const string ExcelContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        public static byte[] CreateTemplate(string sheetName, IReadOnlyCollection<string> columns)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add(string.IsNullOrWhiteSpace(sheetName) ? "Dados" : sheetName);
            var headers = columns?.Where(c => !string.IsNullOrWhiteSpace(c)).ToArray() ?? Array.Empty<string>();

            for (var index = 0; index < headers.Length; index++)
            {
                var cell = worksheet.Cell(1, index + 1);
                cell.Value = headers[index];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#f4f4f4");
            }

            if (headers.Length > 0)
            {
                worksheet.Columns(1, headers.Length).AdjustToContents();
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public static List<ExcelRow> ReadRows(IFormFile? file)
        {
            var rows = new List<ExcelRow>();
            if (file == null || file.Length == 0)
            {
                return rows;
            }

            using var stream = new MemoryStream();
            file.CopyTo(stream);
            stream.Position = 0;

            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheets.FirstOrDefault();
            if (worksheet == null) return rows;

            var range = worksheet.RangeUsed();
            if (range == null) return rows;

            var headerRow = range.FirstRowUsed();
            var lastColumn = range.LastColumnUsed()?.ColumnNumber() ?? headerRow.LastCellUsed()?.Address.ColumnNumber ?? 0;
            if (lastColumn == 0) return rows;

            var headers = new List<string>();
            for (var col = 1; col <= lastColumn; col++)
            {
                headers.Add(headerRow.Cell(col).GetString());
            }

            foreach (var row in range.RowsUsed().Skip(1))
            {
                var dict = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                var hasValue = false;
                for (var col = 1; col <= headers.Count; col++)
                {
                    var header = headers[col - 1];
                    if (string.IsNullOrWhiteSpace(header)) continue;

                    var rawValue = row.Cell(col).GetValue<string>()?.Trim() ?? string.Empty;
                    if (!string.IsNullOrWhiteSpace(rawValue))
                    {
                        hasValue = true;
                    }

                    var normalized = NormalizeKey(header);
                    if (!dict.ContainsKey(normalized))
                    {
                        dict[normalized] = rawValue;
                    }
                }

                if (hasValue)
                {
                    rows.Add(new ExcelRow(dict));
                }
            }

            return rows;
        }

        internal static string NormalizeKey(string? key)
        {
            if (string.IsNullOrWhiteSpace(key)) return string.Empty;
            var normalized = key.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();
            foreach (var ch in normalized.Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark))
            {
                if (char.IsLetterOrDigit(ch))
                {
                    builder.Append(char.ToLowerInvariant(ch));
                }
            }

            return builder.ToString();
        }
    }

    public class ExcelRow
    {
        private readonly Dictionary<string, string> _values;

        internal ExcelRow(Dictionary<string, string> values)
        {
            _values = values;
        }

        public string? Get(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) return null;
            var normalized = ExcelHelper.NormalizeKey(key);
            return _values.TryGetValue(normalized, out var value) ? value : null;
        }
    }
}
