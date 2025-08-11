import _ from 'lodash';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Skill, {
  SkillsAttrs,
  SkillsWithArmorPenalty,
} from '@/interfaces/Skills';
import { Atributo } from '@/data/atributos';
import { calcDefense } from '@/data/equipamentos';
import { getRaceDisplacement } from '@/data/races/functions/functions';
import Bag from '@/interfaces/Bag';
import { CharacterAttributes } from '@/interfaces/Character';
import { applyRaceAbilities, applyPower } from './general';

// We need to copy the applyStatModifiers function locally since it's not exported
const calculateBonusValue = (
  sheet: CharacterSheet,
  bonus: { type: string; value?: number; attribute?: string; formula?: string }
): number => {
  if (bonus.type === 'Level') {
    return sheet.nivel;
  }
  if (bonus.type === 'HalfLevel') {
    return Math.floor(sheet.nivel / 2);
  }
  if (bonus.type === 'Attribute') {
    const attr = bonus.attribute as Atributo;
    return sheet.atributos[attr]?.mod || 0;
  }
  if (bonus.type === 'SpecialAttribute') {
    if (bonus.attribute === 'spellKeyAttr') {
      const attr = sheet.classe.spellPath?.keyAttribute || Atributo.CARISMA;
      return sheet.atributos[attr].mod;
    }
  }
  if (bonus.type === 'LevelCalc' && bonus.formula) {
    // Handle formulas like 'Math.floor(({level} + 3) / 4)'
    const formula = bonus.formula.replace(/{level}/g, sheet.nivel.toString());
    try {
      // eslint-disable-next-line no-eval
      return eval(formula);
    } catch {
      return 0;
    }
  }
  if (bonus.type === 'Fixed') {
    return bonus.value || 0;
  }
  return 0;
};

// Helper function to add bonus to skill
const addOtherBonusToSkill = (
  sheet: CharacterSheet,
  skillName: string,
  bonusValue: number
) => {
  if (!sheet.completeSkills) return;

  const skill = sheet.completeSkills.find((s) => s.name === skillName);
  if (skill) {
    skill.others = (skill.others || 0) + bonusValue;
  }
};

// Helper function to apply only defense bonuses from powers
const applyDefenseBonuses = (sheet: CharacterSheet): CharacterSheet => {
  const updatedSheet = _.cloneDeep(sheet);

  updatedSheet.sheetBonuses.forEach((bonus) => {
    if (bonus.target.type === 'Defense') {
      const bonusValue = calculateBonusValue(updatedSheet, bonus.modifier);
      updatedSheet.defesa += bonusValue;
    }
  });

  return updatedSheet;
};

// Copy of calcDisplacement function from general.ts
const calcDisplacement = (
  bag: Bag,
  raceDisplacement: number,
  atributos: CharacterAttributes,
  baseDisplacement: number
): number => {
  const maxSpaces =
    atributos.Força.mod > 0
      ? 10 + 2 * atributos.Força.mod
      : 10 - atributos.Força.mod;

  if (bag.getSpaces() > maxSpaces) {
    return raceDisplacement - 3;
  }

  return raceDisplacement + baseDisplacement;
};

// Helper functions for applying different types of powers and abilities

function recalculateCompleteSkills(sheet: CharacterSheet): CharacterSheet {
  const updatedSheet = _.cloneDeep(sheet);

  // Calculate armor penalty for skills that are affected by armor
  const armorPenalty = updatedSheet.bag.getArmorPenalty
    ? updatedSheet.bag.getArmorPenalty()
    : updatedSheet.bag.armorPenalty;

  // Helper function to determine training bonus
  const skillTrainingMod = (isTrained: boolean, level: number): number => {
    if (!isTrained) return 0;
    if (level >= 15) return 6;
    if (level >= 7) return 4;
    return 2;
  };

  // If completeSkills already exists, update it
  if (updatedSheet.completeSkills) {
    updatedSheet.completeSkills = updatedSheet.completeSkills.map((skill) => ({
      ...skill,
      halfLevel: Math.floor(updatedSheet.nivel / 2),
      training: skillTrainingMod(
        Object.values(updatedSheet.skills).includes(skill.name),
        updatedSheet.nivel
      ),
      // Apply armor penalty only to affected skills
      others:
        SkillsWithArmorPenalty.includes(skill.name) && armorPenalty > 0
          ? (skill.others || 0) + armorPenalty * -1
          : skill.others || 0,
    }));
  } else {
    // Create completeSkills from SkillsAttrs if it doesn't exist
    updatedSheet.completeSkills = Object.entries(SkillsAttrs)
      .map(([skillName, attr]) => {
        const skill = skillName as Skill;
        const isAffectedByArmor = SkillsWithArmorPenalty.includes(skill);

        return {
          name: skill,
          halfLevel: Math.floor(updatedSheet.nivel / 2),
          training: skillTrainingMod(
            Object.values(updatedSheet.skills).includes(skill),
            updatedSheet.nivel
          ),
          modAttr: attr as unknown as Atributo,
          others: isAffectedByArmor && armorPenalty > 0 ? armorPenalty * -1 : 0,
        };
      })
      .filter(
        (skill) =>
          !skill.name.startsWith('Of') ||
          (skill.name.startsWith('Of') && skill.training > 0)
      );
  }

  return updatedSheet;
}

