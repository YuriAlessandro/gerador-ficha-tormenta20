---
name: release-post
description: Generate a blog post markdown file for a new release of Fichas de Nimb, open the deploy PRs (main → production) in the frontend and backend repos for that version, AND generate the release video from the post (via the release-video skill). Reads the version's section in src/components/screens/Changelog.tsx, the related git commits, and produces release-posts/atualizacao-{version}.md following the established blog format (title, description, slug, cover image suggestion, content blocks with image suggestions). Use when the user asks for a release post, blog post for a version, "post da v X.Y", or the deploy PRs of a version.
---

# release-post

Generate a publish-ready markdown draft for a new release blog post on https://fichasdenimb.com.br/blog.

## Usage

```
/release-post <version>
```

`<version>` examples: `4.13`, `v4.13`, `4.10`. Normalize to `X.Y` internally.

## What the skill must do

1. **Normalize the version** to `X.Y` (strip leading `v`).
2. **Locate the version's changelog entry** in `src/components/screens/Changelog.tsx`. It lives between `<h3>X.Y</h3>` and the next `<h3>` (or the closing tag of that accordion). Read the full block of `<li>` items.
3. **Get commit context** with `git log --oneline -n 30` and pick out the commits relevant to this version (look for commits between `release: vX.Y` and the previous `release: v...` tag/commit). For commits whose meaning is non-obvious from the message, run `git show --stat <hash>` (and `git show <hash>` if needed) to understand what changed.
4. **Generate the markdown** following the format in the next section. Write to `release-posts/atualizacao-{version-with-dash}.md` (e.g. `release-posts/atualizacao-4-13.md`). Create the `release-posts/` directory if it doesn't exist. Tell the user the file path at the end.
5. **Open the deploy PRs** (`main → production`) in the frontend and backend repos — see "Abrir os PRs de deploy" below.
6. **Generate the release video** — see "Vídeo de release" below. Always last: it is the slow step, and a failure there must not hold back the post or the PRs.

Do **not** publish, commit, push, merge the PRs, or call the blog API. The markdown is a draft for the user to paste into the blog editor block-by-block, and merging the PRs (which is what actually deploys) is always the user's call.

## Abrir os PRs de deploy

Deploy sai da branch `production` nos dois repos; ver "Fluxo de deploy" no `CLAUDE.md`. O skill abre os PRs, nunca mergeia.

**Sempre passe `--repo`** — o remote `upstream` faz o `gh` resolver o fork errado.
Repos: `YuriAlessandro/gerador-ficha-tormenta20` (frontend) e `YuriAlessandro/fichas-de-nimb-backend` (backend, que é o submódulo `/backend`).

### Passo 1 — checagens antes de abrir (pare se falhar)

```bash
git fetch origin main production
git -C backend fetch origin main production
git -C src/premium fetch origin
```

- **`main` local à frente do remoto** (`git log --oneline origin/main..main`, idem em `backend` e `src/premium`): **não abra o PR**. O PR só enxerga o remoto, então o deploy sairia sem esses commits. Liste os commits que ficariam de fora e peça ao usuário que faça o push. O skill **nunca** pusha.
- **Gitlink do premium não pushado**: `git -C src/premium branch -r --contains $(git ls-tree origin/main src/premium | awk '{print $3}')`. Se não aparecer nenhuma branch remota, o build do deploy quebra ao clonar o submódulo — pare e avise.
- **Nada para publicar** (`git log --oneline origin/production..origin/main` vazio): pule esse repo e diga no relatório que ele já está em produção. É o caso comum do backend.
- **PR já aberto** (`gh pr list --repo <repo> --base production --head main --state open --json number,url`): não abra outro. Atualize com `gh pr edit <n> --repo <repo> --title ... --body ...` e diga que foi atualizado, não criado.

### Passo 2 — criar

Título: **`vX.Y`** (ex.: `v4.33`), igual nos dois repos.

```bash
gh pr create --repo <repo> --base production --head main --title "vX.Y" --body-file <arquivo>
```

Corpo do PR do **frontend** — o changelog da versão, convertido dos `<li>` do `Changelog.tsx` para bullets markdown (texto limpo, sem tags):

