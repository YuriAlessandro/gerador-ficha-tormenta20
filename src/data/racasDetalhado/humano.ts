import Race from '../../interfaces/Race';

const HUMANO: Race = {
  name: 'Humano',
  habilites: {
    attrs: [
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
    ],
    other: [
      { type: 'pericias', allowed: 'any' },
      { type: 'pericias', allowed: 'any' },
    ],
    texts: [
      'Filhos de Valkaria, Deusa da Ambição, humanos podem se destacar em qualquer caminho que escolherem.',
      'Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha (JÁ INCLUSO).',
    ],
  },
};

export default HUMANO;
