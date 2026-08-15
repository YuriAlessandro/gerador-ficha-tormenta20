# PR Review Command

Revisar um Pull Request (normalmente de um contribuidor externo), **provar empiricamente** que o
problema existia e que a solução funciona, e então:

- **APROVADO** → trazer o conteúdo para a `main` local (sem push).
- **REPROVADO** → pedir autorização ao usuário para publicar o review no próprio PR, com
  comentários inline.

## Arguments

- `$ARGUMENTS` — o número do PR (ex.: `484`) ou a URL completa do PR.

---

## ⚠️ Regras invioláveis

1. **Sempre passe `--repo YuriAlessandro/gerador-ficha-tormenta20` em TODO comando `gh`.**
   Este clone tem um remote `upstream` apontando para `isaacbatst/gerador-ficha-tormenta20`, e o
   `gh` resolve o repositório por ali primeiro — sem o `--repo` você recebe
   `Could not resolve to a PullRequest` ou um 404, mesmo com o PR existindo.
2. **NUNCA rodar build** (`npm run build`, `vite build`, `vite preview`): trava o WSL inteiro.
   A validação é `tsc --noEmit` + `eslint` + `vitest`.
3. **NUNCA fazer push.** Nem para `main`, nem para nenhuma branch, em nenhum repo ou submódulo.
   Push em `main` é deploy de produção e é sempre feito manualmente pelo usuário.
4. **Nunca publique nada no PR sem autorização explícita** do usuário nesta conversa.
5. **Não mencione o uso de IA/Claude** em nenhum texto que vá para o GitHub (corpo do review,
   comentários inline, mensagem de commit). Escreva em primeira pessoa, como o mantenedor.
   Nada de `Co-Authored-By: Claude`, nada de `🤖 Generated with...`, nada de "analisei com IA".

---

## Passo 1 — Ler o PR

```bash
gh pr view <N> --repo YuriAlessandro/gerador-ficha-tormenta20 \
  --json number,title,author,state,headRefName,headRepositoryOwner,baseRefName,body,\
additions,deletions,changedFiles,url,mergeable,commits
gh pr diff <N> --repo YuriAlessandro/gerador-ficha-tormenta20 --patch
```

Extraia da descrição: **qual problema o autor alega**, **como reproduzir**, **o que ele mudou** e
**o que ele diz ter testado**. Você vai verificar cada uma dessas afirmações — nenhuma é aceita
por confiança.

Sinais de alerta a checar já aqui:

- O diff mexe em `src/premium` ou `backend` (submódulos privados)? Contribuidor externo não tem
  acesso a eles; qualquer mudança de gitlink ali é suspeita e deve ser reportada ao usuário.
- O diff mexe em `.github/workflows/`, `public/_headers`, `public/_redirects`,
  `public/_routes.json`, `functions/_middleware.ts` ou `vite.config.ts`? São arquivos de
  infraestrutura/deploy — exigem escrutínio extra e provavelmente teste manual do usuário.
- O PR mistura o fix com refactor não relacionado, bump de versão ou entrada de Changelog?
  Changelog e versão são responsabilidade do mantenedor (comando `/release`), não do PR.

## Passo 2 — Trazer o PR para uma branch temporária

A branch do fork quase sempre está muito atrás da `main`. **Compare sempre o commit (ou a série de
commits) do PR, nunca `git diff main..pr-branch`** — esse diff vem poluído com centenas de arquivos
desatualizados e não representa a mudança.

```bash
git fetch origin pull/<N>/head:pr-<N>
git log --oneline main..pr-<N>        # a série real de commits do PR
git checkout -b pr<N>-verify main
git cherry-pick <sha>                 # ou o range, se forem vários commits
```

Se houver conflito no cherry-pick: resolva se for trivial e **registre isso no review** (o autor
precisa rebasear). Se for um conflito real de semântica, isso por si só já é motivo para pedir
mudanças.

Depois confira o diff que de fato vai entrar:

```bash
git diff main..pr<N>-verify
```

## Passo 3 — Provar que o problema existia (obrigatório)

Este é o coração do comando. Não basta ler o código e achar plausível: **reproduza a falha**.

### 3a. Se o PR trouxe testes

Reverta **apenas o código-fonte**, mantendo os testes novos, e rode:

```bash
git checkout main -- <arquivos de src/ tocados pelo PR, exceto __tests__>
npx vitest run <arquivo de teste do PR>
```

Os testes novos **têm que falhar**, e a falha tem que ser exatamente o sintoma descrito na
descrição do PR. Se eles passam sem o fix, o PR não prova nada — o teste é vazio ou o bug não
existe. Isso é motivo de reprovação.

