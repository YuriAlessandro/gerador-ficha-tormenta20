import { Atributo } from '../data/systems/tormenta20/atributos';
import generalPowers from '../data/poderes';
import PROFICIENCIAS from '../data/systems/tormenta20/proficiencias';
import CharacterSheet from '../interfaces/CharacterSheet';
import { ClassPower } from '../interfaces/Class';
import { GeneralPower, RequirementType } from '../interfaces/Poderes';
import Skill, {
  ALL_SPECIFIC_OFICIOS,
  isGenericOficio,
} from '../interfaces/Skills';
import {
  INVENTOR_SPECIALIZATIONS,
  InventorSpecialization,
  isClassOrVariantOf,
} from './general';

export type LevelTier = 'Iniciante' | 'Veterano' | 'Campeão' | 'Herói';

/**
 * Retorna o patamar de nível do personagem
 */
export function getLevelTier(level: number): LevelTier {
  if (level <= 4) return 'Iniciante';
  if (level <= 10) return 'Veterano';
  if (level <= 16) return 'Campeão';
  return 'Herói';
}

/**
 * Conta quantos poderes de uma categoria específica foram escolhidos no patamar atual
 * Para Bênçãos Dracônicas: category = "Bênção Dracônica"
 */
export function getPowerCountInCurrentTier(
  sheet: CharacterSheet,
  category: string
): number {
  // Conta poderes gerais que contêm a categoria no nome
  // Para Bênçãos Dracônicas, todos começam com esse nome
  const count = sheet.generalPowers.filter((power) =>
    power.name.includes(category)
  ).length;

  return count;
}

export function isPowerAvailable(
  sheet: CharacterSheet,
  power: GeneralPower | ClassPower,
  options?: { ignoreLevelRequirement?: boolean }
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

            const foundInPowers = allPowers.some(
              (currPower) => currPower.name === rule.name
            );
            if (foundInPowers) return true;

            // Verifica opções escolhidas via chooseFromOptions (ex: Égide/Montaria Sagrada)
            return (sheet.sheetActionHistory ?? []).some((entry) =>
              entry.changes.some(
                (change) =>
                  change.type === 'OptionChosen' &&
                  change.chosenName === rule.name
              )
            );
          }
          case RequirementType.ATRIBUTO: {
            const attr = rule.name as Atributo;
            return (
              rule.name && sheet.atributos[attr].value >= (rule?.value || 0)
            );
          }
          case RequirementType.PERICIA: {
            if (isGenericOficio(rule.name)) {
              return sheet.skills.some(
                (s) => s === Skill.OFICIO || ALL_SPECIFIC_OFICIOS.includes(s)
              );
            }
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
            const proficiencia = rule.name as string;

            // Caso especial: 'all' significa qualquer proficiência de arma (exceto Simples, que todas as classes têm)
            if (proficiencia === 'all') {
              const weaponProficiencies = [
                PROFICIENCIAS.MARCIAIS,
                PROFICIENCIAS.FOGO,
                PROFICIENCIAS.EXOTICAS,
              ];
              return weaponProficiencies.some((wp) =>
                sheet.classe.proficiencias.includes(wp)
              );
            }

            return sheet.classe.proficiencias.includes(proficiencia);
          }
          case RequirementType.NIVEL: {
            if (options?.ignoreLevelRequirement) return true;
            const nivel = rule.value as number;
            return sheet.nivel >= nivel;
          }
          case RequirementType.CLASSE: {
            const className = rule.value as unknown as string;
            return rule.name && isClassOrVariantOf(sheet.classe, className);
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
            // 'any' significa que o personagem deve ser devoto de qualquer divindade
            if (godName === 'any') {
              const result = !!sheet.devoto?.divindade;
              if (rule.not) return !result;
              return result;
            }
            const result = sheet.devoto?.divindade.name === godName;
            if (rule.not) return !result;
            return result;
          }
          case RequirementType.RACA: {
            const raceName = rule.name;
            return sheet.raca.name === raceName;
          }
          case RequirementType.CHASSIS: {
            return sheet.raca.chassis === rule.name;
          }
          case RequirementType.TIER_LIMIT: {
            const category = rule.name as string; // "Bênção Dracônica"
            const count = getPowerCountInCurrentTier(sheet, category);
            return count < 1; // Máximo 1 bênção por patamar
          }
          case RequirementType.TEXT:
            // TEXT requirements are always considered met - the user reads
            // the text description and judges if they meet the requirement
            return true;
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
