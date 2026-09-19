# Grimório de bolso — design

**Data:** 18/09/2026
**Status:** aprovado em brainstorming, aguardando plano de implementação

## Problema

Um jogador vai para uma one-shot, presencial ou online, com uma ficha física ou
feita em outro lugar. Ele quer ter à mão o texto de algumas magias e poderes do
personagem sem montar uma ficha inteira no Fichas de Nimb e sem folhear o livro
a cada rodada.

O **Grimório de bolso** é uma coleção nomeada de itens da Enciclopédia de
Tanah-Toh que o jogador monta uma vez e consulta na mesa, no celular ou no PC.

## Escopo

**Dentro:**

- Vários grimórios, guardados só no navegador (`localStorage`), para qualquer
  usuário.
- Sempre existe **pelo menos um** grimório. Um usuário novo começa com um grimório vazio chamado "Padrão", que não tem regra especial: pode ser renomeado e excluído (desde que sobre outro).
- Qualquer item do índice da enciclopédia: magias e poderes (o foco), mas
  também habilidades, classes, raças, origens e divindades.
- Adicionar pela enciclopédia (um clique, no grimório ativo) e por uma busca
  dentro do próprio grimório.
- Botão flutuante e balão de resumo dentro da enciclopédia.
- Páginas `/grimorio` (lista) e `/grimorio/:id` (consulta).
- Exportar e importar em JSON (arquivo ou texto).

**Fora:**

- Salvar no servidor, sincronizar e login. O fork não tem backend nem
  autenticação, que vivem nos submódulos privados. O modelo de dados não
  impede adicionar isso depois.
- Notas pessoais por item. O formato do arquivo tem `versao` para receber esse
  campo no futuro sem quebrar arquivos antigos.
- Reordenar itens manualmente. A ordem é automática, por tipo e depois
  alfabética.
- Guardar o texto das regras dentro do grimório. Só a referência é guardada
  (ver "Decisões").

## Decisões

| #   | Decisão                                                  | Motivo                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Tudo local, com vários grimórios para todos              | O fork não tem backend nem login. Exportar e importar cobrem o backup e a troca de aparelho.                                                                                                                                |
| 2   | Guardar só o **id do índice** da enciclopédia            | O texto mostrado é sempre o oficial e atual, e o arquivo fica pequeno. Os ids já são estáveis, porque o site os usa nas URLs e no "copiar link".                                                                            |
| 3   | Todos os tipos do índice são aceitos                     | O índice já é uniforme, então incluir mais tipos custa quase nada.                                                                                                                                                          |
| 4   | Adicionar pelos cards e por uma busca dentro do grimório | A busca cobre todos os tipos num único lugar. Os botões ficam só nos cards de magia, nos de poder geral e nos resultados da busca unificada.                                                                                |
| 5   | Um clique adiciona ao **grimório ativo**                 | Montar um grimório é repetitivo. O ativo fica sempre visível no botão flutuante.                                                                                                                                            |
| 6   | Página própria, mais um balão na enciclopédia            | Endereço direto para consulta na mesa, sem quebrar a grade de abas da enciclopédia no celular.                                                                                                                              |
| 7   | Cards novos, próprios do grimório                        | Os cards existentes de magia e poder são linhas de tabela (`TableRow`) e não funcionam soltos.                                                                                                                              |
| 8   | Estender em vez de modificar                             | O fork pode virar PR para o repositório original. O código novo fica em pastas próprias, e as mudanças em arquivos existentes são pequenas inserções. Editar código existente continua liberado quando for o caminho limpo. |

## Modelo de dados

```ts
// src/interfaces/PocketGrimoire.ts
export interface PocketGrimoire {
  id: string; // uuid; o primeiro grimório de um usuário novo usa 'default'
  name: string;
  itemIds: string[]; // ids do índice da enciclopédia, sem repetição
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface PocketGrimoireState {
  grimoires: PocketGrimoire[];
  activeId: string;
}
```

**Ids** são os `EncyclopediaEntry.id` gerados por `buildEncyclopediaIndex()`
em `src/functions/encyclopediaSearch.ts`:

