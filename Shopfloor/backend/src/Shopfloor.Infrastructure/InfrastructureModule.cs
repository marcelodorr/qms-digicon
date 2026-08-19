using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Shopfloor.Domain.Common;
using Shopfloor.Domain.Repositories;
using Shopfloor.Infrastructure.EntityFramework;
using Shopfloor.Infrastructure.Security;

namespace Shopfloor.Infrastructure;

public static class InfrastructureModule
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ShopfloorDbContext>(o => o.UseSqlite(configuration.GetConnectionString("DefaultConnection")));
        services.AddScoped<IUserRepository>(sp => new UserRepository(
            sp.GetRequiredService<ShopfloorDbContext>(),
            configuration.GetConnectionString("AuthenticationConnection")
                ?? throw new InvalidOperationException("ConnectionStrings:AuthenticationConnection não configurada.")));
        services.AddScoped<IMachineRepository>(sp => new MachineRepository(
            sp.GetRequiredService<ShopfloorDbContext>(),
            configuration.GetConnectionString("AuthenticationConnection")
                ?? throw new InvalidOperationException("ConnectionStrings:AuthenticationConnection não configurada.")));
        services.AddScoped<IProductionOrderRepository>(sp => new ProductionOrderRepository(sp.GetRequiredService<ShopfloorDbContext>(), configuration.GetConnectionString("AuthenticationConnection")!));
        services.AddScoped<IOperationRepository>(sp => new OperationRepository(sp.GetRequiredService<ShopfloorDbContext>(), configuration.GetConnectionString("AuthenticationConnection")!));
        services.AddScoped<IDefectRepository>(sp => new DefectRepository(sp.GetRequiredService<ShopfloorDbContext>(), configuration.GetConnectionString("AuthenticationConnection")!));
        services.AddScoped<ICauseRepository>(sp => new CauseRepository(sp.GetRequiredService<ShopfloorDbContext>(), configuration.GetConnectionString("AuthenticationConnection")!));
        services.AddScoped<IQuotaRepository, QuotaRepository>(); services.AddScoped<IDefectRecordRepository, DefectRecordRepository>();
        services.AddScoped<IMeasurementRecordRepository, MeasurementRecordRepository>(); services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>(); services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IMasterAdminAuthenticator, MasterAdminAuthenticator>();
        return services;
    }
}