```markdown
Deploy da **vX.Y**.

## Changelog

- <item 1>
- <item 2>

Rascunho do post do blog: `release-posts/atualizacao-X-Y.md` (ainda não publicado).

---

⚠️ Mergear com **"Create a merge commit"**. Nunca squash, rebase ou "Update branch".
```

Corpo do PR do **backend** — o mesmo changelog, mais os commits do backend, que o changelog não descreve:

```markdown
Deploy da **vX.Y**. Mergear **antes** do PR do frontend quando o contrato da API muda.

## Commits do backend

- <saída de `git -C backend log --oneline origin/production..origin/main`>

## Changelog da versão (frontend)

- <os mesmos itens do PR do frontend>

---

⚠️ Mergear com **"Create a merge commit"**. Nunca squash, rebase ou "Update branch".
```

Use `--body-file` com um arquivo temporário no diretório de scratchpad da sessão; o changelog tem acentuação e aspas que sofrem no shell.

### Passo 3 — relatar

Dê as URLs dos dois PRs (ou o motivo de cada um não ter sido aberto) e lembre que o deploy só acontece no merge, backend primeiro.

## Vídeo de release

Depois de salvar o post e abrir os PRs, invoque o skill **`release-video`** com a mesma versão (`Skill` tool, `skill: "release-video"`, `args: "X.Y"`). Ele lê o post que acabou de ser gerado — em especial a linha **Gravação sugerida** de cada bloco — e produz os vídeos 16:9 e 9:16 em `~/workspace/fichas-release-video/videos/vX-Y/renders/`, além das imagens dos blocos em `release-posts/atualizacao-X-Y-imagens/` (ele mesmo atualiza as linhas **Imagem sugerida** do post com os arquivos).

- Pule este passo só se o usuário pedir ("só o post", "sem vídeo") ou se o pedido foi apenas pelos PRs de deploy.
- Se o `release-video` parar por ambiente (dev server fora do ar e sem poder subir, sessão expirada, sem backend para cena logada), o post e os PRs continuam valendo: relate o motivo e o que falta para rodar `/release-video X.Y` depois.

## Output file format

Use this exact template — frontmatter for post metadata, then `## Bloco N` sections for each content block. Each block is what the user will paste into the editor as one block.

```markdown
---
title: Atualização X.Y já disponível
description: <1-sentence summary, max ~140 chars, lists 2-3 main themes>
slug: atualizacao-X-Y-ja-disponivel
coverImage: <SUGESTÃO: arte de fantasia/RPG temática (ex.: dmdave.com, thegamerimages.com, arcaneeye.com). Substituir por URL real antes de publicar.>
---

## Bloco 1 — Introdução

**Título do bloco:** <sem título, ou um título curto de abertura — ver "Bloco introdutório">

**Vídeo:** `~/workspace/fichas-release-video/videos/vX-Y/renders/vX-Y-desktop.mp4` (versão desktop do vídeo de release; subir no editor e posicionar logo abaixo do texto)

<2 a 4 frases: o apanhado geral da versão, citando os 3-4 destaques em negrito, e a deixa para o vídeo>

---

## Bloco 2

**Título do bloco:** <Título específico, escaneável, dizendo o que mudou>

**Imagem sugerida:** <descrição do screenshot/arte que combina com o bloco — ex.: "Screenshot do drawer de equipamentos com o campo de busca em destaque, mostrando 'espada' filtrando 'Espada Longa'.">

**Legenda da imagem (opcional):** <só se for útil; muitos blocos não têm legenda>

**Gravação sugerida:** <roteiro de 1-3 linhas para o vídeo de release, ou "sem gravação" — ver "Gravação sugerida — como pensar">

<conteúdo do bloco em markdown — 1 a 3 parágrafos curtos, com **negrito** em termos do jogo e nomes de poderes/itens, _itálico_ em ênfase ocasional. Listas com `-` quando agrupar várias features.>

---

## Bloco 3

(repete o padrão)

---

## Bloco N — Outras correções

**Título do bloco:** Outras correções
(ou "E tem mais na X.Y" quando for um misto de melhorias e correções menores)

**Imagem sugerida:** <opcional — esse bloco geralmente não tem imagem, ou usa a coverImage de novo como fechamento>

A vX.Y também fechou várias frentes que vinham incomodando:

- **<Nome curto da correção>:** <explicação em 1-2 linhas, com bold no termo de jogo afetado>.
- ...

A lista completa, como sempre, está no [Changelog](/changelog).
```

