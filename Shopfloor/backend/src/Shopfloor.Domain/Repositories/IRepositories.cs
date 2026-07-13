using Shopfloor.Domain.Common;
using Shopfloor.Domain.Entities;

namespace Shopfloor.Domain.Repositories;

public interface IUserRepository : IBaseRepository<User>
{
    Task<User?> FindByUsernameOrEmailAsync(string identifier, CancellationToken ct);
    Task SyncLocalUserAsync(User user, CancellationToken ct);
}
public interface IMachineRepository : IBaseRepository<Machine>
{
    Task<IReadOnlyCollection<Machine>> ListAvailableAsync(CancellationToken ct);
}
public interface IProductionOrderRepository : IBaseRepository<ProductionOrder> { Task<IReadOnlyCollection<ProductionOrder>> ListByMachineAsync(Guid machineId, CancellationToken ct); }
public interface IOperationRepository : IBaseRepository<Operation> { Task<IReadOnlyCollection<Operation>> ListByProductionOrderAsync(Guid productionOrderId, CancellationToken ct); }
public interface IDefectRepository : IBaseRepository<Defect> { Task<Defect?> FindByCodeAsync(string code, CancellationToken ct); Task<IReadOnlyCollection<Defect>> ListAvailableAsync(CancellationToken ct); }
public interface ICauseRepository : IBaseRepository<Cause> { Task<Cause?> FindByCodeAsync(string code, CancellationToken ct); Task<IReadOnlyCollection<Cause>> ListAvailableAsync(CancellationToken ct); }
public interface IQuotaRepository : IBaseRepository<Quota> { Task<IReadOnlyCollection<Quota>> ListByOperationAsync(Guid operationId, CancellationToken ct); }
public interface IDefectRecordRepository : IBaseRepository<DefectRecord> { Task<PagedResult<DefectRecord>> ListDetailedAsync(int page, int pageSize, Guid? userId, CancellationToken ct); }
public interface IMeasurementRecordRepository : IBaseRepository<MeasurementRecord> { }

public interface IPasswordHasher { string Hash(string password); bool Verify(string password, string hash); bool Verify(string password, string hash, string salt); }
public interface ITokenService { string Create(User user); }
public interface IMasterAdminAuthenticator { User? Authenticate(string username, string password); }
