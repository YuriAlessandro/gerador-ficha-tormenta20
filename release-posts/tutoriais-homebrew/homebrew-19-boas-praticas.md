---
title: "Homebrews #19 — Boas práticas, fórmulas seguras e checklist final"
description: O fechamento da série de homebrews da Fichas de Nimb — referências de balanceamento, a whitelist de fórmulas, armadilhas comuns e um checklist antes de publicar.
slug: homebrew-boas-praticas
coverImage: <SUGESTÃO: arte de uma balança/equilíbrio arcano pesando poder e moderação, ou um checklist iluminado. Substituir por URL real antes de publicar.>
---

## Bloco 1

**Título do bloco:** Balanceamento: compare, sempre

A melhor ferramenta de balanceamento é a comparação. Antes de inventar números, **olhe o conteúdo oficial análogo**:

- **PV/PM de classe:** posicione a sua entre as oficiais. Combatentes puros têm PV inicial/por nível altos e PM baixo; conjuradores, o oposto; híbridos no meio.
- **Bônus de habilidade:** +2 fixo é um bônus "forte" de baixo nível em Tormenta. Desconfie de qualquer coisa muito acima disso sem condição ou custo.
- **Efeitos ativos:** cobre PM. Um buff que dá muito por pouco PM é suspeito — use os tiers para escalar custo junto com o efeito.

Se você não consegue apontar uma peça oficial parecida com a sua em poder, provavelmente está forte ou fraco demais.

---

## Bloco 2

**Título do bloco:** A whitelist de fórmulas, em detalhe

As **fórmulas por nível** (no [construtor de bônus avançado](/blog/homebrew-bonus-3-avancado)) passam por uma verificação de segurança. Como o conteúdo é da comunidade, só uma lista branca de elementos é aceita:

- **Números** e decimais; operadores `+ - * / %`; **parênteses**.
- A variável **`{level}`** (e `{classLevel}`), substituída pelo nível.
- As funções: `Math.floor`, `Math.ceil`, `Math.round`, `Math.abs`, `Math.min`, `Math.max`.

Qualquer outra coisa — letras soltas, outras funções, aspas, colchetes — é **rejeitada** ("Fórmula reprovada pela whitelist de segurança"), o campo fica vermelho e o homebrew **não salva**. Exemplos válidos: `Math.floor({level} / 2)`, `Math.min({level}, 10)`, `2 + Math.ceil({level} / 4)`. Não é limitação à toa: é o que mantém o conteúdo da comunidade seguro para todos.

---

## Bloco 3

**Título do bloco:** Armadilhas comuns

Erros que pegam quase todo mundo na primeira vez:

- **Voltar de Avançado para Básico** e perder fórmulas/condições/opções de escolha. Decida o modo antes de investir tempo.
- **Confundir passivo com ativo.** Se vale sempre, é [passivo](/blog/homebrew-bonus-1-fundamentos); se o jogador liga/desliga, é [efeito ativo](/blog/homebrew-efeitos-ativos).
- **Confundir habilidade automática com poder de classe.** Todo mundo tem → automática; cada um escolhe → poder. ([Classes II](/blog/homebrew-classes-2-poderes))
- **Pôr o efeito mecânico só na descrição.** Texto não mexe nos números — o que altera a ficha é o **bônus**. A descrição é para o humano ler.
- **Esquecer de republicar** depois de corrigir algo já publicado. ([Publicação](/blog/homebrew-publicar-manter))

---

## Bloco 4

**Título do bloco:** Checklist antes de publicar

Antes de soltar um homebrew no mundo, rode esta lista:

1. **Nome e descrição** preenchidos e revisados (a descrição aceita markdown — capriche).
2. **Números conferidos** contra conteúdo oficial análogo.
3. **Bônus no lugar certo** (passivo × ativo; alvo correto; escopo de arma certo).
4. **[Ficha de teste](/blog/homebrew-ficha-de-teste)** gerada em pelo menos dois níveis diferentes, sem erros e com os números saindo como esperado.
5. **Visibilidade** definida conforme a intenção (público / não listado / privado).
6. **Changelog** da versão escrito ao publicar — descreva o que mudou (aparece no histórico de versões; nas atualizações, detalhe as alterações em vez de deixar o texto padrão).
7. **Direitos autorais**: o conteúdo é seu ou você tem direito de distribuí-lo; declaração de IA marcada se for o caso.
8. Para **coleções**: todos os membros já publicados e selecionados.

---

## Bloco 5

**Título do bloco:** Fim da série — agora é com você

Você passou por tudo: os [fundamentos](/blog/homebrew-guia-visao-geral), o [editor de habilidades](/blog/homebrew-habilidades), o trio de [bônus](/blog/homebrew-bonus-1-fundamentos), as peças reutilizáveis, as [classes](/blog/homebrew-classes-1-esqueleto) em quatro partes, os [pacotes](/blog/homebrew-pacotes-magias) e [coleções](/blog/homebrew-colecoes), o [teste](/blog/homebrew-ficha-de-teste) e a [publicação](/blog/homebrew-publicar-manter).

O melhor jeito de fixar é **fazendo**: comece por uma raça simples, gere uma ficha de teste, ative, e vá subindo a ambição. E quando publicar algo legal, fique de olho no **fórum** do seu homebrew — o feedback da comunidade é o que transforma uma boa ideia em conteúdo afiado.

Bons builds, e que suas criações encontrem boas mesas em Arton.
