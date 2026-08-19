using AutoMapper;
using Shopfloor.Application.Dtos;
using Shopfloor.Domain.Entities;

namespace Shopfloor.Application.Mappings;

public sealed class ShopfloorProfile : Profile
{
    public ShopfloorProfile()
    {
        CreateMap<User, UserDto>();
        CreateMap<Machine, MachineDto>()
            .ForCtorParam("Status", o => o.MapFrom(s => s.Status.ToString().ToLowerInvariant()));
        CreateMap<ProductionOrder, ProductionOrderDto>();
        CreateMap<Operation, OperationDto>().ForCtorParam("PoId", o => o.MapFrom(s => s.ProductionOrderId));
        CreateMap<Defect, DefectDto>();
        CreateMap<Cause, CauseDto>();
        CreateMap<QuotaOption, QuotaOptionDto>()
            .ForCtorParam("Status", o => o.MapFrom(s => s.Status.HasValue ? s.Status.Value.ToString().ToLowerInvariant() : null));
        CreateMap<Quota, QuotaDto>()
            .ForCtorParam("ResponseType", o => o.MapFrom(s => s.ResponseType.ToString().ToLowerInvariant()));
    }
}
