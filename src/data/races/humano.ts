import { cloneDeep } from 'lodash';
import { getPowersAllowedByRequirements } from '../../functions/powers';
import { getNotRepeatedRandom } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';

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

const HUMANO: Race = {
  name: 'Humano',
  attributes: {
    attrs: [
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
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
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = cloneDeep(sheet);

        // Generate random number between 1 and 100
        const randomNumber = Math.floor(Math.random() * 100) + 1;
        // If random number is less than 50, add a skill, otherwise add a power
        if (randomNumber < 50) {
          const randomSkill = getNotRepeatedRandom(sheetClone.skills, 'skill');
          sheetClone.skills.push(randomSkill);

          substeps.push({
            name: 'Versátil',
            value: `Perícia treinada (${randomSkill})`,
          });

          addSkillOrPower(sheetClone, substeps);
        } else {
          const allowedPowers = getPowersAllowedByRequirements(sheetClone);
          const randomPower = getNotRepeatedRandom(
            sheetClone.generalPowers,
            'power',
            allowedPowers
          );
          sheetClone.generalPowers.push(randomPower);

          substeps.push({
            name: 'Versátil',
            value: `Poder geral recebido (${randomPower.name})`,
          });

          addSkillOrPower(sheetClone, substeps);
        }

        return sheetClone;
      },
    },
  ],
};

export default HUMANO;
