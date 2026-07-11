# Módulo Etiquetas > Etiqueta de Embarque

Este documento descreve o funcionamento do módulo **Etiquetas > Etiqueta de Embarque** do Digicon QMS, incluindo fluxo de uso, dados gravados, configuração de impressão, geração das etiquetas e endpoints envolvidos.

## Objetivo

O módulo permite cadastrar lotes de etiquetas de embarque por **Part Number**, definir o intervalo numérico das etiquetas, escolher o modelo visual e imprimir as etiquetas geradas.

Cada registro salvo representa um lote de etiquetas. A quantidade do lote é calculada automaticamente a partir do intervalo:

```text
Quantidade = Número Final - Número Inicial + 1
```

## Acesso no sistema

O menu fica em:

```text
Etiquetas > Etiqueta de Embarque
```

A rota da tela é:

```text
/etiquetas/etiqueta-embarque
```

O acesso respeita as permissões do módulo:

```text
etiquetas.etiqueta-embarque
```

Usuários sem permissão de edição conseguem visualizar e imprimir, mas não conseguem criar, editar, excluir ou configurar etiquetas.

## Tela de listagem

A tela principal exibe os registros de etiquetas já cadastrados.

Colunas exibidas:

- **Part Number**
- **Data**
- **Range**
- **Modelo**
- **Qtd.**
- **Impressora**
- **Última Atualização**
- **Ações**

A busca filtra por:

- Part Number
- modelo da etiqueta
- range inicial/final
- nome da impressora

Ações disponíveis por registro:

- **Imprimir**: gera novamente o trabalho de impressão do registro salvo.
- **Editar**: abre o formulário com os dados do registro.
- **Excluir**: marca o registro como excluído no banco.

Também há exclusão em massa quando o usuário seleciona linhas na grade.

## Cadastro e edição

O formulário possui os campos abaixo.

### Part Number

Campo obrigatório. O usuário seleciona um Part Number cadastrado no sistema.

Ao selecionar, o formulário preenche automaticamente, apenas para consulta:

- **Descrição**
- **Revisão**

O backend valida se o Part Number existe e não está excluído.

### Modelo da Etiqueta

Campo obrigatório. Existem dois modelos:

- **Tipo 1 - DEFAULT**
- **Tipo 2 - ASSY**

O modelo altera o texto do cabeçalho impresso:

```text
DEFAULT: |-S-| 73030 - {PART_NUMBER}
ASSY:    |-S-| 73030 ASSY- {PART_NUMBER}
```

### Data

Campo obrigatório. Na tela é exibida no formato `MM/yyyy`.

Na impressão, a data é usada no formato:

```text
yyyy/MM
```

Exemplo:

```text
2026/07 - 0001
```

### Número Inicial e Número Final

Campos obrigatórios, numéricos e inteiros.

Regras:

- o número inicial deve ser maior que zero;
- o número final deve ser maior ou igual ao número inicial;
- a quantidade é calculada automaticamente.

Exemplo:

```text
Número Inicial: 1
Número Final: 20
Quantidade: 20
```

### Botões do formulário

- **Salvar**: salva o registro e permanece no formulário.
- **Salvar e Fechar**: salva e volta para a listagem.
- **Salvar e Imprimir**: salva, gera as etiquetas e abre a impressão.
- **Cancelar**: descarta a navegação atual e volta para a listagem.

Após **Salvar e Imprimir**, o sistema mostra uma confirmação com as opções:

- **Fechar**
- **Gerar outra**

## Configuração da etiqueta

Na listagem há um botão de configuração, identificado por ícone de engrenagem.

As configurações são salvas por usuário. O backend usa o nome do usuário logado como chave; se não houver usuário, usa `Sistema`.

Configurações disponíveis:

- **Largura (mm)**
- **Altura (mm)**
- **Margem Esquerda (mm)**
- **Margem Superior (mm)**
- **Largura Badge (mm)**
- **Altura Badge (mm)**
- **Fonte Número Oval (mm)**
- **Fonte Cabeçalho (mm)**
- **Fonte País (mm)**
- **Fonte Rodapé (mm)**
- **Fonte Data Lateral (mm)**
- **Impressora local ou de rede**
- **Impressora Padrão**, preenchida manualmente quando necessário

Valores padrão:

```text
Largura: 100 mm
Altura: 50 mm
Margem esquerda: 0 mm
Margem superior: 0 mm
Fonte número oval: 7.5 mm
Fonte cabeçalho: 5.6 mm
Fonte país: 6.6 mm
Fonte rodapé: 5.6 mm
Fonte data lateral: 4.8 mm
Largura badge: 21.5 mm
Altura badge: 13.03 mm
```

Regras:

- largura e altura devem ser maiores que zero;
- margens não podem ser negativas;
- margem esquerda deve ser menor que a largura;
- margem superior deve ser menor que a altura;
- fontes e dimensões do badge devem ser maiores que zero.

## Impressoras

O backend tenta listar impressoras disponíveis no servidor por dois caminhos:

- impressoras instaladas via `System.Drawing.Printing.PrinterSettings`;
- impressoras locais/de rede via WMI `Win32_Printer`, quando roda em Windows.

O usuário também pode informar manualmente uma fila, por exemplo:

```text
\\servidor\fila
```

