import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import CORE_POWERS from '../../core/powers';
import AMEACAS_ARTON_POWERS from '../powers';
import Skill from '../../../../../interfaces/Skills';

// Combine all powers from Core and Ameaças de Arton for Natureza Orgânica
const ALL_GENERAL_POWERS = [
  ...Object.values(CORE_POWERS).flat(),
  ...Object.values(AMEACAS_ARTON_POWERS).flat(),
];

const yidishanAbilities: RaceAbility[] = [
  {
    name: 'Híbrido Mecânico',
    description:
      'Você é uma criatura do tipo construto. Recebe visão no escuro e imunidade a cansaço, efeitos metabólicos e veneno. Além disso, não precisa respirar, alimentar-se ou dormir, mas não se beneficia de itens da categoria alimentação e efeitos de cura mundana são reduzidos pela metade em você. Você precisa ficar inerte por 8 horas por dia para recarregar suas forças. Se fizer isso, recupera PV e PM por descanso em condições normais (yidishan não são afetados por condições boas ou ruins de descanso).',
  },
  {
    name: 'Natureza Orgânica',
    description:
      'Você se torna treinado em uma perícia (que não precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, você pode ser um yidishan de outra raça humanoide além de humano. Neste caso, você ganha uma habilidade dessa raça a sua escolha. Se a raça era de tamanho diferente de Médio, você também possui sua categoria de tamanho.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Natureza Orgânica' },
        action: {
          type: 'getGeneralPower',
          availablePowers: ALL_GENERAL_POWERS,
          pick: 1,
        },
      },
    ],
  },
  {
    name: 'Peças Metálicas',
    description:
      'As partes mecânicas que complementam seu corpo fornecem +2 na Defesa, mas impõem uma penalidade de armadura de –2.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Peças Metálicas' },
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
];

const YIDISHAN: Race = {
  name: 'Yidishan',
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: Atributo.CARISMA, mod: -2 },
    ],
  },
  faithProbability: {
    ARSENAL: 1,
    MEGALOKK: 1,
    NIMB: 1,
  },
  abilities: yidishanAbilities,
};

export default YIDISHAN;
