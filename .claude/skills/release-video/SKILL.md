---
name: release-video
description: Generate the short showcase videos (16:9 and 9:16 Reels) of a Fichas de Nimb release from its blog post draft. Writes the narration, the Playwright screen-recording scenes and the storyboard, then records, narrates and renders with the pipeline in ~/workspace/fichas-release-video. Use when the user asks for a release video, "vídeo da v X.Y", "vídeo de release", Reels of an update, or as the last step of /release-post.
---

# release-video

Do post de release ao vídeo pronto: **gravação de tela roteirizada → narração pt-BR → composição HyperFrames**, em 16:9 (desktop) e 9:16 (Reels/Shorts) de uma vez.

```
/release-video <version>
```

`<version>`: `4.35`, `v4.35`. O id do vídeo é `v4-35`.

O pipeline mora **fora deste repositório**, em `~/workspace/fichas-release-video` (ferramenta de marketing, sem git). Todo comando abaixo roda de lá. O `README.md` de lá descreve as decisões técnicas do pipeline; leia antes de mexer em `build.mjs` ou `lib/recorder.mjs`.

O skill **não** publica o vídeo, não commita e não mexe em dados de produção.

## O que entra e o que sai

- **Entrada:** `release-posts/atualizacao-X-Y.md` (neste repo). Se não existir, rode `/release-post` antes: o vídeo é derivado do post, não do changelog.
- **Saída:** `~/workspace/fichas-release-video/videos/vX-Y/renders/vX-Y-{desktop,mobile}.mp4`, mais as imagens dos blocos em `release-posts/atualizacao-X-Y-imagens/`.

## Passo 0 — ambiente (pare e avise se faltar)

```bash
git fetch origin production && git log --oneline origin/production..origin/main | head -3   # vazio = versão publicada
curl -s -o /dev/null -w '%{http_code}\n' --max-time 5 http://localhost:5173/                  # dev server
curl -s --max-time 5 http://localhost:3001/api/feature-flags | head -c 200                    # backend local
```

- **Versão já em produção** → grava contra `https://fichasdenimb.com.br`, sem login (não passe `--local` no `new.mjs`).
- **Versão ainda não publicada** (caso comum: o vídeo sai junto do post) → grava contra o dev server local, `node new.mjs X.Y --local`.
  - Dev server fora do ar: suba com `npm start` em background **só se a porta 5173 estiver livre**. Se já houver um rodando, use o que está lá. Nunca reinicie, nunca suba um segundo, nunca apague `node_modules/.vite`.
  - **Nunca** rode `npm run build` / `vite build` / `vite preview` (trava o WSL).
- **Backend local** só é necessário para cenas logadas. A resposta de `/api/feature-flags` tem que ser o JSON do backend do Fichas (`{"success":true,"data":...}`); outra coisa na porta 3001 é outro projeto. Sem backend: roteirize só cenas deslogadas e transforme o resto em `card`. Não suba o backend por conta própria: ele aponta para um banco, pergunte.

## Passo 1 — escolher as cenas

Leia o post. O vídeo **não** cobre o post inteiro: são **4 a 7 cenas**, 45–75s no total.

- Cada bloco do post tem uma linha **Gravação sugerida** (emitida pelo `/release-post`). Ela diz a rota, o estado de partida e o gesto que mostra a feature. Posts antigos não têm: derive do texto e da **Imagem sugerida**.
- **A 1ª cena é o destaque da versão** e precisa abrir num quadro em que algo já está acontecendo (não num diálogo vazio nem numa tela carregando): no mobile ela vira o gancho, antes do título.
- Escolha o que é **visual e rápido**: um clique que muda um número, um modal que abre, uma lista que filtra. Correção de cálculo sem efeito visível fica de fora, ou vira `card`.
- O **Bloco 1 (introdução)** e o bloco "Outras correções" nunca viram cena. A introdução é onde o vídeo desktop vai no post: se a ordem das cenas ficar diferente da ordem dos destaques citados nela, ajuste o texto da introdução.
- Feature que exige login, flag desligada ou dado que não existe no banco de dev: cena logada (ver "Cenas logadas") ou `card` com 2–3 tópicos. Um vídeo com um `card` é melhor que um vídeo sem a feature.
- Agrupe cenas que acontecem na mesma tela na **mesma gravação** (um arquivo em `scenes/`): menos gravações = menos tempo e menos pontos de falha. A v4.34 teve 7 cenas em 4 gravações.

