using Microsoft.EntityFrameworkCore;
using Shopfloor.Domain.Entities;
using Shopfloor.Domain.Repositories;

namespace Shopfloor.Infrastructure.EntityFramework;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(ShopfloorDbContext db, CancellationToken ct = default)
    {
        await db.Database.EnsureCreatedAsync(ct);
        if (await db.Machines.AnyAsync(ct)) return;
        var machines = new[] {
            new Machine { Id=Id("10000000-0000-0000-0000-000000000001"), Name="Prensa Hidráulica 01", Code="MQ-01", Status=MachineStatus.Active, ImageUrl="https://images.unsplash.com/photo-1733683296842-c5c32fe36a50?auto=format&fit=crop&w=600&q=80" },
            new Machine { Id=Id("10000000-0000-0000-0000-000000000002"), Name="Torno CNC 03", Code="MQ-02", Status=MachineStatus.Active, ImageUrl="https://images.unsplash.com/photo-1565439303660-2d3305541604?auto=format&fit=crop&w=600&q=80" },
            new Machine { Id=Id("10000000-0000-0000-0000-000000000003"), Name="Injetora Plástica", Code="MQ-03", Status=MachineStatus.Maintenance, ImageUrl="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80" },
            new Machine { Id=Id("10000000-0000-0000-0000-000000000004"), Name="Robô de Solda", Code="MQ-04", Status=MachineStatus.Active, ImageUrl="https://images.unsplash.com/photo-1531771686035-25f475954919?auto=format&fit=crop&w=600&q=80" }
        };
        var orders = new[] {
            new ProductionOrder { Id=Id("20000000-0000-0000-0000-000000000001"), MachineId=machines[0].Id, Code="OP-1001", ProductName="Painel Frontal A", TargetQuantity=500 },
            new ProductionOrder { Id=Id("20000000-0000-0000-0000-000000000002"), MachineId=machines[0].Id, Code="OP-1002", ProductName="Suporte Lateral", TargetQuantity=200 },
            new ProductionOrder { Id=Id("20000000-0000-0000-0000-000000000003"), MachineId=machines[1].Id, Code="OP-2001", ProductName="Eixo Principal", TargetQuantity=1000 },
            new ProductionOrder { Id=Id("20000000-0000-0000-0000-000000000004"), MachineId=machines[3].Id, Code="OP-4001", ProductName="Chassi Base", TargetQuantity=50 }
        };
        var operations = new[] {
            new Operation { Id=Id("30000000-0000-0000-0000-000000000001"), ProductionOrderId=orders[0].Id, Name="Estampagem", Code="10" },
            new Operation { Id=Id("30000000-0000-0000-0000-000000000002"), ProductionOrderId=orders[0].Id, Name="Rebarbação", Code="20" },
            new Operation { Id=Id("30000000-0000-0000-0000-000000000003"), ProductionOrderId=orders[1].Id, Name="Corte", Code="10" },
            new Operation { Id=Id("30000000-0000-0000-0000-000000000004"), ProductionOrderId=orders[2].Id, Name="Torneamento", Code="10" },
            new Operation { Id=Id("30000000-0000-0000-0000-000000000005"), ProductionOrderId=orders[3].Id, Name="Soldagem", Code="10" }
        };
        var defects = new[] { Defect("D01","Risco Profundo"), Defect("D02","Amassado"), Defect("D03","Rebarba Excessiva"), Defect("D04","Porosidade"), Defect("D05","Falha de Pintura"), Defect("D06","Medida Fora da Tol.") };
        var causes = new[] { Cause("C01","Desgaste da Ferramenta"), Cause("C02","Matéria-prima com defeito"), Cause("C03","Erro de Operação"), Cause("C04","Falha na Máquina"), Cause("C05","Temperatura Incorreta") };
        var quotas = new[] {
            Quota(operations[0], "1", "Espessura da chapa", QuotaResponseType.Numeric, 2, 3m, .1m, .1m, "mm"),
            Quota(operations[0], "2", "Aparência visual", QuotaResponseType.Binary, 1, options: [Opt("OK","OK",QualityStatus.Ok), Opt("NOK","NOK",QualityStatus.Nok)]),
            Quota(operations[0], "3", "Tipo de acabamento", QuotaResponseType.List, 1, options: [Opt("fosco","Fosco",QualityStatus.Ok), Opt("brilhante","Brilhante",QualityStatus.Ok), Opt("manchado","Manchado",QualityStatus.Nok)]),
            Quota(operations[1], "1", "Raio de canto", QuotaResponseType.Numeric, 1, 2m, .3m, .3m, "mm"),
            Quota(operations[1], "2", "Observação da rebarba", QuotaResponseType.Text, 1),
            Quota(operations[3], "1", "Diâmetro externo", QuotaResponseType.Numeric, 3, 45m, .02m, .02m, "mm"),
            Quota(operations[3], "2", "Marcas encontradas", QuotaResponseType.Multiple, 1, options: [Opt("sem_marca","Sem marca",QualityStatus.Ok), Opt("risco","Risco",QualityStatus.Nok), Opt("batida","Batida",QualityStatus.Nok), Opt("oxido","Oxidação",QualityStatus.Nok)]),
            Quota(operations[3], "3", "Diâmetro furo central", QuotaResponseType.Numeric, 1, 12m, .01m, .01m, "mm"),
            Quota(operations[4], "1", "Comprimento do cordão", QuotaResponseType.Numeric, 1, 80m, 5m, 5m, "mm"),
            Quota(operations[4], "2", "Cordão aprovado?", QuotaResponseType.Binary, 1, options: [Opt("OK","OK",QualityStatus.Ok), Opt("NOK","NOK",QualityStatus.Nok)])
        };
        await db.AddRangeAsync(machines, ct); await db.AddRangeAsync(orders, ct);
        await db.AddRangeAsync(operations, ct); await db.AddRangeAsync(defects, ct); await db.AddRangeAsync(causes, ct);
        await db.AddRangeAsync(quotas, ct); await db.SaveChangesAsync(ct);
    }

    private static Guid Id(string value) => Guid.Parse(value);
    private static Defect Defect(string code, string description) => new() { Code=code, Description=description };
    private static Cause Cause(string code, string description) => new() { Code=code, Description=description };
    private static QuotaOption Opt(string value, string label, QualityStatus status) => new() { Value=value, Label=label, Status=status };
    private static Quota Quota(Operation operation, string number, string description, QuotaResponseType type, int samples,
        decimal? nominal=null, decimal? plus=null, decimal? minus=null, string? unit=null, ICollection<QuotaOption>? options=null) => new()
        { OperationId=operation.Id, Number=number, Description=description, ResponseType=type, SampleCount=samples,
          Nominal=nominal, TolerancePlus=plus, ToleranceMinus=minus, Unit=unit, Instruction=$"Realize a verificação: {description}.",
          MeasureImageUrl="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80", Options=options ?? [] };
}
