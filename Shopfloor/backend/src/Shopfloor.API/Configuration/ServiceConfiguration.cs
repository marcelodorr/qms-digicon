using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace Shopfloor.API.Configuration;

public static class ServiceConfiguration
{
    public static IServiceCollection AddShopfloorApi(this IServiceCollection services, IConfiguration configuration)
    {
        var key = configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key não configurada.");
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["Jwt:Issuer"], ValidAudience = configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), ClockSkew = TimeSpan.FromMinutes(1)
            };
        });
        services.AddAuthorization();
        services.AddCors(o => o.AddPolicy("Frontend", p => p.WithOrigins(configuration.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:3000", "http://localhost:5173"]).AllowAnyHeader().AllowAnyMethod()));
        services.AddSwaggerGen(o =>
        {
            o.SwaggerDoc("v1", new OpenApiInfo { Title = "Shopfloor API", Version = "v1" });
            o.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { Name="Authorization", Type=SecuritySchemeType.Http, Scheme="bearer", BearerFormat="JWT", In=ParameterLocation.Header });
            o.AddSecurityRequirement(new OpenApiSecurityRequirement { [new OpenApiSecurityScheme { Reference = new OpenApiReference { Type=ReferenceType.SecurityScheme, Id="Bearer" } }] = Array.Empty<string>() });
        });
        return services;
    }
}