## Passo 2 — esqueleto

```bash
cd ~/workspace/fichas-release-video
node new.mjs X.Y --headline "<tema do título do post>" [--local]
```

Cria `videos/vX-Y/` com fontes, logo, `narration.json` (voz herdada do vídeo anterior, fala `outro` pronta) e `storyboard.json` vazio. `headline` é o subtítulo do cartão "Atualização X.Y": o tema do título do post, sem o "Atualização X.Y -".

## Passo 3 — narração (`videos/vX-Y/narration.json`)

Uma fala por cena, mais a `outro`. Cada fala tem `id`, `text` (o que é **falado**) e `caption` opcional (o que é **exibido**, quando difere).

- **Tamanho:** 1–2 frases, 15–35 palavras. A duração da cena é a duração da fala: fala longa = cena parada.
- **Tom:** o do post, mais curto. Diga o que mudou e o ganho. Sem "nesta atualização", sem ler a lista de features.
- **`text` é escrito para o TTS:** números por extenso ("trinta e cinco", "mais dois"), siglas soletradas ou evitadas ("cê dê" → prefira "dificuldade"; "PM" → "pontos de mana"), nomes de tela em minúsculas. Quando `text` foge da grafia normal, ponha a grafia correta em `caption` ("35", "Livro Básico", "Desfazer Nível").
- Não narre o título: o cartão "Atualização X.Y" entra calado (`"intro": {}`).
- Mexeu numa fala, só ela é regerada (cache por hash).

## Passo 4 — cenas Playwright (`scenes/vX-Y-<nome>.mjs`)

Copie a estrutura de `scenes/v4-35-engenhocas.mjs` (deslogada, com preparação pelos helpers) ou `scenes/v4-34-ficha.mjs` (logada). Cada cena exporta `{ name, localStorage?, auth?, colorScheme?, prepare?, blur?, async run(r, page) }` e roda **uma vez por formato**; use `r.format === 'mobile'` para ramificar.

Helpers do `r` (movem o cursor de verdade, é isso que aparece no vídeo): `r.click(locator, { after })`, `r.moveTo(locator, { duration })`, `r.type(texto)`, `r.scroll(dy, ms)`, `r.wait(ms)`, `r.reactSelect(placeholder, texto)` e **`r.mark(nome, locator?)`**.

Regras que evitam regravar:

- **Marcadores são a cola com o storyboard.** Marque o começo de cada cena, cada momento em que algo importante aparece (com o `locator` do elemento: a caixa dele vira alvo da câmera) e um `end`. Nome em kebab-case, único na gravação.
- **Tudo que não é a feature anda rápido e fora do trecho usado:** navegue com `page.click`/`fill` direto (sem `r.`), e só passe a usar `r.` a partir do marcador de começo da cena.
- **Ritmo:** depois de cada ação que muda a tela, `after: 700–1200`. Antes do marcador de começo, `r.wait(800+)` para a tela assentar. Sem pausa, o espectador não vê o que mudou.
- **Seletores por papel e texto** (`getByRole`, `getByText(..., { exact: true })`, `getByLabel`), nunca classe CSS gerada. Para achar o texto exato dos botões, leia o componente no repo antes de escrever a cena.
- **Mobile é outro layout** (viewport 400px, `isMobile`): drawers viram tela cheia, steppers viram "Passo N de M", tabelas viram cards. Confira os dois formatos no ensaio.
- **Tema:** `colorScheme: 'dark'` em todas as cenas do vídeo (o gravador liga o tema escuro do app). Não misture temas no mesmo vídeo.
- **`localStorage` da cena** só para o que é específico dela (ex.: `fdnLastCreationMode: 'manual'` em `/criar-ficha`); os avisos automáticos o gravador já suprime.
- **A cena deixa tudo como encontrou:** limpa o que criou (fora do trecho usado, depois do `end`) e não confirma ação destrutiva. O diálogo de confirmação já mostra a feature.

### Explorar antes de escrever

Não escreva a cena às cegas. `probe.mjs` roda um roteiro curto e, a cada `shot('nome')`, salva um print em `scratch/` e **imprime o texto exato** de botões, abas, campos e títulos visíveis. É dele que saem os seletores.

```js
// scratch/p1.mjs
export default async (page, shot) => {
  await page.goto('/gerador-ameacas');
  await page.waitForTimeout(3000);
  await shot('ameacas');
};
```

