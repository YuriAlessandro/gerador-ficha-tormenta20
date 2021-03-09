import Race from '../../interfaces/Race';

const AGGELUS: Race = {
  name: 'Suraggel (Aggelus)',
  habilites: {
    attrs: [
      { attr: 'Sabedoria', mod: 4 },
      { attr: 'Carisma', mod: 2 },
      { attr: 'Destreza', mod: 4 },
    ],
    other: [],
    texts: [
      'Você é uma criatura do tipo espírito e recebe visão no escuro.',
      'Você recebe +2 em Diplomacia e Intuição. Além disso, pode lançar Luz (como uma magia divina; atributo-chave Carisma). Caso aprenda novamente essa magia, o custo para lançá-la diminui em –1 PM.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    AZGHER: 1,
    KHALMYR: 1,
    MARAH: 1,
    THYATIS: 1,
  },
};

export default AGGELUS;
