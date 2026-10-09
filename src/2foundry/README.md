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
  efeito **desligado** no item, que o jogador liga e desliga na aba de efeitos
  do ator: perícias, Defesa, atributos, RD, deslocamento, ataque e dano. Sai
  ligado se a opção estiver ativa na ficha no momento da exportação. Sem o
  submódulo premium o catálogo é um stub vazio e só as passivas são exportadas.
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
3. Atualizar `version.ts` e importar uma ficha de teste num mundo com a versão
   nova antes de publicar.
