---
name: release-post
description: Generate a blog post markdown file for a new release of Fichas de Nimb. Reads the version's section in src/components/screens/Changelog.tsx, the related git commits, and produces release-posts/atualizacao-{version}.md following the established blog format (title, description, slug, cover image suggestion, content blocks with image suggestions). Use when the user asks for a release post, blog post for a version, or "post da v X.Y".
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

Do **not** publish, push, commit, or call the blog API. The file is a draft for the user to paste into the blog editor block-by-block.

## Output file format

Use this exact template — frontmatter for post metadata, then `## Bloco N` sections for each content block. Each block is what the user will paste into the editor as one block.

```markdown
---
title: Atualização X.Y já disponível
description: <1-sentence summary, max ~140 chars, lists 2-3 main themes>
slug: atualizacao-X-Y-ja-disponivel
coverImage: <SUGESTÃO: arte de fantasia/RPG temática (ex.: dmdave.com, thegamerimages.com, arcaneeye.com). Substituir por URL real antes de publicar.>
---

## Bloco 1

**Título do bloco:** <Título específico, escaneável, dizendo o que mudou>

**Imagem sugerida:** <descrição do screenshot/arte que combina com o bloco — ex.: "Screenshot do drawer de equipamentos com o campo de busca em destaque, mostrando 'espada' filtrando 'Espada Longa'.">

**Legenda da imagem (opcional):** <só se for útil; muitos blocos não têm legenda>

<conteúdo do bloco em markdown — 1 a 3 parágrafos curtos, com **negrito** em termos do jogo e nomes de poderes/itens, *itálico* em ênfase ocasional. Listas com `-` quando agrupar várias features.>

---

## Bloco 2

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
- **Itálico:** ênfase ocasional, nomes de condições no meio do texto (ex.: *paralisado*), e em frases-fechamento informais (ex.: *Bons jogos e que suas condições durem só uma rodada.*).
- **Explica o porquê:** todo bloco precisa de pelo menos uma frase do *porquê* da mudança ou *qual problema resolvia*. Não basta listar a feature.
- **Especificidade:** prefira nomes reais (poder, classe, número) a abstrações ("um poder de uma classe"). Se o changelog cita "Casca Grossa (Lutador / Atleta)", use isso.
- **Tamanho dos blocos:** 1-3 parágrafos, raramente 4. Listas com `-` quando há 3+ itens correlatos.
- **Quantidade de blocos:** 4 a 8. Combine itens correlatos do changelog num bloco só quando fizer sentido (ex.: 4 poderes de combate viraram um bloco em 4.12). Não faça 1 bloco por linha do changelog.
- **Bloco final:** sempre "Outras correções" ou "E tem mais na X.Y" agrupando os fixes/melhorias menores em bullets, terminando com link para `[Changelog](/changelog)`.

### Sugestão de imagem — como pensar

Para cada bloco com mudança visual, sugira **o que** screenshotar, não uma URL. Padrões observados:
- Feature de UI nova → screenshot da própria UI mostrando a feature em ação.
- Mudança de regra/cálculo → screenshot da ficha mostrando o número correto, ou um print da tela onde o usuário escolhe.
- Bloco de correções → geralmente sem imagem própria.
- Bloco de fechamento informal → reusa a coverImage.

Para a `coverImage`, sugira o **tema** que combina com a feature de destaque (ex.: feature de combate → arte de luta; feature de magia → arte de mago; release misto → arte genérica de aventura). Os posts atuais usam imagens de dmdave.com, static0.thegamerimages.com, arcaneeye.com — não invente URLs, deixe a sugestão e marque como `<SUGESTÃO: ...>`.

## Quick format reference (from real posts)

- **Title:** "Atualização X.Y já disponível" (default) ou "Atualização X.Y - <Tema da feature destaque>" quando há um tema dominante (ex.: "Atualização 4.10 - Condições automáticas na atualização 2026.2").
- **Description:** lista 2-3 temas principais, separados por vírgula, terminando com "e mais correções." quando aplicável. Ex.: "Pesquisa nos equipamentos, mais poderes com bônus automáticos e mais correções."
- **Slug:** `atualizacao-X-Y-ja-disponivel` (default) ou `atualizacao-X-Y-<tema-em-kebab-case>` quando o título tem tema.

## Checklist antes de salvar

- [ ] Título, description e slug coerentes entre si.
- [ ] 4-8 blocos, cada um com título escaneável e imagem sugerida (descrição, não URL).
- [ ] Negritos nos nomes de poderes/classes/itens/números.
- [ ] Cada bloco tem pelo menos uma frase de "porquê".
- [ ] Bloco final agrupa as correções menores e fecha com link `[Changelog](/changelog)`.
- [ ] Arquivo salvo em `release-posts/atualizacao-X-Y.md`.

## Final report to user

Em uma ou duas frases, diga:
1. O caminho do arquivo gerado.
2. Quantos blocos foram criados.
3. Lembre que as URLs de imagem são sugestões e precisam ser substituídas antes de publicar.
