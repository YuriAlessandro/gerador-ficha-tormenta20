import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import {
  GeneralPower,
  GeneralPowerType,
} from '../../../../../interfaces/Poderes';
import tormentaPowers from '../../powers/tormentaPowers';

// Poder fake de Tormenta para Couraça Rúbea
const COURACA_RUBEA_POWER: GeneralPower = {
  type: GeneralPowerType.TORMENTA,
  name: 'Couraça Rúbea (Kaijin)',
  description:
    'Você recebe redução de dano 2. Sua couraça conta como um poder da Tormenta, exceto por perda de Carisma.',
  requirements: [],
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
const DISFORME_POWER: GeneralPower = {
  type: GeneralPowerType.TORMENTA,
  name: 'Disforme (Kaijin)',
  description: DISFORME_DESCRIPTION,
  requirements: [],
};

/**
 * Fichas salvas embutem a cópia da habilidade/poder da época em que a raça foi
 * escolhida, e abrir uma ficha não dispara recálculo — então correções de texto
 * não alcançariam quem já é Kaijin. Exportado para que `normalizeSheet`
 * refresque essas cópias (`raca.abilities` e o poder falso em `generalPowers`).
 */
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
    name: 'Terror Vivo',
    description:
      'Você pode usar Força como atributo-chave de Intimidação (em vez de Carisma) e recebe um poder da Tormenta à sua escolha, que não conta para perda de Carisma.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Terror Vivo' },
        action: {
          type: 'getGeneralPower',
          availablePowers: Object.values(tormentaPowers),
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
