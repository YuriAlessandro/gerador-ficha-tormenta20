import { cloneDeep } from 'lodash';
import Race from '../../interfaces/Race';
import {
  getNotRepeatedRandom,
  getRandomItemFromArray,
} from '../../functions/randomUtils';
import { getRaceDisplacement, getRaceSize } from './functions/functions';
import { Atributo } from '../atributos';
import HUMANO from './humano';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { getPowersAllowedByRequirements } from '../../functions/powers';

function addSkillOrGeneralPower(sheet: CharacterSheet, substeps: SubStep[]) {
  const shouldGetSkill = Math.random() > 0.5;

  if (shouldGetSkill) {
    const randomSkill = getNotRepeatedRandom(sheet.skills, 'skill');
    sheet.skills.push();
    substeps.push({
      name: 'Memória Póstuma',
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
      name: 'Memória Póstuma',
      value: `Poder geral recebido (${randomPower.name})`,
    });
  }
}

function getAndApplyRandomOldRaceAbility(
  sheet: CharacterSheet,
  substeps: SubStep[]
) {
  if (sheet.raca.oldRace?.abilities) {
    const randomAbility = getRandomItemFromArray(sheet.raca.oldRace.abilities);
    sheet.raca.abilities?.push(randomAbility);
    substeps.push({
      name: 'Memória Póstuma',
      value: `${sheet.raca.oldRace.name} (${randomAbility.name})`,
    });
    if (randomAbility.action) {
      return randomAbility.action(sheet, substeps);
    }
  }

  return sheet;
}

const OSTEON: Race = {
  name: 'Osteon',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: -2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
    ],
    texts: [
      'Você recebe resistência a corte, frio e perfuração 5.',
      'Você se torna treinado em uma perícia (não precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, você pode ser um osteon de outra raça humanoide que não humano. Neste caso, você ganha uma habilidade dessa raça a sua escolha. Se a raça era de tamanho diferente de Médio, você também possui sua categoria de tamanho',
      'Você é uma criatura do tipo morto-vivo. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, habilidades mágicas de cura causam dano a você e você não se beneficia de itens ingeríveis (comidas, poções etc.), mas dano de trevas recupera seus PV.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    TENEBRA: 1,
    THWOR: 1,
  },
  setup: (race, allRaces) => {
    const validRaces = allRaces.filter(
      (element) => element.name !== 'Golem' && element.name !== 'Osteon'
    );

    return {
      ...race,
      oldRace: getRandomItemFromArray(validRaces),
    };
  },
  getDisplacement(race) {
    if (race.oldRace) {
      return getRaceDisplacement(race.oldRace);
    }

    return getRaceDisplacement(race);
  },
  getSize(race) {
    if (race.oldRace) {
      return getRaceSize(race.oldRace);
    }

    return getRaceSize(race);
  },
  abilities: [
    {
      name: 'Armadura Óssea',
      description: 'Você recebe resistência a corte, frio e perfuração 5.',
    },
    {
      name: 'Memória Póstuma',
      description:
        'Você se torna treinado em uma perícia (não precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, você pode ser um osteon de outra raça humanoide que não humano. Neste caso, você ganha uma habilidade dessa raça a sua escolha. Se a raça era de tamanho diferente de Médio, você também possui sua categoria de tamanho.',
      action(sheet: CharacterSheet, subSteps: SubStep[]): CharacterSheet {
        let sheetClone = cloneDeep(sheet);

        if (sheet.raca.oldRace) {
          if (sheet.raca.oldRace.name === HUMANO.name) {
            addSkillOrGeneralPower(sheetClone, subSteps);
          } else if (sheet.raca.oldRace.abilities) {
            sheetClone = getAndApplyRandomOldRaceAbility(sheetClone, subSteps);
          }
        }

        return sheetClone;
      },
    },
    {
      name: 'Natureza Esquelética',
      description:
        'Você é uma criatura do tipo morto-vivo. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, habilidades mágicas de cura causam dano a você e você não se beneficia de itens ingeríveis (comidas, poções etc.), mas dano de trevas recupera seus PV.',
    },
  ],
};
export default OSTEON;
