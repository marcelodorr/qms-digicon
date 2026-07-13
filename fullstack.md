---
name: backoffice-fullstack-dotnet-react
description: Padrão de arquitetura e estilo de programação full-stack para um backoffice — backend .NET 8 (Clean Architecture, CQRS via MediatR, Repository, Unit of Work, EF Core, AutoMapper) e frontend Vite + React. Use SEMPRE que for criar, modificar, revisar ou estender código deste backoffice, em qualquer camada do backend OU do frontend — novos domínios/agregados, endpoints, comandos, queries, handlers, repositórios, DTOs, telas, componentes, hooks, chamadas de API ou ajustes em código existente. Aplique mesmo quando o pedido não citar "arquitetura" (ex.: "adicione um endpoint de X", "crie a tela de Y", "ajuste o componente de Z", "consuma o endpoint W"). Esta skill define a camada correta para cada peça, a direção das dependências, as convenções de nomenclatura e o passo a passo para adicionar um recurso ponta a ponta.
---

# Backoffice Full-Stack — Padrão de Desenvolvimento

Esta skill encapsula a arquitetura, a estrutura de pastas e a forma de programar de um backoffice
full-stack: um backend .NET 8 com Clean Architecture + CQRS e um frontend Vite + React. O
objetivo é que qualquer desenvolvimento novo ou ajuste de código preserve a consistência da base.
Antes de escrever qualquer linha, identifique **em qual lado (backend/frontend) e em qual camada**
a peça vive, e respeite os fluxos descritos abaixo.

> Nomes de projeto/classe/pasta abaixo usam placeholders genéricos: `<App>` é o nome da solução
> .NET, `AppDbContext` é o contexto EF, e o exemplo de domínio é o agregado fictício `Foo`.
> Substitua pelos nomes reais da base em que estiver trabalhando, mantendo o padrão.

## Estrutura do repositório (monorepo)

```
/
├── backend/    (API .NET 8 — Clean Architecture + CQRS)
└── frontend/   (Vite + React)
```

Backend e frontend evoluem juntos. Ao adicionar um domínio novo, faça o ponta a ponta: criar o
recurso no backend **e** espelhá-lo no frontend (ver "Recurso ponta a ponta" no fim).

---

# PARTE 1 — Backend (.NET 8)

## Stack de referência (backend)

Não introduza tecnologias fora desta lista sem necessidade explícita. O padrão pressupõe:

- .NET 8 / ASP.NET Core
- Entity Framework Core sobre banco relacional (ex.: PostgreSQL via Npgsql)
- MediatR (CQRS leve: commands, queries, handlers)
- AutoMapper (entidade ↔ DTO)
- Cache distribuído (ex.: Redis)
- JWT Bearer (autenticação)
- Swagger / OpenAPI (documentação)
- (opcional) Armazenamento de objetos (ex.: S3/MinIO) quando o domínio exigir arquivos

## Os quatro projetos e o que vai em cada um

A solução segue Clean Architecture com quatro projetos. **A regra de ouro é a direção das
dependências**: o fluxo aponta sempre para o `Domain`, nunca o contrário.

```
<App>.API            → depende de Application e Infrastructure
<App>.Application    → depende de Domain
<App>.Infrastructure → depende de Domain (e Application quando necessário)
<App>.Domain         → não depende de NINGUÉM (núcleo)
```

| Camada | Responsabilidade | NÃO pode conter |
|--------|------------------|-----------------|
| `<App>.API` | Entrada HTTP: controllers por domínio, pipeline ASP.NET Core, JWT, Swagger, CORS. Dispara comandos/queries via MediatR. | Regra de negócio, acesso a `DbContext`, EF Core |
| `<App>.Application` | Regras de aplicação: commands, queries, handlers (MediatR), DTOs, perfis AutoMapper, CRUD genérico. | Controllers, `DbContext`, detalhes de EF |
| `<App>.Domain` | Entidades de domínio, interfaces de repositório, query filters, paginação. É o núcleo puro. | EF Core, AutoMapper, MediatR, ASP.NET, qualquer infraestrutura |
| `<App>.Infrastructure` | EF Core + banco, repositórios concretos, Unit of Work, interceptors (tenant/soft delete), cache. | Lógica de controller, regra de negócio de aplicação |

