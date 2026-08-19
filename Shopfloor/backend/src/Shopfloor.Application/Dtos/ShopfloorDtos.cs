namespace Shopfloor.Application.Dtos;

public sealed record LoginRequest(string Username, string Password);
public sealed record AuthDto(Guid UserId, string Username, string Name, string Email, string Type, string? Image, string Token);
public sealed record UserDto(Guid Id, string Username, string Name, string Email, string Type, string? Image);
public sealed record MachineDto(Guid Id, string Name, string Code, string Sector, string Status, string ImageUrl);
public sealed record ProductionOrderDto(Guid Id, Guid MachineId, string Code, string ProductName, int TargetQuantity, string Revision, DateTime PlannedDate, string Sector);
public sealed record OperationDto(Guid Id, Guid PoId, string Name, string Code, string Sector);
public sealed record DefectDto(Guid Id, string Code, string Description);
public sealed record CauseDto(Guid Id, string Code, string Description);
public sealed record QuotaOptionDto(string Value, string Label, string? Status);
public sealed record QuotaDto(Guid Id, Guid OperationId, string Number, string Description, string ResponseType,
    decimal? Nominal, decimal? TolerancePlus, decimal? ToleranceMinus, string? Unit, int SampleCount,
    string MeasureImageUrl, string Instruction, IReadOnlyCollection<QuotaOptionDto> Options);

public sealed record CreateDefectRecordDto(Guid UserId, Guid MachineId, Guid PoId, Guid OperationId,
    string DefectCode, string CauseCode, int Quantity, string QuotaNumber, string? Observation, bool Printed);
public sealed record DefectRecordDto(Guid Id, Guid UserId, Guid MachineId, Guid PoId, Guid OperationId,
    string DefectCode, string DefectDescription, string CauseCode, string CauseDescription, int Quantity,
    string QuotaNumber, string? Observation, bool Printed, DateTime Timestamp,
    string MachineName, string PoCode, string OperationName);

public sealed record MeasurementSampleInput(int SampleIndex, object Value, string Status);
public sealed record MeasurementInput(Guid QuotaId, string QuotaNumber, string Description, string ResponseType,
    IReadOnlyCollection<MeasurementSampleInput> Samples, string OverallStatus);
public sealed record CreateMeasurementRecordDto(Guid UserId, Guid MachineId, Guid PoId, Guid OperationId,
    IReadOnlyCollection<MeasurementInput> Measurements, string OverallStatus);
public sealed record MeasurementRecordDto(Guid Id, Guid UserId, Guid MachineId, Guid PoId, Guid OperationId,
    string OverallStatus, DateTime Timestamp);

public sealed record PagedResponse<T>(IReadOnlyCollection<T> Items, int Page, int PageSize, int TotalCount, int TotalPages);
