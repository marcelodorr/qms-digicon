Digicon QMS - pacote self-contained win-x64

Conteudo:
- BUILD\backend: aplicacao publicada self-contained, com backend.exe e wwwroot.
- BUILD\frontend: copia dos arquivos estaticos do frontend.
- BUILD\sql: scripts SQL de atualizacao/criacao.
- BUILD\install-backend-service.bat: instala o backend como servico Windows.
- BUILD\uninstall-backend-service.bat: remove o servico Windows.

Instalacao no cliente:
1. Copie a pasta BUILD\backend para C:\digicon-qms\backend.
2. Ajuste C:\digicon-qms\backend\appsettings.json com a connection string do SQL Server do cliente.
3. Execute os scripts necessarios em BUILD\sql no banco do cliente. Para o modulo de Etiquetas de Embarque, execute update-shipping-labels.sql.
4. Abra o Prompt de Comando como Administrador.
5. Acesse a pasta BUILD deste pacote e execute install-backend-service.bat.
6. A aplicacao ficara disponivel em http://<servidor>:5081.

Observacoes:
- Este pacote e self-contained para Windows x64; nao exige instalacao do runtime .NET no cliente.
- O servico instalado chama-se DigiconQMS.
- Para remover o servico, execute BUILD\uninstall-backend-service.bat como Administrador.
