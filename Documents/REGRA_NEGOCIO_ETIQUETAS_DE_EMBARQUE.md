# Regra de Negócio - Etiquetas de Embarque

Este documento explica, de forma simples, como o módulo **Etiquetas > Etiqueta de Embarque** funciona do ponto de vista do negócio.

## Para que serve

O módulo serve para gerar e imprimir etiquetas de embarque para peças identificadas por **Part Number**.

Em vez de criar uma etiqueta por vez, o usuário informa um intervalo de numeração. O sistema gera automaticamente uma etiqueta para cada número dentro desse intervalo.

Exemplo:

```text
Part Number: ABC-123
Número inicial: 1
Número final: 5
```

O sistema entende que devem ser geradas 5 etiquetas:

```text
0001
0002
0003
0004
0005
```

## Conceitos principais

### Part Number

É o código da peça/produto que será embarcado.

O usuário não digita livremente o Part Number. Ele seleciona um Part Number que já existe no cadastro do sistema.

Ao selecionar o Part Number, o sistema mostra:

- descrição;
- revisão.

Esses campos ajudam o usuário a confirmar que escolheu a peça correta.

### Modelo da etiqueta

Existem dois modelos:

- **DEFAULT**
- **ASSY**

A diferença prática está no texto impresso no cabeçalho da etiqueta.

Modelo DEFAULT:

```text
|-S-| 73030 - {PART_NUMBER}
```

Modelo ASSY:

```text
|-S-| 73030 ASSY- {PART_NUMBER}
```

Use **ASSY** quando a etiqueta for para conjunto/montagem. Use **DEFAULT** para o caso padrão.

### Data

A data representa a referência do embarque/lote.

Na tela, o usuário escolhe uma data. Na etiqueta, ela aparece como ano e mês.

Exemplo:

```text
Data escolhida: Julho/2026
Texto impresso: 2026/07
```

### Número inicial e número final

Esses campos definem quantas etiquetas serão criadas.

O número inicial é o primeiro número da sequência.

O número final é o último número da sequência.

Exemplo:

```text
Inicial: 10
Final: 15
```

O sistema gera:

```text
0010
0011
0012
0013
0014
0015
```

Quantidade total:

```text
6 etiquetas
```

## Regra de quantidade

A quantidade é sempre calculada pelo sistema.

O usuário não digita a quantidade manualmente.

Fórmula:

```text
Quantidade = Número Final - Número Inicial + 1
```

Exemplo:

```text
Número Inicial: 1
Número Final: 20
Quantidade: 20
```

## Regras de validação

O sistema não deve permitir salvar uma etiqueta quando:

- nenhum Part Number foi selecionado;
- nenhum modelo foi selecionado;
- nenhuma data foi selecionada;
- o número inicial está vazio;
- o número final está vazio;
- o número inicial é menor ou igual a zero;
- o número final é menor que o número inicial.

Exemplos inválidos:

```text
Inicial: 0
Final: 10
```

Motivo: o inicial precisa ser maior que zero.

```text
Inicial: 20
Final: 10
```

Motivo: o final não pode ser menor que o inicial.

## Como a numeração aparece na etiqueta

O número da etiqueta sempre aparece com pelo menos 4 dígitos.

Exemplos:

```text
1   vira 0001
9   vira 0009
25  vira 0025
999 vira 0999
```

Se o número tiver mais de 4 dígitos, o sistema mantém o número completo.

Exemplo:

```text
12345 vira 12345
```

## Texto principal impresso

Cada etiqueta possui uma referência lateral formada por:

```text
ANO/MÊS - NÚMERO
```

Exemplo:

```text
2026/07 - 0001
```

Se o usuário informar:

```text
Data: Julho/2026
Inicial: 1
Final: 3
```

O sistema imprime:

```text
2026/07 - 0001
2026/07 - 0002
2026/07 - 0003
```

## Informações fixas da etiqueta

Algumas informações são fixas no layout:

```text
283
BRAZIL
MATCHED SET DO NOT ISSUE SEPARATION
```

