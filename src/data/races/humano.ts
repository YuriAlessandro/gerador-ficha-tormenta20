import { getNotRepeatedRandom } from '../../functions/randomUtils';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { GeneralPower } from '../../interfaces/Poderes';
import Race from '../../interfaces/Race';
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
  abilities: [
    {
      name: 'Versátil',
      description:
        'Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha.',
      action(sheet: CharacterSheet): CharacterSheet {
        const newSkills: Skill[] = [];
        const newGeneralPowers: GeneralPower[] = [];

        newSkills.push(getNotRepeatedRandomSkill(sheet.skills));

        if (Math.random() > 0.5) {
          newSkills.push(
            getNotRepeatedRandomSkill([...newSkills, ...sheet.skills])
          );
        } else {
          const power = getNotRepeatedRandom(
            sheet.generalPowers,
            'power'
          ) as GeneralPower;
          newGeneralPowers.push(power);
        }

        return {
          ...sheet,
          skills: [...sheet.skills, ...newSkills],
          generalPowers: [...sheet.generalPowers, ...newGeneralPowers],
        };
      },
    },
  ],
};

export default HUMANO;