| Prefixo                               | Formato                           | Quantidade (todos os suplementos) |
| ------------------------------------- | --------------------------------- | --------------------------------- |
| `spell`                               | `spell:<nome>`                    | 256                               |
| `power`                               | `power:<GeneralPowerType>:<nome>` | 481                               |
| `class-power`                         | `class-power:<classe>:<nome>`     | 1172                              |
| `class-ability`                       | `class-ability:<classe>:<nome>`   | 218                               |
| `race-ability`                        | `race-ability:<raça>:<nome>`      | 199                               |
| `origin-power`                        | `origin-power:<origem>:<nome>`    | 193                               |
| `deity-power`                         | `deity-power:<divindade>:<nome>`  | 228                               |
| `race` / `class` / `origin` / `deity` | `<prefixo>:<nome>`                | 51 / 30 / 131 / 83                |

A busca sempre procura o id inteiro, sem quebrá-lo em partes. O prefixo, até o
primeiro `:`, só decide qual card mostrar.

### Regras do estado (reducers do slice `pocketGrimoire`)

- `addItem(grimoireId, itemId)`: não duplica. Atualiza `updatedAt`.
- `removeItem(grimoireId, itemId)`. O botão 📖+/✓ usa este par com o id
  explícito do grimório, para o "Desfazer" agir sobre o mesmo grimório mesmo
  que o ativo mude no meio do caminho.
- `createGrimoire(name)`: o id (uuid) e as datas são gerados no `prepare` do
  action creator, então quem faz o dispatch lê `action.payload.id`. O reducer
  continua puro. Não vira o ativo automaticamente: o balão da enciclopédia faz
  o próprio dispatch de `setActive` com esse id. `duplicateGrimoire` e
  `importGrimoire` seguem o mesmo padrão.
- `renameGrimoire(id, name)`: nome sem espaços nas pontas, não vazio, com no
  máximo 60 caracteres.
- `duplicateGrimoire(id)`: cria "<nome> (cópia)" com os mesmos itens.
- `deleteGrimoire(id)`: **não faz nada se for o último grimório**. Se o
  excluído era o ativo, `activeId` passa para o primeiro restante.
- `setActive(id)`: ignora ids que não existem.
- `importGrimoire(parsed)`: acrescenta um grimório já validado (ver
  "Exportar e importar").

**Invariantes.** Os reducers as preservam por construção, e os testes
verificam isso. O que vem de fora (o `localStorage`) passa por
`ensureValidState` no `migrate` do redux-persist e no estado inicial:

- existe pelo menos um grimório;
- `activeId` aponta para um grimório que existe;
- nenhum grimório tem ids repetidos.

Estado ausente, corrompido ou sem grimórios vira `{ grimoires: [Padrão vazio], activeId: 'default' }`. Um `activeId` inválido passa para o primeiro grimório.

**Persistência:** redux-persist com `key: 'pocketGrimoire'`, no mesmo padrão
das fatias já registradas em `src/store/index.ts`.

## Resolução de ids para conteúdo

`src/functions/pocketGrimoire/resolveItems.ts`

- Monta **uma vez** (com cache no módulo) o índice com
  `buildEncyclopediaIndex(Object.values(SupplementId))`, ou seja, com todos os
  suplementos. Assim um item continua aparecendo mesmo que o suplemento esteja
  desativado na enciclopédia. O índice padrão da busca tem 2909 itens, e o
  completo tem 3042, porque inclui o Atlas de Arton.
- `resolveItems(ids)` devolve `ResolvedItem[]`:
  - `{ kind: 'spell', entry, spell }`: `spell` é o objeto completo, vindo do
    `dataRegistry.getSpellsByCircleAndSupplements` para os círculos 1 a 5, com
    todos os suplementos. Magia que existe como arcana e divina vira **um**
    item, com `spellTypes: ['Arcana', 'Divina']`.
  - `{ kind: 'power', entry, power }`: `power` é o `GeneralPower` completo,
    com os pré-requisitos.
  - `{ kind: 'generic', entry }`: habilidades e poderes de classe, raça, origem
    e divindade. Usa `entry.title`, `entry.subtitle` e `entry.description`.
  - `{ kind: 'summary', entry }`: classe, raça, origem ou divindade inteira.
  - `{ kind: 'missing', id, name }`: id que não está no índice. `name` é
    extraído do próprio id por `nameFromId`, que tira o prefixo e, nos ids de
    três partes, o dono. Por exemplo, `class-power:Cavaleiro:Postura de
Combate: Aríete` vira "Postura de Combate: Aríete". Assim nenhum nome
    precisa ser guardado no estado.
