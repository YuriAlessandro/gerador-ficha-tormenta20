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
| Poderes de todas as origens (`collectSheetPowers`)    | itens `poder` com o texto e as rolagens da ficha                                             |
| Magias                                                | itens `magia`; cada aprimoramento é um efeito de uso com o custo em PM                       |
| Mochila                                               | itens `arma` (ataque, dano, crítico), `equipamento`, `consumivel` e `tesouro`                |

Poderes e magias saem com texto, custo, alcance, duração, resistência e
rolagens, mas **sem efeitos mecânicos automáticos** (o bônus de um poder passivo
não é aplicado sozinho pelo Foundry). Os totais da ficha — PV, PM, Defesa,
atributos — já incluem esses bônus e são exportados prontos.

## Acompanhando versões novas do sistema

1. Ler o `CHANGELOG.md` do sistema procurando mudanças de schema (campos
   renomeados, migrações). O que o sistema migra em mundos existentes não é
   migrado em documentos importados.
2. Conferir as chaves de `enums.ts` contra `module/config/T20.js` e o formato de
   efeito de `effects.ts` contra `module/data/effect/base.mjs`.
3. Atualizar `version.ts` e importar uma ficha de teste num mundo com a versão
   nova antes de publicar.
