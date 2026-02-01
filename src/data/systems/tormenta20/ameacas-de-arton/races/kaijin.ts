import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import {
  GeneralPower,
  GeneralPowerType,
} from '../../../../../interfaces/Poderes';

// Poder fake de Tormenta para Couraça Rúbea
const COURACA_RUBEA_POWER: GeneralPower = {
  type: GeneralPowerType.TORMENTA,
  name: 'Couraça Rúbea (Kaijin)',
  description:
    'Você recebe redução de dano 2. Sua couraça conta como um poder da Tormenta, exceto por perda de Carisma.',
  requirements: [],
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
    description:
      'Você é uma criatura do tipo monstro e recebe +5 em testes de resistência contra efeitos causados pela Tormenta. Além disso, efeitos da Tormenta que não afetam lefou também não afetam você.',
  },
  {
    name: 'Disforme',
    description:
      'Por sua anatomia anômala, você não pode emputar nem vestir itens mágicos ou especialmente adaptados para você (que demora um dia e custa 50% do preço do item, sem contar melhorias). Seus itens iniciais, e aqueles recebidos por sua origem ou habilidades, são adaptados para você. Esta habilidade conta como um poder da Tormenta, exceto para perda de Carisma.',
  },
  {
    name: 'Terror Vivo',
    description:
      'Você pode usar Força como atributo-chave de Intimidação (em vez de Carisma) e recebe um poder da Tormenta à sua escolha, que não conta para perda de Carisma.',
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
