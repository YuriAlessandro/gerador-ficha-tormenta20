# Release Command

Create a changelog entry and commit all pending changes for a new version.

## Arguments

- `$ARGUMENTS` — the version number (e.g., `4.8`, `5.0`)

## Instructions

You are creating a release for version **$ARGUMENTS** of the Gerador de Fichas de Tormenta 20 project.

Follow these steps in order:

### Step 1: Gather context

Run the following commands to understand what work was done since the last release:

1. `git log --oneline` — look at recent commits to understand what changed. Identify all commits since the last version bump or release commit.
2. `git diff --stat` — check for any uncommitted changes.
3. `git status` — check for untracked files.

### Step 2: Revisão do código novo (o "PR local") — SEMPRE

O `/pr-review` só roda em PR de terceiros; o trabalho do próprio mantenedor vai direto para a
`main` sem passar por revisão nenhuma. Este passo trata tudo o que entrou desde o último release
como se fosse um PR e aplica o mesmo rigor, **antes** de escrever o changelog (a revisão pode
mudar o que entra nele).

#### 2a. Delimitar o "PR"

```bash
BASE=$(git log --grep='^release: v' -1 --format=%H)   # último commit de release
git log --format='%h %an | %s' $BASE..HEAD
git diff $BASE --stat                                  # commitado + não commitado
git status --short                                     # arquivos novos não rastreados
```

Boa parte do trabalho mora nos submódulos — os commits `chore: atualiza submódulo ...` são só o
ponteiro. Para cada submódulo (`src/premium`, `backend`) com mudança, pegue o intervalo real:

```bash
git diff $BASE -- src/premium backend          # mostra "-Subproject commit <old>" / "+... <new>"
git -C src/premium log --format='%h %s' <old>..HEAD   # inclui commits ainda não bumpados no parent
git -C src/premium status --short                     # e o que nem foi commitado
```

Fica **fora** do escopo: commits só de changelog/docs, e PRs externos que já passaram pelo
`/pr-review` (autor ≠ mantenedor, ou o merge `chore: registra merge do PR #N`).

#### 2b. Agrupar em "PRs"

Agrupe os commits por tema (normalmente um `feat`/`fix` + o bump de submódulo + a entrada de
changelog correspondentes). Para cada grupo, escreva em uma linha **o que ele alega**: qual bug
corrige ou qual comportamento introduz. É essa alegação que será verificada.

#### 2c. Revisar cada grupo

Leia `.claude/commands/pr-review.md` e aplique a cada grupo os **Passos 3 e 4** de lá (provar
que o bug existia, verificar todos os caminhos que alcançam o bug, procurar regressões, validação
completa, aderência ao `CLAUDE.md`). Adaptações:

- **Nunca faça o A/B na working tree principal.** O usuário quase sempre tem o dev server no ar
  (editar arquivo dispara HMR) e pode haver mudança não commitada que se perderia. Faça os
  experimentos de "reverter o fonte e manter o teste" numa worktree no scratchpad, em HEAD
  destacado (não é branch):

  ```bash
  WT="$SCRATCH/release-review"                  # $SCRATCH = scratchpad da sessão, expandido
  git worktree add --detach "$WT" HEAD
  # traz o que ainda não foi commitado (sem os gitlinks; arquivos não rastreados: copie com cp)
  git diff HEAD -- . ':!src/premium' ':!backend' ':!extensions' > "$SCRATCH/pending.diff"
  [ -s "$SCRATCH/pending.diff" ] && git -C "$WT" apply "$SCRATCH/pending.diff"   # diff vazio quebra o apply
  ln -s "$PWD/node_modules" "$WT/node_modules"
  git -C src/premium worktree add --detach "$WT/src/premium" HEAD   # se o grupo tocar o premium
  # reverter só o fonte, mantendo os testes:
  git -C "$WT" checkout $BASE -- <arquivos de fonte do grupo>
  (cd "$WT" && npx vitest run <teste do grupo>)  # tem que FALHAR com o sintoma alegado
  ```

  No premium, o equivalente é `git -C "$WT/src/premium" checkout <old> -- <arquivos>`.

- **Feature sem bug para reproduzir:** em vez de 3a/3b, escreva (ou confira) testes dos cenários
  principais e das bordas que este repo costuma quebrar — os dois motores de derivação, ficha
  nova × ficha carregada da nuvem, mono × multiclasse, frontend × backend.
- **Fix sem teste de regressão** é um achado: escreva o teste (ele fica, não é scratch).
- **Regra do repo público:** todo arquivo novo fora de `src/premium` tem que passar pela pergunta
  "isso é geração de ficha?".
- **Contrato da API mudou** (backend + frontend no mesmo grupo)? Registre para o deploy casado.
- Com 3+ grupos independentes, pode delegar cada grupo a um subagente em paralelo, passando os
  commits, os arquivos, a alegação e estas adaptações (especialmente a da worktree).

A validação completa (Passo 4 do `/pr-review`) roda **uma vez** sobre tudo, na working tree
principal (é só leitura): `npx tsc --noEmit`, `npx eslint <arquivos tocados> --max-warnings=0`,
`npx prettier --check <arquivos tocados>` e `npx vitest run`. Se o backend mudou, rode também
`npx tsc --noEmit` e `npm test` dentro de `backend/`. **Nunca rodar build.**

#### 2d. Veredito

- **Sem achado bloqueante** → siga para o Step 3. Ressalvas menores vão para o relatório final.
- **Achado bloqueante** (bug alegado não se reproduz ou não é resolvido, caminho não coberto que
  falha, regressão, tsc/eslint/teste vermelho, violação da regra do repo público) → **pare antes
  do changelog**. Mostre ao usuário a evidência (saída do teste, trecho de código) e a correção
  proposta, e pergunte: corrigir agora, seguir mesmo assim, ou abortar o release.
  - Corrigir = commit novo de `fix:` com teste de regressão (entra no Step 6a) e revalidação.
    Nunca reescreva commits já existentes.
  - O changelog descreve o estado final, já com as correções.

