using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Security.Cryptography;
using System.Text;
using Shopfloor.Domain.Common;
using Shopfloor.Domain.Entities;
using Shopfloor.Domain.Repositories;

namespace Shopfloor.Infrastructure.EntityFramework;

public class BaseRepository<T> : IBaseRepository<T> where T : BaseEntity
{
    protected readonly ShopfloorDbContext Context;
    protected BaseRepository(ShopfloorDbContext context) => Context = context;
    public virtual Task<T?> GetByIdAsync(Guid id, CancellationToken ct) => Context.Set<T>().FirstOrDefaultAsync(x => x.Id == id, ct);
    public async Task<IReadOnlyCollection<T>> ListAsync(CancellationToken ct) => await Context.Set<T>().AsNoTracking().ToListAsync(ct);
    public Task AddAsync(T entity, CancellationToken ct) => Context.Set<T>().AddAsync(entity, ct).AsTask();
    public void Remove(T entity) { entity.IsDeleted = true; Context.Update(entity); }
}

public sealed class UserRepository(ShopfloorDbContext c, string authenticationConnection) : BaseRepository<User>(c), IUserRepository
{
    public async Task<User?> FindByUsernameOrEmailAsync(string identifier, CancellationToken ct)
    {
        await using var connection = new SqlConnection(authenticationConnection);
        await connection.OpenAsync(ct);
        const string sql = """
            SELECT TOP 1 Id, Username, Password, Salt, Email, Type, [Image]
            FROM login_certification
            WHERE LOWER(Username) = @Identifier OR LOWER(Email) = @Identifier
            """;
        await using var command = new SqlCommand(sql, connection);
        command.Parameters.AddWithValue("@Identifier", identifier.ToLowerInvariant());
        await using var reader = await command.ExecuteReaderAsync(ct);
        if (!await reader.ReadAsync(ct)) return null;

        var externalId = Convert.ToString(reader.GetValue(0)) ?? string.Empty;
        var username = ReadString(reader, 1);
        return new User
        {
            Id = CreateStableId(externalId, username), ExternalId = externalId, Username = username, Name = username,
            PasswordHash = ReadString(reader, 2), PasswordSalt = ReadString(reader, 3), Email = ReadString(reader, 4),
            Type = NormalizeType(reader.GetValue(5)), Image = ReadImage(reader.GetValue(6))
        };
    }

    public async Task SyncLocalUserAsync(User user, CancellationToken ct)
    {
        var local = await Context.Users.FirstOrDefaultAsync(x => x.Id == user.Id, ct);
        if (local is null)
        {
            Context.Users.Add(user);
            return;
        }
        local.ExternalId = user.ExternalId; local.Username = user.Username; local.Name = user.Name;
        local.Email = user.Email; local.Type = user.Type; local.Image = user.Image;
        local.PasswordHash = user.PasswordHash; local.PasswordSalt = user.PasswordSalt; local.IsActive = true;
    }

    private static string ReadString(SqlDataReader reader, int ordinal) => reader.IsDBNull(ordinal) ? string.Empty : Convert.ToString(reader.GetValue(ordinal)) ?? string.Empty;
    private static string NormalizeType(object value) => value is int or long or short or byte
        ? (Convert.ToInt32(value) == 1 ? "Admin" : "User")
        : (Convert.ToString(value)?.Trim() is { Length: > 0 } type ? type : "User");
    private static string? ReadImage(object value) => value switch
    {
        DBNull => null,
        byte[] bytes => Convert.ToBase64String(bytes),
        _ => Convert.ToString(value)
    };
    private static Guid CreateStableId(string externalId, string username)
    {
        if (Guid.TryParse(externalId, out var databaseId)) return databaseId;
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes($"login_certification:{externalId}:{username.ToLowerInvariant()}"));
        return new Guid(bytes.AsSpan(0, 16));
    }
}
public sealed class MachineRepository(ShopfloorDbContext c, string machinesConnection) : BaseRepository<Machine>(c), IMachineRepository
{
    public async Task<IReadOnlyCollection<Machine>> ListAvailableAsync(CancellationToken ct)
    {
        var source = new List<(string Code, string Name, string Sector)>();
        await using (var connection = new SqlConnection(machinesConnection))
        {
            await connection.OpenAsync(ct);
            const string sql = """
                SELECT CodeMach, UsrNameMach, UsrLocal
                FROM Machines
                WHERE IsMach = 1 AND Inativa = 'N'
                ORDER BY UsrNameMach
                """;
            await using var command = new SqlCommand(sql, connection);
            await using var reader = await command.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
            {
                var code = reader.IsDBNull(0) ? string.Empty : Convert.ToString(reader.GetValue(0))?.Trim() ?? string.Empty;
                if (string.IsNullOrWhiteSpace(code)) continue;
                source.Add((code,
                    reader.IsDBNull(1) ? code : Convert.ToString(reader.GetValue(1))?.Trim() ?? code,
                    reader.IsDBNull(2) ? string.Empty : Convert.ToString(reader.GetValue(2))?.Trim() ?? string.Empty));
            }
        }

        var codes = source.Select(x => x.Code).ToArray();
        var localByCode = await Context.Machines.Where(x => codes.Contains(x.Code)).ToDictionaryAsync(x => x.Code, StringComparer.OrdinalIgnoreCase, ct);
        var result = new List<Machine>(source.Count);
        foreach (var item in source)
        {
            if (!localByCode.TryGetValue(item.Code, out var machine))
            {
                machine = new Machine { Id = StableMachineId(item.Code), Code = item.Code };
                Context.Machines.Add(machine);
                localByCode[item.Code] = machine;
            }
            machine.Name = item.Name; machine.Sector = item.Sector; machine.Status = MachineStatus.Active;
            result.Add(machine);
        }
        return result;
    }

