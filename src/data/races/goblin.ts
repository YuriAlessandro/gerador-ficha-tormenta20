import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

const GOBLIN: Race = {
  name: 'Goblin',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 4 },
      { attr: Atributo.INTELIGENCIA, mod: 2 },
      { attr: Atributo.CARISMA, mod: -2 },
    ],
    texts: [
      'Você não sofre penalidades em testes de perícia por não usar kits. Se usar o kit, recebe +2 no teste de perícia.',
      'Você recebe visão no escuro e deslocamento de escalada igual ao seu deslocamento terrestre.',
      'Seu tamanho é Pequeno (veja a página 106), mas seu deslocamento se mantém 9m. Apesar de pequenos, goblins são rápidos.',
      'Você recebe +2 em Fortitude e sua recuperação de PV e PM nunca é inferior ao seu nível.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    HYNINN: 1,
    MEGALOKK: 1,
    NIMB: 1,
    THWOR: 2,
  },
  size: RACE_SIZES.PEQUENO,
  abilities: [
    {
      name: 'Engenhoso',
      description:
        'Você não sofre penalidades em testes de perícia por não usar kits. Se usar o kit, recebe +2 no teste de perícia.',
    },
    {
      name: 'Espelunqueiro',
      description:
        'Você recebe visão no escuro e deslocamento de escalada igual ao seu deslocamento terrestre.',
    },
    {
      name: 'Peste Esguia',
      description:
        'Seu tamanho é Pequeno (veja a página 106), mas seu deslocamento se mantém 9m. Apesar de pequenos, goblins são rápidos.',
    },
    {
      name: 'Rato das Ruas',
      description:
        'Você recebe +2 em Fortitude e sua recuperação de PV e PM nunca é inferior ao seu nível.',
    },
  ],
};

export default GOBLIN;