## Style guide (non-negotiable — match the existing posts)

- **Idioma:** português brasileiro coloquial e direto. Soa como dev contando o que mudou pra um jogador, não release notes corporativos.
- **Personalidade:** punchy. Use construções como "Bug chato e silencioso:", "Mudança pequena, ganho diário grande.", "O maior inimigo das condições em RPG não é a regra — é esquecer que elas estão ativas." Comece blocos pelo problema/contexto quando der, não pela feature.
- **Negrito:** sempre em **nomes de poderes**, **classes**, **itens**, **condições**, **valores numéricos importantes** (ex.: **+2**, **1d10**), **nomes de telas/ações** (ex.: **Mochila de Aventureiro**, **Mesa Virtual**).
- **Itálico:** ênfase ocasional, nomes de condições no meio do texto (ex.: _paralisado_), e em frases-fechamento informais (ex.: _Bons jogos e que suas condições durem só uma rodada._).
- **Explica o porquê:** todo bloco precisa de pelo menos uma frase do _porquê_ da mudança ou _qual problema resolvia_. Não basta listar a feature.
- **Especificidade:** prefira nomes reais (poder, classe, número) a abstrações ("um poder de uma classe"). Se o changelog cita "Casca Grossa (Lutador / Atleta)", use isso.
- **Tamanho dos blocos:** 1-3 parágrafos, raramente 4. Listas com `-` quando há 3+ itens correlatos.
- **Quantidade de blocos:** a introdução, mais 4 a 8 blocos de conteúdo. Combine itens correlatos do changelog num bloco só quando fizer sentido (ex.: 4 poderes de combate viraram um bloco em 4.12). Não faça 1 bloco por linha do changelog.
- **Bloco final:** sempre "Outras correções" ou "E tem mais na X.Y" agrupando os fixes/melhorias menores em bullets, terminando com link para `[Changelog](/changelog)`.

### Bloco introdutório — sempre o primeiro

Todo post abre com um bloco de introdução, e é nele que vai o **vídeo de release (versão desktop, 16:9)**. O texto existe para o vídeo ficar bem posicionado, não para explicar a versão: quem quer detalhe lê os blocos seguintes.

- **Tamanho:** um parágrafo, 2 a 4 frases, no máximo ~60 palavras. Nada de lista, nada de subtítulo.
- **Conteúdo:** o apanhado geral. Cite os 3-4 destaques da versão pelo nome, em **negrito**, na mesma ordem em que aparecem no vídeo (o destaque primeiro), e feche com a deixa para o vídeo ("O vídeo abaixo mostra tudo em um minuto; os detalhes vêm logo depois.").
- **Sem "porquê":** a regra de explicar o porquê vale para os blocos de conteúdo, não para a introdução. Não repita frases que estão nos blocos seguintes.
- **Mídia:** a linha **Vídeo** aponta para `renders/vX-Y-desktop.mp4`, gerado pelo `release-video` (o último passo deste skill). O bloco não tem **Imagem sugerida** nem **Gravação sugerida**. Se o vídeo não for gerado, mantenha o bloco e diga no relatório que falta o vídeo.
- **Não conta** nos "4 a 8 blocos": são 4 a 8 blocos de conteúdo, mais a introdução.

Ex.:

> A **4.35** é a versão do **Inventor**: as **engenhocas** chegaram na aba de Magias, com aparatos e fabricação no assistente de nível. Também tem o **Grimório de bolso** para consultar na sessão, **magias do compêndio** no gerador de ameaças e um **Diário** bem mais confortável. O vídeo abaixo mostra tudo em um minuto; os detalhes vêm logo depois.

### Sugestão de imagem — como pensar

Para cada bloco com mudança visual, sugira **o que** screenshotar, não uma URL. Padrões observados:

- Feature de UI nova → screenshot da própria UI mostrando a feature em ação.
- Mudança de regra/cálculo → screenshot da ficha mostrando o número correto, ou um print da tela onde o usuário escolhe.
- Bloco de correções → geralmente sem imagem própria.
- Bloco de fechamento informal → reusa a coverImage.

