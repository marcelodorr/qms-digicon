using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RncDashboardController : ControllerBase
    {
        private readonly RncDashboardService _service;

        public RncDashboardController(RncDashboardService service)
        {
            _service = service;
        }

        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters([FromQuery] RncDashboardFilters? filters)
        {
            var options = await _service.GetFilterOptionsAsync(filters);
            return Ok(options);
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview([FromQuery] RncDashboardFilters? filters)
        {
            var resolvedFilters = filters ?? new RncDashboardFilters();
            var overview = await _service.GetOverviewAsync(resolvedFilters);
            return Ok(overview);
        }

        [HttpGet("entries")]
        public async Task<IActionResult> GetEntries(
            [FromQuery] RncDashboardFilters? filters,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10
        )
        {
            var resolvedFilters = filters ?? new RncDashboardFilters();
            var result = await _service.GetEntriesAsync(resolvedFilters, page, pageSize);
            return Ok(result);
        }
    }
}