Essas informações não são digitadas pelo usuário no cadastro da etiqueta.

## Configuração da etiqueta

Antes de imprimir, o usuário pode configurar o tamanho e aparência da etiqueta.

Essa configuração define:

- largura da etiqueta;
- altura da etiqueta;
- margens;
- tamanho do oval/badge;
- tamanho das fontes;
- impressora padrão.

Essas configurações são salvas por usuário.

Isso significa que um usuário pode ter uma configuração diferente de outro usuário.

## Impressora

O usuário pode selecionar uma impressora detectada pelo sistema ou digitar manualmente o nome da fila.

Exemplo de fila de rede:

```text
\\servidor\impressora
```

Importante: a impressão é enviada pelo navegador. Por isso, a impressora final pode depender da configuração do computador/navegador do usuário.

## Fluxo normal de uso

1. O usuário acessa **Etiquetas > Etiqueta de Embarque**.
2. Clica em **Nova Etiqueta**.
3. Seleciona o Part Number.
4. Escolhe o modelo da etiqueta.
5. Escolhe a data.
6. Informa o número inicial.
7. Informa o número final.
8. Confere a quantidade calculada.
9. Clica em **Salvar e Imprimir**.
10. O sistema salva o registro.
11. O sistema gera uma etiqueta para cada número do intervalo.
12. O navegador abre a impressão.

## O que fica salvo

Quando uma etiqueta é criada, o sistema salva:

- Part Number;
- data de referência;
- número inicial;
- número final;
- quantidade;
- modelo da etiqueta;
- configuração de tamanho/fonte usada no momento;
- impressora informada;
- usuário que criou;
- data de criação;
- data da última atualização.

## Editar uma etiqueta

Ao editar, o usuário pode alterar:

- Part Number;
- modelo;
- data;
- número inicial;
- número final;
- configuração de impressão associada ao registro.

Depois de salvar, a próxima impressão usa os dados atualizados.

## Excluir uma etiqueta

Quando o usuário exclui uma etiqueta, ela não aparece mais na listagem.

Do ponto de vista do sistema, a exclusão é lógica. Ou seja, o registro é marcado como excluído, mas não é removido fisicamente do banco.

## Imprimir novamente

Uma etiqueta já salva pode ser impressa novamente pela listagem.

Nesse caso, o sistema usa os dados salvos naquele registro para gerar novamente as páginas de impressão.

## Permissões

Usuário com permissão de edição pode:

- criar etiqueta;
- editar etiqueta;
- excluir etiqueta;
- configurar etiqueta;
- imprimir.

Usuário sem permissão de edição pode:

- visualizar etiquetas;
- imprimir etiquetas.

Mas não pode:

- criar;
- editar;
- excluir;
- alterar configuração.

## Exemplos práticos

### Exemplo 1 - Etiqueta simples

Entrada:

```text
Part Number: PN-100
Modelo: DEFAULT
Data: 07/2026
Inicial: 1
Final: 3
```

Resultado:

```text
Quantidade: 3

Etiqueta 1: 2026/07 - 0001
Etiqueta 2: 2026/07 - 0002
Etiqueta 3: 2026/07 - 0003
```

Cabeçalho:

```text
|-S-| 73030 - PN-100
```

### Exemplo 2 - Etiqueta ASSY

Entrada:

```text
Part Number: PN-200
Modelo: ASSY
Data: 12/2026
Inicial: 15
Final: 17
```

Resultado:

```text
Quantidade: 3

Etiqueta 1: 2026/12 - 0015
Etiqueta 2: 2026/12 - 0016
Etiqueta 3: 2026/12 - 0017
```

Cabeçalho:

```text
|-S-| 73030 ASSY- PN-200
```

## Resumo rápido

O módulo responde a três perguntas:

```text
Qual peça?
Qual mês/ano?
Qual intervalo de números?
```

A partir disso, o sistema calcula a quantidade, salva o lote e imprime uma etiqueta para cada número.

