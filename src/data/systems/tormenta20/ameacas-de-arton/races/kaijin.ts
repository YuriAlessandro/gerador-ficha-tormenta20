import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import {
  GeneralPower,
  GeneralPowerType,
} from '../../../../../interfaces/Poderes';
import tormentaPowers from '../../powers/tormentaPowers';

// Poder fake de Tormenta para Couraça Rúbea
export const COURACA_RUBEA_POWER: GeneralPower = {
  type: GeneralPowerType.TORMENTA,
  name: 'Couraça Rúbea (Kaijin)',
  description:
    'Você recebe redução de dano 2. Sua couraça conta como um poder da Tormenta, exceto por perda de Carisma.',
  requirements: [],
  // "exceto por perda de Carisma" — sem esta flag todo Kaijin perdia Carisma
  // por uma habilidade que o livro isenta.
  tormentaCountExcludesCharisma: true,
  sheetBonuses: [
    {
      source: { type: 'power', name: 'Couraça Rúbea (Kaijin)' },
      target: { type: 'DamageReduction', damageType: 'Geral' },
      modifier: { type: 'Fixed', value: 2 },
    },
  ],
};

// Texto de Ameaças de Arton. Fica em uma constante porque o mesmo texto aparece
// na habilidade de raça e no poder falso de Tormenta abaixo — antes eram duas
// cópias, e a de Disforme dizia "não pode empunhar nem vestir itens mágicos ou
// especialmente adaptados", invertendo o sentido da regra (o livro PERMITE
// justamente esses itens).
const DISFORME_DESCRIPTION =
  'Por sua anatomia anômala, você não pode empunhar nem vestir itens, a menos que sejam mágicos ou especialmente adaptados para você (o que demora um dia e custa 50% do preço do item, sem contar melhorias). Seus itens iniciais, e aqueles recebidos por sua origem ou habilidades, são adaptados para você. Esta habilidade conta como um poder da Tormenta, exceto para perda de Carisma.';

const CRIA_DE_TORMENTA_DESCRIPTION =
  'Você é uma criatura do tipo monstro e recebe +5 em testes de resistência contra efeitos causados por lefeu e pela Tormenta. Além disso, efeitos da Tormenta que não afetem lefou também não afetam você.';

// Poder fake de Tormenta para Disforme (conta como poder da Tormenta, exceto por perda de Carisma)
export const DISFORME_POWER: GeneralPower = {
  type: GeneralPowerType.TORMENTA,
  name: 'Disforme (Kaijin)',
  description: DISFORME_DESCRIPTION,
  requirements: [],
  // Ver `COURACA_RUBEA_POWER`: "exceto para perda de Carisma".
  tormentaCountExcludesCharisma: true,
};

/**
 * Fichas salvas embutem a cópia da habilidade/poder da época em que a raça foi
 * escolhida, e abrir uma ficha não dispara recálculo — então correções de texto
 * não alcançariam quem já é Kaijin. Exportado para que `normalizeSheet`
 * refresque essas cópias (`raca.abilities` e o poder falso em `generalPowers`).
 */
/**
 * Poderes falsos do Kaijin que "contam como um poder da Tormenta, EXCETO para
 * perda de Carisma". A ressalva estava só no texto — o dado não setava
 * `tormentaCountExcludesCharisma`, então todo Kaijin perdia Carisma por elas.
 * Como a flag é campo novo, fichas antigas embutem a cópia sem ela: exportado
 * para que `normalizeSheet` carimbe a ressalva nessas cópias.
 */
export const KAIJIN_CHARISMA_EXEMPT_POWER_NAMES = [
  'Couraça Rúbea (Kaijin)',
  'Disforme (Kaijin)',
];

/** Habilidade de raça que concede o poder da Tormenta isento de Carisma. */
export const TERROR_VIVO_ABILITY_NAME = 'Terror Vivo';

/**
 * Catálogo oferecido pelo Terror Vivo: "recebe um poder da Tormenta à sua
 * escolha, QUE NÃO CONTA PARA PERDA DE CARISMA".
 *
 * Ao contrário de Couraça Rúbea e Disforme, aqui o jogador escolhe um poder de
 * verdade — não dá para montar um poder falso isento. A ressalva vai numa CÓPIA
 * de cada poder do catálogo: `getGeneralPower` empurra o objeto oferecido direto
 * para `generalPowers` (tanto no sorteio quanto na escolha manual, que lê este
 * mesmo array), então oferecer o objeto cru do catálogo fazia o poder escolhido
 * chegar na ficha sem a flag — e cobrar Carisma.
 *
 * Cópia rasa de propósito: ninguém muta `sheetBonuses`/`rolls` no lugar (o
 * motor sempre substitui o objeto do poder), e clonar fundo aqui congelaria o
 * conteúdo no momento do import — o oposto do que o refresh do `sheetNormalizer`
 * faz por nome.
 */
export const TERROR_VIVO_POWERS: GeneralPower[] = Object.values(
  tormentaPowers
).map((power) => ({ ...power, tormentaCountExcludesCharisma: true }));

export const KAIJIN_REFRESHED_DESCRIPTIONS: Record<string, string> = {
  Disforme: DISFORME_DESCRIPTION,
  'Disforme (Kaijin)': DISFORME_DESCRIPTION,
  'Cria de Tormenta': CRIA_DE_TORMENTA_DESCRIPTION,
};

const kaijinAbilities: RaceAbility[] = [
  {
    name: 'Couraça Rúbea',
    description: 'Aplica o poder Couraça Rúbea.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Couraça Rúbea' },
        action: {
          type: 'getGeneralPower',
          availablePowers: [COURACA_RUBEA_POWER],
          pick: 1,
        },
      },
    ],
  },
  {
    name: 'Cria de Tormenta',
    description: CRIA_DE_TORMENTA_DESCRIPTION,
  },
  {
    name: 'Disforme',
    description: DISFORME_DESCRIPTION,
    sheetActions: [
      {
        source: { type: 'power', name: 'Disforme' },
        action: {
          type: 'getGeneralPower',
          availablePowers: [DISFORME_POWER],
          pick: 1,
        },
      },
    ],
  },
  {
    name: TERROR_VIVO_ABILITY_NAME,
    description:
      'Você pode usar Força como atributo-chave de Intimidação (em vez de Carisma) e recebe um poder da Tormenta à sua escolha, que não conta para perda de Carisma.',
    sheetActions: [
      {
        source: { type: 'power', name: TERROR_VIVO_ABILITY_NAME },
        action: {
          type: 'getGeneralPower',
          availablePowers: TERROR_VIVO_POWERS,
          pick: 1,
        },
      },
    ],
  },
  {
    name: 'Longevidade',
    description: 'Normal.',
  },
];

const KAIJIN: Race = {
  name: 'Kaijin',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 2 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: Atributo.CARISMA, mod: -2 },
    ],
  },
  faithProbability: {
    NIMB: 1,
    SSZZAAS: 1,
    TENEBRA: 1,
  },
  abilities: kaijinAbilities,
};

export default KAIJIN;