### Princípio chave

A interface do repositório vive no **Domain**; a implementação vive na **Infrastructure**.
O handler na **Application** depende da *interface*, nunca da implementação. Isso mantém a
Application e o Domain ignorantes quanto a EF Core.

## Fluxo de execução (memorize)

Toda requisição segue exatamente este caminho. Não pule camadas (ex.: controller não fala
direto com repositório nem com `DbContext`).

1. O **controller** (`API`) recebe a requisição HTTP.
2. O controller dispara um **command** ou **query** via `MediatR` (`_mediator.Send(...)`).
3. O **handler** (`Application`) aplica a regra de negócio e usa **repositórios** (via interface).
4. O **repositório** (`Infrastructure`) acessa o `AppDbContext` e persiste/consulta.
5. O resultado é mapeado para **DTO** (AutoMapper) e devolvido ao controller.

```
HTTP → Controller → MediatR (Command/Query) → Handler → IRepository → AppDbContext
                                                  ↓
                                          DTO (AutoMapper) → Controller → HTTP
```

## Organização por domínio (backend)

Cada subdomínio é organizado verticalmente: a entidade e o repositório ficam no `Domain`; os
commands/queries/handlers/DTOs ficam na `Application`; a implementação do repositório fica na
`Infrastructure`; o controller fica na `API`. Mantenha o mesmo nome de subpasta de domínio nas
quatro camadas para que seja trivial navegar entre elas.

Pontos centrais de cada projeto:

- `<App>.API/Program.cs` — bootstrap da aplicação.
- `<App>.API/Configuration/ServiceConfiguration.cs` — registra serviços, middleware, auth, CORS, Swagger e integra os módulos.
- `<App>.Application/ApplicationModule.cs` — registra AutoMapper, serviços de domínio e MediatR.
- `<App>.Application/Commands/Generics` — handlers genéricos reutilizáveis de CRUD.
- `<App>.Application/Dtos` — DTOs de request/response.
- `<App>.Domain/Common` — interfaces base, query filters, paginação.
- `<App>.Infrastructure/InfrastructureModule.cs` — registra interceptors, `DbContext`, repositórios, serviços e cache.
- `<App>.Infrastructure/EntityFramework/AppDbContext.cs` — `DbSet`s e filtros globais (tenant + soft delete).
- `<App>.Infrastructure/EntityFramework/Repository` — repositórios concretos por agregado.
- `<App>.Infrastructure/EntityFramework/UnitOfWork/UnitOfWork.cs` — controle de transações.

## Receita: adicionar um novo agregado/domínio (backend)

Siga esta ordem ao criar um recurso novo (exemplo: agregado fictício `Foo`). Reaproveite os
genéricos sempre que o caso for CRUD padrão; só escreva command/handler específico quando houver
regra de negócio própria.

**1. Domain — entidade.** Herde da base comum (`Id`, auditoria, tenant, soft delete).

```csharp
// <App>.Domain/Foos/Foo.cs
public class Foo : BaseEntity   // BaseEntity vem de Domain/Common
{
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public bool IsActive { get; set; }
}
```

**2. Domain — interface do repositório.** Para CRUD, herde da interface genérica.

```csharp
// <App>.Domain/Foos/IFooRepository.cs
public interface IFooRepository : IBaseRepository<Foo> { }
```

**3. Infrastructure — `DbSet` e mapeamento.** Adicione o `DbSet` ao `AppDbContext`; configure via
`IEntityTypeConfiguration<Foo>` se preciso. Os filtros globais de tenant/soft delete são centrais
— **não** os reescreva por entidade.

```csharp
// AppDbContext.cs
public DbSet<Foo> Foos => Set<Foo>();
```

**4. Infrastructure — repositório concreto.** Herde de `BaseRepository` (CRUD + paginação prontos).

