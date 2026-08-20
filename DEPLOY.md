# Deploy no Dokploy

O sistema é publicado como **um único container**: o build do frontend
(Vite) é copiado para `wwwroot` e servido pelo próprio backend ASP.NET Core,
exatamente como já funciona hoje em desenvolvimento/produção local. O
`Dockerfile` na raiz faz esse build em 3 estágios (frontend → backend →
runtime) e o `docker-compose.yml` na raiz é o que o Dokploy usa para subir o
serviço.

## 1. Pré-requisitos

- Um PostgreSQL acessível a partir da VPS (interno ao Dokploy ou externo).
- A string de conexão desse banco.

## 2. Criar a aplicação no Dokploy

1. Novo serviço do tipo **Compose**, origem = este repositório Git.
2. Compose Path: `docker-compose.yml` (raiz do repo). O Dokploy detecta o
   `build:` do serviço `app` e builda a imagem a partir do `Dockerfile`.
3. Configure o domínio/proxy do Dokploy apontando para a porta **8080** do
   container (já publicada pelo `docker-compose.yml`).

## 3. Variáveis de ambiente

Configure em "Environment" do serviço no Dokploy (veja `.env.example`) — o
`docker-compose.yml` repassa essas variáveis para o container:

| Variável | Valor |
|---|---|
| `ConnectionStrings__DefaultConnection` | `Host=...;Port=5432;Database=dbqms;Username=...;Password=...` |

Ao subir, o backend aplica automaticamente as migrations pendentes no banco
(`dotnet ef database update` embutido no `Program.cs`) e, em um banco novo,
cria o usuário administrador inicial. Troque a senha padrão após o primeiro
acesso.

## 4. Volumes persistentes (já declarados no compose)

O sistema grava dados em disco além do banco. O `docker-compose.yml` já
declara dois volumes nomeados para que esses dados sobrevivam a
redeploys/restarts — não é preciso configurar nada a mais no Dokploy:

| Volume | Path no container | Para quê |
|---|---|---|
| `qms_appsettings` | `/app-data` (symlinkado para `/app/appsettings.json` pelo entrypoint) | As telas de **Configurações → SMTP** e **Configurações → Banco de Dados** gravam direto em `appsettings.json` em runtime. Sem volume, qualquer configuração feita pela UI é perdida no próximo deploy. |
| `qms_documents` | `/home/appuser/Documents` | PDFs de certificados de qualidade, certificados de conformidade e certificados de processo especial gerados pelo sistema são salvos aqui por padrão. |

Um volume nomeado não pode ser montado direto em cima de um arquivo único
que já existe na imagem (o Docker exige que seja um diretório), por isso o
volume é montado em `/app-data` e o `docker-entrypoint.sh` cria um symlink
`/app/appsettings.json -> /app-data/appsettings.json` a cada boot. Na
primeira subida, se `/app-data` estiver vazio, ele é semeado com o
`appsettings.json` da imagem (sem segredos); em subidas seguintes, o que a
UI gravou é preservado.

## 5. O que já foi validado localmente

- `docker compose build` e `docker compose up` a partir da raiz do repo
  funcionam de ponta a ponta (frontend Vite + backend .NET 8 publish).
- O container sobe, lê `ConnectionStrings__DefaultConnection` da env var e
  tenta aplicar as migrations — testado com credenciais inválidas de
  propósito, retornando erro claro do Postgres (`role ... does not exist`),
  confirmando que a leitura da variável e a tentativa de conexão funcionam
  como esperado. Com uma connection string válida, a migration é aplicada
  normalmente.
- Testado especificamente o ciclo de vida do volume `qms_appsettings`:
  primeira subida semeia o arquivo, uma escrita simulada (como a tela de
  Configurações faria) persiste, e ao recriar o container reutilizando o
  mesmo volume (simulando um redeploy) a edição continua lá.

## 6. Segurança

O `appsettings.json` versionado no repositório **não contém mais segredos**
(a senha SMTP que estava commitada foi removida). Se você usava aquela senha
de SMTP em produção, troque-a — ela ficou exposta no histórico do Git.
Não commite `.env` (já está no `.gitignore`).
