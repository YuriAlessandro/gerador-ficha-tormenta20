import { Atributo } from '../data/atributos';
import generalPowers from '../data/poderes';
import CharacterSheet from '../interfaces/CharacterSheet';
import { ClassPower } from '../interfaces/Class';
import { GeneralPower, RequirementType } from '../interfaces/Poderes';
import Skill from '../interfaces/Skills';
import { INVENTOR_SPECIALIZATIONS, InventorSpecialization } from './general';

export function isPowerAvailable(
  sheet: CharacterSheet,
  power: GeneralPower | ClassPower
): boolean {
  if (power.requirements && power.requirements.length > 0) {
    return power.requirements.some((req) =>
      req.every((rule) => {
        switch (rule.type) {
          case RequirementType.PODER: {
            const allPowers = [
              ...sheet.generalPowers,
              ...(sheet.origin?.powers || []),
              ...(sheet.classPowers || []),
            ];

            return allPowers.some((currPower) => currPower.name === rule.name);
          }
          case RequirementType.ATRIBUTO: {
            const attr = rule.name as Atributo;
            return rule.name && sheet.atributos[attr].mod >= (rule?.value || 0);
          }
          case RequirementType.PERICIA: {
            const pericia = rule.name as Skill;
            return rule.name && sheet.skills.includes(pericia);
          }
          case RequirementType.HABILIDADE: {
            const result = sheet.classe.abilities.some(
              (ability) => ability.name === rule.name
            );
            if (rule.not) return !result;
            return result;
          }
          case RequirementType.PODER_TORMENTA: {
            const qtdPowers = rule.value as number;
            return (
              sheet.generalPowers.filter(
                (actualPower) => actualPower.type === 'TORMENTA'
              ).length >=
              qtdPowers + 1 // OTHER powers, so can't count itself
            );
          }
          case RequirementType.PROFICIENCIA: {
            const proficiencia = rule.value as unknown as string;
            return (
              rule.name && sheet.classe.proficiencias.includes(proficiencia)
            );
          }
          case RequirementType.NIVEL: {
            const nivel = rule.value as number;
            return sheet.nivel >= nivel;
          }
          case RequirementType.CLASSE: {
            const className = rule.value as unknown as string;
            return rule.name && sheet.classe.name === className;
          }
          case RequirementType.TIPO_ARCANISTA: {
            const classSubName = rule.name;
            return sheet.classe.subname === classSubName;
          }
          case RequirementType.MAGIA: {
            const spellName = rule.name;
            return (
              sheet.spells.filter((spell) => spell.nome === spellName).length >=
              1
            );
          }
          case RequirementType.DEVOTO: {
            const godName = rule.name;
            const result = sheet.devoto?.divindade.name === godName;
            if (rule.not) return !result;
            return result;
          }
          default:
            return true;
        }
      })
    );
  }

  return true;
}

export function getPowersAllowedByRequirements(
  sheet: CharacterSheet
): GeneralPower[] {
  const existingGeneralPowers = sheet.generalPowers;

  return Object.values(generalPowers)
    .flat()
    .filter((power) => {
      const isRepeatedPower = existingGeneralPowers.find(
        (existingPower) => existingPower.name === power.name
      );

      if (isRepeatedPower) {
        return power.allowSeveralPicks;
      }

      return isPowerAvailable(sheet, power);
    });
}

export function getAllowedClassPowers(sheet: CharacterSheet): ClassPower[] {
  return sheet.classe.powers.filter((power) => {
    const existingClassPowers = sheet.classPowers || [];
    const isRepeatedPower = existingClassPowers.find(
      (existingPower) => existingPower.name === power.name
    );

    if (isRepeatedPower) {
      return power.canRepeat;
    }

    return isPowerAvailable(sheet, power);
  });
}

interface WeightedPower {
  power: ClassPower;
  weight: number;
}

function getInventorSpecializationFromSkills(
  skills: Skill[]
): InventorSpecialization | null {
  const specializationEntries = Object.entries(
    INVENTOR_SPECIALIZATIONS
  ) as Array<
    [InventorSpecialization, { skill: Skill; relatedPowers: string[] }]
  >;

  const foundSpecialization = specializationEntries.find(([, data]) =>
    skills.includes(data.skill)
  );

  return foundSpecialization ? foundSpecialization[0] : null;
}

export function getWeightedInventorClassPowers(
  sheet: CharacterSheet
): ClassPower[] {
  const allowedPowers = getAllowedClassPowers(sheet);

  if (sheet.classe.name !== 'Inventor' || allowedPowers.length === 0) {
    return allowedPowers;
  }

  const specialization = getInventorSpecializationFromSkills(sheet.skills);

  if (!specialization) {
    return allowedPowers;
  }

  const { relatedPowers } = INVENTOR_SPECIALIZATIONS[specialization];

  // Create weighted powers array
  const weightedPowers: WeightedPower[] = allowedPowers.map((power) => ({
    power,
    weight: relatedPowers.includes(power.name) ? 3 : 1, // 3x weight for synergistic powers
  }));

  // For weighted selection, we'll modify the array to have multiple entries
  // of high-weight powers to simulate probability
  const expandedPowers: ClassPower[] = [];
  weightedPowers.forEach((wp) => {
    // Add the power multiple times based on its weight
    for (let i = 0; i < wp.weight; i += 1) {
      expandedPowers.push(wp.power);
    }
  });

  return expandedPowers;
}