#### 2e. Limpeza

```bash
git -C src/premium worktree remove --force "$WT/src/premium" 2>/dev/null
git worktree remove --force "$WT"
git worktree prune; git -C src/premium worktree prune
git status --short        # só o que você pretendia (testes de regressão novos, correções)
```

### Step 3: Generate the changelog entry

Read the file `src/components/screens/Changelog.tsx` (first ~150 lines) to understand the existing format and structure.

The changelog uses this pattern inside `<AccordionDetails>`:

- Each version is an `<h3>` tag (e.g., `<h3>4.7</h3>`)
- Changes are listed in `<ul><li>` elements
- Each item starts with a bold category like `<strong>Correção:</strong>`, `<strong>Novo:</strong>`, `<strong>Melhoria:</strong>`, etc.
- Text is in Brazilian Portuguese

Based on the git log, create a new `<h3>$ARGUMENTS</h3>` section with `<ul><li>` entries summarizing all the work done since the last version. Place it **above** the previous version's `<h3>` tag inside the current major version's `<AccordionDetails>`.

Use these categories:

- **Novo:** — for new features
- **Melhoria:** — for improvements/enhancements
- **Correção:** — for bug fixes
- **Remoção:** — for removed features

**IMPORTANT — ordem dos itens:** Dentro de cada versão (`<h3>`), os `<li>` DEVEM ser
agrupados e ordenados nesta ordem: **Novo → Melhoria → Correção → Remoção**. Sempre
liste todos os itens `Novo` primeiro, depois todos os `Melhoria`, depois todos os
`Correção`, e por fim `Remoção`. Esta regra vale para toda edição do `Changelog.tsx`,
seja criando uma nova versão ou adicionando itens a uma versão existente — nunca
intercale categorias fora dessa ordem. (Não é necessário reordenar entradas antigas
já existentes; a regra vale para o conteúdo novo que você adicionar.)

Also update the "Última atualização em" date in the introductory paragraph to today's date in DD/MM/YYYY format.

### Step 4: Bump the version in `package.json`

Set `"version"` in `package.json` to `$ARGUMENTS` (use the full `X.Y.Z` form — e.g. `4.29` becomes `4.29.0`).

This is the **single source of truth** for the app version: `vite.config.ts` reads it to name the PWA caches (bumping it invalidates the old caches) and to inject `__APP_VERSION__`, which feeds the version shown in the sidebar, in the footer, and in the ErrorBoundary's bug report. Skipping this step means the new build reuses the previous version's cache names and every bug report keeps claiming the old version.

### Step 5: Format the files

Run `npx prettier --write src/components/screens/Changelog.tsx package.json` to ensure consistent formatting.

### Step 6: Commit changes

There are two types of changes to commit — handle them separately:

#### 6a. Commit pending code changes (if any)

If there are uncommitted changes **other than** `Changelog.tsx` (e.g., bug fixes, data corrections, new features), commit them first with a message that describes **what was actually changed** — not the version number. For example: `fix: corrigir duração da magia Velocidade`.

1. Stage only the non-changelog files: `git add <files>`
2. Create a commit with a descriptive message reflecting the change.

If there are multiple unrelated changes, create separate commits for each.

#### 6b. Commit the changelog

After all code changes are committed:

1. Stage the changelog and the version bump: `git add src/components/screens/Changelog.tsx package.json`
2. Create a commit with the message: `release: v$ARGUMENTS`

Include in all commits the co-author line given by the conversation's attribution reminder (the current model, not a hardcoded one).

### Step 7: Manual testing walkthrough (SEMPRE)

After committing, you **MUST** output a manual testing walkthrough for at least one scenario from the work done in this release. This is mandatory — never skip this step.

Requirements:

- Pick at least one meaningful change from this release (prefer a user-visible feature, fix, or improvement).
- Write the walkthrough in Brazilian Portuguese, addressed to the user as if they were a normal end user of the app.
- Describe the steps as clicks/taps and visible UI interactions only (e.g., "abra o app", "clique em X", "selecione Y", "verifique que Z aparece").
- Do NOT include project setup, dev server, build commands, env vars, or any technical/developer context — assume the user is just using the app in the browser.
- Be specific: name the actual buttons, screens, fields, and expected results so the user can follow it without guessing.
- If there are multiple distinct changes worth testing, you may include more than one scenario, but at least one is required.

Prefira os cenários que a revisão do Step 2 **não** conseguiu cobrir com teste automatizado
(interação de UI, layout mobile, fluxo que passa pelo backend).

Antes dele, o relatório final traz uma seção `## Revisão do código` com: os grupos revisados
(e o que ficou fora do escopo), como cada bug foi reproduzido (saída real da falha), os caminhos
extras checados, o resultado de cada validação, as correções feitas no Step 2d e as ressalvas
menores. Se o Step 2 não encontrou nada, diga isso explicitamente — não omita a seção.

Format the output as clearly labeled sections at the end of your final message, e.g.:

```
## Revisão do código
...

## Como testar manualmente

**Cenário: <nome curto do que está sendo testado>**

1. ...
2. ...
3. Resultado esperado: ...
```

### Important notes

- Do NOT push to remote — only commit locally.
- Write changelog entries in Brazilian Portuguese.
- Keep descriptions concise but informative, matching the existing style.
- If there are no meaningful changes in the git log, ask the user what should go in the changelog before proceeding.
