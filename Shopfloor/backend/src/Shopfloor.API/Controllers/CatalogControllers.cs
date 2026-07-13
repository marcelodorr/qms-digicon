using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shopfloor.Application.Dtos;
using Shopfloor.Application.Features.Catalog;

namespace Shopfloor.API.Controllers;

[ApiController, Authorize, Route("api/machines")]
public sealed class MachinesController(IMediator mediator) : ControllerBase
{ [HttpGet] public Task<IReadOnlyCollection<MachineDto>> List(CancellationToken ct) => mediator.Send(new ListMachinesQuery(), ct); }

[ApiController, Authorize, Route("api/production-orders")]
public sealed class ProductionOrdersController(IMediator mediator) : ControllerBase
{ [HttpGet] public Task<IReadOnlyCollection<ProductionOrderDto>> List([FromQuery] Guid machineId, CancellationToken ct) => mediator.Send(new ListProductionOrdersQuery(machineId), ct); }

[ApiController, Authorize, Route("api/operations")]
public sealed class OperationsController(IMediator mediator) : ControllerBase
{ [HttpGet] public Task<IReadOnlyCollection<OperationDto>> List([FromQuery] Guid productionOrderId, CancellationToken ct) => mediator.Send(new ListOperationsQuery(productionOrderId), ct); }

[ApiController, Authorize, Route("api/defects")]
public sealed class DefectsController(IMediator mediator) : ControllerBase
{ [HttpGet] public Task<IReadOnlyCollection<DefectDto>> List(CancellationToken ct) => mediator.Send(new ListDefectsQuery(), ct); }

[ApiController, Authorize, Route("api/causes")]
public sealed class CausesController(IMediator mediator) : ControllerBase
{ [HttpGet] public Task<IReadOnlyCollection<CauseDto>> List(CancellationToken ct) => mediator.Send(new ListCausesQuery(), ct); }

[ApiController, Authorize, Route("api/quotas")]
public sealed class QuotasController(IMediator mediator) : ControllerBase
{ [HttpGet] public Task<IReadOnlyCollection<QuotaDto>> List([FromQuery] Guid operationId, CancellationToken ct) => mediator.Send(new ListQuotasQuery(operationId), ct); }
