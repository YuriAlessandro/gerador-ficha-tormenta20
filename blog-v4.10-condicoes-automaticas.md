# Tormenta 20 em tempo real: Condições Automáticas chegaram na versão 4.10

A segunda feature mais votada pelos apoiadores finalmente saiu do forno. Seguindo o ciclo da Multiclasse, a **super feature** desta atualização é o sistema de **Condições (Status Effects)** — e ele foi construído para tirar do seu caderno de rascunho toda aquela contabilidade de modificadores que o T20 adora empilhar em combate.

Este post quebra a feature em blocos para você ver exatamente o que mudou na ficha e na mesa virtual.

---

## 33 condições oficiais, direto na ficha

O catálogo completo das **33 condições oficiais** do Tormenta 20 agora vive dentro do gerador: Abalado, Cego, Caído, Debilitado, Desprevenido, Paralisado, Petrificado, Envenenado, Atordoado, Apavorado, Enjoado, Fascinado, Fatigado, Enredado, Exausto, Frágil, Imóvel, Inconsciente, Indefeso, Lento, Ofuscado, Pasmo, Sangrando, Sob Pressão, Surpreendido, Surdo, Vulnerável — e todas as demais previstas no livro.

Ao aplicar uma condição, você não abre uma aba separada nem digita um "-2" à mão no atributo: a ficha **recalcula automaticamente** Defesa, perícias, atributos, ataques e deslocamento. Cada valor afetado ganha um destaque visual com ícone, cor da categoria e um tooltip explicando qual condição está causando aquela mudança.

![Ficha com condições ativas mostrando Defesa, deslocamento e perícias com destaque visual](images/blog/v4.10/conditions-sheet-highlights.png)

---

## Cascata inteligente: quem contém, ativa

Várias condições do T20 "contêm" outras — Cego implica Desprevenido e Lento, Paralisado implica Imóvel e Indefeso, Petrificado implica Inconsciente, e por aí vai. Marcar cada derivada manualmente toda vez é receita para esquecer alguma.

Agora, quando você aplica uma condição-raiz, as **derivadas entram automaticamente** e aparecem marcadas como implícitas (um selo visual deixa claro que elas vieram junto). Ao remover a raiz, as implícitas saem juntas — sem lixo sobrando na ficha. Mestre não precisa mais lembrar quais são os combos oficiais; o sistema cuida disso.

![Cascata de condições: aplicar Cego adiciona Desprevenido e Lento automaticamente](images/blog/v4.10/conditions-cascade.png)

---

## Regra oficial de não-acúmulo

Uma das sutilezas do T20 é que **condições com o mesmo efeito não empilham**. Desprevenido dá −5 de Defesa, Vulnerável dá −2 de Defesa — juntas, o resultado é −5, não −7. A regra vale para qualquer penalidade sobreposta.

O gerador aplica essa lógica automaticamente: ao agregar os modificadores ativos, ele sempre usa a **penalidade mais severa por alvo** e descarta as demais. Você pode empilhar o que quiser na ficha sem medo de inflar penalidades indevidamente — o valor final que aparece é o mesmo que você calcularia na mão seguindo o livro.

![Exemplo de não-acúmulo: Desprevenido + Vulnerável aplicando −5 em vez de −7](images/blog/v4.10/conditions-no-stacking.png)

---

## Mestre no controle: condições na mesa virtual

As condições não ficaram presas à ficha individual — elas estão plugadas direto na **mesa virtual**. Na tela de combate, o mestre tem um botão por linha que abre o gerenciador de condições de **qualquer combatente**: jogador, ameaça importada ou combatente personalizado.

Quando o mestre aplica uma condição no personagem de um jogador, a mudança **propaga via socket** para a ficha daquele jogador em tempo real. Nada de mensagens no chat pedindo pro jogador "adicionar −2 aí", nada de divergência entre o que o mestre vê e o que o jogador vê. A ficha no celular do jogador atualiza sozinha, com todos os recálculos aplicados.

![Tela de combate com botão de condições em cada combatente da iniciativa](images/blog/v4.10/conditions-virtual-table.png)

---

## Lembretes no início de cada turno

O maior inimigo das condições em jogos de RPG não é a regra — é **esquecer** que elas estão ativas. Passaram três rodadas, o bárbaro continua Abalado e ninguém lembrou de aplicar o −2.

Por isso, no começo de cada turno, um **popup lembra o mestre e o dono da ficha** de todas as condições ativas no combatente da vez, com nome e texto integral de cada uma. E, para manter visibilidade constante sem precisar abrir nada, cada combatente na lista de iniciativa ganha **badges** com as condições ativas — você bate o olho e sabe o estado da mesa inteira.

![Popup de início de turno listando condições ativas e badges na iniciativa](images/blog/v4.10/conditions-turn-reminder.png)

---

## Exclusiva para apoiadores

Como toda super feature de ciclo, as Condições Automáticas são **exclusivas para apoiadores** (Aventureiros, Paladinos e Nimbianos). Se você usa a ferramenta com frequência em mesas reais, o retorno em tempo economizado por sessão é imediato — e o apoio mantém o projeto rodando para toda a comunidade.

![Selo de apoiador e acesso à feature de condições](images/blog/v4.10/conditions-supporter.png)

---

## E tem mais na 4.10

Além das condições, a 4.10 trouxe um pacote sólido de melhorias e correções:

- **Edição de posts e comentários no fórum**, com indicador discreto de "editado" e suporte a menções.
- **Fichas próprias do mestre na mesa virtual** — útil para rodar a ferramenta solo, sem depender de jogadores usando o sistema.
- **Melhor Amigo no multiclasse de Treinador** pelo Level Up, com criação dedicada e gestão de múltiplos parceiros (abas no modal para alternar entre eles).
- **Importar Ameaça ou adicionar Jogador** ao entrar com um combatente novo no meio do encontro.
- Correções em **Precisão Furtiva, Cavaleiro Bandido, Explorar Fraqueza, Impostor, Ligação Telepática, Armas da Ambição, Golem Desperto** e nas habilidades de classe visíveis no editor de poderes de personagens multiclasse.

A lista completa, como sempre, está no [Changelog](/changelog).

---

*Bons jogos e que suas condições durem só uma rodada.*
