# Layouts customizáveis de ficha — estado e handoff

> **Para quem pegar isto depois.** As Fases 1 e 2 estão implementadas e verdes.
> A Fase 3 não foi começada. Este documento é o que você precisa para continuar
> sem reabrir decisões que já foram tomadas.
>
> Última atualização: 15/08/2026.

---

## 1. O que é a feature

A ficha deixou de ter um arranjo fixo em código. O layout virou um **documento**
que o usuário escolhe, edita e (na Fase 3) compartilha. São três modelos base —
página única, abas e menu de ação — mais um editor drag-and-drop.

Tudo atrás da flag `sheetLayouts`, restrita a apoiadores.

### Decisões travadas com o dono do projeto

Não reabrir sem falar com ele.

| Tema             | Decisão                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Modelos          | `single` (rolagem contínua), `tabs` (o arranjo histórico), `actionMenu` (lista-mestra de telas, estilo app do D&D Beyond) |
| Gating           | **Tudo** só para apoiadores. Não-apoiador fica no layout de hoje e vê cadeado + CTA `/apoiar`                             |
| Editor           | **Seções em slots** — arrastar entre áreas, ordem, largura, título, ícone, cor. **Não** é grade livre x/y                 |
| Imagens de fundo | Presets no bundle + campo de URL https. **Nenhum pipeline de upload novo**                                                |
| Ícones           | Catálogo **completo** do game-icons.net                                                                                   |
| Compartilhar     | Código curto/link + galeria simples com busca, preview e denúncia. Sem fila de curadoria                                  |
| Entrada na UI    | Discreta, dentro da própria ficha. **Sem área dedicada na home**                                                          |

---

## 2. Onde está o código

Três repositórios, todos na branch **`feat/layouts-de-ficha`**, **nada pusheado**.

### Repo principal — 7 commits

```
df9aa5a3 chore(stub oss): regenera o espelho público do submódulo premium
21120ceb feat(layouts): aparência do layout e entrada para o editor
22f1a3ce feat(ficha): o Result passa a ser dirigido por layout, atrás de flag
e0d62a0e feat(layouts): os três modelos de ficha e o motor que os renderiza
b5fa24df feat(ícones): catálogo completo do game-icons.net
91968790 feat(layouts): contrato de dados, resolução e saneamento
93be0a07 test(ficha): trava o arranjo atual antes de extrair as seções
```

40 arquivos (fora os 4.180 ícones), +5.545 / −1.387.

### Submódulo `src/premium` — 2 commits

```
8e42aa1 feat(layouts): editor drag-and-drop com preview ao vivo
b928366 feat(layouts): operações do editor como funções puras
```

### Submódulo `backend` — 1 commit

```
4eaf6e7 feat(feature flags): registra a flag sheetLayouts
```

Cada commit compila e passa nos testes por conta própria — o histórico foi
refeito uma vez justamente para garantir isso.

### ⚠️ Árvore suja de propósito

`src/types/featureFlags.types.ts` tem uma alteração **não commitada** que
destrava a flag para teste local:

```ts
// TEMPORÁRIO PARA TESTE LOCAL — reverter para { enabled: false, supporterOnly: true }
sheetLayouts: { enabled: true, supporterOnly: false },
```

Reverter com `git checkout src/types/featureFlags.types.ts` antes de commitar
qualquer coisa.

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
`Mixed`. Custa ~2-4 KB por ficha — que é um dos argumentos para migrar a
`layoutId` na Fase 3.

---

## 6. Fase 3 — o que falta ⬜

Nada disso foi começado.

### 6.1 Backend

Molde: `Folder` (coleção do usuário) + os campos de compartilhamento do
`Homebrew`.

```
backend/src/models/SheetLayout.ts
backend/src/routes/sheetLayoutRoutes.ts
backend/src/controllers/sheetLayoutController.ts
backend/src/middleware/validateSheetLayout.ts   ← espelho de sheetLayoutValidation.ts
backend/src/types/sheetLayout.ts
```

Model: `userId` (ref User, indexado), `name` (60), `description` (200),
`schemaVersion`, `data` (Mixed), `visibility: private|unlisted|public`,
`shareCode` (unique sparse), `templateKind` (desnormalizado para filtro),
`copyCount`, `reportCount`, `isHidden`, timestamps.

Índices: `{userId,updatedAt:-1}`, `{visibility,isHidden,copyCount:-1}`,
`{shareCode}` unique sparse, texto em `name`/`description`.

Rotas — **literais antes de `/:id`**, como em `homebrewRoutes.ts`:

