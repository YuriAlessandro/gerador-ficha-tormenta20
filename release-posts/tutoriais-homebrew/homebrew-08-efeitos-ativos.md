---
title: "Homebrews #8 — Efeitos ativos: buffs que o jogador liga e desliga"
description: Como criar buffs alternáveis (fúrias, posturas, transformações) com tiers, custo de PM e bônus circunstanciais nos seus homebrews da Fichas de Nimb.
slug: homebrew-efeitos-ativos
coverImage: <SUGESTÃO: arte de um personagem "ativando" um poder — aura explodindo, olhos brilhando, postura de combate. Substituir por URL real antes de publicar.>
---

## Bloco 1

**Título do bloco:** Passivo não dá conta de tudo

Um bônus passivo está **sempre ligado**. Mas muito conteúdo de Tormenta é circunstancial: a **Fúria** do bárbaro, uma **postura** de combate, uma **transformação**, uma bênção temporária. Esses são **efeitos ativos** — buffs que o jogador **liga e desliga** na ficha, e que muitas vezes custam PM.

O acordeão **"Efeitos ativos"** aparece nas habilidades, nos poderes e (em formato de "um por magia") nos pacotes de magias. O texto de ajuda nas magias resume bem: *"Buff alternável aplicado à ficha quando a magia está ativa (ex.: bônus na Defesa)."*

---

## Bloco 2

**Título do bloco:** A estrutura de um efeito ativo

Um efeito ativo tem:

- **Nome do Efeito** (obrigatório, ex.: "Fúria Sombria").
- **Descrição (opcional)**.
- Um ou mais **Tiers** (níveis do efeito).

Por que **tiers**? Porque muitos buffs escalam: a Fúria de nível baixo dá menos que a de nível alto. Em vez de um efeito só, você define faixas. Use **"Adicionar tier"** para criar quantos precisar.

Cada tier tem:

- **Nome do Tier** (ex.: "Tier 1").
- **Custo PM** (opcional) — quanto custa ativar.
- **Nível mín.** (opcional, 1–20) — *"Libera no nível"*: o tier só fica disponível a partir desse nível.
- **Descrição do Tier (opcional)**.
- Uma lista de **bônus** daquele tier.

---

## Bloco 3

**Título do bloco:** Os bônus de um tier

Dentro de cada tier, clique em **"Adicionar bônus"**. O efeito ativo tem sua própria lista de tipos de bônus (campo **"Tipo"**), pensada para buffs:

- **Atributo**, **Defesa**, **PV**, **PM**, **Iniciativa**, **CD de Magias**
- **Ataque (todos)** e **Ataque (corpo a corpo / distância)**
- **Dano de arma** (com escopo: Qualquer arma, Corpo a corpo, À distância)
- **Deslocamento (+)** — soma metros ao deslocamento; e **Deslocamento (substituir)** — troca o total
- **Perícia (escolher)** — *"Inclui Iniciativa, Fortitude, Reflexos e Vontade."*
- **Teste de Resistência** (Fortitude, Reflexos, Vontade ou Todos)
- **Redução de Dano** (por tipo; use "Geral" para qualquer dano)
- **Margem de Ameaça (armas)** e **Multiplicador Crítico (armas)**

Cada bônus tem um **Valor** e, conforme o tipo, campos extras (atributo, perícia, tipo de dano, escopo ou resistência).

---

## Bloco 4

**Título do bloco:** Exemplo — a Fúria escalável

Vamos modelar uma **"Fúria"** clássica:

1. Crie o efeito ativo, nome "Fúria".
2. **Tier 1** (Custo PM `2`, Nível mín. `1`): bônus **Dano de arma** (Corpo a corpo) `+2` e bônus **Teste de Resistência** (Fortitude) `+1`.
3. **Tier 2** (Custo PM `4`, Nível mín. `7`): **Dano de arma** `+4`, **Fortitude** `+2`.
4. **Tier 3** (Custo PM `6`, Nível mín. `13`): **Dano de arma** `+6`, **Fortitude** `+3`.

Na ficha, o jogador vê o botão da Fúria, escolhe o tier disponível para o nível dele, paga o PM e os bônus entram — até ele desligar. É assim que se constrói qualquer buff alternável.

Com bônus, rolagens e efeitos ativos no bolso, você já tem todas as peças. Hora de montar o tipo mais ambicioso: a [classe — começando pelo esqueleto](/blog/homebrew-classes-1-esqueleto).
