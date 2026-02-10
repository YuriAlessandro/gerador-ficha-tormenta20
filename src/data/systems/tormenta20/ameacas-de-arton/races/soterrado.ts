import Race from '../../../../../interfaces/Race';
import { getRandomItemFromArray } from '../../../../../functions/randomUtils';
import {
  getRaceDisplacement,
  getRaceSize,
  getDefaultSize,
  getDefaultDisplacement,
} from '../../races/functions/functions';
import { Atributo } from '../../atributos';
import HUMANO from '../../races/humano';

const SOTERRADO: Race = {
  name: 'Soterrado',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: -1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
    excludeFromAny: [Atributo.CONSTITUICAO],
  },
  faithProbability: {
    AHARADAK: 1,
    TENEBRA: 1,
    THWOR: 1,
  },
  setup: (race, allRaces) => {
    const validRaces = allRaces.filter(
      (element) =>
        element.name !== 'Golem' &&
        element.name !== 'Osteon' &&
        element.name !== 'Soterrado'
    );

    const randomNumber = Math.random();
    let oldRace = HUMANO;
    if (randomNumber < 0.2) {
      oldRace = getRandomItemFromArray(validRaces);
    }

    return {
      ...race,
      oldRace,
    };
  },
  getDisplacement(race) {
    if (race.oldRace) {
      return getRaceDisplacement(race.oldRace);
    }

    return getDefaultDisplacement(race);
  },
  getSize(race) {
    if (race.oldRace) {
      return getRaceSize(race.oldRace);
    }

    return getDefaultSize(race);
  },
  abilities: [
    {
      name: 'Abraço Gélido',
      description:
        'Você recebe +2 em testes para agarrar. Além disso, seus ataques desarmados e com armas naturais causam 2 pontos de dano de frio extras.',
    },
    {
      name: 'Esquife de Gelo',
      description:
        'Você recebe redução de corte e perfuração 5 e redução de frio 10. Entretanto, sofre 1 ponto de dano adicional por dado de dano de fogo.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Esquife de Gelo' },
          target: { type: 'DamageReduction', damageType: 'Corte' },
          modifier: { type: 'Fixed', value: 5 },
        },
        {
          source: { type: 'power', name: 'Esquife de Gelo' },
          target: { type: 'DamageReduction', damageType: 'Perfuração' },
          modifier: { type: 'Fixed', value: 5 },
        },
        {
          source: { type: 'power', name: 'Esquife de Gelo' },
          target: { type: 'DamageReduction', damageType: 'Frio' },
          modifier: { type: 'Fixed', value: 10 },
        },
      ],
    },
    {
      name: 'Memória Póstuma',
      description:
        'Você se torna treinado em uma perícia (não precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, você pode ser um soterrado de outra raça humanoide que não humano. Neste caso, você ganha uma habilidade dessa raça a sua escolha. Se a raça era de tamanho diferente de Médio, você também possui sua categoria de tamanho.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Memória Póstuma',
          },
          action: {
            type: 'special',
            specialAction: 'osteonMemoriaPostuma',
          },
        },
      ],
    },
    {
      name: 'Natureza Esquelética',
      description:
        'Você é uma criatura do tipo morto-vivo. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, habilidades mágicas de cura causam dano a você e você não se beneficia de itens ingeríveis (comidas, poções etc.), mas dano de trevas recupera seus PV.',
    },
  ],
};

export default SOTERRADO;
