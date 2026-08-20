# PostgreSQL

O backend usa PostgreSQL por meio do provider `Npgsql.EntityFrameworkCore.PostgreSQL`.
A migration `InitialPostgreSql` e o snapshot atual representam todo o schema da
aplicacao, inclusive as tabelas de login, sessoes, permissoes e recuperacao de
senha que antes eram mantidas por scripts avulsos.

Ao iniciar, o backend aplica automaticamente as migrations pendentes. Em um
banco novo, elas tambem criam o usuario administrador inicial `admin`. A senha
inicial deve ser alterada depois do primeiro acesso.

## Configuracao

Nao grave credenciais reais no repositorio. Configure a connection string pelo
ambiente do processo:

```bash
export ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=dbqms;Username=admin;Password=change-me'
```

Para desenvolvimento local, a opcao recomendada e o Secret Manager do .NET:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=servidor;Port=5432;Database=dbqms;Username=admin;Password=sua-senha"
```

O segredo fica no perfil local do usuario e nao e versionado pelo Git.

Em Docker ou em uma plataforma de deploy, crie a mesma variavel diretamente no
painel de secrets/variaveis de ambiente.

## Preparar e validar o backend

```bash
dotnet tool restore
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

No desenvolvimento, `dotnet run` inicia a API em `http://localhost:5100`.
O Vite encaminha automaticamente requisicoes relativas a `/api` para essa
porta. A porta `5000` nao e usada porque pode estar reservada pelo AirPlay no
macOS.

Para gerar o script SQL sem aplicar a migration:

```bash
dotnet ef migrations script 0 InitialPostgreSql \
  --context AppDbContext \
  --output Migrations/Scripts/InitialPostgreSql.sql
```

Para criar uma migration futura:

```bash
dotnet ef migrations add NomeDaMigration --context AppDbContext
dotnet ef database update --context AppDbContext
```

## Scripts antigos

Os arquivos em `sql/` foram criados para o SQL Server e sao mantidos apenas
como referencia historica. Eles nao devem ser executados no PostgreSQL. Toda
alteracao futura de schema deve ser feita por migrations do Entity Framework.

## Datas e horarios

O projeto usa temporariamente `Npgsql.EnableLegacyTimestampBehavior` porque o
codigo existente mistura valores `DateTime` locais e UTC. Antes de remover essa
compatibilidade, normalize a aplicacao para UTC e gere uma migration especifica
para converter as colunas de data e hora.
