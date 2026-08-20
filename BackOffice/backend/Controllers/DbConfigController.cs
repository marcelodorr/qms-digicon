using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DbConfigController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _environment;

        public DbConfigController(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        [HttpGet]
        public IActionResult Get()
        {
            var connection = _configuration.GetConnectionString("DefaultConnection") ?? string.Empty;

            var response = new DbConnectionConfig
            {
                DefaultConnection = connection
            };

            try
            {
                if (!string.IsNullOrWhiteSpace(connection))
                {
                    var builder = new NpgsqlConnectionStringBuilder(connection);
                    response.Server = builder.Host;
                    response.Port = builder.Port;
                    response.Database = builder.Database;
                    response.User = builder.Username;
                    response.Password = builder.Password;
                }
            }
            catch
            {
                // If parsing fails, still return the raw connection string for manual adjustment.
            }

            return Ok(response);
        }

        [HttpPut]
        public IActionResult Update([FromBody] DbConnectionConfig payload)
        {
            if (payload == null)
                return BadRequest("Payload inválido.");

            if (string.IsNullOrWhiteSpace(payload.Server) ||
                string.IsNullOrWhiteSpace(payload.Database) ||
                string.IsNullOrWhiteSpace(payload.User) ||
                string.IsNullOrWhiteSpace(payload.Password))
            {
                return BadRequest("Servidor, Banco, Usuário e Senha são obrigatórios.");
            }

            if (payload.Port is <= 0 or > 65535)
            {
                return BadRequest("A porta deve estar entre 1 e 65535.");
            }

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = payload.Server,
                Port = payload.Port ?? 5432,
                Database = payload.Database,
                Username = payload.User,
                Password = payload.Password,
                Pooling = true
            };

            var newConnection = builder.ConnectionString;

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

            if (root["ConnectionStrings"] is not JsonObject connectionSection)
            {
                connectionSection = new JsonObject();
                root["ConnectionStrings"] = connectionSection;
            }

            connectionSection["DefaultConnection"] = newConnection;

            var updatedJson = root.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
            System.IO.File.WriteAllText(appSettingsPath, updatedJson);

            if (_configuration is IConfigurationRoot configRoot)
            {
                configRoot.Reload();
            }

            return Ok(new DbConnectionConfig
            {
                Server = payload.Server,
                Port = payload.Port ?? 5432,
                Database = payload.Database,
                User = payload.User,
                Password = payload.Password,
                DefaultConnection = newConnection
            });
        }
    }
}
