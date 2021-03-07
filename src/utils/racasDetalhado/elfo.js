const ELFO = {
  name: 'Elfo',
  habilites: {
    attrs: [
      { attr: 'Inteligência', mod: 4 },
      { attr: 'Destreza', mod: 2 },
      { attr: 'Constituição', mod: -2 },
    ],
    other: [{ type: 'pm', mod: 1, pernivel: true }],
    texts: [
      'Seu deslocamento é 12m (em vez de 9m).',
      'Você recebe +1 ponto de mana por nível (JÁ INCLUSO).',
      'Você recebe visão na penumbra e +2 em Misticismo e Percepção.',
    ],
  },
};

export default ELFO;
