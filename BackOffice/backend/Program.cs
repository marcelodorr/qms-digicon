
using System;
using System.Diagnostics;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting.WindowsServices;
using Npgsql;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseWindowsService();

builder.WebHost
    .UseKestrel();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<ProductDocumentControlService>();
builder.Services.AddScoped<ProductConformityCertificateService>();
builder.Services.AddScoped<QualityCertificateService>();
builder.Services.AddScoped<ControleElebService>();
builder.Services.AddScoped<AnalystService>();
builder.Services.AddScoped<SpecialProcessCertificateService>();
builder.Services.AddScoped<RncDashboardService>();
builder.Services.AddScoped<ShippingLabelService>();
builder.Services.AddSingleton<DbCommandErrorCapture>();
builder.Services.AddSingleton<DbCommandErrorInterceptor>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("Content-Disposition", "X-Saved-Path"));
});

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "A connection string 'ConnectionStrings:DefaultConnection' não foi configurada.");
    }

    options.UseNpgsql(connectionString, npgsqlOptions =>
        npgsqlOptions.EnableRetryOnFailure());
    options.AddInterceptors(sp.GetRequiredService<DbCommandErrorInterceptor>());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
}

app.UseExceptionHandler(appBuilder =>
{
    appBuilder.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = feature?.Error;
        if (exception == null)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            return;
        }

        var root = exception.GetBaseException();
        var statusCode = root switch
        {
            ArgumentException => StatusCodes.Status400BadRequest,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedAccessException => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

        var problem = new ProblemDetails
        {
            Status = statusCode,
            Title = "Erro ao processar a requisicao.",
            Detail = root.Message,
            Instance = context.Request.Path
        };

        problem.Extensions["traceId"] = traceId;

        if (root is PostgresException postgresException)
        {
            problem.Extensions["sqlState"] = postgresException.SqlState;
            problem.Extensions["tableName"] = postgresException.TableName;
            problem.Extensions["constraintName"] = postgresException.ConstraintName;
            problem.Extensions["position"] = postgresException.Position;
        }

        if (app.Environment.IsDevelopment())
        {
            problem.Extensions["exceptionType"] = root.GetType().FullName;
            problem.Extensions["stackTrace"] = root.StackTrace;
            if (!ReferenceEquals(root, exception))
            {
                problem.Extensions["outerException"] = exception.GetType().FullName;
            }

            var capture = context.RequestServices.GetService<DbCommandErrorCapture>();
            if (capture?.Current != null)
            {
                problem.Extensions["sqlCommand"] = capture.Current.CommandText;
                problem.Extensions["sqlParameters"] = capture.Current.Parameters;
                capture.Clear();
            }
        }

        app.Logger.LogError(exception, "Unhandled exception. TraceId: {TraceId}", traceId);

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(problem);
    });
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        var path = context.Context.Request.Path.Value ?? string.Empty;
        if (path.EndsWith("/index.html", StringComparison.OrdinalIgnoreCase) ||
            path.Equals("/index.html", StringComparison.OrdinalIgnoreCase))
        {
            context.Context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
            context.Context.Response.Headers["Pragma"] = "no-cache";
            context.Context.Response.Headers["Expires"] = "0";
            return;
        }

        if (path.StartsWith("/assets/", StringComparison.OrdinalIgnoreCase))
        {
            context.Context.Response.Headers["Cache-Control"] = "public, max-age=31536000, immutable";
            return;
        }

        context.Context.Response.Headers["Cache-Control"] = "public, max-age=86400";
    }
});

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html", new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        context.Context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
        context.Context.Response.Headers["Pragma"] = "no-cache";
        context.Context.Response.Headers["Expires"] = "0";
    }
});

app.Run();
