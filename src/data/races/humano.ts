import _ from 'lodash';
import { getNotRepeatedRandom } from '../../functions/randomUtils';
import { GeneralPower } from '../../interfaces/Poderes';
import Race, { CharacterStats } from '../../interfaces/Race';
import Skill from '../../interfaces/Skills';
import { getNotRepeatedRandomSkill } from '../pericias';

const HUMANO: Race = {
  name: 'Humano',
  attributes: {
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
        const newSkills: Skill[] = [];
        const generalPowers: GeneralPower[] = [];

        newSkills.push(getNotRepeatedRandomSkill(stats.skills));

        if (Math.random() > 0.5) {
          newSkills.push(
            getNotRepeatedRandomSkill([...newSkills, ...stats.skills])
          );
        } else {
          const power = getNotRepeatedRandom(
            stats.powers.general,
            'power'
          ) as GeneralPower;
          generalPowers.push(power);
        }

        return _.merge(stats, {
          skills: [...stats.skills, ...newSkills],
          powers: {
            general: generalPowers,
          },
        });
      },
    },
  },
};

export default HUMANO;
