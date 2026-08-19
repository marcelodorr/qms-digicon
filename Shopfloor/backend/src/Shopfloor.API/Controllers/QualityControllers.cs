using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shopfloor.Application.Dtos;
using Shopfloor.Application.Features.Quality;

namespace Shopfloor.API.Controllers;

[ApiController, Authorize, Route("api/defect-records")]
public sealed class DefectRecordsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<DefectRecordDto>> Create(CreateDefectRecordDto request, CancellationToken ct)
    { var result = await mediator.Send(new CreateDefectRecordCommand(request), ct); return CreatedAtAction(nameof(List), new { id=result.Id }, result); }
    [HttpGet]
    public Task<PagedResponse<DefectRecordDto>> List([FromQuery] int page=1, [FromQuery] int pageSize=20, [FromQuery] Guid? userId=null, CancellationToken ct=default)
        => mediator.Send(new ListDefectRecordsQuery(page, pageSize, userId), ct);
    [HttpPost("{id:guid}/reprint")]
    public Task<DefectRecordDto> Reprint(Guid id, CancellationToken ct) => mediator.Send(new ReprintDefectLabelCommand(id), ct);
}

[ApiController, Authorize, Route("api/measurement-records")]
public sealed class MeasurementRecordsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<MeasurementRecordDto>> Create(CreateMeasurementRecordDto request, CancellationToken ct)
    { var result = await mediator.Send(new CreateMeasurementRecordCommand(request), ct); return StatusCode(StatusCodes.Status201Created, result); }
}
