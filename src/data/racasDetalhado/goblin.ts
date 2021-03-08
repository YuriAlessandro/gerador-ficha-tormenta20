import Race from '../../interfaces/Race';

const GOBLIN: Race = {
  name: 'Goblin',
  habilites: {
    attrs: [
      { attr: 'Destreza', mod: 4 },
      { attr: 'Inteligência', mod: 2 },
      { attr: 'Carisma', mod: -2 },
    ],
    other: [],
    texts: [
      'Você não sofre penalidades em testes de perícia por não usar kits. Se usar o kit, recebe +2 no teste de perícia.',
      'Você recebe visão no escuro e deslocamento de escalada igual ao seu deslocamento terrestre.',
      'Seu tamanho é Pequeno (veja a página 106), mas seu deslocamento se mantém 9m. Apesar de pequenos, goblins são rápidos.',
      'Você recebe +2 em Fortitude e sua recuperação de PV e PM nunca é inferior ao seu nível.',
    ],
  },
};

export default GOBLIN;
