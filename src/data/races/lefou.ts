import Race from '../../interfaces/Race';

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
  faithProbability: {
    AHARADAK: 2,
    THWOR: 1,
  },
};

export default LEFOU;
