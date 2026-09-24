# Layouts customizáveis de ficha — estado e handoff

> **Para quem pegar isto depois.** As três fases estão implementadas e verdes.
> Falta o que está em §10 (build, página de créditos, testes na mão). Este
> documento é o que você precisa para continuar sem reabrir decisões que já
> foram tomadas.
>
> Última atualização: 24/09/2026.

---

## 1. O que é a feature

A ficha deixou de ter um arranjo fixo em código. O layout virou um **documento**
que o usuário escolhe, edita e (na Fase 3) compartilha. São três modelos base —
página única, abas e menu de ação — mais um editor drag-and-drop.

Tudo atrás da flag `sheetLayouts`, restrita a apoiadores.

### Decisões travadas com o dono do projeto

Não reabrir sem falar com ele.

| Tema             | Decisão                                                                                                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modelos          | `single` (rolagem contínua), `tabs` (o arranjo histórico), `actionMenu` (uma tela por vez, trocada pela barra fixa com menu, estilo app do D&D Beyond)                |
| Gating           | **Criar, editar, salvar e publicar** só para apoiadores (cadeado + CTA `/apoiar`). **Ver** é de todos: o layout da ficha renderiza para qualquer visualizador (24/09) |
| Editor           | **Seções em slots** — arrastar entre áreas, ordem, largura, título, ícone, cor. **Não** é grade livre x/y                                                             |
| Imagens de fundo | Presets no bundle + campo de URL https. **Nenhum pipeline de upload novo**                                                                                            |
| Ícones           | Catálogo **completo** do game-icons.net                                                                                                                               |
| Compartilhar     | Código curto/link + galeria simples com busca, preview e denúncia. Sem fila de curadoria                                                                              |
| Entrada na UI    | Discreta, dentro da própria ficha. **Sem área dedicada na home**                                                                                                      |
| Vínculo          | A ficha **sempre** carrega a cópia em `sheet.layout`; `sheet.layoutId` é só o modelo de origem. Nada renderiza por referência (24/09)                                 |
| Denúncia         | 1 por usuário, com motivo; **3 denúncias ocultam sozinho**; moderador restaura pelo admin (24/09)                                                                     |

---

## 2. Onde está o código

Três repositórios, todos na branch **`feat/layouts-de-ficha`**, **pushada**
(nunca em `main`). A branch recebeu `main` por merge em 24/09.

- **Principal:** Fases 1–2 (8 commits de 15/08), o merge da `main` e a Fase 3.
- **`src/premium`:** editor (Fase 2), seção do Diário e a biblioteca/galeria.
- **`backend`:** flag, merge da `main` e a biblioteca (`67a9401`).

Para testar localmente, ligue a flag **sem commitar**: em
`src/types/featureFlags.types.ts`, `sheetLayouts: { enabled: true,
supporterOnly: false }`. No backend, a flag precisa existir no banco (o seed
só roda com a coleção vazia) — crie pelo admin ou `PUT /api/admin/feature-flags`.

---

## 3. Arquitetura em uma página

### Divisão público × premium

O motor é **público** porque quem renderiza é o `Result`, que é público, e
porque o build sem o submódulo precisa ficar de pé. Só criar/editar/compartilhar
é premium.

