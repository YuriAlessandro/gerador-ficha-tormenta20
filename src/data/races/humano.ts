import Race, { CharacterStats } from '../../interfaces/Race';
import { getNotRepeatedRandomSkill } from '../pericias';

const HUMANO: Race = {
  name: 'Humano',
  habilites: {
    attrs: [
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
    ],
    texts: [
      'Filhos de Valkaria, Deusa da Ambição, humanos podem se destacar em qualquer caminho que escolherem.',
      'Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha (JÁ INCLUSO).',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    VALKARIA: 1,
    THWOR: 1,
  },
  abilities: {
    Versátil: {
      name: 'Versátil',
      description:
        'Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha.',
      action(stats: CharacterStats): CharacterStats {
        const skills = [];

        skills.push(getNotRepeatedRandomSkill(stats));

        return stats;
      },
    },
  },
};

export default HUMANO;