```
GET   /api/sheet-layouts/public       optionalAuth   ?q= &template= &sort= &page=
GET   /api/sheet-layouts/code/:code   optionalAuth
GET   /api/sheet-layouts/             auth           meus layouts
POST  /api/sheet-layouts/             auth + requireFeature + checkLimit + validate
POST  /api/sheet-layouts/:id/publish  auth           gera shareCode
POST  /api/sheet-layouts/:id/copy     auth           fork, copyCount++
POST  /api/sheet-layouts/:id/report   auth
PATCH /api/sheet-layouts/:id/visibility  auth + moderatorMiddleware
GET   /api/sheet-layouts/:id          optionalAuth   dono OU visibility != private
PUT   /api/sheet-layouts/:id          auth + validate
DELETE /api/sheet-layouts/:id         auth
```

**Código curto:** reusar o padrão de `GameTableInviteLink.ts:14`
(`randomBytes(...).toString('base64url')`), com retry até 3× em colisão.

### 6.2 Limites por tier

`maxSheetLayouts` em `SubscriptionLimits`, **nos dois espelhos**:
`src/types/subscription.types.ts` e `backend/src/types/subscription.ts`.
Esquecer o backend dá **400 no PUT** — é uma armadilha conhecida do projeto.

Sugerido: FREE `0` (a sentinela de indisponível), N1 `3`, N2 `10`, N3 `-1`.
Boostável pelo `limitBoost` (fora de `NON_BOOSTABLE_LIMITS`).

Considerar também um `getSheetLayoutCaps(level)` no estilo de
`getProfileCustomizationCaps`: `maxRegions`, `canUseBackgroundUrl` (N2+),
`canPublishToGallery` (N1+), `canUseCustomNotes` (N2+).

### 6.3 Frontend

- `src/premium/services/sheetLayout.service.ts` + provider com os layouts do
  usuário.
- `sheet.layoutId` com precedência sobre `sheet.layout` inline; ao salvar um
  layout inline como modelo, gravar `layoutId` e limpar `layout`.
- `defaultSheetLayoutId` em `useUserPreferences` + `saveAppearanceSettings`
  (`authSlice.ts:107`) — é isso que dá "reaproveitável entre personagens" sem
  tocar em cada ficha.
- Publicar → `shareCode` + link; botão de copiar.
- `ImportLayoutDialog` (código/link) + galeria (busca, filtro por template,
  ordenação por `copyCount`, preview, "Usar este layout").
- Rota `/layout/:code` em `src/App.tsx` (react-router v5, sem lazy).
- Botão de denunciar.

### 6.4 Regra importante da galeria

**Aplicar um layout da comunidade faz cópia dura** (como o `POST /:id/fork` do
homebrew), nunca referência ao documento do autor — senão despublicar quebraria
a ficha de terceiros.

**Ficha alheia na mesa:** `GET /:id` com `optionalAuth` devolve
`public`/`unlisted` para qualquer um, `private` só para o dono. Não resolveu →
preset padrão. Ao atribuir um layout privado a uma ficha que está numa mesa, o
editor deveria sugerir publicar como `unlisted`. Degradação aceitável, nunca
erro.

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
| Embed do Owlbear                    | `?theme=light` e `?theme=dark`, sem botão de layout                |
| `GameSessionPage`                   | girar o tablet → aba/tela preservada                               |
| Widget de ficha no Escudo do Mestre | somente-leitura; **o overlay não cobre a tela do mestre**          |
| `VITE_NO_PREMIUM=1`                 | ficha de pé, sem botão de layout                                   |

---

## 10. Pendências e riscos conhecidos

| #   | Item                                                                                                                                  | Gravidade                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | **Build nunca foi rodado** — nem o normal nem `VITE_NO_PREMIUM=1`                                                                     | precisa acontecer antes do merge                                              |
| 2   | **Página de créditos dos ícones não existe** (§8)                                                                                     | requisito de licença                                                          |
| 3   | **Fundos e véu não foram avaliados visualmente** — 8 padrões CSS e véu de 50%, escolhidos no escuro                                   | subjetivo, fácil de ajustar                                                   |
| 4   | **Mesa virtual / Owlbear não foram testados de fato** — o overlay foi raciocinado, não visto                                          | é o risco nº 1 da §7                                                          |
| 5   | **Largura "metade" numa seção larga** (Equipamentos) pode estourar                                                                    | não verificado                                                                |
| 6   | `golpistaDivino.spec.ts` é **intermitente** — gera até 30 fichas aleatórias torcendo para sortear um poder. Falhou 1 vez em 4 rodadas | pré-existente, não relacionado                                                |
| 7   | O `Result` ainda tem ~3.370 linhas (Estágio B não feito, §4)                                                                          | opcional                                                                      |
| 8   | Nenhum teste renderiza o **editor** — só a lógica pura tem cobertura                                                                  | aceitável (é o padrão do `gmScreenPlacement`), mas o dnd nunca foi exercitado |

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
- O plano original completo está em
  `~/.claude/plans/eu-quero-fazer-uma-twinkly-haven.md`.
