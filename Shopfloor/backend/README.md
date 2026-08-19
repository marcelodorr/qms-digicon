# Shopfloor Backend

API .NET 8 estruturada em Clean Architecture, com CQRS/MediatR, AutoMapper, EF Core/SQLite, Repository, Unit of Work, JWT e Swagger. A autenticação consulta a tabela `login_certification` no SQL Server compartilhado com o BackOffice.

## Executar

```bash
cd Shopfloor/backend
dotnet restore
dotnet run --project src/Shopfloor.API
```

Swagger: `http://localhost:5080/swagger`. A base SQLite e os dados iniciais são criados automaticamente.

Configure `ConnectionStrings__AuthenticationConnection` para o SQL Server que contém `login_certification`. Faça login em `POST /api/auth/login` com `username` (também aceita o e-mail cadastrado na busca) e `password`, usando depois o token retornado como Bearer.

O administrador mestre é compatível com o BackOffice (`admin` / `admin123` no desenvolvimento). Em produção, configure `MasterAdmin__Username` e `MasterAdmin__Password` por secret manager.

Em produção, sobrescreva `ConnectionStrings__DefaultConnection`, `ConnectionStrings__AuthenticationConnection` e principalmente `Jwt__Key` por variáveis de ambiente ou secret manager.

## Fluxos expostos

- `POST /api/auth/login`
- `GET /api/machines`
- `GET /api/production-orders?machineId=...`
- `GET /api/operations?productionOrderId=...`
- `GET /api/defects`, `GET /api/causes`
- `GET /api/quotas?operationId=...`
- `POST`, `GET /api/defect-records`; `POST /api/defect-records/{id}/reprint`
- `POST /api/measurement-records`