```bash
node probe.mjs scratch/p1.mjs --dark [--format mobile] [--auth pessoal]
```

Para o estado de partida de cenas deslogadas, use `scenes/_helpers.mjs`: `randomSheet(page, { race, cls, level })` gera uma ficha em `/ficha-aleatoria`, `ensurePower(page, nome)` garante um poder pelo editor (a ficha aleatória sorteia os poderes: não conte com a sorte) e `addSpells(page, [nomes])` adiciona magias. Acrescente helpers novos lá quando uma preparação for reaproveitável.

### Armadilhas conhecidas

- **Tooltip cobre o vizinho.** O tooltip do MUI é interativo: o de um botão abre embaixo dele e engole o clique do botão da linha seguinte. Em listas, clique **de baixo para cima** (ver `v4-35-grimorio.mjs`). O `page.click` espera o tooltip sumir; o `r.click` não.
- **Avisos (snackbar) cobrem o botão flutuante no celular.** Depois de uma ação que dispara aviso, não clique em nada no rodapé: navegue por outra via (`page.goto`).
- **Passos de assistente:** no desktop o stepper é clicável pelo rótulo; no celular vira "Passo N de M" e só anda pelo **Próximo**.
- **Acordeões fechados:** itens de lista filtrada podem estar dentro de um grupo recolhido (ex.: "1º Círculo (1)"); expanda antes de clicar.
- **Resultado aleatório** (rolagem, tesouro, ficha gerada): a narração não pode afirmar o resultado ("passou", "achou uma espada"). Descreva o mecanismo.
- **Popups automáticos** (nuvem, PWA, push, apoio a cada 5 fichas) já são suprimidos pelo gravador; se aparecer um novo, acrescente a chave em `lib/recorder.mjs`, não na cena.

### Ensaio

```bash
node record.mjs scenes/vX-Y-<nome>.mjs --format desktop --base-url http://localhost:5173 --shots
```

`--shots` salva um print por marcador e junta todos em `out/<cena>/<formato>/shots.jpg`, na ordem. **Leia essa folha** (Read) e confira: a feature está visível, nada de popup por cima, nenhum dado pessoal na tela. Se a cena quebrar, `out/<cena>/<formato>/erro.png` mostra a tela no momento do erro. Repita no `--format mobile`. Itere até os dois formatos passarem; só então siga. O `make.mjs` regrava sem `--shots` (o print atrasa a gravação).

### Cenas logadas

- `auth: 'pessoal'` carrega `auth/pessoal.json` (sessão por origem: local ≠ produção). O gravador já borra nome/usuário/e-mail da conta e suprime os popups de conta. Se a sessão expirou ou não existe para a origem, **pare e peça ao usuário** para renovar (`node login.mjs pessoal --snippet`, instruções no topo do `login.mjs`): o login é Google e não dá para automatizar.
- `prepare: mockFlags` (de `setup/common.mjs`) liga, só no navegador da gravação, flags ainda desligadas. Acrescente a flag nova em `FLAGS`.
- Dados de demo (mesa, ficha): script idempotente em `setup/vX-Y-*.mjs`, que grava os ids em `videos/vX-Y/demo-state.json`. **Só no backend local com banco de dev.** Reaproveite a ficha/mesa de demo de versões anteriores quando servir (`videos/v4-34/demo-state.json`).

## Passo 5 — storyboard (`videos/vX-Y/storyboard.json`)

Uma entrada em `scenes` por fala, na ordem do vídeo (destaque primeiro). Modelos completos: `videos/v4-35/storyboard.json` (deslogado, com `card`) e `videos/v4-34/storyboard.json` (logado).

```json
{
  "voice": "engenhocas",
  "chip": "Engenhocas do Inventor",
  "rec": "v4-35-engenhocas",
  "mediaStart": { "marker": "magias", "offset": -0.3 },
  "mediaEnd": { "marker": "ativou", "offset": 1.0 },
  "camera": [
    {
      "marker": "dialog",
      "offset": -0.3,
      "focus": ["dialog"],
      "pad": 30,
      "formats": ["desktop"]
    }
  ]
}
```

