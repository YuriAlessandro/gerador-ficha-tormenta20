import { getRandomItemFromArray } from '../../functions/randomUtils';
import Race from '../../interfaces/Race';

const OSTEON: Race = {
  name: 'Osteon',
  habilites: {
    attrs: [
      { attr: 'Constituição', mod: -2 },
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
  setup(races) {
    const validRaces = races.filter(
      (race) => race.name !== 'Golem' && race.name !== 'Osteon'
    );
    this.oldRace = getRandomItemFromArray(validRaces);
  },
};
export default OSTEON;
