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
import { ManualPowerSelections } from '@/interfaces/PowerSelections';
import { applyRaceAbilities, applyPower } from './general';
import { getRemovedPowers } from './reverseSheetActions';

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
      // Reset others to 0 and only apply armor penalty if affected
      others:
        SkillsWithArmorPenalty.includes(skill.name) && armorPenalty > 0
          ? armorPenalty * -1
          : 0,
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

function applyGeneralPowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  sheetClone = (sheetClone.generalPowers || []).reduce((acc, power) => {
    const selections = manualSelections?.[power.name];
    const [newAcc] = applyPower(acc, power, selections);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyClassPowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  sheetClone = (sheetClone.classPowers || []).reduce((acc, power) => {
    const selections = manualSelections?.[power.name];
    const [newAcc] = applyPower(acc, power, selections);
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
 * @param sheet - The updated character sheet
 * @param originalSheet - Optional original sheet state to detect removed powers
 * @param manualSelections - Optional manual selections for powers that require them
 */
export function recalculateSheet(
  sheet: CharacterSheet,
  originalSheet?: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let updatedSheet = _.cloneDeep(sheet);
  let removedPowerNames: string[] = [];

  // Step 0: If we have the original sheet, identify removed powers
  if (originalSheet) {
    // Find removed general powers
    const originalGeneralPowers = originalSheet.generalPowers || [];
    const newGeneralPowers = updatedSheet.generalPowers || [];
    const removedGeneralPowers = getRemovedPowers(
      originalGeneralPowers,
      newGeneralPowers
    );

    // Find removed class powers
    const originalClassPowers = originalSheet.classPowers || [];
    const newClassPowers = updatedSheet.classPowers || [];
    const removedClassPowers = getRemovedPowers(
      originalClassPowers,
      newClassPowers
    );

    removedPowerNames = [...removedGeneralPowers, ...removedClassPowers];

    // Only reverse sheet actions (not bonuses) since bonuses will be cleared anyway
    removedPowerNames.forEach((powerName) => {
      // Find all history entries for this power
      const powerHistoryEntries = updatedSheet.sheetActionHistory.filter(
        (entry) => entry.powerName === powerName
      );

      // Reverse each action in reverse order (LIFO)
      powerHistoryEntries.reverse().forEach((historyEntry) => {
        historyEntry.changes.forEach((change) => {
          // Inline reversal logic to avoid circular imports
          switch (change.type) {
            case 'Attribute': {
              // Find the original modification to get the exact value that was added
              const relevantHistory = updatedSheet.sheetActionHistory.find(
                (entry) =>
                  entry.powerName === powerName &&
                  entry.changes.some(
                    (c) =>
                      c.type === 'Attribute' && c.attribute === change.attribute
                  )
              );
              if (relevantHistory) {
                const attributeChange = relevantHistory.changes.find(
                  (c) =>
                    c.type === 'Attribute' && c.attribute === change.attribute
                ) as { type: 'Attribute'; attribute: Atributo; value: number };
                if (attributeChange) {
                  const originalValue =
                    updatedSheet.atributos[change.attribute].mod;
                  const modificationValue =
                    attributeChange.value - originalValue;
                  updatedSheet.atributos[change.attribute].mod -=
                    modificationValue;
                }
              }
              break;
            }

            case 'ProficiencyAdded': {
              const profIndex = updatedSheet.classe.proficiencias.indexOf(
                change.proficiency
              );
              if (profIndex > -1) {
                updatedSheet.classe.proficiencias.splice(profIndex, 1);
              }
              break;
            }

            case 'SkillsAdded': {
              change.skills.forEach((skill: string) => {
                const skillIndex = updatedSheet.skills.indexOf(skill as Skill);
                if (skillIndex > -1) {
                  updatedSheet.skills.splice(skillIndex, 1);
                }
              });
              break;
            }

            case 'SenseAdded': {
              if (updatedSheet.sentidos) {
                const senseIndex = updatedSheet.sentidos.indexOf(change.sense);
                if (senseIndex > -1) {
                  updatedSheet.sentidos.splice(senseIndex, 1);
                }
              }
              break;
            }

            case 'PowerAdded': {
              if (updatedSheet.generalPowers) {
                const powerIndex = updatedSheet.generalPowers.findIndex(
                  (power) => power.name === change.powerName
                );
                if (powerIndex > -1) {
                  updatedSheet.generalPowers.splice(powerIndex, 1);
                }
              }
              break;
            }

            case 'SpellsLearned': {
              if (updatedSheet.spells) {
                change.spellNames.forEach((spellName: string) => {
                  const spellIndex = updatedSheet.spells.findIndex(
                    (spell) => spell.nome === spellName
                  );
                  if (spellIndex > -1) {
                    updatedSheet.spells.splice(spellIndex, 1);
                  }
                });
              }
              break;
            }

            case 'AttributeIncreasedByAumentoDeAtributo':
              updatedSheet.atributos[change.attribute].mod -= 1;
              break;

            default:
              // Other action types not yet implemented
              break;
          }
        });
      });

      // Remove history entries for this power
      updatedSheet.sheetActionHistory = updatedSheet.sheetActionHistory.filter(
        (entry) => entry.powerName !== powerName
      );
    });
  }

  // Step 1: Clear existing bonuses to avoid accumulation
  updatedSheet.sheetBonuses = [];

  // Step 2: Apply general powers (most important for manual additions)
  updatedSheet = applyGeneralPowers(updatedSheet, manualSelections);

  // Step 3: Apply class powers (with manual selections)
  updatedSheet = applyClassPowers(updatedSheet, manualSelections);

  // Step 4: Apply race abilities
  updatedSheet = applyRaceAbilities(updatedSheet);

  // Step 5: Apply class abilities (filter by level)
  updatedSheet = applyClassAbilities(updatedSheet);

  // Step 6: Apply divine powers
  updatedSheet = applyDivinePowers(updatedSheet);

  // Step 7: Apply origin powers
  updatedSheet = applyOriginPowers(updatedSheet);

  // Step 7: Recalculate skills first (resets others to 0)
  updatedSheet = recalculateCompleteSkills(updatedSheet);

  // Step 8: Apply non-defense bonuses (PV, PM, skills, etc.)
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
      } else if (bonus.target.type === 'PickSkill') {
        // Re-apply PickSkill bonuses using manual selections
        // Find which power this bonus belongs to by checking the bonus source
        if (
          bonus.source?.type === 'power' &&
          manualSelections?.[bonus.source.name]?.skills
        ) {
          const powerName = bonus.source.name;
          const powerSelections = manualSelections[powerName];
          if (powerSelections?.skills) {
            const selectedSkills = powerSelections.skills.slice(
              0,
              bonus.target.pick
            );
            selectedSkills.forEach((skillName) => {
              addOtherBonusToSkill(updatedSheet, skillName, bonusValue);
            });
          }
        }
      } else if (bonus.target.type === 'Displacement') {
        updatedSheet.displacement += bonusValue;
      } else if (bonus.target.type === 'ArmorPenalty') {
        updatedSheet.extraArmorPenalty =
          (updatedSheet.extraArmorPenalty || 0) + bonusValue;
      }
    }
  });

  // Step 9: Reset defense to base and recalculate from ground up
  updatedSheet.defesa = 10; // Reset to base defense
  updatedSheet = calcDefense(updatedSheet); // Calculate base + equipment + attributes

  // Step 10: Apply defense bonuses from powers AFTER base calculation
  updatedSheet = applyDefenseBonuses(updatedSheet);

  // Step 11: Recalculate displacement from ground up
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