Para a `coverImage`, sugira o **tema** que combina com a feature de destaque (ex.: feature de combate → arte de luta; feature de magia → arte de mago; release misto → arte genérica de aventura). Os posts atuais usam imagens de dmdave.com, static0.thegamerimages.com, arcaneeye.com — não invente URLs, deixe a sugestão e marque como `<SUGESTÃO: ...>`.

### Gravação sugerida — como pensar

Essa linha não vai para o blog: é o insumo do skill `release-video`, que transforma cada uma numa cena gravada com Playwright. Escreva para quem vai roteirizar cliques, não para o leitor:

- **Onde começa:** a rota e o estado de partida (ex.: "`/criar-ficha`, Elfo Arcanista, passo Magias"; "ficha de Inventor nível 5 com Engenhoqueiro, aba Magias").
- **O gesto:** os 2 a 4 cliques que mostram a feature, com o **texto exato** dos botões e rótulos (confira no componente).
- **O quadro que vende:** o que precisa estar na tela no fim (o número que mudou, o modal aberto, a lista filtrada).
- **O que precisa existir:** login, apoiador, flag ainda desligada, dado de demo (mesa, ficha salva, homebrew). Se der para mostrar deslogado, diga "deslogado".
- **"sem gravação"** para o que não tem efeito visual rápido (correção de cálculo, bloco de correções). Marque **(destaque)** no bloco que deve abrir o vídeo.

Ex.: `**Gravação sugerida:** (destaque) deslogado, ficha de Inventor com Engenhoqueiro, aba Magias: clicar na chave inglesa de uma magia, dar nome à engenhoca, salvar; depois clicar em Ativar e mostrar a rolagem de Ofício (engenhoqueiro) contra a CD.`

## Quick format reference (from real posts)

- **Title:** "Atualização X.Y já disponível" (default) ou "Atualização X.Y - <Tema da feature destaque>" quando há um tema dominante (ex.: "Atualização 4.10 - Condições automáticas na atualização 2026.2").
- **Description:** lista 2-3 temas principais, separados por vírgula, terminando com "e mais correções." quando aplicável. Ex.: "Pesquisa nos equipamentos, mais poderes com bônus automáticos e mais correções."
- **Slug:** `atualizacao-X-Y-ja-disponivel` (default) ou `atualizacao-X-Y-<tema-em-kebab-case>` quando o título tem tema.

## Checklist antes de salvar

- [ ] Título, description e slug coerentes entre si.
- [ ] **Bloco 1 é a introdução**: um parágrafo curto com os destaques e a linha **Vídeo** apontando para o render desktop.
- [ ] 4-8 blocos de conteúdo depois dela, cada um com título escaneável e imagem sugerida (descrição, não URL).
- [ ] Negritos nos nomes de poderes/classes/itens/números.
- [ ] Cada bloco de conteúdo tem pelo menos uma frase de "porquê".
- [ ] Bloco final agrupa as correções menores e fecha com link `[Changelog](/changelog)`.
- [ ] Arquivo salvo em `release-posts/atualizacao-X-Y.md`.
- [ ] Todo bloco de conteúdo tem **Gravação sugerida** (ou "sem gravação"), e exatamente um está marcado como **(destaque)**.
- [ ] PRs `main → production` abertos (ou pulados, com motivo) nos dois repos, título `vX.Y`, changelog no corpo, nenhum mergeado.
- [ ] `release-video` invocado por último (ou pulado, com motivo).

## Final report to user

Em poucas frases, diga:

1. O caminho do arquivo gerado.
2. Quantos blocos foram criados.
3. Lembre que as URLs de imagem são sugestões e precisam ser substituídas antes de publicar.
4. As URLs dos PRs de deploy do frontend e do backend — ou, para cada um que não foi aberto, o motivo (nada novo para publicar, `main` local não pushada, PR já existente que foi atualizado).
5. Que nada foi mergeado: o deploy acontece quando o usuário mergear, backend primeiro.
6. O caminho dos vídeos gerados pelo `release-video` (ou por que ele não rodou e o que falta).
