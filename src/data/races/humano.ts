import { cloneDeep } from 'lodash';
import { getPowersAllowedByRequirements } from '../../functions/powers';
import { getNotRepeatedRandom } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { RACE_SIZES } from './raceSizes/raceSizes';

function addSkillOrPower(sheet: CharacterSheet, substeps: SubStep[]) {
  const shouldGetSkill = Math.random() > 0.5;

  if (shouldGetSkill) {
    const randomSkill = getNotRepeatedRandom(sheet.skills, 'skill');
    sheet.skills.push(randomSkill);
    substeps.push({
      name: 'Versátil',
      value: `Perícia treinada (${randomSkill})`,
    });
  } else {
    const allowedPowers = getPowersAllowedByRequirements(sheet);
    const randomPower = getNotRepeatedRandom(
      sheet.generalPowers,
      'power',
      allowedPowers
    );
    sheet.generalPowers.push(randomPower);
    substeps.push({
      name: 'Versátil',
      value: `Poder geral recebido (${randomPower.name})`,
    });
  }

  return sheet;
}

class HUMANO implements Race {
  name = 'Humano';

  attributes = {
    attrs: [
      { attr: 'any' as 'any' | Atributo, mod: 2 },
      { attr: 'any' as 'any' | Atributo, mod: 2 },
      { attr: 'any' as 'any' | Atributo, mod: 2 },
    ],
  };

  faithProbability = {
    AHARADAK: 1,
    VALKARIA: 1,
    THWOR: 1,
  };

  displacement = 9;

  size = RACE_SIZES.MEDIO;

  abilities = [
    {
      name: 'Versátil',
      description:
        'Você se torna treinado em duas perícias a sua escolha (não precisam ser da sua classe). Você pode trocar uma dessas perícias por um poder geral a sua escolha.',
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        const randomSkill = getNotRepeatedRandom(sheetClone.skills, 'skill');
        sheetClone.skills.push(randomSkill);

        substeps.push({
          name: 'Versátil',
          value: `Perícia treinada (${randomSkill})`,
        });

        addSkillOrPower(sheetClone, substeps);

        return sheetClone;
      },
    },
  ];
}

export default HUMANO;
