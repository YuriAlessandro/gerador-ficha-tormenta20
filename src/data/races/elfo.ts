import Race from '../../interfaces/Race';

const ELFO: Race = {
  name: 'Elfo',
  habilites: {
    attrs: [
      { attr: 'Inteligência', mod: 4 },
      { attr: 'Destreza', mod: 2 },
      { attr: 'Constituição', mod: -2 },
    ],
    other: [{ type: 'pm', mod: 1 }], // Update per level
    texts: [
      'Seu deslocamento é 12m (em vez de 9m).',
      'Você recebe +1 ponto de mana por nível (JÁ INCLUSO).',
      'Você recebe visão na penumbra e +2 em Misticismo e Percepção.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ALLIHANNA: 1,
    THWOR: 1,
    KALLYADRANOCH: 1,
    MARAH: 1,
    WYNNA: 1,
  },
  displacement: 12,
};

export default ELFO;