```csharp
// <App>.Infrastructure/EntityFramework/Repository/FooRepository.cs
public class FooRepository : BaseRepository<Foo>, IFooRepository
{
    public FooRepository(AppDbContext context) : base(context) { }
}
```

**5. Application — DTOs.** Em `Dtos`. Nunca exponha a entidade diretamente na API.

```csharp
// <App>.Application/Dtos/Foos/FooDto.cs
public class FooDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string Code { get; set; } = default!;
    public bool IsActive { get; set; }
}
```

**6. Application — perfil AutoMapper.**

```csharp
public class FooProfile : Profile
{
    public FooProfile()
    {
        CreateMap<Foo, FooDto>().ReverseMap();
        CreateMap<CreateFooCommand, Foo>();
    }
}
```

**7. Application — command/query + handler.** Para CRUD puro, reutilize `Commands/Generics`.

```csharp
public record CreateFooCommand(string Name, string Code) : IRequest<FooDto>;

public class CreateFooHandler : IRequestHandler<CreateFooCommand, FooDto>
{
    private readonly IFooRepository _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateFooHandler(IFooRepository repository, IUnitOfWork unitOfWork, IMapper mapper)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<FooDto> Handle(CreateFooCommand request, CancellationToken ct)
    {
        var foo = _mapper.Map<Foo>(request);
        await _repository.AddAsync(foo, ct);
        await _unitOfWork.SaveChangesAsync(ct);   // transação via Unit of Work
        return _mapper.Map<FooDto>(foo);
    }
}
```

**8. API — controller.** Só orquestra via MediatR. Sem regra de negócio, sem EF.

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]   // JWT
public class FoosController : ControllerBase
{
    private readonly IMediator _mediator;
    public FoosController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFooCommand command, CancellationToken ct)
        => Ok(await _mediator.Send(command, ct));

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] FooQuery query, CancellationToken ct)
        => Ok(await _mediator.Send(query, ct));
}
```

**9. Registro de DI.** Registre interface→implementação no `InfrastructureModule.cs`. MediatR e
AutoMapper costumam ser registrados por assembly scanning — confira o padrão existente antes de
registrar manualmente.

```csharp
// InfrastructureModule.cs
services.AddScoped<IFooRepository, FooRepository>();
```

## Regras de listagem, filtros e paginação (backend)

- Use os **query filters** e a **paginação** centralizados em `Domain/Common`. Não invente um
  esquema de paginação por endpoint.
- Listagens retornam o tipo paginado padrão do projeto, não `List<T>` cru.
- Os filtros globais de **tenant** e **soft delete** são aplicados pelo `AppDbContext`. Confie
  neles: não filtre `IsDeleted`/tenant manualmente, e não os desative sem justificativa.

## Convenções de nomenclatura (backend)

- Entidades: substantivo singular (`Foo`, `Order`, `Product`).
- Repositórios: `I<Entidade>Repository` (Domain) e `<Entidade>Repository` (Infrastructure).
- Commands: `<Verbo><Entidade>Command`; Queries: `<Entidade>Query` / `Get<Entidade>ByIdQuery`.
- Handlers: `<NomeDoCommandOuQuery>Handler`.
- DTOs: `<Entidade>Dto`, `Create<Entidade>Dto`, `Update<Entidade>Dto`.
- Controllers: `<EntidadePlural>Controller`.
- `async`/`await` em toda I/O, sempre propagando `CancellationToken`.

## O que NUNCA fazer (backend)

- Controller acessando `DbContext`/repositório direto (deve passar por MediatR).
- Regra de negócio no controller ou no repositório.
- Referência a EF Core, AutoMapper, MediatR ou ASP.NET dentro do `Domain`.
- Expor entidades na resposta HTTP — sempre via DTO.
- Persistir sem passar pelo `Unit of Work`.
- Reescrever filtros de tenant/soft delete por entidade.
- Criar esquema de paginação/filtro paralelo ao de `Domain/Common`.

---

# PARTE 2 — Frontend (Vite + React)

## Stack e ferramentas (frontend)

- Vite + React
- Node.js v18+ (se houver erro de dependência, use Node 18 ou 20)
- Gerenciador de pacotes: npm
- Dev server: `npm run dev` (porta 3000 por padrão)
- Build de produção: `npm run build` → artefatos em `frontend/build`

Comandos a partir de `frontend/`:

```bash
npm install
npm run dev      # desenvolvimento (porta 3000)
npm run build    # gera frontend/build
```

## Filosofia (espelha o backend)

O frontend segue os mesmos princípios do backend: **organização por domínio/feature** (vertical,
não por tipo de arquivo) e **separação de camadas** — a UI não fala HTTP diretamente, assim como
o controller não fala com o banco. A regra equivalente é: **componentes não chamam `fetch`/axios
direto**; passam por uma camada de dados (services/hooks).

## Organização por domínio (frontend)

Estruture `frontend/src` agrupando cada domínio com seus próprios componentes, hooks, chamadas de
API e tipos. Código transversal vai em `shared`.

```
frontend/src/
├── app/                 # bootstrap: router, providers globais, layout raiz
├── features/
│   └── foos/            # um domínio = uma pasta (espelha o domínio do backend)
│       ├── api.ts       # chamadas HTTP do domínio (getFoos, createFoo, ...)
│       ├── hooks.ts     # hooks de dados/estado (useFoos, useCreateFoo, ...)
│       ├── types.ts     # tipos que ESPELHAM os DTOs do backend
│       ├── components/  # componentes específicos do domínio
│       └── FoosPage.tsx # tela/rota do domínio
├── shared/
│   ├── ui/              # componentes reutilizáveis (botão, tabela, modal...)
│   ├── hooks/           # hooks genéricos
│   ├── lib/             # utilitários
│   └── types/           # tipos transversais (paginação, erro de API...)
└── services/
    └── http.ts          # cliente HTTP único (baseURL, auth, erros)
