using Shopfloor.Domain.Common;

namespace Shopfloor.Domain.Entities;

public enum MachineStatus { Active, Maintenance, Stopped }
public enum QuotaResponseType { Numeric, Text, List, Multiple, Binary }
public enum QualityStatus { Pending, Ok, Nok }

public sealed class User : BaseEntity
{
    public string ExternalId { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Image { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public sealed class Machine : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public MachineStatus Status { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Sector { get; set; } = string.Empty;
}

public sealed class ProductionOrder : BaseEntity
{
    public Guid MachineId { get; set; }
    public Machine Machine { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int TargetQuantity { get; set; }
    public string Revision { get; set; } = string.Empty;
}

public sealed class Operation : BaseEntity
{
    public Guid ProductionOrderId { get; set; }
    public ProductionOrder ProductionOrder { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string PartNumber { get; set; } = string.Empty;
    public string Revision { get; set; } = string.Empty;
}

public sealed class Defect : BaseEntity { public string Code { get; set; } = string.Empty; public string Description { get; set; } = string.Empty; }
public sealed class Cause : BaseEntity { public string Code { get; set; } = string.Empty; public string Description { get; set; } = string.Empty; }

public sealed class Quota : BaseEntity
{
    public Guid OperationId { get; set; }
    public Operation Operation { get; set; } = null!;
    public string Number { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public QuotaResponseType ResponseType { get; set; }
    public decimal? Nominal { get; set; }
    public decimal? TolerancePlus { get; set; }
    public decimal? ToleranceMinus { get; set; }
    public string? Unit { get; set; }
    public int SampleCount { get; set; }
    public string MeasureImageUrl { get; set; } = string.Empty;
    public string Instruction { get; set; } = string.Empty;
    public ICollection<QuotaOption> Options { get; set; } = [];
}

public sealed class QuotaOption : BaseEntity
{
    public Guid QuotaId { get; set; }
    public Quota Quota { get; set; } = null!;
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public QualityStatus? Status { get; set; }
}

public sealed class DefectRecord : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid MachineId { get; set; }
    public Guid ProductionOrderId { get; set; }
    public Guid OperationId { get; set; }
    public Guid DefectId { get; set; }
    public Guid CauseId { get; set; }
    public int Quantity { get; set; }
    public string QuotaNumber { get; set; } = string.Empty;
    public string? Observation { get; set; }
    public bool LabelPrinted { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
    public Machine Machine { get; set; } = null!;
    public ProductionOrder ProductionOrder { get; set; } = null!;
    public Operation Operation { get; set; } = null!;
    public Defect Defect { get; set; } = null!;
    public Cause Cause { get; set; } = null!;
}

public sealed class MeasurementRecord : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid MachineId { get; set; }
    public Guid ProductionOrderId { get; set; }
    public Guid OperationId { get; set; }
    public QualityStatus OverallStatus { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public ICollection<MeasurementResult> Results { get; set; } = [];
}

public sealed class MeasurementResult : BaseEntity
{
    public Guid MeasurementRecordId { get; set; }
    public MeasurementRecord MeasurementRecord { get; set; } = null!;
    public Guid QuotaId { get; set; }
    public string QuotaNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public QuotaResponseType ResponseType { get; set; }
    public QualityStatus OverallStatus { get; set; }
    public ICollection<MeasurementSample> Samples { get; set; } = [];
}

public sealed class MeasurementSample : BaseEntity
{
    public Guid MeasurementResultId { get; set; }
    public MeasurementResult MeasurementResult { get; set; } = null!;
    public int SampleIndex { get; set; }
    public string Value { get; set; } = string.Empty;
    public QualityStatus Status { get; set; }
}
