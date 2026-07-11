using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using iTextSharp.text;

namespace backend.Utils
{
    public static class PdfHelper
    {
        /// <summary>
        /// Tenta carregar a imagem do logo da Digicon de vários caminhos possíveis
        /// </summary>
        public static Image? TryLoadDigiconLogo()
        {
            var candidatePaths = new List<string>();

            void AddCandidate(params string[] parts)
            {
                var safeSegments = parts.Where(s => !string.IsNullOrWhiteSpace(s)).ToArray();
                if (safeSegments.Length == 0) return;

                try
                {
                    var combined = Path.Combine(safeSegments);
                    var fullPath = Path.GetFullPath(combined);
                    if (!candidatePaths.Contains(fullPath))
                    {
                        candidatePaths.Add(fullPath);
                    }
                }
                catch
                {
                    // Ignora caminhos inválidos
                }
            }

            var baseDir = AppContext.BaseDirectory;
            var currentDir = Directory.GetCurrentDirectory();
            var solutionDir = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", ".."));

            // Adiciona candidatos de caminhos possíveis
            AddCandidate(baseDir, "digicon_logo.png");
            AddCandidate(baseDir, "logo-digicon.png");
            AddCandidate(baseDir, "public", "digicon_logo.png");
            AddCandidate(baseDir, "wwwroot", "digicon_logo.png");
            AddCandidate(baseDir, "wwwroot", "logo-digicon.png");
            AddCandidate(baseDir, "wwwroot", "images", "digicon_logo.png");
            AddCandidate(baseDir, "wwwroot", "images", "logo-digicon.png");

            AddCandidate(currentDir, "logo-digicon.png");
            AddCandidate(currentDir, "wwwroot", "logo-digicon.png");
            AddCandidate(currentDir, "wwwroot", "images", "logo-digicon.png");
            AddCandidate(currentDir, "wwwroot", "images", "digicon_logo.png");
            AddCandidate(currentDir, "frontend", "src", "assets", "digicon_logo.png");
            AddCandidate(currentDir, "frontend", "public", "digicon_logo.png");
            AddCandidate(currentDir, "frontend", "public", "logo512.png");
            AddCandidate(currentDir, "frontend", "public", "logo192.png");

            AddCandidate(solutionDir, "frontend", "src", "assets", "digicon_logo.png");
            AddCandidate(solutionDir, "frontend", "public", "digicon_logo.png");
            AddCandidate(solutionDir, "frontend", "public", "logo512.png");
            AddCandidate(solutionDir, "frontend", "public", "logo192.png");

            // Tenta carregar cada caminho candidato
            foreach (var path in candidatePaths)
            {
                if (!File.Exists(path))
                    continue;

                try
                {
                    return Image.GetInstance(path);
                }
                catch
                {
                    // Ignora caminho inválido e tenta o próximo
                }
            }

            return null;
        }

        /// <summary>
        /// Tenta construir uma imagem a partir de dados base64 de assinatura
        /// </summary>
        public static Image? TryBuildSignatureImage(string? signatureBase64)
        {
            if (string.IsNullOrWhiteSpace(signatureBase64))
                return null;

            try
            {
                var data = signatureBase64;

                // Remove prefixo data:image se presente
                if (signatureBase64.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                {
                    var commaIndex = signatureBase64.IndexOf(',');
                    if (commaIndex >= 0)
                    {
                        data = signatureBase64.Substring(commaIndex + 1);
                    }
                }

                var bytes = Convert.FromBase64String(data);
                return Image.GetInstance(bytes);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Tenta carregar uma assinatura de um arquivo
        /// </summary>
        public static Image? TryLoadSignatureFromFile(string? path)
        {
            if (string.IsNullOrWhiteSpace(path))
                return null;

            string resolvedPath = path;

            // Se o caminho não existe, tenta resolver relativo a wwwroot/images
            if (!File.Exists(resolvedPath))
            {
                resolvedPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", path);
                if (!File.Exists(resolvedPath))
                    return null;
            }

            try
            {
                return Image.GetInstance(resolvedPath);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Sanitiza um segmento de nome de arquivo removendo caracteres inválidos
        /// </summary>
        public static string SanitizeFileSegment(string? value, string fallback = "NA")
        {
            if (string.IsNullOrWhiteSpace(value))
                return fallback;

            var trimmed = value.Trim();
            var invalidChars = Path.GetInvalidFileNameChars();
            var sanitized = new string(trimmed.Select(ch => invalidChars.Contains(ch) ? '_' : ch).ToArray());

            return string.IsNullOrWhiteSpace(sanitized) ? fallback : sanitized;
        }
    }
}