```

Use o **mesmo nome de domínio** que existe no backend (ex.: `foos` no front ↔ `Foos` no back),
para que a navegação entre as duas pontas seja trivial.

## Camadas do frontend (fluxo)

```
Componente → hook (useFoos) → service/api (api.ts) → cliente HTTP (http.ts) → Backend
```

1. **Cliente HTTP único** (`services/http.ts`): baseURL vinda de env, anexa o JWT, trata erros e
   401 de forma centralizada. Nenhum componente cria seu próprio cliente.
2. **Camada de API por domínio** (`features/<dom>/api.ts`): funções tipadas que mapeiam os
   endpoints REST do backend, 1:1 com as rotas.
3. **Camada de dados/estado** (`features/<dom>/hooks.ts`): hooks que encapsulam carregamento,
   cache, loading/erro (use uma lib de data fetching, ex.: TanStack Query, ou hooks próprios).
4. **UI** (componentes/telas): consome os hooks; não conhece detalhes de HTTP.

### Cliente HTTP

```ts
// services/http.ts
import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,   // nunca hardcode a URL
});

http.interceptors.request.use((config) => {
  const token = getAuthToken();                  // JWT
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) handleUnauthorized();  // tratamento central
    return Promise.reject(err);
  },
);
```

### Tipos espelhando os DTOs do backend

Cada recurso tem **um** tipo no frontend, com os mesmos campos do DTO correspondente. Não duplique
nem invente formatos paralelos.

```ts
// features/foos/types.ts
export interface FooDto {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}
```

### API por domínio (1:1 com as rotas REST)

```ts
// features/foos/api.ts
import { http } from "@/services/http";
import type { FooDto } from "./types";

export const foosApi = {
  list:   () => http.get<FooDto[]>("/api/foos").then((r) => r.data),
  get:    (id: string) => http.get<FooDto>(`/api/foos/${id}`).then((r) => r.data),
  create: (body: Omit<FooDto, "id">) => http.post<FooDto>("/api/foos", body).then((r) => r.data),
  update: (id: string, body: Partial<FooDto>) => http.put<FooDto>(`/api/foos/${id}`, body).then((r) => r.data),
  remove: (id: string) => http.delete(`/api/foos/${id}`).then((r) => r.data),
};
```

### Hooks de dados

```ts
// features/foos/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { foosApi } from "./api";