```
PÚBLICO
  src/interfaces/SheetLayout.ts              tipos + caps + versão de schema
  src/interfaces/sheetLayoutPresets.ts       PRESET_TABS / SINGLE / ACTION_MENU
  src/functions/sheetLayoutResolve.ts        aplica overrides + disponibilidade
  src/functions/sheetLayoutValidation.ts     sanitize (renderizar) e validate (salvar)
  src/components/SheetResult/layout/
    SheetLayoutRenderer.tsx                  mede o container, escolhe o template
    templates/{SinglePage,Tabs,ActionMenu}Template.tsx
    SheetSectionFrame.tsx                    Card + BookTitle + barra de ações
    RegionStack.tsx                          larguras inteira/metade
    sheetSectionTypes.ts                     SheetSectionNode, collectRegionActions
    sheetLayoutAccess.ts                     useSheetLayoutAccess + resolveSheetLayoutFor
    SheetLayoutPicker.tsx                    o botão discreto na ficha
    layoutTheme.ts                           fundos e fontes
  src/components/SheetResult/sheetSurfaceMemory.ts
  src/components/icons/SheetIcon.tsx         roteia mui: e gi:
  src/components/icons/gameIcons/GameIcon.tsx
  public/game-icons/                         4.180 SVGs + manifest (gerados)
  scripts/build-game-icons.mjs               gerador do catálogo

PREMIUM (src/premium/)
  functions/layoutMutations.ts               as operações do editor, puras
  components/SheetLayoutEditor/
    SheetLayoutEditorDialog.tsx              controles + preview ao vivo
    RegionList.tsx                           o drag-and-drop
    GameIconPicker.tsx                       busca no catálogo
    SectionSettingsDialog.tsx
    RegionSettingsDialog.tsx
    LayoutThemePanel.tsx
```

### O modelo de dados

Um layout é uma lista de **regiões** com papéis estruturais, cada uma contendo
**seções**. O template decide como cada papel vira pixel — é isso que permite
trocar de modelo sem remontar o documento.

| Papel     | Onde aparece                                       |
| --------- | -------------------------------------------------- |
| `header`  | fixo no topo; **obrigatório** no `actionMenu`      |
| `main`    | coluna esquerda (tabs) ou corpo do scroll (single) |
| `aside`   | coluna direita; só quando o container é largo      |
| `surface` | uma aba (tabs) ou uma tela (actionMenu)            |
| `footer`  | rodapé                                             |

Três decisões de modelagem que valem entender antes de mexer:

1. **Desktop e mobile são UM layout com override**, não dois documentos. O
   código já fazia exatamente isso e num lugar só (Perícias saía das abas no
   desktop). Dois documentos dobrariam o payload de compartilhamento e criariam
   a pergunta insolúvel _"adicionei uma seção no desktop, aparece no mobile?"_.

2. **A superfície é decidida pela largura do CONTAINER**, não do viewport. O
   `Result` roda dentro do widget do Escudo do Mestre, de diálogos da mesa e do
   painel lateral do Owlbear: lá a tela é grande e o espaço não é.

3. **Seções indisponíveis são filtradas na RESOLUÇÃO, nunca no documento.** Uma
   ficha sem conjurador não mostra Magias, mas o layout salvo continua com a
   seção — senão trocar de classe destruiria o design do usuário.

### Sanitize × validate

São funções separadas de propósito, e confundi-las já causou um bug durante a
implementação:

- `sanitizeSheetLayout` — **renderizar**. Nunca lança; o que não dá para
  consertar vira o preset padrão.
- `validateSheetLayout` — **salvar**. Responde se o documento é aceitável e
  devolve os problemas.

A primeira versão fazia `validate` chamar `sanitize`, que cai no preset padrão —
então validar um layout quebrado **aprovava o preset no lugar dele**. Hoje
existe `sanitizeSheetLayoutStrict`, que devolve `null` com o motivo, e as duas
públicas se apoiam nela.

---

## 4. Fase 1 — motor e os três modelos ✅

### O que foi feito

- **Teste de paridade primeiro** (`Result.layoutParity.spec.tsx`), escrito e
  verde **antes** de tocar no `Result`. É o guard-rail de toda a fase: trava
  ordem das abas, Perícias fora delas no desktop e como primeira no mobile,
  ordem vertical dos blocos e ausência de ações em somente-leitura.
- Contrato de dados, resolve e validação, com 46 testes.
- Os três templates + o renderer + a memória de aba/tela.
- **Extração das seções do `Result`** (Estágio A): os blocos que eram JSX inline
  num `return` de ~1.600 linhas viraram um `SheetSectionNodeMap`. Os corpos
  foram **movidos sem edição**; as ~21 drawers seguem montadas onde estavam.
- Gating com a flag `sheetLayouts`.
- Catálogo de ícones.

