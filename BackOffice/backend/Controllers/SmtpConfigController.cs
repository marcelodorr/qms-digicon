using System.IO;
using System.Net.Sockets;
using System.Text.Json;
using System.Text.Json.Nodes;
using backend.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SmtpConfigController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<SmtpConfigController> _logger;

        public SmtpConfigController(IConfiguration configuration, IWebHostEnvironment environment, ILogger<SmtpConfigController> logger)
        {
            _configuration = configuration;
            _environment = environment;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var section = _configuration.GetSection("Smtp");

            var host = section["Host"];
            var user = section["User"];
            var password = section["Password"];
            var fromEmail = section["FromEmail"];
            var fromName = section["FromName"];

            int? port = null;
            if (int.TryParse(section["Port"], out var parsedPort))
            {
                port = parsedPort;
            }

            bool? useSsl = null;
            if (bool.TryParse(section["UseSsl"], out var parsedUseSsl))
            {
                useSsl = parsedUseSsl;
            }

            return Ok(new SmtpConfig
            {
                Host = host ?? string.Empty,
                Port = port,
                User = user ?? string.Empty,
                Password = password ?? string.Empty,
                FromEmail = fromEmail ?? string.Empty,
                FromName = fromName ?? string.Empty,
                UseSsl = useSsl ?? true
            });
        }

        [HttpPut]
        public IActionResult Update([FromBody] SmtpConfig payload)
        {
            if (payload == null)
                return BadRequest("Payload inválido.");

            if (string.IsNullOrWhiteSpace(payload.Host) ||
                payload.Port is null ||
                payload.Port <= 0 ||
                string.IsNullOrWhiteSpace(payload.FromEmail))
            {
                return BadRequest("Servidor, Porta e E-mail remetente são obrigatórios.");
            }

            var appSettingsPath = Path.Combine(_environment.ContentRootPath, "appsettings.json");
            if (!System.IO.File.Exists(appSettingsPath))
                return NotFound("Arquivo appsettings.json não encontrado.");

            JsonObject? root;
            try
            {
                var jsonText = System.IO.File.ReadAllText(appSettingsPath);
                root = JsonNode.Parse(jsonText)?.AsObject();
            }
            catch (JsonException)
            {
                return StatusCode(500, "Conteúdo inválido em appsettings.json.");
            }

            if (root == null)
                return StatusCode(500, "Não foi possível ler o appsettings.json.");

            if (root["Smtp"] is not JsonObject smtpSection)
            {
                smtpSection = new JsonObject();
                root["Smtp"] = smtpSection;
            }

            smtpSection["Host"] = payload.Host.Trim();
            smtpSection["Port"] = payload.Port.Value;
            smtpSection["User"] = payload.User?.Trim() ?? string.Empty;
            smtpSection["Password"] = payload.Password ?? string.Empty;
            smtpSection["FromEmail"] = payload.FromEmail.Trim();
            smtpSection["FromName"] = payload.FromName?.Trim() ?? string.Empty;
            smtpSection["UseSsl"] = payload.UseSsl ?? true;

            var updatedJson = root.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
            System.IO.File.WriteAllText(appSettingsPath, updatedJson);

            if (_configuration is IConfigurationRoot configRoot)
            {
                configRoot.Reload();
            }

            return Ok(new SmtpConfig
            {
                Host = payload.Host.Trim(),
                Port = payload.Port.Value,
                User = payload.User?.Trim() ?? string.Empty,
                Password = payload.Password ?? string.Empty,
                FromEmail = payload.FromEmail.Trim(),
                FromName = payload.FromName?.Trim() ?? string.Empty,
                UseSsl = payload.UseSsl ?? true
            });
        }

        public class TestEmailRequest
        {
            public string? ToEmail { get; set; }
        }

        [HttpPost("test")]
        public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest request)
        {
            var smtpConfig = LoadSmtpConfig();
            if (string.IsNullOrWhiteSpace(smtpConfig.Host) || string.IsNullOrWhiteSpace(smtpConfig.FromEmail) || smtpConfig.Port is null)
            {
                return BadRequest(new { message = "Configure Host, Porta e E-mail remetente antes de testar." });
            }

            var toEmail = request?.ToEmail?.Trim();
            if (string.IsNullOrWhiteSpace(toEmail))
            {
                toEmail = smtpConfig.FromEmail;
            }

            try
            {
                await SendTestEmailAsync(smtpConfig, toEmail!);
                return Ok(new
                {
                    success = true,
                    message = "E-mail de teste enviado com sucesso.",
                    host = smtpConfig.Host,
                    port = smtpConfig.Port,
                    useSsl = smtpConfig.UseSsl ?? true
                });
            }
            catch (Exception ex)
            {
                var detail = ex.GetBaseException().Message;
                _logger.LogError(ex, "Falha ao enviar e-mail de teste SMTP (Host: {Host}, Port: {Port}, User: {User}, To: {To}).",
                    smtpConfig.Host, smtpConfig.Port, smtpConfig.User, toEmail);
                return StatusCode(500, new
                {
                    message = $"Falha ao enviar e-mail de teste: {detail} (Host: {smtpConfig.Host}, Port: {smtpConfig.Port}, SSL: {smtpConfig.UseSsl ?? true})",
                    detail,
                    host = smtpConfig.Host,
                    port = smtpConfig.Port,
                    useSsl = smtpConfig.UseSsl ?? true
                });
            }
        }

        [HttpPost("ping")]
        public async Task<IActionResult> Ping()
        {
            var smtpConfig = LoadSmtpConfig();
            if (string.IsNullOrWhiteSpace(smtpConfig.Host) || smtpConfig.Port is null)
            {
                return BadRequest(new { message = "Configure Host e Porta antes de testar a conexão." });
            }

            try
            {
                await TestSmtpConnectivityAsync(smtpConfig);
                return Ok(new
                {
                    success = true,
                    message = "Conexão SMTP realizada com sucesso.",
                    host = smtpConfig.Host,
                    port = smtpConfig.Port,
                    useSsl = smtpConfig.UseSsl ?? true
                });
            }
            catch (Exception ex)
            {
                var detail = ex.GetBaseException().Message;
                _logger.LogError(ex, "Falha ao conectar SMTP (Host: {Host}, Port: {Port}).",
                    smtpConfig.Host, smtpConfig.Port);
                return StatusCode(500, new
                {
                    message = $"Falha ao conectar SMTP: {detail} (Host: {smtpConfig.Host}, Port: {smtpConfig.Port}, SSL: {smtpConfig.UseSsl ?? true})",
                    detail,
                    host = smtpConfig.Host,
                    port = smtpConfig.Port,
                    useSsl = smtpConfig.UseSsl ?? true
                });
            }
        }

        private SmtpConfig LoadSmtpConfig()
        {
            var section = _configuration.GetSection("Smtp");
            int? port = null;
            if (int.TryParse(section["Port"], out var parsedPort))
            {
                port = parsedPort;
            }

            bool? useSsl = null;
            if (bool.TryParse(section["UseSsl"], out var parsedUseSsl))
            {
                useSsl = parsedUseSsl;
            }

            return new SmtpConfig
            {
                Host = section["Host"],
                Port = port,
                User = section["User"],
                Password = section["Password"],
                FromEmail = section["FromEmail"],
                FromName = section["FromName"],
                UseSsl = useSsl ?? true
            };
        }

        private async Task SendTestEmailAsync(SmtpConfig smtp, string email)
        {
            using var client = new SmtpClient();
            client.Timeout = 30_000;

            var secureSocket = ResolveSecureSocketOptions(smtp);
            await client.ConnectAsync(smtp.Host!, smtp.Port ?? 25, secureSocket);

            if (!string.IsNullOrWhiteSpace(smtp.User))
            {
                await client.AuthenticateAsync(smtp.User, smtp.Password ?? string.Empty);
            }

            var fromName = string.IsNullOrWhiteSpace(smtp.FromName) ? smtp.FromEmail! : smtp.FromName!;
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, smtp.FromEmail));
            message.To.Add(MailboxAddress.Parse(email));
            message.Subject = "Teste de envio - Digicon QMS";
            message.Body = new TextPart("plain")
            {
                Text = "Este e-mail confirma que as configuracoes SMTP estao funcionando."
            };

            var sendTask = client.SendAsync(message);
            var completed = await Task.WhenAny(sendTask, Task.Delay(TimeSpan.FromSeconds(30)));
            if (completed != sendTask)
            {
                throw new TimeoutException("Tempo limite ao enviar o e-mail de teste.");
            }

            await sendTask;
            await client.DisconnectAsync(true);
        }

        private static async Task TestSmtpConnectivityAsync(SmtpConfig smtp)
        {
            using var client = new TcpClient();
            var connectTask = client.ConnectAsync(smtp.Host!, smtp.Port ?? 25);
            var completed = await Task.WhenAny(connectTask, Task.Delay(TimeSpan.FromSeconds(5)));
            if (completed != connectTask)
            {
                throw new TimeoutException("Tempo limite ao conectar no servidor SMTP.");
            }

            await connectTask;
        }

        private static SecureSocketOptions ResolveSecureSocketOptions(SmtpConfig smtp)
        {
            if (smtp.UseSsl == true)
            {
                return smtp.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTlsWhenAvailable;
            }

            return SecureSocketOptions.None;
        }
    }
}
