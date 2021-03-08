import Race from '../../interfaces/Race';

const MINOTAURO: Race = {
  name: 'Minotauro',
  habilites: {
    attrs: [
      { attr: 'Força', mod: 4 },
      { attr: 'Constituição', mod: 2 },
      { attr: 'Sabedoria', mod: -2 },
    ],
    other: [{ type: 'defesa', mod: 1 }],
    texts: [
      'Você possui uma arma natural de chifres (dano 1d6, crítico x2, perfuração). Quando usa a ação atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com os chifres.',
      'Sua pele é dura como a de um touro. Você recebe +1 na Defesa (JÁ INCLUSO).',
      'Você tem olfato apurado. Você não fica desprevenido e sofre apenas camuflagem (em vez de camuflagem total) contra inimigos em alcance curto que não possa ver.',
    ],
  },
};

export default MINOTAURO;
