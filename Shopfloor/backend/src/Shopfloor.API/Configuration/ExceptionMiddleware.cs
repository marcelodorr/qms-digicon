using Microsoft.AspNetCore.Mvc;
using Shopfloor.Application.Common;

namespace Shopfloor.API.Configuration;

public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try { await next(context); }
        catch (Exception ex)
        {
            var status = ex switch { NotFoundException => 404, ValidationException => 400, UnauthorizedException => 401, _ => 500 };
            if (status == 500) logger.LogError(ex, "Erro não tratado na API");
            context.Response.StatusCode = status;
            await context.Response.WriteAsJsonAsync(new ProblemDetails { Status=status, Title=status == 500 ? "Erro interno do servidor." : ex.Message });
        }
    }
}