Depois restaure e confirme que passam:

```bash
git checkout pr<N>-verify -- <mesmos arquivos>
npx vitest run <arquivo de teste do PR>
```

### 3b. Se o PR não trouxe testes

Escreva um teste temporário que reproduza o cenário da descrição, rode-o contra a `main` (deve
falhar) e contra o fix (deve passar). Coloque-o em `src/functions/__tests__/scratch<N>.spec.ts`
e **apague antes de finalizar**. Ausência de teste de regressão em um bug fix é uma ressalva
legítima para o review, mesmo que o fix esteja correto.

### 3c. Verifique TODOS os caminhos que alcançam o bug

O teste do autor normalmente cobre só o caminho pelo qual ele tropeçou. Procure os outros e
reproduza por lá também — é aí que mora o valor real do review.

Neste projeto, o caso mais comum é a duplicidade de motores de derivação de ficha:

- geração aleatória → `applyStatModifiers` (`src/functions/general.ts`)
- assistente / level-up / recálculo → `recalculateSheet` (`src/functions/recalculateSheet.ts`)

Eles divergem em silêncio. Um fix que resolve só um dos dois está incompleto. Outros pares que
merecem a mesma checagem: frontend × backend (limites, `NEVER_UNSET_SHEET_KEYS`), ficha nova ×
ficha carregada da nuvem (`normalizeSheet`, `stripSheetForStorage`/`rehydrateSheet`), mono-classe ×
multiclasse.

Escreva um teste temporário para o caminho não coberto e prove se ele falha ou não. Se falhar, o
PR está incompleto → é uma ressalva ou uma reprovação, dependendo da gravidade.

### 3d. Procure regressões que o fix possa introduzir

Liste os consumidores do que mudou (`grep -rn "<símbolo>" src/`) e avalie cada um. Pergunte
especificamente:

- O caminho antigo continua idêntico para o caso comum? (ex.: mono-classe, ficha sem suplemento)
- Algum campo passou a ser sobrescrito onde antes era preservado?
- A mudança estreita um fallback que alguém dependia?

Cheque também as memórias do projeto (`MEMORY.md`) por gotchas relacionados aos arquivos tocados —
várias armadilhas deste repo já estão documentadas lá.

## Passo 4 — Validação completa

Rode tudo, na branch com o fix aplicado:

```bash
npx tsc --noEmit
npx eslint <arquivos tocados> --max-warnings=0
npx prettier --check <arquivos tocados>
npx vitest run
```

Contribuidores externos rodam sem o submódulo privado `src/premium`, então frequentemente **não
conseguem rodar `tsc --noEmit`** — você consegue, e deve. É uma das checagens que só o mantenedor
faz.

Sobre o CI: o job do CircleCI inicializa `src/premium` usando `$GITHUB_PAT`, e **PRs vindos de fork
não recebem essa variável**. Um CI vermelho por esse motivo **não é culpa do PR** — não use isso
como razão para reprovar, e mencione no review quando for o caso.

Revise ainda a aderência às regras do `CLAUDE.md`: nada de `any`, nada de prop spreading, sem
variáveis não usadas, responsividade mobile em mudanças de UI, e conteúdo de regra de jogo
conferido contra os livros oficiais em `livros/` quando o PR mexer em dados de sistema.

## Passo 5 — Veredito

Decida entre:

- **APROVADO** — o problema era real e reproduzível, o fix o resolve em todos os caminhos, não
  introduz regressão, e toda a validação passa. Ressalvas menores (estilo, comentário, um
  fallback que poderia ser mais defensivo) não impedem a aprovação: registre-as no relatório ao
  usuário.
- **REPROVADO** — qualquer uma destas: o problema não se reproduz; o fix não resolve o problema
  descrito; resolve só um dos caminhos; introduz regressão; quebra tsc/eslint/testes; a mudança
  vai muito além do escopo declarado; ou toca em algo que exige decisão do mantenedor
  (infraestrutura, dados de regra sem fonte, submódulo privado).

Na dúvida entre aprovar com ressalva forte e reprovar, **pergunte ao usuário** apresentando o
trade-off — não decida sozinho.

---

## Passo 6A — Caminho APROVADO

Traga para a `main` local via **cherry-pick** (não merge — a branch do fork está atrás da `main`,
e um merge arrastaria centenas de arquivos desatualizados). O cherry-pick **preserva a autoria do
contribuidor**, o que é o certo: ele fica como `author`, o usuário como `committer`.

```bash
git checkout main
git cherry-pick <sha>          # ou a série de commits, na ordem
git log -1 --format='%an <%ae> | committer: %cn'
git status --short             # tem que estar limpo
```

