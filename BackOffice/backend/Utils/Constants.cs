namespace backend.Utils
{
    /// <summary>
    /// Constantes compartilhadas da aplicação
    /// </summary>
    public static class Constants
    {
        // Valores padrão para auditoria
        public const string DefaultSystemUser = "Sistema";
        public const string NotAvailable = "N/A";
        public const string NotInformed = "NÃO INFORMADO";

        // Informações da empresa
        public static class Company
        {
            public const string Name = "DIGICON S/A – Controle Eletrônico para Mecânica";
            public const string ShortName = "DIGICON S/A";
            public const string LegalName = "Digicon S/A";
            public const string CNPJ = "88.020.102/0001-10";
            public const string StateRegistration = "570028779";
            public const string SupplierCode = "163283";
            public const string Address = "R. Nissin Castiel, 640 – Distrito Industrial – Gravataí/RS – Brasil – CEP 94045-420";
            public const string FullAddress = "Rua Nissin Castiel, Nº 640 - Gravataí/RS - Brasil";
        }

        // Limites de campos
        public static class FieldLimits
        {
            public const int ShortTextField = 255;
            public const int MediumTextField = 500;
            public const int LongTextField = 4000;
            public const int AnalystName = 150;
        }

        // Mensagens de erro
        public static class ErrorMessages
        {
            public const string InvalidPath = "Caminho inválido.";
            public const string PayloadRequired = "Payload não informado.";
            public const string CertificateNotFound = "Certificado não encontrado.";
            public const string CertificateNumberRequired = "Número do certificado é obrigatório.";
            public const string DatabaseSaveError = "Falha ao salvar alterações no banco.";
        }

        // Padrões de especificação
        public static class Specifications
        {
            public const string DefaultInspected = "AS9138";
        }

        // Nomes de pastas padrão
        public static class Folders
        {
            public const string QualityCertificates = "Certificados";
            public const string ProductConformityCertificates = "ProductConformityCertificates";
            public const string SpecialProcessCertificates = "CertificadosProcessoEspecial";
        }
    }
}