Observação importante: atualmente a impressão é disparada pelo navegador usando `window.print()` em um `iframe`. O nome da impressora é salvo no registro e aparece na configuração/listagem, mas a escolha final da impressora depende do navegador/sistema operacional, a menos que o ambiente esteja configurado para imprimir automaticamente na impressora padrão.

## Geração das etiquetas

Ao imprimir, o frontend chama o backend para montar um **print job**.

O backend gera uma etiqueta para cada número do intervalo.

Exemplo:

```text
Part Number: PN-001
Data: 07/2026
Número Inicial: 1
Número Final: 3
```

Itens gerados:

```text
2026/07 - 0001
2026/07 - 0002
2026/07 - 0003
```

O número de série recebe zeros à esquerda. A quantidade mínima de dígitos é 4, mas o sistema aumenta se o número final tiver mais dígitos.

Exemplos:

```text
1      -> 0001
25     -> 0025
12345  -> 12345
```

## Layout impresso

Cada etiqueta é renderizada como uma página HTML independente.

Elementos principais:

- badge oval com texto fixo `283`;
- cabeçalho com modelo e Part Number;
- país fixo `BRAZIL`;
- aviso fixo `MATCHED SET DO NOT ISSUE SEPARATION`;
- referência lateral vertical no formato `{yyyy/MM} - {serial}`;

O tamanho da página é definido com `@page` usando largura e altura configuradas em milímetros.

## Persistência

O módulo usa duas estruturas principais no banco.

### ShippingLabels

Armazena os lotes de etiquetas.

Campos principais:

- `Id`
- `PartNumberId`
- `PartNumber`
- `ReferenceDate`
- `RangeStart`
- `RangeEnd`
- `Quantity`
- `LabelModel`
- fontes e dimensões da etiqueta
- `PrinterName`
- `CreateBy`
- `CreateDate`
- `LastUpdate`
- `IsDeleted`

A exclusão é lógica: o registro recebe `IsDeleted = true`.

### ShippingLabelPrintSettings

Armazena configuração de impressão por usuário.

Campos principais:

- `Username`
- largura e altura da etiqueta
- margens
- fontes
- dimensões do badge
- `PrinterName`
- datas de criação e atualização

## API

Base:

```text
/api/ShippingLabel
```

Endpoints:

| Método | Rota | Função |
|---|---|---|
| `GET` | `/api/ShippingLabel` | Lista etiquetas não excluídas |
| `GET` | `/api/ShippingLabel/{id}` | Busca uma etiqueta por ID |
| `POST` | `/api/ShippingLabel` | Cria etiqueta |
| `PUT` | `/api/ShippingLabel/{id}` | Atualiza etiqueta |
| `DELETE` | `/api/ShippingLabel/{id}` | Exclui logicamente etiqueta |
| `GET` | `/api/ShippingLabel/print-settings?username={usuario}` | Busca ou cria configurações do usuário |
| `PUT` | `/api/ShippingLabel/print-settings` | Salva configurações do usuário |
| `GET` | `/api/ShippingLabel/printers` | Lista impressoras detectadas |
| `GET` | `/api/ShippingLabel/{id}/print-job` | Gera dados para impressão |

## Fluxo técnico resumido

1. Ao abrir a tela, o frontend carrega em paralelo:
   - etiquetas cadastradas;
   - Part Numbers;
   - configurações de impressão do usuário;
   - impressoras disponíveis.
2. O usuário cria ou edita uma etiqueta.
3. O frontend envia os dados e as configurações atuais para o backend.
4. O backend valida Part Number, intervalo, modelo, dimensões e margens.
5. O registro é salvo em `ShippingLabels`.
6. Se o usuário imprimir, o frontend solicita `/print-job`.
7. O backend gera uma lista de itens de impressão com sequência e texto de referência.
8. O frontend monta HTML/CSS com `@page` e chama `window.print()`.

## Principais validações

No frontend:

- Part Number obrigatório;
- modelo obrigatório;
- data obrigatória;
- número inicial e final obrigatórios;
- números devem ser inteiros;
- final deve ser maior ou igual ao inicial.

No backend:

- Part Number deve existir e não estar excluído;
- Part Number salvo não pode ficar vazio;
- modelo deve ser `DEFAULT` ou `ASSY`;
- número inicial deve ser maior que zero;
- número final deve ser maior ou igual ao inicial;
- largura e altura da etiqueta devem ser maiores que zero;
- largura e altura do badge devem ser maiores que zero;
- margens não podem ser negativas;
- margens devem ser menores que as dimensões da etiqueta.

## Arquivos principais

Frontend:

- `frontend/src/app/components/shipping-labels/ShippingLabelsView.tsx`
- `frontend/src/app/components/shipping-labels/ShippingLabelsList.tsx`
- `frontend/src/app/components/shipping-labels/ShippingLabelForm.tsx`
- `frontend/src/app/components/shipping-labels/ShippingLabelSettingsSheet.tsx`
- `frontend/src/lib/shipping-labels.ts`

Backend:

- `backend/Controllers/ShippingLabelController.cs`
- `backend/Services/ShippingLabelService.cs`
- `backend/Models/ShippingLabelModel.cs`
- `backend/Models/ShippingLabelPrintSettingsModel.cs`
- `backend/Models/ShippingLabelSaveCommand.cs`
- `backend/Models/ShippingLabelPrintJob.cs`
- `backend/Models/ShippingLabelTemplateTypes.cs`