export function useFoos() {
  return useQuery({ queryKey: ["foos"], queryFn: foosApi.list });
}
```

## Convenções de nomenclatura (frontend)

- Componentes: arquivo e nome em `PascalCase`, um componente por arquivo (`FoosPage.tsx`).
- Hooks: `useXxx` em camelCase (`useFoos`, `useCreateFoo`).
- Módulo de API por domínio: `<domínio>Api` (`foosApi`).
- Tipos espelham DTOs: `<Entidade>Dto`, e variações `Create<Entidade>Dto` quando útil.
- Pastas de feature em plural/minúsculo, alinhadas ao domínio do backend (`features/foos`).
- Variáveis de ambiente via Vite: `import.meta.env.VITE_*`.

## O que NUNCA fazer (frontend)

- Chamar `fetch`/axios direto de um componente — passe pela camada `api.ts` + hooks.
- Hardcodar baseURL da API ou qualquer segredo — use `VITE_*`.
- Duplicar tipos do mesmo recurso ou divergir dos DTOs do backend.
- Espalhar tratamento de auth/401 pelos componentes — concentre no cliente HTTP.
- Organizar tudo por tipo técnico (uma pasta gigante de "components") em vez de por domínio.
- Misturar regra de UI com regra de dados no mesmo lugar — separe componente, hook e service.

---

# Recurso ponta a ponta (full-stack)

Ao adicionar um domínio novo, faça as duas pontas, na mesma ordem de domínio:

1. **Backend**: siga a receita de 9 passos (entidade → interface → DbSet → repositório → DTO →
   profile → command/handler → controller → DI).
2. **Frontend**: crie `features/<domínio>/` com `types.ts` (espelhando o DTO), `api.ts` (1:1 com
   as rotas do controller), `hooks.ts`, componentes e a tela/rota; registre a rota em `app/`.

Mantenha os contratos sincronizados: nomes de campos do DTO, rotas REST e formato de paginação/
filtros devem bater entre back e front.

## Checklist antes de finalizar

**Backend**
- [ ] Peça na camada correta, respeitando a direção das dependências?
- [ ] Interface do repositório no Domain e implementação na Infrastructure?
- [ ] Controller só orquestra via MediatR, sem regra de negócio nem EF?
- [ ] DTO de entrada/saída + perfil AutoMapper?
- [ ] Reaproveitou CRUD genérico e paginação/filtros centralizados?
- [ ] Persistência via Unit of Work?
- [ ] `DbSet` no `AppDbContext` e repositório registrado no DI?
- [ ] Endpoint protegido por JWT quando apropriado e visível no Swagger?

**Frontend**
- [ ] Domínio em `features/<dom>/` espelhando o domínio do backend?
- [ ] Componentes consomem hooks; só a camada de API fala HTTP?
- [ ] Cliente HTTP único, com baseURL via `VITE_*` e auth/401 centralizados?
- [ ] Tipos espelham os DTOs do backend, sem duplicação?
- [ ] Funções de API 1:1 com as rotas REST do controller?
- [ ] Nomenclatura (PascalCase componentes, `useXxx` hooks) seguida?
- [ ] `npm run build` gera `frontend/build` sem erros?

## Pontos de referência do código

Ao ter dúvida sobre um padrão, abra o arquivo correspondente na base e espelhe o que já existe.

Backend:
- `<App>.API/Program.cs`
- `<App>.API/Configuration/ServiceConfiguration.cs`
- `<App>.Application/ApplicationModule.cs`
- `<App>.Application/Commands/Generics`
- `<App>.Infrastructure/InfrastructureModule.cs`
- `<App>.Infrastructure/EntityFramework/AppDbContext.cs`
- `<App>.Infrastructure/EntityFramework/UnitOfWork/UnitOfWork.cs`
- `<App>.Domain/Common`

Frontend:
- `frontend/src/app/` (router e providers)
- `frontend/src/services/http.ts` (cliente HTTP)
- `frontend/src/features/<dom>/` (um domínio existente como modelo)
- `frontend/src/shared/` (UI e utilitários transversais)