### Duas coisas que a extração resolveu de passagem

- A regra _"Perícias vai para a direita no desktop"_ era um `if` cravado no
  render mais um `!isMobile &&` na coluna. Virou dado no preset; as duas linhas
  sumiram.
- `useMediaQuery` decidia o arranjo pelo viewport — acertava na página da ficha
  e errava no widget do mestre, nos diálogos da mesa e no Owlbear. Agora quem
  decide é `useContainerWidth`, que já existia.

### O Estágio B não foi feito, e é opcional

As seções ainda são "nós" construídos dentro do `Result`, não componentes em
arquivos próprios. Transformá-las em componentes de verdade (com
`SheetDataContext` + `SheetActionsContext` separados e `React.memo`) melhora
performance e legibilidade, mas **não é pré-requisito de nada**. Se for fazer, a
ordem sugerida é do mais isolado para o mais acoplado: `proficiencies` →
`sizeDisplacement` → `creationSteps` → `equipment` → `skills` → `attacks` →
`defense` → `spells` → `powers` → `attributes` → `identity`.

---

## 5. Fase 2 — editor drag-and-drop ✅

### O que foi feito

- `layoutMutations.ts`: mover/adicionar/remover seção, criar/renomear/reordenar/
  remover região, overrides de mobile, tema, e `applyTemplate`. 26 testes.
- O editor: arrastar entre áreas, criar abas, ícone do catálogo, cor, fonte,
  fundo, largura, esconder área no mobile, trocar de modelo.
- Preview ao vivo com toggle desktop/mobile.
- Fundos e fontes aplicados pelo renderer.

### Invariante do editor

**Nenhuma operação descarta seção em silêncio.** Apagar uma aba devolve o
conteúdo para a paleta; trocar de modelo preserva tudo. Há teste cobrindo as
seis transições entre os três modelos.

### Persistência atual

O layout é gravado **inline em `sheet.layout`**. Isso não exigiu nada do
backend: `stripSheetForStorage` faz spread no nível raiz e `Sheet.sheetData` é
`Mixed`. Custa ~2-4 KB por ficha. A Fase 3 **manteve** isso de propósito
(decisão de 24/09): `layoutId` é só vínculo de origem, nunca referência de
renderização — assim a ficha não depende de rede nem de o modelo continuar
existindo.

---

## 6. Fase 3 — biblioteca, compartilhamento e galeria ✅

### Backend (`backend/`)

- `src/models/SheetLayout.ts`: `userId`, `name`, `description`, `data`
  (sempre o layout SANEADO), `visibility`, `shareCode` (unique sparse),
  `forkedFrom`, `copyCount`, `isHidden` + `hiddenReason`, `reports[]` +
  `reportCount`.
- `src/routes/sheetLayoutRoutes.ts` → `/api/sheet-layouts`: `GET /public`,
  `GET /code/:code`, `GET /reported` (moderador), `GET /`, `POST /`,
  `POST /:id/publish|copy|apply|report`, `PATCH /:id/moderation`,
  `GET|PUT|DELETE /:id`. Regras puras (busca escapada, paginação, quem lê,
  auto-ocultar, remoção da URL) em `src/utils/sheetLayoutRules.ts`, testadas em
  `tests/sheetLayout.test.ts`.
- **Espelho do contrato** em `src/sheetLayout/` (os três arquivos do front).
  `src/functions/__tests__/sheetLayoutBackendMirror.spec.ts` compara byte a
  byte e falha se divergirem — edite no front e copie.
- `src/middleware/requireFlag.ts`: primeira checagem de flag no servidor.
  Flag ausente = desligada; `supporterOnly` encadeia `requireSupporter`. Ler a
  própria lista e APAGAR ficam fora do portão (quem deixou de apoiar limpa o que
  criou).
- `maxSheetLayouts` (FREE 0, N1 3, N2 10, N3 ilimitado; com boost) nos dois
  espelhos de limites.
