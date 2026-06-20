---
title: "Homebrews #4 — Bônus passivos I: fundamentos"
description: O construtor de bônus da Fichas de Nimb é onde texto vira número. Este post cobre os alvos simples e as duas formas básicas de calcular um bônus — valor fixo e escala por nível.
slug: homebrew-bonus-1-fundamentos
coverImage: <SUGESTÃO: imagem conceitual de "engrenagens/números" se encaixando numa ficha de personagem — algo que evoque "ajuste fino dos atributos". Substituir por URL real antes de publicar.>
---

## Bloco 1

**Título do bloco:** O construtor de bônus, em uma frase

Sempre que você abre o acordeão **"Bônus passivos"** de uma habilidade, poder ou opção, encontra o mesmo construtor. Cada bônus é uma linha que responde a duas perguntas:

1. **"O que afeta"** — o alvo (qual número do personagem muda).
2. **Como calcula** — quanto, e se isso varia.

Clique em **"Adicionar bônus"** para criar uma linha; o ícone de lixeira (**"Remover bônus"**) apaga. Você pode empilhar vários bônus numa mesma habilidade. Este post cobre os alvos simples e as duas formas básicas de cálculo; os posts [II](/blog/homebrew-bonus-2-combate) e [III](/blog/homebrew-bonus-3-avancado) cobrem combate e os recursos avançados.

---

## Bloco 2

**Título do bloco:** "O que afeta" — os alvos do modo básico

No campo **"O que afeta"**, o modo **Básico** oferece:

- **Atributo** — Força, Destreza, etc.
- **Perícia** — qualquer perícia (Atletismo, Furtividade, Vontade…).
- **Pontos de Vida (PV)**
- **Pontos de Mana (PM)**
- **Defesa**
- **Deslocamento**
- **Redução de Dano** — abre **"Tipo de dano"** (corte, fogo, geral…).
- **Bônus em todos os ataques**
- **Dano**, **Margem de ameaça**, **Multiplicador de crítico** — ligados a armas; veja o [post de combate](/blog/homebrew-bonus-2-combate).
- **Proficiência** — concede uma proficiência (em arma/armadura).

O modo **Avançado** acrescenta ainda: Penalidade de Armadura, Espaços de carga e CD de magias. Para a maioria do conteúdo, os alvos básicos bastam.

---

## Bloco 3

**Título do bloco:** Forma 1 — Valor fixo

A forma mais comum. O bônus é um número constante: **+2 em Defesa**, **+1 em Fortitude**, **+5 PV**.

Para **Atributo**, escolha o atributo e digite o valor. Para **Perícia**, escolha a perícia e o valor. Para PV/PM/Defesa/Deslocamento, basta o valor. É isso — "Valor fixo" é o padrão e resolve a esmagadora maioria das habilidades raciais e dos bônus de baixo nível.

> Exemplo: a habilidade "Couro Grosso" de uma raça reptiliana = um bônus **Defesa, valor fixo, +2**. Sempre ativo, sem nível, sem condição. Pronto.

---

## Bloco 4

**Título do bloco:** Forma 2 — Escala por nível

Muitos bônus de classe **crescem** conforme o personagem sobe de nível. Para isso, no modo básico existe **"Escala por nível"**, que usa **faixas (breakpoints)**: a partir de tal nível, o bônus passa a valer tanto.

Você adiciona faixas com **"Adicionar faixa"**, e cada faixa tem:

- **"A partir do nível"** (1 a 20)
- **"Valor"**

Exemplo clássico — uma redução de dano que cresce: faixa 1 → `2`, faixa 5 → `4`, faixa 11 → `6`, faixa 17 → `8`. Entre o nível 5 e o 10, o bônus vale 4; a partir do 11, passa a 6; e assim por diante. É a forma honesta de modelar "aumenta com o tempo" sem precisar de fórmula.

---

## Bloco 5

**Título do bloco:** Quando o básico não basta

Valor fixo e escala por nível cobrem quase tudo. Você só precisa subir para o **Avançado** quando quiser:

- bônus igual ao **valor de um atributo** (ex.: "+Carisma em Diplomacia");
- bônus por **fórmula** (ex.: `metade do nível, arredondado pra baixo`);
- bônus que **só vale sob uma condição** (usando armadura pesada, empunhando escudo…).

Tudo isso está no [post III — escolha do jogador, fórmulas e condições](/blog/homebrew-bonus-3-avancado). Antes dele, porém, vale entender os bônus ligados a armas, que têm campos próprios: é o [post II — combate](/blog/homebrew-bonus-2-combate).