- `groupResolvedItems(items)` agrupa e ordena para a página de consulta:

  1. Magias por círculo (1º a 5º), depois por nome;
  2. Poderes gerais;
  3. Poderes de classe;
  4. Habilidades de classe;
  5. Poderes de origem;
  6. Poderes concedidos;
  7. Habilidades de raça;
  8. Classes, Raças, Origens e Divindades;
  9. Não encontrados.

  A ordem alfabética dentro de cada grupo usa `localeCompare(..., 'pt-BR')`.

A camada de dados (índice e `dataRegistry`) é só lida, nunca alterada.

## Interface

Os componentes novos ficam em `src/components/PocketGrimoire/`. Todos precisam
funcionar no celular (breakpoints do MUI) e no tema claro e escuro.

### `AddToGrimoireButton`

- Props: `itemId: string`, `itemName: string` e `grimoireId?: string`. Sem
  `grimoireId`, o botão age sobre o grimório ativo. A página de consulta passa
  o grimório aberto, que pode não ser o ativo.
- Ícone `BookmarkAddOutlined` quando o item não está no grimório e
  `BookmarkAdded` (verde) quando está. Clicar alterna.
- Tooltip: "Adicionar a <grimório>" / "Remover de <grimório>".
- Notificação do notistack: "<item> adicionado a <grimório>" com o botão
  **Desfazer** e `autoHideDuration: 4000`. O provider global usa `null`, que
  nunca esconde. Fica ancorada **embaixo, à esquerda**, porque o provider
  ancora à direita, onde fica o botão flutuante.
- `event.stopPropagation()`, para não abrir nem fechar a linha da tabela.
- **Inserido** ao lado do `CopyUrlButton` no card de magia
  (`UnifiedSpellsTable.tsx`) e no de poder geral (`PowersTable.tsx`), e em cada
  resultado da `EncyclopediaSearch.tsx`.

### `PocketGrimoireFab` (dentro da enciclopédia)

- Botão flutuante no canto inferior direito, com `Badge` mostrando a quantidade
  de itens do ativo. Respeita a área segura com os helpers `safeBottom` e
  `safeRight` de `src/theme/safeArea.ts`, os mesmos de `DiceBox3D/DiceTray.tsx`,
  e não sobrepõe a bandeja de dados.
- No **desktop**, abre um balão (`Popper` ou `Popover`) preso ao botão, que
  **não bloqueia** a página: dá para seguir marcando itens com ele aberto.
- No **celular**, abre uma folha que sobe de baixo (`SwipeableDrawer`
  `anchor='bottom'`).
- Conteúdo do balão:
  - seletor do grimório ativo, com o item "+ Novo grimório" (cria e ativa);
  - nomes dos itens agrupados, com a mesma ordem do resolvedor;
  - clicar num nome navega para o item na enciclopédia
    (`/database/<route>/<param>`);
  - lixeira em cada item;
  - estado vazio: "Seu grimório está vazio. Use 📖+ nos cards para adicionar.";
  - rodapé com "Abrir completo" (`OpenInNew`), que vai para `/grimorio/<id>`.
- **Inserido** em `Database.tsx`, apenas quando `embedded` é falso.

### Página `/grimorio` (`PocketGrimoireListPage`)

- Cabeçalho "Meus grimórios" com os botões **Novo** (`Add`) e **Importar**
  (`FileUploadOutlined`).
- Um card por grimório: nome, selo **ativo**, quantidade de itens e data da
  última edição. Clicar abre `/grimorio/:id`.
- Menu ⋮ com ícones:
  - Tornar ativo (`CheckCircleOutlined`);
  - Renomear (`DriveFileRenameOutline`);
  - Exportar (`FileDownloadOutlined`);
  - Duplicar (`ContentCopyOutlined`);
  - Excluir (`DeleteOutlined`, em vermelho, desativado quando é o único grimório, com diálogo de
    confirmação).
