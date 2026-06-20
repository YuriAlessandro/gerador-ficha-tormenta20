---
title: "Homebrews #6 — Bônus passivos III: escolha do jogador, fórmulas e condições"
description: Os recursos avançados do construtor de bônus — deixar o jogador escolher perícia ou atributo (com limite por patamar), bônus por fórmula e bônus condicionais.
slug: homebrew-bonus-3-avancado
coverImage: <SUGESTÃO: arte abstrata de "ramificação/escolha" — caminhos divergentes ou runas condicionais se acendendo. Substituir por URL real antes de publicar.>
---

## Bloco 1

**Título do bloco:** Ligue o Avançado — com cuidado

Tudo neste post exige o editor em **Avançado**. Lembre-se do aviso: voltar para o Básico **remove** fórmulas (viram valor fixo), condições e opções de escolha. Então decida o modo antes de investir tempo numa habilidade complexa.

O avançado abre três famílias de recurso no construtor de bônus: deixar o **jogador escolher** o alvo, calcular o bônus por **fórmula**, e tornar o bônus **condicional**. Vamos a cada uma.

---

## Bloco 2

**Título do bloco:** Jogador escolhe — perícia e atributo

Nos alvos **Atributo** e **Perícia**, aparece o checkbox **"Jogador escolhe"**. Em vez de você fixar qual perícia/atributo recebe o bônus, quem decide é o jogador, na criação do personagem.

- **Perícia + "Jogador escolhe"** → surge **"Quantas"** (1 a 10): o jogador escolhe N perícias para receber o bônus. É o padrão de "treine 2 perícias à sua escolha".
- **Atributo + "Jogador escolhe"** → surge **"Quantos"** (1 a 6) e o checkbox **"Uma vez por patamar"**.

Esse **"Uma vez por patamar"** é exatamente o aumento de atributo do Bardo: o jogador pode aplicar a mesma escolha apenas uma vez por patamar (Iniciante, Veterano, Campeão, Lenda), evitando empilhar tudo no mesmo atributo. Marque-o quando a habilidade conceder aumentos repetidos ao longo dos níveis.

---

## Bloco 3

**Título do bloco:** Fórmula por nível

Quando "valor fixo" e "escala por nível" não bastam, o campo **Como calcula** oferece, no avançado:

- **Valor de um atributo** — o bônus é igual a um atributo (ex.: +Carisma).
- **Atributo limitado por nível** — igual ao atributo, mas com teto pelo nível.
- **Fórmula por nível** — você escreve uma expressão matemática.

Na fórmula, use a variável **`{level}`** (o nível do personagem). Exemplos válidos: `{level}`, `Math.floor({level} / 2)`, `Math.ceil({level} / 4) + 1`. São permitidas as quatro operações, parênteses e as funções `Math.floor`, `Math.ceil`, `Math.round`, `Math.abs`, `Math.min`, `Math.max`. Qualquer coisa fora dessa lista é rejeitada por segurança — o campo fica destacado em vermelho e o homebrew não salva. Os detalhes da whitelist estão no [post de boas práticas e fórmulas](/blog/homebrew-boas-praticas).

---

## Bloco 4

**Título do bloco:** Bônus condicionais

No avançado, cada bônus pode ganhar uma **condição**: ele só vale quando a condição for satisfeita. É como você modela "+2 em Defesa **enquanto usar armadura pesada**" ou "+1 no dano **empunhando arma de duas mãos**".

O construtor de condições aceita cláusulas como:

- Usando armadura pesada / qualquer armadura
- Empunhando escudo / arma de duas mãos / corpo a corpo / à distância / duas armas
- Nível do personagem ou valor de atributo (com comparação ≥, ≤, =)
- É da classe / da raça X, é devoto de Y, possui o poder/perícia/proficiência Z

Você pode combinar várias cláusulas com **Todas** (E) ou **Qualquer** (OU), e negar uma cláusula individual. Assim dá para expressar regras bem específicas sem código.

---

## Bloco 5

**Título do bloco:** Um exemplo avançado completo

A habilidade de classe **"Guarda Defensiva"** (nível 3): *enquanto empunha escudo, o personagem recebe Defesa igual à metade do nível.*

1. Editor em **Avançado**.
2. Alvo **Defesa**, **Como calcula → Fórmula por nível**, fórmula `Math.floor({level} / 2)`.
3. Abra a **condição** e adicione **"Empunhando escudo"**.

Pronto: o bônus aparece e desaparece conforme o personagem equipa ou guarda o escudo, e cresce sozinho a cada dois níveis. Esse é o tipo de coisa que o avançado torna possível — mas, de novo: só ligue o avançado quando o conceito realmente pedir.

A seguir, duas peças curtas e úteis que aparecem em vários editores: [Rolagens de dados](/blog/homebrew-rolagens) e [Efeitos ativos](/blog/homebrew-efeitos-ativos).
