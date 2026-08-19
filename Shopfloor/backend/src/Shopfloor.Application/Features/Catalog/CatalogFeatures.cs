using AutoMapper;
using MediatR;
using Shopfloor.Application.Dtos;
using Shopfloor.Domain.Common;
using Shopfloor.Domain.Repositories;

namespace Shopfloor.Application.Features.Catalog;

public sealed record ListMachinesQuery : IRequest<IReadOnlyCollection<MachineDto>>;
public sealed record ListProductionOrdersQuery(Guid MachineId, DateOnly PlannedDate, string? Search) : IRequest<IReadOnlyCollection<ProductionOrderDto>>;
public sealed record ListOperationsQuery(Guid ProductionOrderId) : IRequest<IReadOnlyCollection<OperationDto>>;
public sealed record ListDefectsQuery : IRequest<IReadOnlyCollection<DefectDto>>;
public sealed record ListCausesQuery : IRequest<IReadOnlyCollection<CauseDto>>;
public sealed record ListQuotasQuery(Guid OperationId) : IRequest<IReadOnlyCollection<QuotaDto>>;

public sealed class ListMachinesHandler(IMachineRepository repository, IUnitOfWork unitOfWork, IMapper mapper) : IRequestHandler<ListMachinesQuery, IReadOnlyCollection<MachineDto>>
{
    public async Task<IReadOnlyCollection<MachineDto>> Handle(ListMachinesQuery q, CancellationToken ct)
    {
        var machines = await repository.ListAvailableAsync(ct);
        await unitOfWork.SaveChangesAsync(ct);
        return mapper.Map<IReadOnlyCollection<MachineDto>>(machines);
    }
}
public sealed class ListProductionOrdersHandler(IProductionOrderRepository repository, IUnitOfWork unitOfWork, IMapper mapper) : IRequestHandler<ListProductionOrdersQuery, IReadOnlyCollection<ProductionOrderDto>>
{ public async Task<IReadOnlyCollection<ProductionOrderDto>> Handle(ListProductionOrdersQuery q, CancellationToken ct) { var items=await repository.ListByMachineAsync(q.MachineId,q.PlannedDate,q.Search,ct);await unitOfWork.SaveChangesAsync(ct);return mapper.Map<IReadOnlyCollection<ProductionOrderDto>>(items); } }
public sealed class ListOperationsHandler(IOperationRepository repository, IUnitOfWork unitOfWork, IMapper mapper) : IRequestHandler<ListOperationsQuery, IReadOnlyCollection<OperationDto>>
{ public async Task<IReadOnlyCollection<OperationDto>> Handle(ListOperationsQuery q, CancellationToken ct) { var items=await repository.ListByProductionOrderAsync(q.ProductionOrderId,ct);await unitOfWork.SaveChangesAsync(ct);return mapper.Map<IReadOnlyCollection<OperationDto>>(items); } }
public sealed class ListDefectsHandler(IDefectRepository repository, IUnitOfWork unitOfWork, IMapper mapper) : IRequestHandler<ListDefectsQuery, IReadOnlyCollection<DefectDto>>
{ public async Task<IReadOnlyCollection<DefectDto>> Handle(ListDefectsQuery q, CancellationToken ct) { var items = await repository.ListAvailableAsync(ct); await unitOfWork.SaveChangesAsync(ct); return mapper.Map<IReadOnlyCollection<DefectDto>>(items); } }
public sealed class ListCausesHandler(ICauseRepository repository, IUnitOfWork unitOfWork, IMapper mapper) : IRequestHandler<ListCausesQuery, IReadOnlyCollection<CauseDto>>
{ public async Task<IReadOnlyCollection<CauseDto>> Handle(ListCausesQuery q, CancellationToken ct) { var items = await repository.ListAvailableAsync(ct); await unitOfWork.SaveChangesAsync(ct); return mapper.Map<IReadOnlyCollection<CauseDto>>(items); } }
public sealed class ListQuotasHandler(IQuotaRepository repository, IMapper mapper) : IRequestHandler<ListQuotasQuery, IReadOnlyCollection<QuotaDto>>
{ public async Task<IReadOnlyCollection<QuotaDto>> Handle(ListQuotasQuery q, CancellationToken ct) => mapper.Map<IReadOnlyCollection<QuotaDto>>(await repository.ListByOperationAsync(q.OperationId, ct)); }