- Aviso fixo: "Grimórios ficam só neste navegador. Exporte para fazer backup ou
  levar para outro aparelho."

### Página `/grimorio/:id` (`PocketGrimoirePage`)

- Título com o nome do grimório e o mesmo menu ⋮ da lista.
- Campo de busca com dois papéis:
  - filtra os itens do grimório pelo nome;
  - abaixo, mostra "Adicionar da enciclopédia", com até 8 resultados do índice
    completo, usando a pontuação existente (`searchEncyclopedia`). Cada
    resultado tem um botão de adicionar.
- Filtros rápidos (itens não encontrados aparecem em todos):

  - **Tudo**;
  - **Magias** (`spell`);
  - **Poderes** (`power`, `class-power`, `origin-power`, `deity-power`);
  - **Habilidades** (`class-ability`, `race-ability`);
  - **Outros** (`class`, `race`, `origin`, `deity`).

  Um filtro sem itens no grimório fica escondido.

- Cards agrupados conforme `groupResolvedItems`. Começam **fechados**, a menos
  que o grimório tenha **5 itens ou menos**; nesse caso, começam abertos.
- Cards:
  - `GrimoireSpellCard`:
    - fechado: nome, escola e execução/alcance;
    - aberto: um bloco de estatísticas em destaque (execução, alcance, alvo,
      área, duração, resistência), descrição e aprimoramentos
      (`TRUQUE` / `+N PM`).
  - `GrimoirePowerCard`: nome, tipo, pré-requisitos e descrição.
  - `GrimoireGenericCard`: nome, subtítulo e descrição.
  - `GrimoireSummaryCard`: nome, subtítulo e o link "Ver na enciclopédia".
  - `GrimoireMissingCard`: "<nome> não existe mais na enciclopédia",
    com botão de remover.
  - Todos os cards têm botão de remover do grimório.
- Id de grimório que não existe na rota: "Grimório não encontrado", com link
  para `/grimorio`.

### Pontos de contato com o código existente

| Arquivo                                          | Mudança                                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `src/store/index.ts`                             | registrar o reducer `pocketGrimoire` persistido                                       |
| `src/App.tsx`                                    | rotas `/grimorio` e `/grimorio/:id`, carregadas via `lazyScreen` como as demais telas |
| `src/components/SidebarV2/SidebarV2.tsx`         | item "Grimório de bolso" logo abaixo de "Enciclopédia de Tanah-Toh"                   |
| `src/components/screens/Database.tsx`            | `<PocketGrimoireFab />`                                                               |
| `src/components/Database/UnifiedSpellsTable.tsx` | `<AddToGrimoireButton />` no card de magia                                            |
| `src/components/DatabaseTables/PowersTable.tsx`  | `<AddToGrimoireButton />` no card de poder geral                                      |
| `src/components/Database/EncyclopediaSearch.tsx` | `<AddToGrimoireButton />` em cada resultado                                           |
| `.gitignore`                                     | `.superpowers/`                                                                       |

## Exportar e importar

`src/functions/pocketGrimoire/exchange.ts`, com funções puras.

### Formato

```json
{
  "formato": "fichas-de-nimb/grimorio-de-bolso",
  "versao": 1,
  "exportadoEm": "2026-09-18T21:30:00.000Z",
  "grimorio": {
    "nome": "Mago da one-shot",
    "itens": [
      { "id": "spell:Bola de Fogo", "nome": "Bola de Fogo" },
      {
        "id": "class-power:Arcanista:Magia Acelerada",
        "nome": "Magia Acelerada"
      }
    ]
  }
}
```

`nome` nos itens serve só para leitura humana e para o card de item não
encontrado. A importação usa apenas o `id`.

### Exportar

- `exportGrimoire(grimoire, resolveName)` devolve a string JSON, com
  indentação de 2 espaços.
- Diálogo com as ações:
  - **Baixar .json**: `grimorio-<slug-do-nome>.json`, via `Blob` e
    `URL.createObjectURL`;
  - **Copiar texto**: `navigator.clipboard.writeText`, com notificação de
    sucesso ou falha.
