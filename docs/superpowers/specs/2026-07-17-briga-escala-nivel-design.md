# Briga escala com o nível de Lutador

## Problema

A habilidade Briga (Lutador) tem um roll fixo de `1d6` em
`src/data/systems/tormenta20/classes/lutador.ts`. Pelas regras oficiais do
Tormenta 20, o dano desarmado aumenta com o nível de lutador, mas a ficha
gerada mostra `1d6` em qualquer nível.

## Regra oficial (tabela do Lutador)

| Nível de lutador  | Dano desarmado |
| ----------------- | -------------- |
| 1º–4º             | 1d6            |
| 5º–8º             | 1d8            |
| 9º–12º            | 1d10           |
| 13º–16º           | 1d12           |
| 17º–19º           | 2d8            |
| 20º (Dono da Rua) | 2d10           |

A variante Atleta reutiliza a habilidade Briga e tem a mesma progressão
(Corpo Ideal no 20º também leva a 2d10). Em multiclasse, vale o nível na
classe que concede a Briga, não o nível do personagem.

## Abordagem escolhida

Helper dedicado (`src/functions/powers/lutador-special.ts`), seguindo o
padrão de `frade-special.ts`:

- `getBrigaDice(classLevel)`: mapeia nível de classe → dado.
- `updateBrigaRolls(sheet)`: localiza a habilidade Briga em
  `sheet.classe.abilities`, resolve o nível via `getClassLevel(sheet, ability.sourceClassName ?? sheet.classe.name)` e substitui o `dice` do
  roll. Substitui os objetos (não muta in place) para não contaminar
  `classe.originalAbilities`. Retorna o novo dado quando houve mudança,
  para o level-up registrar um substep.

Pontos de chamada (onde as habilidades de classe são materializadas na ficha):

1. `applyClassAbilities` em `src/functions/general.ts` (geração aleatória).
2. `levelUp` em `src/functions/general.ts` (level-up aleatório) — com
   substep "Briga: dano desarmado aumenta para X" quando cruza um limiar.
3. `applyClassAbilities` em `src/functions/recalculateSheet.ts` (recálculo:
   edições, fichas históricas, level-up manual — que recalcula ao final).

## Alternativas descartadas

- **Mecanismo genérico de rolls por nível** (ex.: `diceByLevel` em
  `DiceRoll`): exigiria propagar contexto de nível para os componentes de
  exibição; invasivo demais para um único caso.
- **Habilidades "Briga melhorada" nos níveis 5/9/13/17**: não existe
  mecanismo de substituição de habilidade; geraria entradas duplicadas na
  ficha.

## Testes

`src/__tests__/functions/lutadorBriga.test.ts` (vitest):

- Tabela completa de `getBrigaDice` (limiares 1/5/9/13/17/20).
- `recalculateSheet` de um Lutador nível N ajusta o roll da Briga.
- Multiclasse: nível de classe (não de personagem) decide o dado.
- Fichas de outras classes não são afetadas.
