import Race from '../../interfaces/Race';
import { getRandomItemFromArray } from '../../functions/randomUtils';
import { getRaceDisplacement, getRaceSize } from './functions/functions';
import { Atributo } from '../atributos';

const OSTEON: Race = {
  name: 'Osteon',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: -2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
    ],
    other: [],
    texts: [
      'Você recebe resistência a corte, frio e perfuração 5.',
      'Você se torna treinado em uma perícia (não precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, você pode ser um osteon de outra raça humanoide que não humano. Neste caso, você ganha uma habilidade dessa raça a sua escolha. Se a raça era de tamanho diferente de Médio, você também possui sua categoria de tamanho (NÃO INCLUSO, ESCOLHA O DESEJADO E ADICIONE MANUALMENTE NA SUA FICHA).',
      'Você é uma criatura do tipo morto-vivo. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, habilidades mágicas de cura causam dano a você e você não se beneficia de itens ingeríveis (comidas, poções etc.), mas dano de trevas recupera seus PV.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    TENEBRA: 1,
    THWOR: 1,
  },
  setup: (race, allRaces) => {
    const validRaces = allRaces.filter(
      (element) => element.name !== 'Golem' && element.name !== 'Osteon'
    );

    return {
      ...race,
      oldRace: getRandomItemFromArray(validRaces),
    };
  },
  getDisplacement(race) {
    if (race.oldRace) {
      return getRaceDisplacement(race.oldRace);
    }

    return getRaceDisplacement(race);
  },
  getSize(race) {
    if (race.oldRace) {
      return getRaceSize(race.oldRace);
    }

    return getRaceSize(race);
  },
};
export default OSTEON;
