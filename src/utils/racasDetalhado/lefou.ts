import { getRandomItemFromArray } from '../../functions/utils';
import { Race } from '../../interfaces/CharacterSheet';
import nomes from '../nomes';

const LEFOU: Race = {
  name: 'Lefou',
  habilites: {
    attrs: [
      { attr: 'Carisma', mod: -2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
    ],
    other: [],
    texts: [
      'Você é uma criatura do tipo monstro e recebe +5 em testes de resistência contra efeitos causados por lefeu e pela Tormenta.',
      'Todo lefou possui defeitos físicos que, embora desagradáveis, conferem certas vantagens. Você recebe +2 em duas perícias a sua escolha. Cada um desses bônus conta como um poder da Tormenta. Você pode trocar um desses bônus por um poder da Tormenta a sua escolha. Esta habilidade não causa perda de Carisma.',
    ],
  },
  getName(sex: string) {
    const possibleFirstNames = nomes[this.name].primeiroNome as string[];
    const lefouSecondNames = nomes[this.name].segundoNome as {
      [key: string]: string[];
    };
    const possibleSecondNames = lefouSecondNames[sex];

    const firstName = getRandomItemFromArray<string>(possibleFirstNames);
    const lastName = getRandomItemFromArray<string>(possibleSecondNames);

    return `${firstName} ${lastName}`;
  },
};

export default LEFOU;