Não altere a mensagem de commit original do contribuidor e **não acrescente `Co-Authored-By` de
IA**. Limpe as branches temporárias (`git branch -D pr<N> pr<N>-verify`) e o teste de scratch, se
houver.

Não faça push. Não crie entrada de Changelog nem bump de versão — isso é do `/release`, e cabe ao
usuário decidir quando.

Ao final, relate ao usuário em português:

- o que foi verificado e **como o bug foi reproduzido** (cole a saída da falha real);
- os caminhos extras que você checou além do teste do autor;
- o resultado de cada validação;
- ressalvas menores encontradas;
- o hash do commit que entrou na `main` local;
- lembrete de que nada foi pushado, e que fechar o PR no GitHub referenciando o hash dá o crédito
  visível ao contribuidor.

## Passo 6B — Caminho REPROVADO

**Pare e peça autorização.** Apresente ao usuário, antes de publicar qualquer coisa:

1. o veredito e o motivo, com a evidência (saída de teste, trecho de código);
2. o corpo do review que você pretende postar;
3. a lista de comentários inline (arquivo, linha e texto de cada um);
4. o `event` pretendido: `REQUEST_CHANGES` para defeito real, `COMMENT` para dúvida ou ressalva
   sem defeito confirmado.

Só publique após um "sim" explícito. Se o usuário pedir ajustes no texto, refaça e pergunte de novo.

### Como publicar (o review deve ser o mais inline possível)

Prefira **um único review com comentários inline** — não uma sequência de comentários soltos.
Monte um JSON e envie pela API:

Escreva o JSON no diretório de scratchpad da sessão (o caminho aparece no system prompt; expanda-o
antes de usar — glob não funciona em redirect de shell) e envie com `--input`:

```bash
# $SCRATCH = diretório de scratchpad da sessão, já expandido
cat > "$SCRATCH/review-<N>.json" <<'JSON'
{
  "body": "<resumo curto: o que foi verificado, o que precisa mudar>",
  "event": "REQUEST_CHANGES",
  "comments": [
    { "path": "src/functions/general.ts", "line": 2950, "side": "RIGHT", "body": "<observação pontual>" },
    { "path": "src/functions/general.ts", "start_line": 2960, "line": 2965, "side": "RIGHT", "body": "<observação sobre um trecho>" }
  ]
}
JSON

gh api repos/YuriAlessandro/gerador-ficha-tormenta20/pulls/<N>/reviews \
  --method POST --input "$SCRATCH/review-<N>.json"
```

Use here-doc com delimitador entre aspas (`<<'JSON'`) para o shell não interpretar crase, `$` ou
`!` dentro do texto do review.

Detalhes que evitam erro 422:

- `line` é o número da linha **no arquivo em sua versão final (head do PR)** e precisa estar
  dentro de um hunk do diff. Ancore preferencialmente em **linhas adicionadas** (`side: "RIGHT"`).
- Para comentar em linha removida, use `side: "LEFT"`.
- Para um intervalo, use `start_line` + `line` (ambos no mesmo lado).
- Confira as linhas válidas com `gh pr diff <N> --repo ... --patch` antes de montar o JSON.

### Como escrever o review

- **Em português do Brasil**, em primeira pessoa, direto e respeitoso — é um contribuidor externo
  doando tempo ao projeto.
- **O grosso vai inline.** O corpo do review é só o resumo: o que foi verificado, o veredito e o
  que falta. Cada crítica pontual vira um comentário na linha exata.
- **Concreto, não vago.** "Isso quebra o recálculo" vale pouco; "com esta ficha o
  `recalculateSheet` lança `<erro>` na linha X, porque `sourceClassName` não é lido ali" vale
  muito. Cole a saída de teste que comprova.
- **Reconheça o que está certo.** Se o diagnóstico do autor estava correto e só a solução ficou
  incompleta, diga isso.
- **Sugira o caminho.** Quando souber a correção, aponte-a — de preferência num bloco
  `suggestion` do GitHub (uma cerca de código com a linguagem `suggestion`), que permite ao autor
  aplicar a mudança com um clique. Vale quando cabe em poucas linhas.
- Nada de mencionar IA, nada de assinatura de bot.

Depois de publicar, informe ao usuário a URL do review e **não** traga o código para a `main`.

---

## Limpeza (sempre)

```bash
git branch -D pr<N> pr<N>-verify 2>/dev/null
rm -f src/functions/__tests__/scratch<N>.spec.ts
git status --short          # tem que refletir só o que você pretendia
```

Confirme que não sobrou nenhum arquivo de scratch e que a working tree está no estado esperado
antes de encerrar.