- `chip`: selo da cena, 2–5 palavras, o nome da feature.
- `mediaStart`/`mediaEnd` **sempre por marcador** (nunca segundos fixos: cada regravação desloca tudo). O trecho é encaixado na fala: mais longo, acelera até 2,5x; mais curto, congela o último quadro. Mire em trechos de **1x a 1,8x** a duração da fala; trecho 3x mais longo que a fala sai corrido e cortado.
- `camera`: zoom num elemento marcado (`focus` = nomes de marcadores com caixa). Use quando o que importa ocupa menos de ~1/3 da tela. No mobile a gravação já é tela cheia: quase sempre `"formats": ["desktop"]`. Sem `camera`, a cena fica aberta.
- Cena sem gravação: `{ "voice": "...", "card": { "kicker": "Novo", "title": "...", "bullets": ["...", "..."] } }`.
- `"scene"` no topo é a gravação padrão das cenas sem `rec`; ajuste ou ponha `rec` em todas.

## Passo 6 — montar e revisar

```bash
node make.mjs videos/vX-Y                 # grava tudo, narra, monta, lint, renderiza os dois formatos
node review.mjs videos/vX-Y               # folhas de contato: 1 quadro a cada 2s
```

Rode o `make.mjs` em background (leva alguns minutos; o render usa `--workers 3`, não aumente). Depois **leia as folhas** em `videos/vX-Y/review/*.jpg` e confira, nos dois formatos:

- [ ] Mobile abre no destaque em ação; o título vem depois. Desktop abre no título.
- [ ] Em cada cena, a feature narrada está na tela **durante** a fala (não antes, não depois).
- [ ] Nenhuma cena congelada por mais da metade da duração, nem acelerada a ponto de não dar para ler.
- [ ] Legenda e selo não cobrem o que a cena mostra (no mobile, o que importa fica no terço de cima).
- [ ] Sem tela de carregamento, popup, erro ou dado pessoal.
- [ ] Zoom da câmera enquadra o elemento certo.

Para corrigir sem regravar tudo:

```bash
node make.mjs videos/vX-Y --skip-record                    # mudou só fala/storyboard
node make.mjs videos/vX-Y --rec vX-Y-<cena>                # regrava só uma gravação
node make.mjs videos/vX-Y --skip-record --format mobile    # remonta um formato
```

## Passo 7 — imagens para o post

As gravações também rendem as imagens dos blocos do post. Saem da gravação bruta do desktop (tela limpa, 2560x1440), nunca do vídeo montado, que tem legenda, selo e zoom por cima.

```bash
node stills.mjs videos/vX-Y      # um quadro por marcador + recortes/ no elemento marcado
```

Leia `videos/vX-Y/stills/index.jpg`, escolha uma ou duas imagens por bloco que teve gravação e copie para `release-posts/atualizacao-X-Y-imagens/` (neste repo, pasta ignorada pelo git) com o nome `bloco<N>-<assunto>.png`, usando o número do bloco no post. Prefira o arquivo de `recortes/` quando existir: a tela inteira deixa a interface pequena demais no blog.

- Marcador cujo quadro pega a tela no meio de uma transição (campo ainda vazio, modal abrindo): extraia o quadro de outro marcador, ou rode `stills.mjs` com `--offset` maior.
- Bloco de conteúdo **sem gravação** mas com tela acessível deslogado: capture com `probe.mjs` (ele grava em 2x) e recorte no card que interessa.
- O que depende de login ou do backend e não pôde ser capturado fica sem imagem: liste no relatório.
- Animação (rolagem, caça-níquel) não rende parada: diga no relatório que aquele trecho pede um clipe, não uma imagem.

Depois de copiar, troque no post a descrição de cada **Imagem sugerida** atendida pelo caminho do arquivo, mantendo a descrição original entre parênteses quando a imagem capturada for diferente do que ela pedia.

## Relatório final

1. Caminho dos dois `.mp4` e a duração de cada um.
2. As cenas, na ordem, e de que bloco do post cada uma veio.
3. O que ficou de fora e por quê (sem backend, sem sessão, sem efeito visual).
4. Contra o que foi gravado (produção ou dev server local).
5. Que a voz é a do `narration.json` (Kokoro local por padrão; ElevenLabs exige `ELEVENLABS_API_KEY` em `~/workspace/fichas-release-video/.env` e `"provider": "elevenlabs"`).
6. As imagens copiadas para `release-posts/atualizacao-X-Y-imagens/`, por bloco, e os blocos que ficaram sem imagem.
7. Que nada foi publicado.
