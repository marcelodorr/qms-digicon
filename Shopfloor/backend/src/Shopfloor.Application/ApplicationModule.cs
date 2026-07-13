using Microsoft.Extensions.DependencyInjection;

namespace Shopfloor.Application;

public static class ApplicationModule
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(_ => { }, typeof(ApplicationModule).Assembly);
        services.AddMediatR(configuration => configuration.RegisterServicesFromAssembly(typeof(ApplicationModule).Assembly));
        return services;
    }
}
