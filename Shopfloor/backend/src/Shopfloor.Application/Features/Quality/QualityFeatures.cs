using System.Text.Json;
using MediatR;
using Shopfloor.Application.Common;
using Shopfloor.Application.Dtos;
using Shopfloor.Domain.Common;
using Shopfloor.Domain.Entities;
using Shopfloor.Domain.Repositories;

namespace Shopfloor.Application.Features.Quality;

public sealed record CreateDefectRecordCommand(CreateDefectRecordDto Data) : IRequest<DefectRecordDto>;
public sealed record ListDefectRecordsQuery(int Page = 1, int PageSize = 20, Guid? UserId = null) : IRequest<PagedResponse<DefectRecordDto>>;
public sealed record ReprintDefectLabelCommand(Guid Id) : IRequest<DefectRecordDto>;
public sealed record CreateMeasurementRecordCommand(CreateMeasurementRecordDto Data) : IRequest<MeasurementRecordDto>;

public sealed class CreateDefectRecordHandler(
    IUserRepository users, IMachineRepository machines, IProductionOrderRepository orders,
    IOperationRepository operations, IDefectRepository defects, ICauseRepository causes,
    IDefectRecordRepository records, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateDefectRecordCommand, DefectRecordDto>
{
    public async Task<DefectRecordDto> Handle(CreateDefectRecordCommand request, CancellationToken ct)
    {
        var d = request.Data;
        if (d.Quantity <= 0) throw new ValidationException("A quantidade deve ser maior que zero.");
        var user = await users.GetByIdAsync(d.UserId, ct) ?? throw new NotFoundException("Usuário não encontrado.");
        var machine = await machines.GetByIdAsync(d.MachineId, ct) ?? throw new NotFoundException("Máquina não encontrada.");
        var order = await orders.GetByIdAsync(d.PoId, ct) ?? throw new NotFoundException("Ordem de produção não encontrada.");
        var operation = await operations.GetByIdAsync(d.OperationId, ct) ?? throw new NotFoundException("Operação não encontrada.");
        var defect = await defects.FindByCodeAsync(d.DefectCode, ct) ?? throw new NotFoundException("Defeito não encontrado.");
        var cause = await causes.FindByCodeAsync(d.CauseCode, ct) ?? throw new NotFoundException("Causa não encontrada.");
        if (order.MachineId != machine.Id || operation.ProductionOrderId != order.Id)
            throw new ValidationException("Máquina, ordem de produção e operação não pertencem ao mesmo fluxo.");
        var entity = new DefectRecord { UserId = user.Id, MachineId = machine.Id, ProductionOrderId = order.Id,
            OperationId = operation.Id, DefectId = defect.Id, CauseId = cause.Id, Quantity = d.Quantity,
            QuotaNumber = d.QuotaNumber.Trim(), Observation = d.Observation?.Trim(), LabelPrinted = d.Printed };
        await records.AddAsync(entity, ct);
        await unitOfWork.SaveChangesAsync(ct);
        return ToDto(entity, user, machine, order, operation, defect, cause);
    }

    internal static DefectRecordDto ToDto(DefectRecord r, User u, Machine m, ProductionOrder po, Operation op, Defect d, Cause c) =>
        new(r.Id, u.Id, m.Id, po.Id, op.Id, d.Code, d.Description, c.Code, c.Description, r.Quantity,
            r.QuotaNumber, r.Observation, r.LabelPrinted, r.Timestamp, m.Name, po.Code, op.Name);
}

public sealed class ListDefectRecordsHandler(IDefectRecordRepository records) : IRequestHandler<ListDefectRecordsQuery, PagedResponse<DefectRecordDto>>
{
    public async Task<PagedResponse<DefectRecordDto>> Handle(ListDefectRecordsQuery q, CancellationToken ct)
    {
        var page = Math.Max(1, q.Page); var size = Math.Clamp(q.PageSize, 1, 100);
        var result = await records.ListDetailedAsync(page, size, q.UserId, ct);
        var items = result.Items.Select(r => CreateDefectRecordHandler.ToDto(r, r.User, r.Machine, r.ProductionOrder, r.Operation, r.Defect, r.Cause)).ToArray();
        return new(items, page, size, result.TotalCount, result.TotalPages);
    }
}

public sealed class ReprintDefectLabelHandler(IDefectRecordRepository records, IUnitOfWork unitOfWork) : IRequestHandler<ReprintDefectLabelCommand, DefectRecordDto>
{
    public async Task<DefectRecordDto> Handle(ReprintDefectLabelCommand q, CancellationToken ct)
    {
        var r = await records.GetByIdAsync(q.Id, ct) ?? throw new NotFoundException("Registro de não conformidade não encontrado.");
        r.LabelPrinted = true; r.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(ct);
        return CreateDefectRecordHandler.ToDto(r, r.User, r.Machine, r.ProductionOrder, r.Operation, r.Defect, r.Cause);
    }
}

public sealed class CreateMeasurementRecordHandler(IMeasurementRecordRepository records, IQuotaRepository quotas, IUnitOfWork unitOfWork)
    : IRequestHandler<CreateMeasurementRecordCommand, MeasurementRecordDto>
{
    public async Task<MeasurementRecordDto> Handle(CreateMeasurementRecordCommand request, CancellationToken ct)
    {
        var d = request.Data;
        if (d.Measurements.Count == 0) throw new ValidationException("Informe ao menos uma medição.");
        var entity = new MeasurementRecord { UserId = d.UserId, MachineId = d.MachineId, ProductionOrderId = d.PoId,
            OperationId = d.OperationId, OverallStatus = ParseStatus(d.OverallStatus) };
        foreach (var input in d.Measurements)
        {
            var quota = await quotas.GetByIdAsync(input.QuotaId, ct) ?? throw new NotFoundException($"Cota {input.QuotaNumber} não encontrada.");
            if (quota.OperationId != d.OperationId) throw new ValidationException($"A cota {quota.Number} não pertence à operação.");
            if (input.Samples.Count != quota.SampleCount) throw new ValidationException($"A cota {quota.Number} exige {quota.SampleCount} amostra(s).");
            entity.Results.Add(new MeasurementResult { QuotaId = quota.Id, QuotaNumber = quota.Number,
                Description = quota.Description, ResponseType = quota.ResponseType, OverallStatus = ParseStatus(input.OverallStatus),
                Samples = input.Samples.Select(s => new MeasurementSample { SampleIndex = s.SampleIndex,
                    Value = JsonSerializer.Serialize(s.Value), Status = ParseStatus(s.Status) }).ToList() });
        }
        await records.AddAsync(entity, ct); await unitOfWork.SaveChangesAsync(ct);
        return new(entity.Id, entity.UserId, entity.MachineId, entity.ProductionOrderId, entity.OperationId,
            entity.OverallStatus.ToString().ToLowerInvariant(), entity.Timestamp);
    }

    private static QualityStatus ParseStatus(string value) => value.Trim().ToLowerInvariant() switch
    { "ok" => QualityStatus.Ok, "nok" => QualityStatus.Nok, "pending" => QualityStatus.Pending, _ => throw new ValidationException($"Status inválido: {value}.") };
}