- `defaultSheetLayoutId` no usuário: validado como layout próprio no
  `authController` e **copiado para toda ficha nova** (não ameaça, sem layout
  próprio) no `POST /api/sheets`. Nunca ao abrir ficha (vetor do bug de wipe).

### Frontend

- `resolveSheetLayoutFor(isEnabled, …)`: decide pela FLAG, não pelo apoio de
  quem olha. O mestre sem apoio vê a ficha do jogador como ele montou.
- Premium, `src/premium/`:
  - `hooks/useSheetLayouts.ts` — store de MÓDULO (não Context) com a
    biblioteca, carregada sob demanda;
  - `components/SheetLayoutLibrary/` — painel "Meus layouts" no seletor,
    compartilhar, importar por código, galeria, denúncia, página
    `/layout/:code`;
  - editor: "Salvar nesta ficha" (desfaz o vínculo), "Biblioteca → Salvar
    como novo modelo / Atualizar o modelo" (oferece aplicar às fichas
    vinculadas na nuvem);
  - admin → Comunidade → **Layouts denunciados**.
- `SheetLayoutWireframe` (público): miniatura esquemática para galeria,
  importar e link — não precisa de ficha e não carrega URL externa.
- Diário do Jogador (veio da `main`) virou a seção `journal`.

### Esquema v2 — visibilidade por dispositivo (24/09)

- `showOn?: 'desktop' | 'mobile'` em regiões e seções substitui
  `mobile.regionOverrides`/`hiddenRegionIds`, que o editor não mostrava (a aba
  Perícias parecia vazia). O sanitize converte v1: região escondida vira "só
  computador"; override vira a seção "só computador" + uma CÓPIA "só celular"
  na frente da região de destino.
- Unicidade agora é **por dispositivo**: a mesma seção pode aparecer uma vez no
  computador e uma no celular ("Duplicar para o outro dispositivo" no editor).
- `SHEET_LAYOUT_SCHEMA_VERSION = 2` para app antigo recusar o documento (cai
  no preset) em vez de ignorar `showOn` e renderizar as duas cópias.
- Editor ciente do modelo: Aba / Grupo (página única) / Tela (menu de ação).
  O menu de ação converte corpo e coluna lateral em telas (o template não os
  desenhava — o conteúdo sumia).
- Página única: a coluna lateral deixou de ser escondida no celular (em v1 a
  página única ficava sem Perícias no celular).

### Regras que não são óbvias

- **Usar layout de terceiro direto na ficha** não ocupa vaga nem conta cópia;
  **salvar na biblioteca** ocupa vaga e faz `copyCount++` (atômico). Copiar o
  próprio layout não conta.
- **URL de fundo nunca sai para terceiros** (`stripForPublic` no servidor, na
  leitura pública e na cópia): abrir um layout alheio vazaria o IP para o
  servidor da imagem. O dono continua vendo a dele.
- **Editar não desoculta** um layout ocultado por denúncia (≠ homebrew).
  Restaurar pelo admin zera as denúncias.
- O **código** nasce na primeira publicação e não muda; voltar a privado só
  faz o link parar de responder.
- **"Aplicar nas fichas"** alcança só fichas na nuvem (`sheetData.layoutId`).
  Quem estiver com uma dessas fichas aberta noutro aparelho continua vendo o
  layout antigo até recarregar.
- A **ficha recém-criada** com layout padrão só mostra o layout depois de
  recarregada do servidor: quem injeta é o backend, e o cliente segue com a
  cópia que enviou (a baseline do delta não inclui o layout, então nada é
  apagado).

---

## 7. Armadilhas específicas deste código

Cada uma destas custou tempo ou quase virou bug. Não redescobrir.

1. **O overlay do menu de ação não pode ser `Dialog`.** O portal vai para o
   `document.body` e cobriria a tela inteira — e o `Result` roda dentro do
   widget de ficha do Escudo do Mestre. Um jogador abrindo o menu da própria
   ficha apagaria a tela do mestre. Está ancorado em absoluto no root da ficha.

