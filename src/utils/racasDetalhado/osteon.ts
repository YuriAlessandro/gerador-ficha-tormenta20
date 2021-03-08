import { generateRandomName } from '../../functions/utils';
import { Race } from '../../interfaces/CharacterSheet';

export interface Osteon extends Race {
  oldRace?: Race;
  sortOldRace: (oldRaceName?: string | undefined) => Race;
  setup: (allRaces: Race[], oldRaceName?: string) => void;
  allowedOldRaces: Race[];
}

function getRandomOldRace(allowedOldRaces: Race[]) {
  return allowedOldRaces[Math.floor(Math.random() * allowedOldRaces.length)];
}

const OSTEON: Osteon = {
  name: 'Osteon',
  allowedOldRaces: [],
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
  sortOldRace(oldRaceName) {
    if (oldRaceName) {
      const foundRace = this.allowedOldRaces.find(
        (race) => race.name === oldRaceName
      );

      return foundRace || getRandomOldRace(this.allowedOldRaces);
    }

    return getRandomOldRace(this.allowedOldRaces);
  },
  getName(sex) {
    if (this.oldRace) {
      return generateRandomName(this.oldRace, sex);
    }

    this.oldRace = this.sortOldRace();

    return generateRandomName(this.oldRace, sex);
  },
  setup(allRaces: Race[], oldRaceName) {
    this.allowedOldRaces = allRaces.filter(
      (raca) => raca.name !== 'Osteon' && raca.name !== 'Golem'
    );

    this.oldRace = this.sortOldRace(oldRaceName);
  },
};
export default OSTEON;