function applyDivinePowers(sheet: CharacterSheet): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  if (!sheetClone.devoto?.poderes) return sheetClone;

  sheetClone = (sheetClone.devoto.poderes || []).reduce((acc, power) => {
    const [newAcc] = applyPower(acc, power);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyClassAbilities(sheet: CharacterSheet): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  const availableAbilities = sheetClone.classe.abilities.filter(
    (ability) => ability.nivel <= sheet.nivel
  );

  sheetClone.classe.abilities = availableAbilities;

  sheetClone = availableAbilities.reduce((acc, ability) => {
    const [newAcc] = applyPower(acc, ability);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyGeneralPowers(sheet: CharacterSheet): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  sheetClone = (sheetClone.generalPowers || []).reduce((acc, power) => {
    const [newAcc] = applyPower(acc, power);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyOriginPowers(sheet: CharacterSheet): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  if (!sheetClone.origin?.powers) return sheetClone;

  sheetClone = (sheetClone.origin.powers || []).reduce((acc, power) => {
    const [newAcc] = applyPower(acc, power);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

/**
 * Recalculates the entire character sheet after changes have been made.
 * This function applies all powers, abilities, and bonuses to ensure
 * the sheet is consistent and up-to-date.
 *
 * For now, this is a simplified version that focuses on the most important
 * recalculations: powers, defense, and race abilities.
 */
export function recalculateSheet(sheet: CharacterSheet): CharacterSheet {
  let updatedSheet = _.cloneDeep(sheet);

  // Step 0: Clear existing bonuses to avoid accumulation
  updatedSheet.sheetBonuses = [];

  // Step 1: Apply general powers (most important for manual additions)
  updatedSheet = applyGeneralPowers(updatedSheet);

  // Step 2: Apply race abilities
  updatedSheet = applyRaceAbilities(updatedSheet);

  // Step 3: Apply class abilities (filter by level)
  updatedSheet = applyClassAbilities(updatedSheet);

  // Step 4: Apply divine powers
  updatedSheet = applyDivinePowers(updatedSheet);

  // Step 5: Apply origin powers
  updatedSheet = applyOriginPowers(updatedSheet);

  // Step 6: Apply non-defense bonuses (PV, PM, skills, etc.)
  updatedSheet.sheetBonuses.forEach((bonus) => {
    if (bonus.target.type !== 'Defense') {
      const bonusValue = calculateBonusValue(updatedSheet, bonus.modifier);

      if (bonus.target.type === 'PV') {
        updatedSheet.pv += bonusValue;
      } else if (bonus.target.type === 'PM') {
        updatedSheet.pm += bonusValue;
      } else if (bonus.target.type === 'Skill') {
        const skillName = bonus.target.name;
        addOtherBonusToSkill(updatedSheet, skillName, bonusValue);
      } else if (bonus.target.type === 'Displacement') {
        updatedSheet.displacement += bonusValue;
      } else if (bonus.target.type === 'ArmorPenalty') {
        updatedSheet.extraArmorPenalty =
          (updatedSheet.extraArmorPenalty || 0) + bonusValue;
      }
    }
  });

  // Step 7: Recalculate skills after applying bonuses
  updatedSheet = recalculateCompleteSkills(updatedSheet);

  // Step 8: Reset defense to base and recalculate from ground up
  updatedSheet.defesa = 10; // Reset to base defense
  updatedSheet = calcDefense(updatedSheet); // Calculate base + equipment + attributes

  // Step 9: Apply defense bonuses from powers AFTER base calculation
  updatedSheet = applyDefenseBonuses(updatedSheet);

  // Step 10: Recalculate displacement from ground up
  const baseDisplacementBonuses = updatedSheet.sheetBonuses
    .filter((bonus) => bonus.target.type === 'Displacement')
    .reduce(
      (acc, bonus) => acc + calculateBonusValue(updatedSheet, bonus.modifier),
      0
    );

  updatedSheet.displacement = calcDisplacement(
    updatedSheet.bag,
    getRaceDisplacement(updatedSheet.raca),
    updatedSheet.atributos,
    baseDisplacementBonuses
  );

  return updatedSheet;
}