    private static Guid StableMachineId(string code)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes($"machine:{code.ToUpperInvariant()}"));
        return new Guid(bytes.AsSpan(0, 16));
    }
}
public sealed class ProductionOrderRepository(ShopfloorDbContext c, string connectionString) : BaseRepository<ProductionOrder>(c), IProductionOrderRepository
{
    public async Task<IReadOnlyCollection<ProductionOrder>> ListByMachineAsync(Guid machineId, CancellationToken ct)
    {
        var source = new List<(string Code, string PartNumber, int Quantity, string Revision)>();
        await using var connection = new SqlConnection(connectionString); await connection.OpenAsync(ct);
        const string sql = """SELECT IndProd1, MAX(IndProd3), MAX(PlanQty), MAX(RevProcesso) FROM Production WHERE Inativo = 'N' AND IndProd1 IS NOT NULL GROUP BY IndProd1 ORDER BY IndProd1""";
        await using var command = new SqlCommand(sql, connection); await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) source.Add((Text(reader,0), Text(reader,1), reader.IsDBNull(2) ? 0 : Convert.ToInt32(reader.GetValue(2)), Text(reader,3)));
        var codes = source.Select(x => x.Code).ToArray();
        var locals = await Context.ProductionOrders.Where(x => codes.Contains(x.Code)).ToDictionaryAsync(x => x.Code, ct);
        var result = new List<ProductionOrder>();
        foreach (var item in source.Where(x => x.Code.Length > 0)) {
            if (!locals.TryGetValue(item.Code, out var entity)) { entity = new ProductionOrder { Id=StableId("production", item.Code), Code=item.Code }; Context.Add(entity); locals[item.Code]=entity; }
            entity.MachineId=machineId; entity.ProductName=item.PartNumber; entity.TargetQuantity=item.Quantity; entity.Revision=item.Revision; result.Add(entity);
        }
        return result;
    }
    private static string Text(SqlDataReader r,int i) => r.IsDBNull(i) ? string.Empty : Convert.ToString(r.GetValue(i))?.Trim() ?? string.Empty;
    private static Guid StableId(string type,string value) => new(SHA256.HashData(Encoding.UTF8.GetBytes($"{type}:{value.ToUpperInvariant()}"))[..16]);
}
public sealed class OperationRepository(ShopfloorDbContext c, string connectionString) : BaseRepository<Operation>(c), IOperationRepository
{
    public async Task<IReadOnlyCollection<Operation>> ListByProductionOrderAsync(Guid productionOrderId, CancellationToken ct)
    {
        var order = await Context.ProductionOrders.FirstOrDefaultAsync(x => x.Id == productionOrderId, ct) ?? throw new InvalidOperationException("Ordem de produção não sincronizada.");
        var source = new List<(string Code,string Name,string PartNumber,string Revision)>();
        await using var connection = new SqlConnection(connectionString); await connection.OpenAsync(ct);
        const string sql = """SELECT DISTINCT IndProd2, DataAux2, IndProd3, RevProcesso FROM Production WHERE Inativo = 'N' AND IndProd1 = @ProductionOrder ORDER BY IndProd2""";
        await using var command = new SqlCommand(sql, connection); command.Parameters.AddWithValue("@ProductionOrder", order.Code);
        await using var reader = await command.ExecuteReaderAsync(ct);
        while (await reader.ReadAsync(ct)) source.Add((Text(reader,0),Text(reader,1),Text(reader,2),Text(reader,3)));
        var codes=source.Select(x=>x.Code).ToArray(); var locals=await Context.Operations.Where(x=>x.ProductionOrderId==productionOrderId && codes.Contains(x.Code)).ToDictionaryAsync(x=>x.Code,ct);
        var result=new List<Operation>(); foreach(var item in source.Where(x=>x.Code.Length>0)) { if(!locals.TryGetValue(item.Code,out var entity)){entity=new Operation{Id=StableId(order.Code,item.Code),ProductionOrderId=productionOrderId,Code=item.Code};Context.Add(entity);locals[item.Code]=entity;} entity.Name=string.IsNullOrWhiteSpace(item.Name)?item.Code:item.Name;entity.PartNumber=item.PartNumber;entity.Revision=item.Revision;result.Add(entity); } return result;
    }
    private static string Text(SqlDataReader r,int i) => r.IsDBNull(i)?string.Empty:Convert.ToString(r.GetValue(i))?.Trim()??string.Empty;
    private static Guid StableId(string order,string operation) => new(SHA256.HashData(Encoding.UTF8.GetBytes($"operation:{order}:{operation}"))[..16]);
}
public sealed class DefectRepository(ShopfloorDbContext c, string cs) : BaseRepository<Defect>(c), IDefectRepository
{
    public Task<Defect?> FindByCodeAsync(string code,CancellationToken ct)=>Context.Defects.FirstOrDefaultAsync(x=>x.Code==code,ct);
    public Task<IReadOnlyCollection<Defect>> ListAvailableAsync(CancellationToken ct)=>SyncMotivesAsync(17,ct);
    private async Task<IReadOnlyCollection<Defect>> SyncMotivesAsync(int type,CancellationToken ct){var source=await ReadMotives(cs,type,ct);var codes=source.Select(x=>x.Code).ToArray();var locals=await Context.Defects.Where(x=>codes.Contains(x.Code)).ToDictionaryAsync(x=>x.Code,ct);var result=new List<Defect>();foreach(var item in source){if(!locals.TryGetValue(item.Code,out var e)){e=new Defect{Code=item.Code};Context.Add(e);locals[item.Code]=e;}e.Description=item.Text;result.Add(e);}return result;}
    internal static async Task<List<(string Code,string Text)>> ReadMotives(string cs,int type,CancellationToken ct){var result=new List<(string,string)>();await using var cn=new SqlConnection(cs);await cn.OpenAsync(ct);await using var cmd=new SqlCommand("SELECT Code, MsgText FROM Motivos WHERE [Type] = @Type AND Inativo = 'N' ORDER BY Code",cn);cmd.Parameters.AddWithValue("@Type",type);await using var r=await cmd.ExecuteReaderAsync(ct);while(await r.ReadAsync(ct)){var code=Convert.ToString(r.GetValue(0))?.Trim()??"";if(code.Length>0)result.Add((code,r.IsDBNull(1)?code:Convert.ToString(r.GetValue(1))?.Trim()??code));}return result;}
}
public sealed class CauseRepository(ShopfloorDbContext c, string cs) : BaseRepository<Cause>(c), ICauseRepository
{
    public Task<Cause?> FindByCodeAsync(string code,CancellationToken ct)=>Context.Causes.FirstOrDefaultAsync(x=>x.Code==code,ct);
    public async Task<IReadOnlyCollection<Cause>> ListAvailableAsync(CancellationToken ct){var source=await DefectRepository.ReadMotives(cs,18,ct);var codes=source.Select(x=>x.Code).ToArray();var locals=await Context.Causes.Where(x=>codes.Contains(x.Code)).ToDictionaryAsync(x=>x.Code,ct);var result=new List<Cause>();foreach(var item in source){if(!locals.TryGetValue(item.Code,out var e)){e=new Cause{Code=item.Code};Context.Add(e);locals[item.Code]=e;}e.Description=item.Text;result.Add(e);}return result;}
}
public sealed class QuotaRepository(ShopfloorDbContext c) : BaseRepository<Quota>(c), IQuotaRepository
{
    public override Task<Quota?> GetByIdAsync(Guid id, CancellationToken ct) => Context.Quotas.Include(x => x.Options).FirstOrDefaultAsync(x => x.Id == id, ct);
    public async Task<IReadOnlyCollection<Quota>> ListByOperationAsync(Guid id, CancellationToken ct) => await Context.Quotas.AsNoTracking().Include(x => x.Options).Where(x => x.OperationId == id).OrderBy(x => x.Number).ToListAsync(ct);
}
public sealed class DefectRecordRepository(ShopfloorDbContext c) : BaseRepository<DefectRecord>(c), IDefectRecordRepository
{
    private IQueryable<DefectRecord> Detailed => Context.DefectRecords.Include(x => x.User).Include(x => x.Machine)
        .Include(x => x.ProductionOrder).Include(x => x.Operation).Include(x => x.Defect).Include(x => x.Cause);
    public override Task<DefectRecord?> GetByIdAsync(Guid id, CancellationToken ct) => Detailed.FirstOrDefaultAsync(x => x.Id == id, ct);
    public async Task<PagedResult<DefectRecord>> ListDetailedAsync(int page, int size, Guid? userId, CancellationToken ct)
    {
        var query = Detailed.AsNoTracking(); if (userId.HasValue) query = query.Where(x => x.UserId == userId);
        var total = await query.CountAsync(ct); var items = await query.OrderByDescending(x => x.Timestamp).Skip((page - 1) * size).Take(size).ToListAsync(ct);
        return new(items, page, size, total);
    }
}
public sealed class MeasurementRecordRepository(ShopfloorDbContext c) : BaseRepository<MeasurementRecord>(c), IMeasurementRecordRepository;
public sealed class UnitOfWork(ShopfloorDbContext context) : IUnitOfWork
{ public Task<int> SaveChangesAsync(CancellationToken ct) => context.SaveChangesAsync(ct); }
