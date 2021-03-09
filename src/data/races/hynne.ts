import Race from '../../interfaces/Race';

const HYNNE: Race = {
  name: 'Hynne',
  habilites: {
    attrs: [
      { attr: 'Destreza', mod: 4 },
      { attr: 'Carisma', mod: 2 },
      { attr: 'Força', mod: -2 },
    ],
    other: [],
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
};

export default HYNNE;