2. **`DragDropContext` não aninha.** O `PowersDisplay` traz o dele, então o
   preview do editor e o painel de arrastar são **irmãos**. Envolver um no outro
   quebra a reordenação de poderes em silêncio.

3. **Seção duplicada quebra o rbd** (droppableIds repetidos) e os ids fixos de
   DOM (`id='steps-header'`). Daí a regra `singleton` por `kind`, com `note`
   como única exceção.

4. **`useMediaQuery` responde a pergunta errada** dentro do widget do mestre,
   dos diálogos da mesa e do painel lateral do Owlbear. Usar
   `src/hooks/useContainerWidth.ts`, que já trata `ResizeObserver` ausente no
   jsdom.

5. **Três coisas disputam o fundo da ficha:** `WildShapeSkin` (forma selvagem),
   `getSheetBackgroundColor` (que hardcoda `#212121`/`#f3f2f1` por causa do
   embed do Owlbear) e agora o fundo do layout. Precedência: **forma selvagem >
   fundo do layout > tema**.

6. **Barra de ações vazia é armadilha.** Uma `Stack` posicionada em absoluto com
   zero filhos ainda ocupa área e engole cliques do conteúdo embaixo. O frame
   não renderiza a barra quando `actions.length === 0` — e em somente-leitura
   todas as ações somem.

7. **Quem é dono do card desenha a barra.** Seções dentro de uma aba não
   desenham a sua, senão cada botão aparece duas vezes. Um teste pegou isso.

8. **Editar um preset gera cópia.** Os presets são objetos de módulo
   COMPARTILHADOS: mutá-los mudaria o layout de todas as outras fichas.

9. **Identidade e vitais estão fundidos numa seção só.** PV/PM são um irmão de
   flex dentro do card de identidade; separá-los jogaria os vitais para um card
   próprio. Separar depois é bump de `schemaVersion`.

10. **`SimpleResult.tsx` fica separado.** É renderização textual para
    copiar/colar (via `ReactToPrint`), read-only, sem drawers — não é uma
    variante de layout.

---

## 8. O catálogo de ícones

4.180 SVGs em `public/game-icons/`, ~6,5 MB, gerados por
`scripts/build-game-icons.mjs` a partir do repositório `game-icons/icons`.

**Por que arquivo por ícone e não um pacote npm:** um ícone escolhido em runtime
não é tree-shakeable, então `react-icons/gi` colocaria os ~4.200 desenhos no
bundle de todo mundo, inclusive de quem nunca abre o editor. Servidos de
`public/`, uma ficha baixa os 5-15 que usa e o bundle JS não cresce um byte.

- `public/_headers` dá cache imutável de 1 ano em `/game-icons/*` — o desenho de
  `lorc/crystal-ball` de fato nunca muda; ícone novo ganha nome novo.
- `public/_routes.json` só inclui rotas de página, então esses caminhos **nunca
  invocam a Function** do Pages: custo zero na cota do Workers.
- O id (`gi:<autor>/<nome>`) carrega o caminho do arquivo, então **renderizar
  não precisa do manifest**. O manifest (290 KB, 35 KB comprimido) só é baixado
  quando o seletor do editor abre.

**Licença — requisito, não cortesia.** O acervo é CC BY 3.0 com alguns autores
em CC0, e a licença é **por autor**. O manifest carrega o autor de cada ícone e
`credits.generated.ts` lista os 35. O autor aparece no tooltip do seletor.

⚠️ **Pendência:** ainda **não existe uma página de créditos** no app exibindo
`GAME_ICONS_AUTHORS`. Isso deveria entrar antes do rollout — hoje a atribuição
só aparece no tooltip do seletor e no rodapé do diálogo.

`spellSchoolIcons.tsx` continua com os 8 glifos inline. Não é duplicação a
resolver: eles funcionam e não dependem de rede.

---

## 9. Como validar

**Nunca rodar build** — `npm run build`, `vite build` e `vite preview` travam o
WSL. Fica para o dono do projeto.

```bash
npx tsc --noEmit
npx eslint src/ --max-warnings=0
npx vitest run
npx prettier --write <arquivos editados>
node scripts/generate-premium-stub.mjs && npx prettier --write "src/premium-stub/**/*.tsx"
```

