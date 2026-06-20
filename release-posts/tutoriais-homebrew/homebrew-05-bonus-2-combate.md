---
title: "Homebrews #5 — Bônus passivos II: dano, margem de ameaça e crítico"
description: Os bônus de combate da Fichas de Nimb têm campos próprios — escopo de arma, fonte do valor e modo aumentar/definir. Guia completo de dano, margem de ameaça e multiplicador de crítico.
slug: homebrew-bonus-2-combate
coverImage: <SUGESTÃO: arte de fantasia de um golpe crítico devastador — lâmina conectando com um inimigo, faíscas/impacto. Substituir por URL real antes de publicar.>
---

## Bloco 1

**Título do bloco:** Bônus de arma são diferentes

Três alvos do construtor de bônus mexem diretamente nas armas e, por isso, ganham campos extras: **Dano**, **Margem de ameaça** e **Multiplicador de crítico**. Todos compartilham um conceito — o **escopo de arma**: a quais armas o bônus se aplica.

O campo de escopo ("Armas afetadas") oferece:

- **Geral (todas as armas)**
- **Corpo a corpo**
- **À distância**
- **Arremesso**
- **Simples**, **Marciais**, **Exóticas**
- **De fogo**

Assim você modela coisas como "*+2 de dano só com armas à distância*" ou "*crítico melhor só com armas marciais*".

---

## Bloco 2

**Título do bloco:** Dano — o básico é valor fixo

O alvo **"Dano"** soma ao dano das armas no escopo escolhido. **No modo Básico, o dano é sempre um valor fixo** — escolha o escopo e digite o número (ex.: escopo "Corpo a corpo", valor `2`). Simples e suficiente para a maioria dos casos.

O modo **Avançado** abre a **"Fonte do dano"**, permitindo que o bônus venha de algo que varia:

- **Valor fixo**
- **Nível do personagem**
- **Círculo de magia** (o círculo máximo que o personagem acessa)
- **Valor de um atributo**

E, no avançado, surgem dois limitadores (checkboxes): **"Limitar pelo nível"** e **"Limitar por um atributo"** — úteis para evitar que um bônus baseado em atributo dispare em níveis baixos. Comece com o valor fixo; só vá para as fontes variáveis quando o conceito realmente exigir.

---

## Bloco 3

**Título do bloco:** Margem de ameaça — aumentar ou definir

A **margem de ameaça** é a faixa de rolagem que ameaça crítico (ex.: "19" significa crítico em 19–20). O alvo **"Margem de ameaça"** tem, além do escopo, um campo de **modo** ("Efeito"):

- **Aumentar margem** — alarga a margem em N. Valor `1` numa arma de margem 20 deixa em 19 (19–20); numa arma de margem 19, deixa em 18 (18–20).
- **Definir margem** — fixa a margem num número exato. Definir `18` deixa a arma com crítico em 18–20, independentemente da margem original.

Use **Aumentar** para talentos que "afiam" qualquer arma do personagem; use **Definir** quando a habilidade dita uma margem específica.

---

## Bloco 4

**Título do bloco:** Multiplicador de crítico — aumentar ou definir

Espelha a margem de ameaça, mas para o **multiplicador** (o "x2", "x3" do dano crítico). O alvo **"Multiplicador de crítico"** também tem escopo e modo:

- **Aumentar multiplicador** — soma ao multiplicador atual. `1` numa arma x2 deixa x3.
- **Definir multiplicador** — fixa o multiplicador. Definir `3` deixa qualquer arma do escopo em x3.

O sistema é esperto com armas que só têm parte da informação: uma arma anotada apenas como "x2" assume margem implícita 20; uma anotada apenas como "19" assume multiplicador implícito x2. Então um bônus de crítico funciona mesmo em armas que não listam os dois números.

---

## Bloco 5

**Título do bloco:** Montando um "estilo de combate" coerente

Esses três alvos brilham juntos. Imagine um poder de classe **"Lâmina Implacável"** (corpo a corpo):

- **Dano**, escopo Corpo a corpo, valor fixo `2`.
- **Margem de ameaça**, escopo Corpo a corpo, modo Aumentar, `1`.

Resultado: com qualquer arma corpo a corpo, o personagem ganha +2 de dano e margem de crítico um ponto mais ampla. Tudo aparece automaticamente nas armas equipadas e nas rolagens da ficha.

No próximo post fechamos o construtor de bônus com os recursos avançados: [escolha do jogador, fórmulas e condições](/blog/homebrew-bonus-3-avancado).