- O JSON também aparece numa caixa de texto somente leitura, para copiar à mão
  se a área de transferência falhar.

### Importar

- Diálogo com duas abas: **Arquivo** (`<input type="file" accept=".json,application/json">`)
  e **Colar texto**.
- `parseGrimoireImport(text)` devolve
  `{ ok: true, value: { name, itemIds } } | { ok: false, error }`:

| Situação                                  | Mensagem                                                             |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Mais de 1 MB                              | "Arquivo grande demais para ser um grimório."                        |
| Não é JSON                                | "Não foi possível ler o arquivo. Ele não parece ser um JSON válido." |
| `formato` diferente ou estrutura inválida | "Este arquivo não é um grimório do Fichas de Nimb."                  |
| `versao` maior que a suportada            | "Este grimório foi criado numa versão mais nova do site."            |
| Mais de 1000 itens                        | "Este grimório tem itens demais (máximo 1000)."                      |

- Ids repetidos são removidos. Ids fora do índice são **mantidos** e aparecem
  como "não encontrados".
- O nome importado vazio vira "Grimório importado". Se colidir com um existente,
  recebe o sufixo " (2)", " (3)"…
- Sempre cria um grimório **novo**, sem virar o ativo. A notificação diz
  "<nome> importado: N itens (M não encontrados)" e tem o botão **Tornar
  ativo**.

## Testes

Vitest com Testing Library, em pastas `__tests__` ao lado do código. Nenhum
teste pode depender de `src/premium`, porque eles precisam passar no fork.

**Unitários:**

- **Slice:**
  - adicionar sem duplicar;
  - remover;
  - criar, renomear (com validação do nome) e duplicar;
  - não excluir o último grimório; excluir o Padrão quando há outro;
  - excluir o ativo passa o ativo para o primeiro restante;
  - `setActive` com id inexistente;
  - `ensureValidState` com estado vazio, corrompido e sem grimórios.
- **Exportar e importar:**
  - exportar e importar devolve o mesmo grimório;
  - cada linha da tabela de erros;
  - ids repetidos removidos;
  - conflito de nome gera o sufixo;
  - ids desconhecidos preservados e contados.
- **Resolvedor:**
  - um id de cada prefixo resolve para o `kind` certo;
  - magia de suplemento fora do conjunto padrão resolve (um item do Atlas de
    Arton);
  - magia arcana e divina vira um item só;
  - id inválido vira `missing`;
  - a ordem de `groupResolvedItems` está correta.
- **Proteção contra regressão:**
  - toda magia e todo poder geral do índice completo resolvem com os dados
    detalhados (`spell` e `power`), e não como card genérico;
  - todo poder geral tem um id `power:<power.type>:<nome>` que existe no
    índice, que é como a tabela de poderes monta o id do botão.

**Componentes:**

- clicar em `AddToGrimoireButton` troca o ícone e aumenta o contador do
  botão flutuante;
- remover pelo balão atualiza o botão do card;
- `PocketGrimoirePage` abre os cards automaticamente com 5 itens ou menos e os
  deixa fechados com 6 ou mais.

## Verificação antes de dar como pronto

1. `npx vitest run`: os testes novos passam. A linha de base continua a mesma:
   2036 testes passando e só as 15 falhas já conhecidas de
   `unarmedDamage.spec.ts`, causadas pelo `safeFormulaEval` do stub premium.
2. `npx eslint --max-warnings=0` e `npx prettier --check` em todos os arquivos
   novos e alterados.
3. `npx tsc --noEmit` com a saída filtrada: zero erros nos arquivos novos e
   alterados. O `tsc` completo não passa sem o módulo premium.
4. Teste no navegador (Chromium headless), no desktop (1366×900) e no celular
   (390×844):

   - montar um grimório pela enciclopédia;
   - trocar o ativo pelo balão;
   - abrir `/grimorio/:id`;
   - exportar, excluir, importar de volta;
   - recarregar a página e confirmar que os dados continuam lá.

   Com screenshots.

5. Screenshots antes e depois das abas Magias e Poderes: a única diferença deve
   ser o botão novo.
