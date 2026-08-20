using backend.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using NpgsqlTypes;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private static readonly TimeSpan OnlineWindow = TimeSpan.FromMinutes(5);

        public LoginController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private NpgsqlConnection CreateConnection()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException("Configuração de conexão ausente.");
            }

            return new NpgsqlConnection(connectionString);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();
                var lastSeenByUser = await GetLatestSessionActivityAsync(connection);
                var now = DateTime.UtcNow;

                const string sql = @"
                    SELECT Username, Email, Matricula, Type, Image
                    FROM login_certification
                    ORDER BY Username
                ";

                using var command = new NpgsqlCommand(sql, connection);
                using var reader = await command.ExecuteReaderAsync();

                var users = new List<object>();
                while (await reader.ReadAsync())
                {
                    var username = ReadStringOrEmpty(reader, 0);
                    var email = ReadStringOrEmpty(reader, 1);
                    var matricula = ReadNullableString(reader, 2);
                    var type = NormalizeUserType(reader.GetValue(3));
                    var image = ReadNullableString(reader, 4);
                    DateTime? lastSeen = null;
                    if (!string.IsNullOrWhiteSpace(username) &&
                        lastSeenByUser.TryGetValue(username.ToLowerInvariant(), out var lastSeenValue))
                    {
                        lastSeen = lastSeenValue;
                    }
                    var isOnline = lastSeen.HasValue && now - lastSeen.Value <= OnlineWindow;
                    users.Add(new
                    {
                        id = username,
                        fullName = username,
                        username,
                        email,
                        matricula,
                        type = NormalizeUserType(type),
                        image,
                        lastSeen,
                        isOnline
                    });
                }

                return Ok(users);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("auth")]
        public async Task<IActionResult> Authenticate([FromBody] LoginRequest request)
        {
            var identifier = request?.User?.Trim();
            var password = request?.Password;

            if (string.IsNullOrWhiteSpace(identifier) || string.IsNullOrWhiteSpace(password))
            {
                return BadRequest(new { message = "Usuário e senha são obrigatórios." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                const string sql = @"
                    SELECT Username, Email, Password, Salt, Type, Image
                    FROM login_certification
                    WHERE LOWER(Username) = @Identifier OR LOWER(Email) = @Identifier OR LOWER(Matricula) = @Identifier
                ";

                using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("@Identifier", identifier.ToLowerInvariant());

                string? username = null;
                string? email = null;
                string? hash = null;
                string? salt = null;
                string? type = null;
                string? image = null;

                using (var reader = await command.ExecuteReaderAsync())
                {
                    if (!await reader.ReadAsync())
                    {
                        return Unauthorized(new { message = "Usuário ou senha inválidos." });
                    }

                    username = ReadStringOrEmpty(reader, 0);
                    email = ReadStringOrEmpty(reader, 1);
                    hash = ReadStringOrEmpty(reader, 2);
                    salt = ReadStringOrEmpty(reader, 3);
                    type = NormalizeUserType(reader.GetValue(4));
                    image = ReadNullableString(reader, 5);
                }

                if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(hash) || string.IsNullOrWhiteSpace(salt))
                {
                    return Unauthorized(new { message = "Usuário ou senha inválidos." });
                }

                if (!VerifyPassword(password, hash, salt))
                {
                    return Unauthorized(new { message = "Usuário ou senha inválidos." });
                }

                var userSession = await CreateSessionAsync(connection, username, email);
                return Ok(new
                {
                    success = true,
                    user = new
                    {
                        id = username,
                        fullName = username,
                        username,
                        email,
                        type = NormalizeUserType(type),
                        image
                    },
                    session = new
                    {
                        id = userSession.sessionId,
                        createdAt = userSession.createdAt,
                        lastSeen = userSession.lastSeen
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            var username = request?.Username?.Trim();
            var email = request?.Email?.Trim();
            var matricula = string.IsNullOrWhiteSpace(request?.Matricula) ? null : request!.Matricula!.Trim();
            var password = request?.Password;
            var type = NormalizeUserType(request?.Type);
            var image = request?.Image;

            if (string.IsNullOrWhiteSpace(username) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(password))
            {
                return BadRequest(new { message = "Username, Email e Senha são obrigatórios." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();
                var emailNormalized = email.ToLowerInvariant();
                var matriculaNormalized = matricula?.ToLowerInvariant();

                const string checkSql = @"
                    SELECT COUNT(*)
                    FROM login_certification
                    WHERE LOWER(Username) = @Username OR LOWER(Email) = @Email
                       OR (@Matricula IS NOT NULL AND LOWER(Matricula) = @Matricula)
                ";

                using (var checkCommand = new NpgsqlCommand(checkSql, connection))
                {
                    checkCommand.Parameters.AddWithValue("@Username", username.ToLowerInvariant());
                    checkCommand.Parameters.AddWithValue("@Email", emailNormalized);
                    checkCommand.Parameters.AddWithValue("@Matricula", (object?)matriculaNormalized ?? DBNull.Value);
                    var exists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
                    if (exists > 0)
                    {
                        return Conflict(new { message = "Usuário, email ou matrícula já existente." });
                    }
                }

                var lengthError = await ValidateColumnLengthAsync(connection, "Username", username, "Username");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                lengthError = await ValidateColumnLengthAsync(connection, "Email", emailNormalized, "Email");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                lengthError = await ValidateColumnLengthAsync(connection, "Matricula", matricula, "Matrícula");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                lengthError = await ValidateColumnLengthAsync(connection, "Image", image, "Imagem");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                var (hash, salt) = HashPassword(password);

                const string insertSql = @"
                    INSERT INTO login_certification (Username, Email, Matricula, Password, Salt, Type, Image)
                    VALUES (@Username, @Email, @Matricula, @Password, @Salt, @Type, @Image)
                ";

                using (var insertCommand = new NpgsqlCommand(insertSql, connection))
                {
                    insertCommand.Parameters.AddWithValue("@Username", username);
                    insertCommand.Parameters.AddWithValue("@Email", emailNormalized);
                    insertCommand.Parameters.AddWithValue("@Matricula", (object?)matricula ?? DBNull.Value);
                    insertCommand.Parameters.AddWithValue("@Password", hash);
                    insertCommand.Parameters.AddWithValue("@Salt", salt);
                    await AddTypeParameterAsync(insertCommand, connection, "@Type", type);
                    await AddImageParameterAsync(insertCommand, connection, "@Image", image);
                    await insertCommand.ExecuteNonQueryAsync();
                }

                return Ok(new
                {
                    success = true,
                    message = "Usuário criado com sucesso.",
                    user = new
                    {
                        id = username,
                        fullName = username,
                        username,
                        email,
                        matricula,
                        type,
                        image
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        public class UpdateUserRequest
        {
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? Matricula { get; set; }
            public string? Type { get; set; }
            public string? Image { get; set; }
        }

        public class UserModulePermissionRequest
        {
            public string? ModuleKey { get; set; }
            public bool CanView { get; set; }
            public bool CanEdit { get; set; }
        }

        [HttpPut("users/{username}")]
        public async Task<IActionResult> UpdateUser(string username, [FromBody] UpdateUserRequest request)
        {
            var newUsername = request?.Username?.Trim();
            var newEmail = request?.Email?.Trim();
            var newMatricula = string.IsNullOrWhiteSpace(request?.Matricula) ? null : request!.Matricula!.Trim();
            var rawType = request?.Type;
            var type = rawType == null ? null : NormalizeUserType(rawType);
            var image = request?.Image;

            if (string.IsNullOrWhiteSpace(newUsername) || string.IsNullOrWhiteSpace(newEmail))
            {
                return BadRequest(new { message = "Username e Email são obrigatórios." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();
                var newEmailNormalized = newEmail.ToLowerInvariant();
                var newMatriculaNormalized = newMatricula?.ToLowerInvariant();

                const string checkSql = @"
                    SELECT COUNT(*)
                    FROM login_certification
                    WHERE (LOWER(Username) = @NewUsername OR LOWER(Email) = @NewEmail
                        OR (@NewMatricula IS NOT NULL AND LOWER(Matricula) = @NewMatricula))
                      AND LOWER(Username) <> @CurrentUsername
                ";

                using (var checkCommand = new NpgsqlCommand(checkSql, connection))
                {
                    checkCommand.Parameters.AddWithValue("@NewUsername", newUsername.ToLowerInvariant());
                    checkCommand.Parameters.AddWithValue("@NewEmail", newEmailNormalized);
                    checkCommand.Parameters.AddWithValue("@NewMatricula", (object?)newMatriculaNormalized ?? DBNull.Value);
                    checkCommand.Parameters.AddWithValue("@CurrentUsername", username.ToLowerInvariant());
                    var exists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
                    if (exists > 0)
                    {
                        return Conflict(new { message = "Usuário, email ou matrícula já existente." });
                    }
                }

                var lengthError = await ValidateColumnLengthAsync(connection, "Username", newUsername, "Username");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                lengthError = await ValidateColumnLengthAsync(connection, "Email", newEmailNormalized, "Email");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                lengthError = await ValidateColumnLengthAsync(connection, "Matricula", newMatricula, "Matrícula");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                lengthError = await ValidateColumnLengthAsync(connection, "Image", image, "Imagem");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                const string updateSql = @"
                    UPDATE login_certification
                    SET Username = @NewUsername,
                        Email = @NewEmail,
                        Matricula = @NewMatricula,
                        Type = COALESCE(@Type, Type),
                        Image = COALESCE(@Image, Image)
                    WHERE LOWER(Username) = @CurrentUsername
                ";

                using (var updateCommand = new NpgsqlCommand(updateSql, connection))
                {
                    updateCommand.Parameters.AddWithValue("@NewUsername", newUsername);
                    updateCommand.Parameters.AddWithValue("@NewEmail", newEmailNormalized);
                    updateCommand.Parameters.AddWithValue("@NewMatricula", (object?)newMatricula ?? DBNull.Value);
                    await AddTypeParameterAsync(updateCommand, connection, "@Type", type);
                    await AddImageParameterAsync(updateCommand, connection, "@Image", image);
                    updateCommand.Parameters.AddWithValue("@CurrentUsername", username.ToLowerInvariant());
                    var rows = await updateCommand.ExecuteNonQueryAsync();
                    if (rows == 0)
                    {
                        return NotFound(new { message = "Usuário não encontrado." });
                    }
                }

                if (!string.Equals(newUsername, username, StringComparison.OrdinalIgnoreCase))
                {
                    const string updatePermissionsSql = @"
                        UPDATE login_module_permissions
                        SET Username = @NewUsername
                        WHERE LOWER(Username) = @CurrentUsername
                    ";

                    using var permissionsCommand = new NpgsqlCommand(updatePermissionsSql, connection);
                    permissionsCommand.Parameters.AddWithValue("@NewUsername", newUsername.ToLowerInvariant());
                    permissionsCommand.Parameters.AddWithValue("@CurrentUsername", username.ToLowerInvariant());
                    await permissionsCommand.ExecuteNonQueryAsync();
                }

                return Ok(new
                {
                    success = true,
                    message = "Usuário atualizado com sucesso.",
                    user = new
                    {
                        id = newUsername,
                        fullName = newUsername,
                        username = newUsername,
                        email = newEmail,
                        matricula = newMatricula,
                        type = type ?? "User",
                        image
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("users/{username}")]
        public async Task<IActionResult> DeleteUser(string username)
        {
            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                const string sql = @"
                    DELETE FROM login_certification
                    WHERE LOWER(Username) = @Username
                ";

                using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("@Username", username.ToLowerInvariant());
                var rows = await command.ExecuteNonQueryAsync();

                if (rows == 0)
                {
                    return NotFound(new { message = "Usuário não encontrado." });
                }

                const string deletePermissionsSql = @"
                    DELETE FROM login_module_permissions
                    WHERE LOWER(Username) = @Username
                ";

                using (var permissionsCommand = new NpgsqlCommand(deletePermissionsSql, connection))
                {
                    permissionsCommand.Parameters.AddWithValue("@Username", username.ToLowerInvariant());
                    await permissionsCommand.ExecuteNonQueryAsync();
                }

                return Ok(new { success = true, message = "Usuário removido com sucesso." });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("users/{username}/permissions")]
        public async Task<IActionResult> GetUserModulePermissions(string username)
        {
            var trimmedUsername = username?.Trim();
            if (string.IsNullOrWhiteSpace(trimmedUsername))
            {
                return BadRequest(new { message = "Usuário é obrigatório." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                const string sql = @"
                    SELECT ModuleKey, CanView, CanEdit
                    FROM login_module_permissions
                    WHERE LOWER(Username) = @Username
                    ORDER BY ModuleKey
                ";

                using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("@Username", trimmedUsername.ToLowerInvariant());
                using var reader = await command.ExecuteReaderAsync();

                var result = new List<object>();
                while (await reader.ReadAsync())
                {
                    result.Add(new
                    {
                        moduleKey = ReadStringOrEmpty(reader, 0),
                        canView = reader.GetBoolean(1),
                        canEdit = reader.GetBoolean(2)
                    });
                }

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("users/{username}/permissions")]
        public async Task<IActionResult> UpdateUserModulePermissions(
            string username,
            [FromBody] List<UserModulePermissionRequest>? permissions)
        {
            var trimmedUsername = username?.Trim();
            if (string.IsNullOrWhiteSpace(trimmedUsername))
            {
                return BadRequest(new { message = "Usuário é obrigatório." });
            }

            if (permissions == null)
            {
                return BadRequest(new { message = "Permissões são obrigatórias." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                using var transaction = connection.BeginTransaction();

                const string deleteSql = @"
                    DELETE FROM login_module_permissions
                    WHERE LOWER(Username) = @Username
                ";

                using (var deleteCommand = new NpgsqlCommand(deleteSql, connection, transaction))
                {
                    deleteCommand.Parameters.AddWithValue("@Username", trimmedUsername.ToLowerInvariant());
                    await deleteCommand.ExecuteNonQueryAsync();
                }

                const string insertSql = @"
                    INSERT INTO login_module_permissions
                        (Username, ModuleKey, CanView, CanEdit, UpdatedAt)
                    VALUES
                        (@Username, @ModuleKey, @CanView, @CanEdit, @UpdatedAt)
                ";

                foreach (var permission in permissions)
                {
                    var moduleKey = permission?.ModuleKey?.Trim();
                    if (string.IsNullOrWhiteSpace(moduleKey))
                    {
                        continue;
                    }

                    var canEdit = permission!.CanEdit;
                    var canView = permission.CanView || canEdit;

                    using var insertCommand = new NpgsqlCommand(insertSql, connection, transaction);
                    insertCommand.Parameters.AddWithValue("@Username", trimmedUsername.ToLowerInvariant());
                    insertCommand.Parameters.AddWithValue("@ModuleKey", moduleKey);
                    insertCommand.Parameters.AddWithValue("@CanView", canView);
                    insertCommand.Parameters.AddWithValue("@CanEdit", canEdit);
                    insertCommand.Parameters.AddWithValue("@UpdatedAt", DateTime.UtcNow);
                    await insertCommand.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Permissões atualizadas com sucesso." });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile([FromQuery] string? username = null, [FromQuery] string? email = null)
        {
            if (string.IsNullOrWhiteSpace(username) && string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "Informe o username ou email." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                const string sql = @"
                    SELECT Username, Email, Type, Image
                    FROM login_certification
                    WHERE (@Username IS NOT NULL AND LOWER(Username) = @Username)
                       OR (@Email IS NOT NULL AND LOWER(Email) = @Email)
                ";

                using var command = new NpgsqlCommand(sql, connection);
                command.Parameters.AddWithValue("@Username", (object?)username?.ToLowerInvariant() ?? DBNull.Value);
                command.Parameters.AddWithValue("@Email", (object?)email?.ToLowerInvariant() ?? DBNull.Value);

                using var reader = await command.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    return NotFound(new { message = "Usuário não encontrado." });
                }

                var foundUsername = ReadStringOrEmpty(reader, 0);
                var foundEmail = ReadStringOrEmpty(reader, 1);
                var type = NormalizeUserType(reader.GetValue(2));
                var image = ReadNullableString(reader, 3);

                return Ok(new
                {
                    id = foundUsername,
                    fullName = foundUsername,
                    username = foundUsername,
                    email = foundEmail,
                    type = NormalizeUserType(type),
                    image
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        public class ProfileUpdateRequest
        {
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? NewUsername { get; set; }
            public string? NewEmail { get; set; }
            public string? Image { get; set; }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateRequest request)
        {
            var lookupUsername = request?.Username?.Trim();
            var lookupEmail = request?.Email?.Trim();
            var newUsername = request?.NewUsername?.Trim();
            var newEmail = request?.NewEmail?.Trim();
            var newImage = request?.Image;

            if (string.IsNullOrWhiteSpace(lookupUsername) && string.IsNullOrWhiteSpace(lookupEmail))
            {
                return BadRequest(new { message = "Informe o username ou email." });
            }

            if (string.IsNullOrWhiteSpace(newUsername) &&
                string.IsNullOrWhiteSpace(newEmail) &&
                newImage == null)
            {
                return BadRequest(new { message = "Nenhum dado para atualizar." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                const string selectSql = @"
                    SELECT Username, Email, Type, Image
                    FROM login_certification
                    WHERE (@Username IS NOT NULL AND LOWER(Username) = @Username)
                       OR (@Email IS NOT NULL AND LOWER(Email) = @Email)
                ";

                string currentUsername;
                string? currentEmail;
                string currentType;
                string? currentImage;

                using (var selectCommand = new NpgsqlCommand(selectSql, connection))
                {
                    selectCommand.Parameters.AddWithValue("@Username", (object?)lookupUsername?.ToLowerInvariant() ?? DBNull.Value);
                    selectCommand.Parameters.AddWithValue("@Email", (object?)lookupEmail?.ToLowerInvariant() ?? DBNull.Value);
                    using var reader = await selectCommand.ExecuteReaderAsync();
                    if (!await reader.ReadAsync())
                    {
                        return NotFound(new { message = "Usuário não encontrado." });
                    }
                    currentUsername = ReadStringOrEmpty(reader, 0);
                    currentEmail = ReadNullableString(reader, 1);
                    currentType = NormalizeUserType(reader.GetValue(2));
                    currentImage = ReadNullableString(reader, 3);
                }

                var targetUsername = string.IsNullOrWhiteSpace(newUsername) ? currentUsername : newUsername;
                var targetEmail = string.IsNullOrWhiteSpace(newEmail) ? currentEmail : newEmail;
                var targetEmailNormalized = string.IsNullOrWhiteSpace(targetEmail) ? null : targetEmail.ToLowerInvariant();
                var targetImage = newImage == null ? currentImage : newImage;

                var lengthError = await ValidateColumnLengthAsync(connection, "Username", targetUsername, "Username");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                lengthError = await ValidateColumnLengthAsync(connection, "Email", targetEmailNormalized, "Email");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                lengthError = await ValidateColumnLengthAsync(connection, "Image", targetImage, "Imagem");
                if (lengthError != null)
                {
                    return BadRequest(new { message = lengthError });
                }

                const string checkSql = @"
                    SELECT COUNT(*)
                    FROM login_certification
                    WHERE ((@NewUsername IS NOT NULL AND LOWER(Username) = @NewUsername)
                       OR (@NewEmail IS NOT NULL AND LOWER(Email) = @NewEmail))
                      AND LOWER(Username) <> @CurrentUsername
                ";

                using (var checkCommand = new NpgsqlCommand(checkSql, connection))
                {
                    checkCommand.Parameters.AddWithValue("@NewUsername", targetUsername.ToLowerInvariant());
                    checkCommand.Parameters.AddWithValue("@NewEmail", (object?)targetEmailNormalized ?? DBNull.Value);
                    checkCommand.Parameters.AddWithValue("@CurrentUsername", currentUsername.ToLowerInvariant());
                    var exists = Convert.ToInt32(await checkCommand.ExecuteScalarAsync(), CultureInfo.InvariantCulture);
                    if (exists > 0)
                    {
                        return Conflict(new { message = "Usuário ou email já existente." });
                    }
                }

                const string updateSql = @"
                    UPDATE login_certification
                    SET Username = @NewUsername,
                        Email = @NewEmail,
                        Image = @Image
                    WHERE LOWER(Username) = @CurrentUsername
                ";

                using (var updateCommand = new NpgsqlCommand(updateSql, connection))
                {
                    updateCommand.Parameters.AddWithValue("@NewUsername", targetUsername);
                    updateCommand.Parameters.AddWithValue("@NewEmail", (object?)targetEmailNormalized ?? DBNull.Value);
                    await AddImageParameterAsync(updateCommand, connection, "@Image", targetImage);
                    updateCommand.Parameters.AddWithValue("@CurrentUsername", currentUsername.ToLowerInvariant());
                    await updateCommand.ExecuteNonQueryAsync();
                }

                if (!string.Equals(targetUsername, currentUsername, StringComparison.OrdinalIgnoreCase))
                {
                    const string updatePermissionsSql = @"
                        UPDATE login_module_permissions
                        SET Username = @NewUsername
                        WHERE LOWER(Username) = @CurrentUsername
                    ";

                    using var permissionsCommand = new NpgsqlCommand(updatePermissionsSql, connection);
                    permissionsCommand.Parameters.AddWithValue("@NewUsername", targetUsername.ToLowerInvariant());
                    permissionsCommand.Parameters.AddWithValue("@CurrentUsername", currentUsername.ToLowerInvariant());
                    await permissionsCommand.ExecuteNonQueryAsync();
                }

                return Ok(new
                {
                    success = true,
                    message = "Perfil atualizado com sucesso.",
                    user = new
                    {
                        id = targetUsername,
                        fullName = targetUsername,
                        username = targetUsername,
                        email = targetEmailNormalized ?? string.Empty,
                        type = currentType,
                        image = targetImage
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("ping")]
        public async Task<IActionResult> Ping()
        {
            var sessionId = GetSessionIdFromRequest();
            if (sessionId == null)
            {
                return Unauthorized(new { message = "Sessão inválida." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                var updated = await RefreshSessionAsync(connection, sessionId.Value);
                if (!updated)
                {
                    return Unauthorized(new { message = "Sessão expirada." });
                }

                return Ok(new { success = true });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var sessionId = GetSessionIdFromRequest();
            if (sessionId == null)
            {
                return Unauthorized(new { message = "Sessão inválida." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                await RevokeSessionAsync(connection, sessionId.Value);
                return Ok(new { success = true });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("online")]
        public async Task<IActionResult> GetOnline([FromQuery] int? windowMinutes = null)
        {
            var window = windowMinutes.HasValue && windowMinutes.Value > 0
                ? TimeSpan.FromMinutes(windowMinutes.Value)
                : OnlineWindow;

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                var lastSeenByUser = await GetLatestSessionActivityAsync(connection);
                var now = DateTime.UtcNow;
                var onlineUsers = lastSeenByUser
                    .Where(entry => now - entry.Value <= window)
                    .OrderBy(entry => entry.Key)
                    .Select(entry => new { username = entry.Key, lastSeen = entry.Value })
                    .ToList();

                return Ok(new { windowMinutes = window.TotalMinutes, users = onlineUsers });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        public class ChangePasswordRequest
        {
            public string? Username { get; set; }
            public string? Email { get; set; }
            public string? CurrentPassword { get; set; }
            public string? NewPassword { get; set; }
        }

        public class ForgotPasswordRequest
        {
            public string? Identifier { get; set; }
        }

        public class ResetPasswordRequest
        {
            public string? Token { get; set; }
            public string? NewPassword { get; set; }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var identifier = request?.Identifier?.Trim();
            if (string.IsNullOrWhiteSpace(identifier))
            {
                return BadRequest(new { message = "Informe o usuário ou e-mail." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                const string sql = @"
                    SELECT Username, Email
                    FROM login_certification
                    WHERE LOWER(Username) = @Identifier OR LOWER(Email) = @Identifier
                ";

                string? username = null;
                string? email = null;

                using (var command = new NpgsqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Identifier", identifier.ToLowerInvariant());
                    using var reader = await command.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        username = ReadStringOrEmpty(reader, 0);
                        email = ReadStringOrEmpty(reader, 1);
                    }
                }

                if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(email))
                {
                    return Ok(new { success = true, message = "Se existir uma conta, enviaremos um link para redefinir a senha." });
                }

                var smtpConfig = LoadSmtpConfig();
                if (string.IsNullOrWhiteSpace(smtpConfig.Host) || string.IsNullOrWhiteSpace(smtpConfig.FromEmail) || smtpConfig.Port is null)
                {
                    return StatusCode(500, new { message = "Configuração de e-mail não definida." });
                }

                var token = GenerateResetToken();
                var tokenHash = HashToken(token);
                var now = DateTime.UtcNow;
                var expiresAt = now.AddHours(1);

                const string invalidateSql = @"
                    UPDATE login_password_resets
                    SET UsedAt = @Now
                    WHERE LOWER(Username) = @Username AND UsedAt IS NULL
                ";

                using (var invalidateCommand = new NpgsqlCommand(invalidateSql, connection))
                {
                    invalidateCommand.Parameters.AddWithValue("@Now", now);
                    invalidateCommand.Parameters.AddWithValue("@Username", username.ToLowerInvariant());
                    await invalidateCommand.ExecuteNonQueryAsync();
                }

                const string insertSql = @"
                    INSERT INTO login_password_resets (TokenHash, Username, Email, CreatedAt, ExpiresAt)
                    VALUES (@TokenHash, @Username, @Email, @CreatedAt, @ExpiresAt)
                ";

                using (var insertCommand = new NpgsqlCommand(insertSql, connection))
                {
                    insertCommand.Parameters.AddWithValue("@TokenHash", tokenHash);
                    insertCommand.Parameters.AddWithValue("@Username", username);
                    insertCommand.Parameters.AddWithValue("@Email", email);
                    insertCommand.Parameters.AddWithValue("@CreatedAt", now);
                    insertCommand.Parameters.AddWithValue("@ExpiresAt", expiresAt);
                    await insertCommand.ExecuteNonQueryAsync();
                }

                var resetLink = BuildResetLink(token);
                await SendResetEmailAsync(smtpConfig, email, username, resetLink);

                return Ok(new { success = true, message = "Se existir uma conta, enviaremos um link para redefinir a senha." });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.Token) || string.IsNullOrWhiteSpace(request?.NewPassword))
            {
                return BadRequest(new { message = "Token e nova senha são obrigatórios." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();
                await using var transaction = (NpgsqlTransaction)await connection.BeginTransactionAsync();

                var tokenHash = HashToken(request.Token.Trim());
                var now = DateTime.UtcNow;

                const string selectSql = @"
                    SELECT Username, Email
                    FROM login_password_resets
                    WHERE TokenHash = @TokenHash
                      AND UsedAt IS NULL
                      AND ExpiresAt > @Now
                    LIMIT 1
                ";

                string? username = null;

                using (var selectCommand = new NpgsqlCommand(selectSql, connection, transaction))
                {
                    selectCommand.Parameters.AddWithValue("@TokenHash", tokenHash);
                    selectCommand.Parameters.AddWithValue("@Now", now);
                    using var reader = await selectCommand.ExecuteReaderAsync();
                    if (await reader.ReadAsync())
                    {
                        username = ReadStringOrEmpty(reader, 0);
                    }
                }

                if (string.IsNullOrWhiteSpace(username))
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Token inválido ou expirado." });
                }

                var (newHash, newSalt) = HashPassword(request.NewPassword);

                const string updateUserSql = @"
                    UPDATE login_certification
                    SET Password = @Password, Salt = @Salt
                    WHERE LOWER(Username) = @Username
                ";

                using (var updateCommand = new NpgsqlCommand(updateUserSql, connection, transaction))
                {
                    updateCommand.Parameters.AddWithValue("@Password", newHash);
                    updateCommand.Parameters.AddWithValue("@Salt", newSalt);
                    updateCommand.Parameters.AddWithValue("@Username", username.ToLowerInvariant());
                    await updateCommand.ExecuteNonQueryAsync();
                }

                const string updateResetSql = @"
                    UPDATE login_password_resets
                    SET UsedAt = @Now
                    WHERE TokenHash = @TokenHash
                ";

                using (var updateResetCommand = new NpgsqlCommand(updateResetSql, connection, transaction))
                {
                    updateResetCommand.Parameters.AddWithValue("@Now", now);
                    updateResetCommand.Parameters.AddWithValue("@TokenHash", tokenHash);
                    await updateResetCommand.ExecuteNonQueryAsync();
                }

                await transaction.CommitAsync();
                return Ok(new { success = true, message = "Senha redefinida com sucesso." });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.CurrentPassword) ||
                string.IsNullOrWhiteSpace(request?.NewPassword))
            {
                return BadRequest(new { message = "Senha atual e nova senha são obrigatórias." });
            }

            if (string.IsNullOrWhiteSpace(request.Username) && string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Informe o username ou email." });
            }

            try
            {
                using var connection = CreateConnection();
                await connection.OpenAsync();

                const string sql = @"
                    SELECT Username, Password, Salt
                    FROM login_certification
                    WHERE (@Username IS NOT NULL AND LOWER(Username) = @Username)
                       OR (@Email IS NOT NULL AND LOWER(Email) = @Email)
                ";

                string? username = null;
                string? hash = null;
                string? salt = null;

                using (var command = new NpgsqlCommand(sql, connection))
                {
                    command.Parameters.AddWithValue("@Username", (object?)request.Username?.ToLowerInvariant() ?? DBNull.Value);
                    command.Parameters.AddWithValue("@Email", (object?)request.Email?.ToLowerInvariant() ?? DBNull.Value);
                    using var reader = await command.ExecuteReaderAsync();
                    if (!await reader.ReadAsync())
                    {
                        return NotFound(new { message = "Usuário não encontrado." });
                    }
                    username = reader.GetString(0);
                    hash = reader.GetString(1);
                    salt = reader.GetString(2);
                }

                if (hash == null || salt == null || !VerifyPassword(request.CurrentPassword, hash, salt))
                {
                    return Unauthorized(new { message = "Senha atual inválida." });
                }

                var (newHash, newSalt) = HashPassword(request.NewPassword);

                const string updateSql = @"
                    UPDATE login_certification
                    SET Password = @Password, Salt = @Salt
                    WHERE LOWER(Username) = @Username
                ";

                using (var updateCommand = new NpgsqlCommand(updateSql, connection))
                {
                    updateCommand.Parameters.AddWithValue("@Password", newHash);
                    updateCommand.Parameters.AddWithValue("@Salt", newSalt);
                    updateCommand.Parameters.AddWithValue("@Username", username!.ToLowerInvariant());
                    await updateCommand.ExecuteNonQueryAsync();
                }

                return Ok(new { success = true, message = "Senha atualizada com sucesso." });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private static string NormalizeUserType(object? value)
        {
            if (value == null || value is DBNull)
            {
                return "User";
            }

            if (value is string text)
            {
                return NormalizeUserType(text);
            }

            if (value is bool flag)
            {
                return flag ? "Admin" : "User";
            }

            if (value is byte or short or int or long)
            {
                return Convert.ToInt64(value, CultureInfo.InvariantCulture) == 1 ? "Admin" : "User";
            }

            var stringValue = Convert.ToString(value, CultureInfo.InvariantCulture);
            return NormalizeUserType(stringValue);
        }

        private static string NormalizeUserType(string? type)
        {
            return string.Equals(type, "Admin", StringComparison.OrdinalIgnoreCase)
                ? "Admin"
                : "User";
        }

        private static string? ReadNullableString(NpgsqlDataReader reader, int ordinal)
        {
            if (reader.IsDBNull(ordinal))
            {
                return null;
            }

            var value = reader.GetValue(ordinal);
            return value switch
            {
                string text => text,
                byte[] bytes => Encoding.UTF8.GetString(bytes),
                _ => Convert.ToString(value, CultureInfo.InvariantCulture)
            };
        }

        private static string ReadStringOrEmpty(NpgsqlDataReader reader, int ordinal)
        {
            return ReadNullableString(reader, ordinal) ?? string.Empty;
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

        private string BuildResetLink(string token)
        {
            var appBaseUrl = _configuration["App:BaseUrl"];
            if (string.IsNullOrWhiteSpace(appBaseUrl) && Request.Headers.TryGetValue("Origin", out var origin))
            {
                appBaseUrl = origin.FirstOrDefault();
            }
            if (string.IsNullOrWhiteSpace(appBaseUrl))
            {
                appBaseUrl = $"{Request.Scheme}://{Request.Host}";
            }

            return $"{appBaseUrl!.TrimEnd('/')}/reset-password?token={WebUtility.UrlEncode(token)}";
        }

        private async Task SendResetEmailAsync(SmtpConfig smtp, string email, string username, string resetLink)
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
            message.Subject = "Redefinicao de senha";
            var safeUser = WebUtility.HtmlEncode(username);
            var safeLink = WebUtility.HtmlEncode(resetLink);
            var textBody = $@"Ola {username},

Recebemos um pedido para redefinir sua senha. Para criar uma nova senha, acesse o link abaixo:

{resetLink}

Este link expira em 1 hora.

Se voce nao solicitou esta alteracao, ignore este e-mail.";

            var htmlBody = $@"<!doctype html>
<html>
  <head>
    <meta charset=""utf-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1"" />
    <title>Redefinicao de senha</title>
  </head>
  <body style=""margin:0; padding:0; background-color:#f4f6fb;"">
    <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color:#f4f6fb; padding:24px 12px;"">
      <tr>
        <td align=""center"">
          <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""max-width:560px; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 8px 24px rgba(15,23,42,0.12);"">
            <tr>
              <td style=""padding:28px 28px 12px 28px; font-family:'Segoe UI', Arial, sans-serif; color:#0f172a;"">
                <div style=""font-size:18px; font-weight:600; margin-bottom:8px;"">Redefinicao de senha</div>
                <div style=""font-size:14px; color:#334155;"">Ola {safeUser},</div>
              </td>
            </tr>
            <tr>
              <td style=""padding:0 28px 24px 28px; font-family:'Segoe UI', Arial, sans-serif; color:#334155; font-size:14px; line-height:1.6;"">
                Recebemos um pedido para redefinir sua senha. Para criar uma nova senha, use o botao abaixo.
              </td>
            </tr>
            <tr>
              <td align=""center"" style=""padding:0 28px 24px 28px;"">
                <a href=""{resetLink}"" style=""display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-family:'Segoe UI', Arial, sans-serif; font-size:14px; font-weight:600;"">
                  Criar nova senha
                </a>
              </td>
            </tr>
            <tr>
              <td style=""padding:0 28px 24px 28px; font-family:'Segoe UI', Arial, sans-serif; color:#64748b; font-size:12px; line-height:1.6;"">
                Este link expira em 1 hora. Se o botao nao funcionar, copie e cole o link abaixo no navegador:
                <div style=""word-break:break-all; margin-top:6px; color:#2563eb;"">{safeLink}</div>
              </td>
            </tr>
            <tr>
              <td style=""padding:0 28px 28px 28px; font-family:'Segoe UI', Arial, sans-serif; color:#64748b; font-size:12px; line-height:1.6;"">
                Se voce nao solicitou esta alteracao, ignore este e-mail.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";

            var body = new Multipart("alternative")
            {
                new TextPart("plain") { Text = textBody },
                new TextPart("html") { Text = htmlBody }
            };
            message.Body = body;

            var sendTask = client.SendAsync(message);
            var completed = await Task.WhenAny(sendTask, Task.Delay(TimeSpan.FromSeconds(30)));
            if (completed != sendTask)
            {
                throw new TimeoutException("Tempo limite ao enviar o e-mail.");
            }

            await sendTask;
            await client.DisconnectAsync(true);
        }

        private static SecureSocketOptions ResolveSecureSocketOptions(SmtpConfig smtp)
        {
            if (smtp.UseSsl == true)
            {
                return smtp.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTlsWhenAvailable;
            }

            return SecureSocketOptions.None;
        }

        private static string GenerateResetToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            var token = Convert.ToBase64String(bytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .TrimEnd('=');
            return token;
        }

        private static string HashToken(string token)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }

        private Guid? GetSessionIdFromRequest()
        {
            if (Request.Headers.TryGetValue("Authorization", out var authValues))
            {
                var auth = authValues.FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(auth))
                {
                    var parts = auth.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                    var token = parts.Length == 2 ? parts[1] : parts[0];
                    if (Guid.TryParse(token, out var sessionId))
                    {
                        return sessionId;
                    }
                }
            }

            if (Request.Headers.TryGetValue("X-Session-Id", out var sessionValues))
            {
                var session = sessionValues.FirstOrDefault();
                if (!string.IsNullOrWhiteSpace(session) && Guid.TryParse(session, out var sessionId))
                {
                    return sessionId;
                }
            }

            return null;
        }

        private async Task<(Guid sessionId, DateTime createdAt, DateTime lastSeen)> CreateSessionAsync(
            NpgsqlConnection connection,
            string username,
            string? email)
        {
            var sessionId = Guid.NewGuid();
            var now = DateTime.UtcNow;
            var ipAddress = TrimToLength(GetClientIpAddress(), 64);
            var userAgent = TrimToLength(GetUserAgent(), 256);

            const string sql = @"
                INSERT INTO login_sessions
                    (SessionId, Username, Email, CreatedAt, LastSeen, IpAddress, UserAgent)
                VALUES
                    (@SessionId, @Username, @Email, @CreatedAt, @LastSeen, @IpAddress, @UserAgent)
            ";

            using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("@SessionId", sessionId);
            command.Parameters.AddWithValue("@Username", username);
            command.Parameters.AddWithValue("@Email", (object?)email ?? DBNull.Value);
            command.Parameters.AddWithValue("@CreatedAt", now);
            command.Parameters.AddWithValue("@LastSeen", now);
            command.Parameters.AddWithValue("@IpAddress", (object?)ipAddress ?? DBNull.Value);
            command.Parameters.AddWithValue("@UserAgent", (object?)userAgent ?? DBNull.Value);
            await command.ExecuteNonQueryAsync();

            return (sessionId, now, now);
        }

        private async Task<bool> RefreshSessionAsync(NpgsqlConnection connection, Guid sessionId)
        {
            const string sql = @"
                UPDATE login_sessions
                SET LastSeen = @LastSeen
                WHERE SessionId = @SessionId
                  AND RevokedAt IS NULL
            ";

            using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("@SessionId", sessionId);
            command.Parameters.AddWithValue("@LastSeen", DateTime.UtcNow);
            var rows = await command.ExecuteNonQueryAsync();
            return rows > 0;
        }

        private async Task RevokeSessionAsync(NpgsqlConnection connection, Guid sessionId)
        {
            const string sql = @"
                UPDATE login_sessions
                SET RevokedAt = @RevokedAt
                WHERE SessionId = @SessionId
                  AND RevokedAt IS NULL
            ";

            using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("@SessionId", sessionId);
            command.Parameters.AddWithValue("@RevokedAt", DateTime.UtcNow);
            await command.ExecuteNonQueryAsync();
        }

        private async Task<Dictionary<string, DateTime>> GetLatestSessionActivityAsync(NpgsqlConnection connection)
        {
            const string sql = @"
                SELECT LOWER(Username) AS Username, MAX(LastSeen) AS LastSeen
                FROM login_sessions
                WHERE RevokedAt IS NULL
                GROUP BY LOWER(Username)
            ";

            using var command = new NpgsqlCommand(sql, connection);
            using var reader = await command.ExecuteReaderAsync();
            var result = new Dictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);

            while (await reader.ReadAsync())
            {
                if (reader.IsDBNull(0) || reader.IsDBNull(1))
                {
                    continue;
                }

                var username = reader.GetString(0);
                if (string.IsNullOrWhiteSpace(username))
                {
                    continue;
                }

                result[username] = reader.GetDateTime(1);
            }

            return result;
        }

        private string? GetClientIpAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        private string? GetUserAgent()
        {
            if (Request.Headers.TryGetValue("User-Agent", out var values))
            {
                return values.FirstOrDefault();
            }

            return null;
        }

        private static string? TrimToLength(string? value, int maxLength)
        {
            if (string.IsNullOrEmpty(value) || value.Length <= maxLength)
            {
                return value;
            }

            return value.Substring(0, maxLength);
        }

        private async Task<string?> ValidateColumnLengthAsync(
            NpgsqlConnection connection,
            string columnName,
            string? value,
            string displayName)
        {
            if (string.IsNullOrEmpty(value))
            {
                return null;
            }

            var (dataType, maxLength) = await GetColumnInfoAsync(connection, columnName);
            if (maxLength == null || maxLength < 0)
            {
                return null;
            }

            if (IsBinaryColumnType(dataType))
            {
                var byteCount = Encoding.UTF8.GetByteCount(value);
                if (byteCount > maxLength)
                {
                    return $"{displayName} excede o limite de {maxLength} bytes.";
                }

                return null;
            }

            if (IsCharacterColumnType(dataType) && value.Length > maxLength)
            {
                return $"{displayName} excede o limite de {maxLength} caracteres.";
            }

            return null;
        }

        private async Task<string?> GetColumnDataTypeAsync(NpgsqlConnection connection, string columnName)
        {
            var (dataType, _) = await GetColumnInfoAsync(connection, columnName);
            return dataType;
        }

        private async Task<(string? dataType, int? maxLength)> GetColumnInfoAsync(
            NpgsqlConnection connection,
            string columnName)
        {
            const string sql = @"
                SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = 'login_certification'
                  AND LOWER(COLUMN_NAME) = LOWER(@ColumnName)
            ";

            using var command = new NpgsqlCommand(sql, connection);
            command.Parameters.AddWithValue("@ColumnName", columnName);
            using var reader = await command.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
            {
                return (null, null);
            }

            var dataType = reader.IsDBNull(0) ? null : reader.GetString(0);
            int? maxLength = null;
            if (!reader.IsDBNull(1))
            {
                maxLength = reader.GetInt32(1);
            }

            return (dataType, maxLength);
        }

        private static bool IsBinaryColumnType(string? dataType)
        {
            return string.Equals(dataType, "bytea", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsCharacterColumnType(string? dataType)
        {
            return string.Equals(dataType, "character varying", StringComparison.OrdinalIgnoreCase)
                || string.Equals(dataType, "character", StringComparison.OrdinalIgnoreCase)
                || string.Equals(dataType, "text", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsBitColumnType(string? dataType)
        {
            return string.Equals(dataType, "boolean", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsNumericColumnType(string? dataType)
        {
            return string.Equals(dataType, "integer", StringComparison.OrdinalIgnoreCase)
                || string.Equals(dataType, "smallint", StringComparison.OrdinalIgnoreCase)
                || string.Equals(dataType, "bigint", StringComparison.OrdinalIgnoreCase);
        }

        private async Task AddImageParameterAsync(NpgsqlCommand command, NpgsqlConnection connection, string parameterName, string? image)
        {
            if (image == null)
            {
                command.Parameters.AddWithValue(parameterName, DBNull.Value);
                return;
            }

            var dataType = await GetColumnDataTypeAsync(connection, "Image");
            if (IsBinaryColumnType(dataType))
            {
                var bytes = Encoding.UTF8.GetBytes(image);
                var parameter = command.Parameters.Add(parameterName, NpgsqlDbType.Bytea, -1);
                parameter.Value = bytes;
                return;
            }

            command.Parameters.AddWithValue(parameterName, image);
        }

        private async Task AddTypeParameterAsync(NpgsqlCommand command, NpgsqlConnection connection, string parameterName, string? type)
        {
            if (type == null)
            {
                command.Parameters.AddWithValue(parameterName, DBNull.Value);
                return;
            }

            var normalizedType = NormalizeUserType(type);
            var dataType = await GetColumnDataTypeAsync(connection, "Type");

            if (IsBitColumnType(dataType))
            {
                var parameter = command.Parameters.Add(parameterName, NpgsqlDbType.Boolean);
                parameter.Value = string.Equals(normalizedType, "Admin", StringComparison.OrdinalIgnoreCase);
                return;
            }

            if (IsNumericColumnType(dataType))
            {
                var parameter = command.Parameters.Add(parameterName, NpgsqlDbType.Integer);
                parameter.Value = string.Equals(normalizedType, "Admin", StringComparison.OrdinalIgnoreCase) ? 1 : 0;
                return;
            }

            command.Parameters.AddWithValue(parameterName, normalizedType);
        }

        private static (string hash, string salt) HashPassword(string password)
        {
            var saltBytes = RandomNumberGenerator.GetBytes(16);
            using var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes, 100_000, HashAlgorithmName.SHA256);
            var hashBytes = pbkdf2.GetBytes(32);
            return (Convert.ToBase64String(hashBytes), Convert.ToBase64String(saltBytes));
        }

        private static bool VerifyPassword(string password, string hashBase64, string saltBase64)
        {
            if (string.IsNullOrWhiteSpace(hashBase64) || string.IsNullOrWhiteSpace(saltBase64))
            {
                return false;
            }

            Span<byte> saltBytes = stackalloc byte[16];
            if (!Convert.TryFromBase64String(saltBase64, saltBytes, out var saltLength))
            {
                return false;
            }

            using var pbkdf2 = new Rfc2898DeriveBytes(password, saltBytes[..saltLength].ToArray(), 100_000, HashAlgorithmName.SHA256);
            var hashBytes = pbkdf2.GetBytes(32);

            Span<byte> expectedHash = stackalloc byte[32];
            if (!Convert.TryFromBase64String(hashBase64, expectedHash, out var hashLength) ||
                hashLength != expectedHash.Length)
            {
                return false;
            }

            return CryptographicOperations.FixedTimeEquals(hashBytes, expectedHash);
        }
    }
}
