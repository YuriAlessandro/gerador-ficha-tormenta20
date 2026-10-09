# Exportação para o Foundry VTT

Converte uma ficha (ou ameaça) em um ator do sistema
[Tormenta20](https://gitlab.com/vizael/Tormenta20) do Foundry VTT, para ser
usado em **Importar Dados** no ator.

Tudo que vai no JSON é montado a partir dos dados da própria ficha. Nada do
compêndio do sistema é copiado: do sistema só usamos o **formato** (nomes de
campos e chaves de enum), que é o que torna o arquivo importável.

A versão alvo está em [`version.ts`](version.ts). O sistema 1.6.x só roda no
Foundry v14 e **não migra documentos importados** em formato antigo — o JSON
precisa sair exatamente no schema da versão alvo.

## O que é exportado

| Parte da ficha                                        | No Foundry                                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Atributos, perícias treinadas, ofícios                | `system.atributos`, `system.pericias` (ofícios sem chave própria viram `ofi1`…`ofi9`)        |
| PV e PM (máximo, atual, temporário)                   | `system.attributes.pv/pm`, com o cálculo manual ligado (`flags.tormenta20.lvlconfig.manual`) |
| Defesa                                                | base + atributo; o Foundry soma armadura/escudo equipados e `outros` fecha a conta           |
| Deslocamentos, sentidos, tamanho, carga, dinheiro, RD | `system.attributes.*`, `system.tracos.*`, `system.dinheiro`                                  |
| Proficiências                                         | `system.tracos.profArmas/profArmaduras`                                                      |
| Classe(s)                                             | um item `classe` por classe (multiclasse)                                                    |
| Poderes de todas as origens (`collectSheetPowers`)    | itens `poder` com o texto, as rolagens e os efeitos da ficha                                 |
| Magias                                                | itens `magia`; cada aprimoramento é um efeito de uso com o custo em PM                       |
| Mochila                                               | itens `arma` (ataque, dano, crítico), `equipamento`, `consumivel` e `tesouro`                |

## Automações

As automações também são nossas (`automations.ts`), convertidas dos dados que a
ficha já usa para calcular seus totais:

- **Passivas** — `sheet.sheetBonuses` (bônus permanentes de poderes, raça,
  itens, ajustes manuais). Cada fonte vira um efeito sempre ligado com os bônus
  de **perícia** e **Defesa**; o efeito fica no item do poder ou, quando a fonte
  não é um poder exportado, no próprio ator. Os demais alvos (PV, PM, atributos,
  deslocamento, RD) já saem como total pronto, e bônus permanentes de ataque e
  dano já estão nos números das armas.
- **Ativáveis** — o catálogo de efeitos ativos (`@/premium/data/activePowers`, o
  do botão "Usar" da ficha). Cada opção de uso de um poder ou magia vira um
  efeito **desligado no ator**, que aparece em "Efeitos Inativos" na aba de
  Efeitos do personagem com a caixa de ligar; ligado, passa para "Efeitos
  Passivos" e entra nos totais. Cobre perícias, Defesa, atributos, RD,
  deslocamento, ataque e dano, e sai ligado se a opção estiver ativa na ficha no
  momento da exportação. Sem o submódulo premium o catálogo é um stub vazio e só
  as passivas são exportadas.

  Esses efeitos ficam no **ator**, não no item do poder, de propósito: a ficha de
  personagem do sistema monta a lista de efeitos só com `actor.effects`, e a 1.6
  deixou de criar a cópia transferida do efeito do item — no item, o jogador só
  os veria abrindo o próprio poder. Três cuidados em cima disso:

  - Bônus que vale para todas as perícias sai como uma única mudança com o
    curinga `system.pericias.*.bonus`, em vez de uma por perícia. Além de deixar
    o efeito legível, é assim que os **ofícios** recebem o bônus: eles não têm
    chave fixa no sistema (`ofi1`…`ofi9`), e o curinga alcança todos.
  - Opções que geram exatamente as mesmas mudanças viram um efeito só — senão o
    jogador veria duas linhas de nomes diferentes fazendo a mesma coisa (os
    passos de dano de Armamento da Natureza, por exemplo, não têm equivalente).
  - O texto do efeito traz a fonte, o custo em PM, os PV/PM temporários que
    precisam ser aplicados à mão e um aviso quando parte dos bônus não é
    automatizável. Opções do mesmo poder são alternativas, e o texto diz isso —
    o Foundry não impede ligar duas.

- **De uso, escritas à mão** — `onUseAutomations.ts`: poderes cuja regra não é
  um bônus numérico e por isso não existe como dado na ficha (ex.: Esgrima
  Mágica troca Luta por Atuação no ataque). Cada um vira uma opção na janela de
  rolagem do Foundry. É uma tabela mantida manualmente, poder a poder.
- **Aprimoramentos de magia** — efeitos de uso com o custo em PM; os que têm
  bônus de dano estruturado alteram a rolagem.

Os valores são resolvidos na exportação (nível e atributos atuais). Subir de
nível no Foundry não os recalcula: é reexportar a ficha.

O que não tem dado estruturado na ficha (bônus restritos a uma arma específica,
efeitos puramente descritivos) vai só como texto.

## Acompanhando versões novas do sistema

1. Ler o `CHANGELOG.md` do sistema procurando mudanças de schema (campos
   renomeados, migrações). O que o sistema migra em mundos existentes não é
   migrado em documentos importados.
2. Conferir as chaves de `enums.ts` contra `module/config/T20.js` e o formato de
   efeito de `effects.ts` contra `module/data/effect/base.mjs`.
3. Conferir os campos do ator e dos itens contra **`module/dataModel/`** — é lá
   que moram os DataModels registrados, os que validam na importação.
   `module/data/actor` e `module/data/item` parecem o lugar certo mas são uma
   reescrita em andamento, com schemas vazios. (A exceção é o efeito, cujo
   modelo registrado é o de `module/data/effect/`.)
4. Conferir a tabela `SKILL_DEFINITIONS` de `skills.ts` contra `T20.pericias`.
   Ela espelha `st`/`pda`/`size`, que são constantes da regra: como emitimos o
   objeto da perícia inteiro, o valor inicial do sistema não se aplica e um
   desvio aqui tira a penalidade de armadura e o "somente treinado" sem erro
   nenhum.
5. Atualizar `version.ts` e importar uma ficha de teste num mundo com a versão
   nova antes de publicar.
