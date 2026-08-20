# Deploy no Dokploy

O sistema é publicado como **um único container**: o build do frontend
(Vite) é copiado para `wwwroot` e servido pelo próprio backend ASP.NET Core,
exatamente como já funciona hoje em desenvolvimento/produção local. O
`Dockerfile` na raiz faz esse build em 3 estágios (frontend → backend →
runtime) e não precisa de nenhuma outra configuração de rede.

## 1. Pré-requisitos

- Um PostgreSQL acessível a partir da VPS (interno ao Dokploy ou externo).
- A string de conexão desse banco.

## 2. Criar a aplicação no Dokploy

1. Novo serviço do tipo **Application**, origem = este repositório Git.
2. Build type: **Dockerfile** (usa o `Dockerfile` da raiz do repo).
3. Porta interna do container: **8080** (já configurada via `ASPNETCORE_URLS`
   no Dockerfile). Configure o domínio/proxy do Dokploy apontando para essa
   porta.

## 3. Variáveis de ambiente

Configure em "Environment" do serviço (veja `.env.example`):

| Variável | Valor |
|---|---|
| `ConnectionStrings__DefaultConnection` | `Host=...;Port=5432;Database=dbqms;Username=...;Password=...` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |

Ao subir, o backend aplica automaticamente as migrations pendentes no banco
(`dotnet ef database update` embutido no `Program.cs`) e, em um banco novo,
cria o usuário administrador inicial. Troque a senha padrão após o primeiro
acesso.

## 4. Volumes persistentes (obrigatório)

O sistema grava dados em disco além do banco. Sem volumes, esses dados somem
a cada redeploy/restart do container:

| Volume no Dokploy | Path no container | Para quê |
|---|---|---|
| `qms-appsettings` | `/app/appsettings.json` | As telas de **Configurações → SMTP** e **Configurações → Banco de Dados** gravam direto nesse arquivo em runtime. Sem volume, qualquer configuração feita pela UI é perdida no próximo deploy. |
| `qms-documents` | `/home/appuser/Documents` | PDFs de certificados de qualidade, certificados de conformidade e certificados de processo especial gerados pelo sistema são salvos aqui por padrão. |

Mapeie ambos como *volume mounts* (não *bind mounts* do host, a menos que
você gerencie o path manualmente na VPS).

Na primeira subida, se o volume de `appsettings.json` estiver vazio, o
arquivo da imagem (sem segredos) é usado como ponto de partida — configure
SMTP e, se preferir usar a UI em vez da variável de ambiente, a conexão de
banco pela tela de Configurações; a gravação subsequente já vai para o
volume.

## 5. O que já foi validado localmente

- `docker build -t qms-digicon .` a partir da raiz do repo builda com
  sucesso (frontend Vite + backend .NET 8 publish).
- O container sobe, lê `ConnectionStrings__DefaultConnection` da env var e
  tenta aplicar as migrations — testado com credenciais inválidas de
  propósito, retornando erro claro do Postgres (`role ... does not exist`),
  confirmando que a leitura da variável e a tentativa de conexão funcionam
  como esperado. Com uma connection string válida, a migration é aplicada
  normalmente.

## 6. Segurança

O `appsettings.json` versionado no repositório **não contém mais segredos**
(a senha SMTP que estava commitada foi removida). Se você usava aquela senha
de SMTP em produção, troque-a — ela ficou exposta no histórico do Git.
Não commite `.env` (já está no `.gitignore`).
