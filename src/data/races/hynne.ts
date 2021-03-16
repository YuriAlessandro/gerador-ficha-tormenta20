import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

const HYNNE: Race = {
  name: 'Hynne',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 4 },
      { attr: Atributo.CARISMA, mod: 2 },
      { attr: Atributo.FORCA, mod: -2 },
    ],
    texts: [
      'Quando faz um ataque à distância com uma funda ou uma arma de arremesso, seu dano aumenta em um passo.',
      'Seu tamanho é Pequeno (veja a página 106) e seu deslocamento é 6m. Você recebe +2 em Enganação e usa o modificador de Destreza para Atletismo (em vez de Força).',
      'Quando faz um teste de resistência, você pode gastar 1 PM para rolar este teste novamente.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    HYNINN: 1,
    MARAH: 1,
    OCEANO: 1,
    THWOR: 1,
  },
  size: RACE_SIZES.PEQUENO,
  getDisplacement: () => 6,
  abilities: [
    {
      name: 'Arremessador',
      description:
        'Quando faz um ataque à distância com uma funda ou uma arma de arremesso, seu dano aumenta em um passo.',
    },
    {
      name: 'Pequeno e Rechonchudo',
      description:
        'Seu tamanho é Pequeno (veja a página 106) e seu deslocamento é 6m. Você recebe +2 em Enganação e usa o modificador de Destreza para Atletismo (em vez de Força).',
    },
    {
      name: 'Sorte Salvadora',
      description:
        'Quando faz um teste de resistência, você pode gastar 1 PM para rolar este teste novamente.',
    },
  ],
};

export default HYNNE;