Estado atual: **2.371 testes em 184 arquivos**, tsc e eslint limpos.

### Testar na mão

Com o dev server (`npm start`, porta 5173) e a flag destravada (ver §2):

| Tela                                | O que conferir                                                     |
| ----------------------------------- | ------------------------------------------------------------------ |
| `/ficha/:id` desktop                | **idêntica ao que era antes** com o preset padrão                  |
| `/ficha/:id` a 390px                | Perícias como primeira aba no modelo de abas                       |
| Ícone de layout → 3 modelos         | página única e menu de ação navegáveis                             |
| Personalizar                        | arrastar entre áreas, criar aba, trocar de modelo sem perder seção |
| Embed do Owlbear                    | `?theme=light` e `?theme=dark`; o DONO vê o botão de layout        |
| `GameSessionPage`                   | girar o tablet → aba/tela preservada                               |
| Widget de ficha no Escudo do Mestre | somente-leitura; **o overlay não cobre a tela do mestre**          |
| `VITE_NO_PREMIUM=1`                 | ficha de pé, sem botão de layout                                   |

---

## 10. Pendências e riscos conhecidos

| #   | Item                                                                                                                                   | Gravidade                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | **Build nunca foi rodado** — nem o normal nem `VITE_NO_PREMIUM=1`                                                                      | precisa acontecer antes do merge                                              |
| 2   | **Página de créditos dos ícones não existe** (§8)                                                                                      | requisito de licença                                                          |
| 3   | **Fundos e véu não foram avaliados visualmente** — 8 padrões CSS e véu de 50%, escolhidos no escuro                                    | subjetivo, fácil de ajustar                                                   |
| 4   | **Mesa virtual / Owlbear não foram testados de fato** — o overlay foi raciocinado, não visto                                           | é o risco nº 1 da §7                                                          |
| 5   | **Largura "metade" numa seção larga** (Equipamentos) pode estourar                                                                     | não verificado                                                                |
| 6   | `golpistaDivino.spec.ts` é **intermitente** — gera até 30 fichas aleatórias torcendo para sortear um poder. Falhou 1 vez em 4 rodadas  | pré-existente, não relacionado                                                |
| 7   | O `Result` ainda tem ~3.370 linhas (Estágio B não feito, §4)                                                                           | opcional                                                                      |
| 8   | Nenhum teste renderiza o **editor** nem a **galeria** — só a lógica pura tem cobertura                                                 | aceitável (é o padrão do `gmScreenPlacement`), mas o dnd nunca foi exercitado |
| 9   | **Seção `note` não renderiza** — o editor deixa adicionar, o `Result` não tem nó para ela (fora do escopo da Fase 3, decisão de 24/09) | bug conhecido                                                                 |
| 10  | **Controllers da Fase 3 não têm teste de integração** (o backend não tem Mongo em memória); só as regras puras                         | testar na mão (§9)                                                            |
| 11  | Flag `sheetLayouts` precisa ser **criada no banco de produção** antes do rollout (o seed não roda com coleção cheia)                   | passo de deploy                                                               |

---

## 11. Convenções do projeto que valem lembrar

- **Nunca fazer push para `main`** em nenhum dos repos. O dono pusha à mão —
  push em main é deploy de produção.
- Backend e premium são **submódulos privados**: commit à parte em cada um.
- `npx prettier --write` em todo arquivo tocado.
- ESLint estrito: nada de `any`, prop spreading só nos `{...provided.*}` do rbd
  (com o `// eslint-disable-next-line react/jsx-props-no-spreading`).
- Feature nova premium exige: flag em `featureFlags.types.ts` **e** no
  `featureFlagController.ts` do backend, componentes no submódulo, e **stub OSS
  regenerado**.
- O plano original das Fases 1–2 se perdeu; o da Fase 3 está em
  `~/.claude/plans/vamos-planejar-a-fase-typed-stallman.md` (máquina do dono).
