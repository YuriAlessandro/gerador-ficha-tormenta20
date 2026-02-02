import _ from 'lodash';

import Bag from '@/interfaces/Bag';
import { CharacterAttributes } from '@/interfaces/Character';
import CharacterSheet, {
  SheetActionHistoryEntry,
  Step,
} from '@/interfaces/CharacterSheet';
import Equipment from '@/interfaces/Equipment';
import { ManualPowerSelections } from '@/interfaces/PowerSelections';
import Skill, {
  SkillsAttrs,
  SkillsWithArmorPenalty,
} from '@/interfaces/Skills';
import { Spell } from '@/interfaces/Spells';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import {
  calcDefense,
  isHeavyArmor,
} from '@/data/systems/tormenta20/equipamentos';
import { getRaceDisplacement } from '@/data/systems/tormenta20/races/functions/functions';

import { applyRaceAbilities, applyPower } from './general';
import { getRemovedPowers } from './reverseSheetActions';

// Note: resetAttributesToBase was removed as part of attribute system simplification.
// The value field now directly contains the modifier (no separate base/mod distinction).

/**
 * Removes duplicate entries from sheetActionHistory based on source
 */
function deduplicateHistory(
  history: SheetActionHistoryEntry[]
): SheetActionHistoryEntry[] {
  const seen = new Map<string, SheetActionHistoryEntry>();

  history.forEach((action) => {
    // Create a key based on source type and identifying properties
    let key = `${action.source.type}`;

    if (action.source.type === 'race' && 'raceName' in action.source) {
      key += `-${action.source.raceName}`;
    } else if (action.source.type === 'class' && 'className' in action.source) {
      key += `-${action.source.className}`;
    } else if (
      action.source.type === 'origin' &&
      'originName' in action.source
    ) {
      key += `-${action.source.originName}`;
    } else if (action.source.type === 'levelUp' && 'level' in action.source) {
      key += `-${action.source.level}`;
    } else if (action.source.type === 'power' && 'name' in action.source) {
      key += `-${action.source.name}`;
      // For powers with multiple instances (like Aumento de Atributo), include changes in key
      if (action.changes && action.changes.length > 0) {
        const changesKey = JSON.stringify(action.changes);
        key += `-${changesKey}`;
      }
    }

    // Only keep the first occurrence
    if (!seen.has(key)) {
      seen.set(key, action);
    }
  });

  return Array.from(seen.values());
}

/**
 * Removes duplicate steps from the steps array
 */
function deduplicateSteps(steps: Step[]): Step[] {
  const seen = new Set<string>();
  const uniqueSteps: Step[] = [];

  steps.forEach((step) => {
    // Create a key based on label and type
    const key = `${step.type || ''}-${step.label}`;

    // For defense increments, keep only the last one
    if (step.label.includes('Incrementou Defesa')) {
      // Remove previous defense increments
      const previousIndex = uniqueSteps.findIndex((s) =>
        s.label.includes('Incrementou Defesa')
      );
      if (previousIndex !== -1) {
        uniqueSteps.splice(previousIndex, 1);
      }
      uniqueSteps.push(step);
    } else if (!seen.has(key)) {
      seen.add(key);
      uniqueSteps.push(step);
    }
  });

  return uniqueSteps;
}

/**
 * Removes duplicate spells from the spells array
 */
function deduplicateSpells(spells: Spell[]): Spell[] {
  const seen = new Set<string>();
  const uniqueSpells: Spell[] = [];

  spells.forEach((spell) => {
    if (!seen.has(spell.nome)) {
      seen.add(spell.nome);
      uniqueSpells.push(spell);
    }
  });

  return uniqueSpells;
}

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
    return sheet.atributos[attr]?.value || 0;
  }
  if (bonus.type === 'SpecialAttribute') {
    if (bonus.attribute === 'spellKeyAttr') {
      const attr = sheet.classe.spellPath?.keyAttribute || Atributo.CARISMA;
      return sheet.atributos[attr].value;
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

// Helper function to check if a weapon matches bonus criteria
const weaponMatchesBonus = (
  weapon: Equipment,
  bonus: {
    weaponName?: string;
    weaponTags?: string[];
    proficiencyRequired?: boolean;
  },
  _sheet: CharacterSheet
): boolean => {
  // Check specific weapon name
  if (bonus.weaponName && weapon.nome !== bonus.weaponName) {
    return false;
  }

  // Check weapon tags
  if (bonus.weaponTags && bonus.weaponTags.length > 0) {
    const weaponTags = weapon.weaponTags || [];
    const hasMatchingTag = bonus.weaponTags.some((tag) =>
      weaponTags.includes(tag)
    );
    if (!hasMatchingTag) {
      return false;
    }
  }

  // Check proficiency requirement
  if (bonus.proficiencyRequired) {
    // TODO: Implement proficiency check logic
    // For now, assume all weapons are proficient
    // This would need to check against sheet.classe.proficiencias
  }

  return true;
};

// Helper function to reset weapon to base values (remove previous bonuses)
const resetWeaponToBase = (weapon: Equipment): Equipment => {
  const resetWeapon = { ...weapon };

  // If weapon has manual edits, preserve the current values
  // Only reset weapons that don't have manual edits (i.e., system-added weapons)
  if (resetWeapon.hasManualEdits) {
    // Preserve user edits - only reset atkBonus if it's a system bonus
    // User-edited damage and critical are kept as-is
    return resetWeapon;
  }

  // For weapons without manual edits, reset to base values
  // If base values exist, use them; otherwise, extract from current values

  // Reset atkBonus to base or 0
  resetWeapon.atkBonus = resetWeapon.baseAtkBonus ?? 0;

  // Reset damage to base value or extract base if not stored
  if (resetWeapon.baseDano) {
    resetWeapon.dano = resetWeapon.baseDano;
  } else if (resetWeapon.dano && resetWeapon.dano.includes('+')) {
    // Fallback: Extract base damage (everything before the first '+')
    // and store it for future use
    [resetWeapon.dano] = resetWeapon.dano.split('+');
    resetWeapon.baseDano = resetWeapon.dano;
  }

  // Reset critical to base value
  // If baseCritico doesn't exist yet, initialize it with the current critico value
  // This prevents cumulative bonus application on subsequent recalculateSheet calls
  if (resetWeapon.baseCritico) {
    resetWeapon.critico = resetWeapon.baseCritico;
  } else if (resetWeapon.critico) {
    // First time processing this weapon - store current critico as base
    resetWeapon.baseCritico = resetWeapon.critico;
  }

  return resetWeapon;
};

// Helper function to recalculate HP with attribute replacement
const applyHPAttributeReplacement = (sheet: CharacterSheet): CharacterSheet => {
  const updatedSheet = _.cloneDeep(sheet);

  // Check if there's an HP attribute replacement
  const hpReplacement = updatedSheet.sheetBonuses.find(
    (bonus) => bonus.target.type === 'HPAttributeReplacement'
  );

  if (hpReplacement && hpReplacement.target.type === 'HPAttributeReplacement') {
    const { newAttribute } = hpReplacement.target;

    // Recalculate HP using the new attribute instead of Constitution
    const baseHp = updatedSheet.classe.pv;
    const attributeBonus =
      updatedSheet.atributos[newAttribute].value * updatedSheet.nivel;

    updatedSheet.pv = baseHp + attributeBonus;
  }

  return updatedSheet;
};

// Helper function to apply weapon bonuses
const applyWeaponBonuses = (
  sheet: CharacterSheet,
  _manualSelections?: ManualPowerSelections
): CharacterSheet => {
  const updatedSheet = _.cloneDeep(sheet);

  // Apply weapon bonuses to all weapons in the bag
  updatedSheet.bag.equipments.Arma = updatedSheet.bag.equipments.Arma.map(
    (weapon) => {
      // Start with a clean weapon (reset any previous bonuses)
      const weaponCopy = resetWeaponToBase(weapon);

      // Skip automatic bonuses for manually edited weapons
      // The user's manual values should be preserved exactly as they set them
      if (weapon.hasManualEdits) {
        return weaponCopy;
      }

      // Calculate total bonuses for this weapon
      let totalAttackBonus = 0;
      let totalDamageBonus = 0;
      let totalCriticalBonus = 0;

      updatedSheet.sheetBonuses.forEach((bonus) => {
        if (
          (bonus.target.type === 'WeaponDamage' ||
            bonus.target.type === 'WeaponAttack' ||
            bonus.target.type === 'WeaponCritical') &&
          weaponMatchesBonus(weapon, bonus.target, updatedSheet)
        ) {
          const bonusValue = calculateBonusValue(updatedSheet, bonus.modifier);

          if (bonus.target.type === 'WeaponAttack') {
            totalAttackBonus += bonusValue;
          } else if (bonus.target.type === 'WeaponDamage') {
            totalDamageBonus += bonusValue;
          } else if (bonus.target.type === 'WeaponCritical') {
            totalCriticalBonus += bonusValue;
          }
        }
      });

      // Apply totaled bonuses
      if (totalAttackBonus > 0) {
        weaponCopy.atkBonus = totalAttackBonus;
      }

      if (totalDamageBonus > 0) {
        weaponCopy.dano = weaponCopy.dano
          ? `${weaponCopy.dano}+${totalDamageBonus}`
          : `+${totalDamageBonus}`;
      }

      if (totalCriticalBonus > 0 && weaponCopy.critico) {
        // Apply critical bonus logic (simplified for now)
        if (weaponCopy.critico.includes('x')) {
          const currentMult = parseInt(
            weaponCopy.critico.match(/x(\d+)/)?.[1] || '2',
            10
          );
          weaponCopy.critico = weaponCopy.critico.replace(
            /x\d+/,
            `x${currentMult + totalCriticalBonus}`
          );
        } else if (weaponCopy.critico.includes('/')) {
          const parts = weaponCopy.critico.split('/');
          if (parts[1].includes('x')) {
            const currentMult = parseInt(
              parts[1].match(/x(\d+)/)?.[1] || '2',
              10
            );
            weaponCopy.critico = `${parts[0]}/x${
              currentMult + totalCriticalBonus
            }`;
          }
        } else {
          const currentRange = parseInt(weaponCopy.critico, 10);
          if (!Number.isNaN(currentRange)) {
            weaponCopy.critico = `${Math.max(
              1,
              currentRange - totalCriticalBonus
            )}`;
          }
        }
      }

      return weaponCopy;
    }
  );

  return updatedSheet;
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
  const maxSpaces = 10 + atributos.Força.value;

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

  // If completeSkills already exists, update it while preserving manual edits
  if (updatedSheet.completeSkills) {
    updatedSheet.completeSkills = updatedSheet.completeSkills.map((skill) => {
      // Check if skill is in the skills array (base training from character creation)
      const isBaseSkillTrained = Object.values(updatedSheet.skills).includes(
        skill.name
      );

      // Preserve existing training value if skill was manually trained/untrained
      // (i.e., if completeSkills has training but skills array doesn't, or vice versa)
      // We keep the existing training value in completeSkills as it may have been manually edited
      const existingTraining = skill.training || 0;
      const baseTraining = skillTrainingMod(
        isBaseSkillTrained,
        updatedSheet.nivel
      );

      // If skill has training in completeSkills but not in base skills array,
      // it was manually trained - preserve it
      // If skill is in base skills array, use the calculated training
      const finalTraining =
        existingTraining > 0 && !isBaseSkillTrained
          ? existingTraining // Manually trained - preserve
          : baseTraining; // Use base calculation

      // Preserve existing 'others' value completely
      // This keeps any manual edits intact
      // Note: armor penalty was already calculated when the skill was first created
      // or when the user manually edited it
      const existingOthers = skill.others || 0;

      return {
        ...skill,
        halfLevel: Math.floor(updatedSheet.nivel / 2),
        training: finalTraining,
        others: existingOthers,
      };
    });
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

function applyDivinePowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  if (!sheetClone.devoto?.poderes) return sheetClone;

  sheetClone = (sheetClone.devoto.poderes || []).reduce((acc, power) => {
    const powerSelections = manualSelections?.[power.name];
    const [newAcc] = applyPower(acc, power, powerSelections);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyClassAbilities(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  const availableAbilities = sheetClone.classe.abilities.filter(
    (ability) => ability.nivel <= sheet.nivel
  );

  sheetClone.classe.abilities = availableAbilities;

  sheetClone = availableAbilities.reduce((acc, ability) => {
    const abilitySelections = manualSelections?.[ability.name];
    const [newAcc] = applyPower(acc, ability, abilitySelections);
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
    const powerName = power.name;
    const powerSelections = manualSelections?.[powerName];

    // All selections are now combined for repeatable powers

    const [newAcc] = applyPower(acc, power, powerSelections);
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
    const powerName = power.name;
    const powerSelections = manualSelections?.[powerName];

    // All selections are now combined for repeatable powers

    const [newAcc] = applyPower(acc, power, powerSelections);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyOriginPowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  if (!sheetClone.origin?.powers) return sheetClone;

  sheetClone = (sheetClone.origin.powers || []).reduce((acc, power) => {
    const powerSelections = manualSelections?.[power.name];
    const [newAcc] = applyPower(acc, power, powerSelections);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

/**
 * Checks if the character has a specific class ability
 */
function hasClassAbility(sheet: CharacterSheet, abilityName: string): boolean {
  // Check in class abilities
  const classAbilities = sheet.classe.abilities || [];
  if (
    classAbilities.some(
      (ability) => ability.name === abilityName && ability.nivel <= sheet.nivel
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if equipment bonus condition is met
 */
function isConditionMet(
  sheet: CharacterSheet,
  condition: { type: string; value: string }
): boolean {
  if (condition.type === 'hasClassAbility') {
    return hasClassAbility(sheet, condition.value);
  }

  if (condition.type === 'isClass') {
    return sheet.classe.name === condition.value;
  }

  return false;
}

/**
 * Collects and applies bonuses from all equipment in the bag
 */
function applyEquipmentBonuses(sheet: CharacterSheet): CharacterSheet {
  const updatedSheet = _.cloneDeep(sheet);

  // Collect all equipment from the bag
  const allEquipment: Equipment[] = [
    ...(updatedSheet.bag.equipments['Item Geral'] || []),
    ...(updatedSheet.bag.equipments.Vestuário || []),
    ...(updatedSheet.bag.equipments.Alquimía || []),
    ...(updatedSheet.bag.equipments.Arma || []),
    ...(updatedSheet.bag.equipments.Armadura || []),
    ...(updatedSheet.bag.equipments.Escudo || []),
    ...(updatedSheet.bag.equipments.Alimentação || []),
    ...(updatedSheet.bag.equipments.Animal || []),
    ...(updatedSheet.bag.equipments.Veículo || []),
    ...(updatedSheet.bag.equipments.Serviço || []),
    ...(updatedSheet.bag.equipments.Hospedagem || []),
  ];

  // Process each equipment
  allEquipment.forEach((equip) => {
    // Add direct sheet bonuses
    if (equip.sheetBonuses) {
      updatedSheet.sheetBonuses.push(...equip.sheetBonuses);
    }

    // Process conditional bonuses
    if (equip.conditionalBonuses) {
      equip.conditionalBonuses.forEach((conditional) => {
        if (isConditionMet(updatedSheet, conditional.condition)) {
          updatedSheet.sheetBonuses.push(...conditional.bonuses);
        }
      });
    }

    // Process selectable bonus (if a skill was selected)
    if (equip.selectableBonus && equip.selectedBonusSkill) {
      const skillBonus = {
        source: { type: 'equipment' as const, equipmentName: equip.nome },
        target: { type: 'Skill' as const, name: equip.selectedBonusSkill },
        modifier: {
          type: 'Fixed' as const,
          value: equip.selectableBonus.bonusValue,
        },
      };
      updatedSheet.sheetBonuses.push(skillBonus);
    }
  });

  return updatedSheet;
}

/**
 * Options for controlling what gets recalculated
 */
export interface RecalculateOptions {
  /** Skip PM (Pontos de Mana) recalculation - use when only equipment changes */
  skipPMRecalc?: boolean;
  /** Skip PV (Pontos de Vida) recalculation - use when only equipment changes */
  skipPVRecalc?: boolean;
}

/**
 * Recalculates the entire character sheet after changes have been made.
 * This function applies all powers, abilities, and bonuses to ensure
 * the sheet is consistent and up-to-date.
 *
 * @param sheet - The updated character sheet
 * @param originalSheet - Optional original sheet state to detect removed powers
 * @param manualSelections - Optional manual selections for powers that require them
 * @param options - Optional flags to control what gets recalculated
 */
export function recalculateSheet(
  sheet: CharacterSheet,
  originalSheet?: CharacterSheet,
  manualSelections?: ManualPowerSelections,
  options?: RecalculateOptions
): CharacterSheet {
  let updatedSheet = _.cloneDeep(sheet);
  let removedPowerNames: string[] = [];

  // Note: Attribute reset/re-application was removed - value now contains the final modifier directly.
  // Race bonuses are already included in value from initial creation.

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
                    updatedSheet.atributos[change.attribute].value;
                  const modificationValue =
                    attributeChange.value - originalValue;
                  updatedSheet.atributos[change.attribute].value -=
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
              updatedSheet.atributos[change.attribute].value -= 1;
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

  // Step 1.5: Recalculate maxSpaces based on current Força modifier
  updatedSheet.maxSpaces = 10 + updatedSheet.atributos.Força.value;

  // Step 2: Apply general powers (most important for manual additions)
  updatedSheet = applyGeneralPowers(updatedSheet, manualSelections);

  // Step 3: Apply class powers (with manual selections)
  updatedSheet = applyClassPowers(updatedSheet, manualSelections);

  // Step 4: Apply race abilities
  // Note: applyRaceAbilities is imported from general.ts and expects SelectionOptions (flat)
  // Race ability selections are already applied during initial creation
  updatedSheet = applyRaceAbilities(updatedSheet);

  // Step 5: Apply class abilities (filter by level)
  updatedSheet = applyClassAbilities(updatedSheet, manualSelections);

  // Step 6: Apply divine powers
  updatedSheet = applyDivinePowers(updatedSheet, manualSelections);

  // Step 7: Apply origin powers
  updatedSheet = applyOriginPowers(updatedSheet, manualSelections);

  // Step 7.3: Apply equipment bonuses
  updatedSheet = applyEquipmentBonuses(updatedSheet);

  // Check for manual max overrides - when set, skip ALL recalculation for that stat
  // Player takes full control of these values when manually defined
  const hasManualMaxPV =
    updatedSheet.manualMaxPV !== undefined && updatedSheet.manualMaxPV > 0;
  const hasManualMaxPM =
    updatedSheet.manualMaxPM !== undefined && updatedSheet.manualMaxPM > 0;

  // Step 7.5: Reset PV and PM to base values AFTER all powers applied (to use correct attributes)
  // Skip PV recalculation if flag is set (e.g., equipment-only changes)
  if (!options?.skipPVRecalc) {
    if (hasManualMaxPV) {
      // Player has set manual max - skip all calculations, just use the manual value
      updatedSheet.pv = updatedSheet.manualMaxPV!;
    } else {
      // PV base = classe.pv + (classe.addpv * (level - 1)) + (CON mod * level)
      const basePV = updatedSheet.classe.pv || 0;
      const addPVPerLevel =
        updatedSheet.customPVPerLevel ?? updatedSheet.classe.addpv ?? 0; // Use custom value if defined
      const conMod = updatedSheet.atributos.Constituição?.value || 0;
      updatedSheet.pv =
        basePV +
        addPVPerLevel * (updatedSheet.nivel - 1) +
        conMod * updatedSheet.nivel;

      // Add bonus PV if defined
      if (updatedSheet.bonusPV) {
        updatedSheet.pv += updatedSheet.bonusPV;
      }

      // Add manual PV edit if defined (applied after all calculations)
      if (updatedSheet.manualPVEdit) {
        updatedSheet.pv += updatedSheet.manualPVEdit;
      }
    }

    // Initialize current PV if not set (first time or reset)
    if (updatedSheet.currentPV === undefined) {
      updatedSheet.currentPV = updatedSheet.pv;
    }

    // Initialize increment if not set
    if (updatedSheet.pvIncrement === undefined) {
      updatedSheet.pvIncrement = 1;
    }
  }

  // Skip PM recalculation if flag is set (e.g., equipment-only changes)
  if (!options?.skipPMRecalc) {
    if (hasManualMaxPM) {
      // Player has set manual max - skip all calculations, just use the manual value
      updatedSheet.pm = updatedSheet.manualMaxPM!;
    } else {
      // PM base = classe.pm + (classe.addpm * (level - 1))
      // Note: Key attribute bonus (INT/CAR/SAB) is NOT added here - it comes from
      // class abilities (e.g., "Magias") via sheetBonuses to avoid double-counting
      const basePM = updatedSheet.classe.pm || 0;
      const addPMPerLevel =
        updatedSheet.customPMPerLevel ?? updatedSheet.classe.addpm ?? 0; // Use custom value if defined

      // Calculate PM: base + perLevel * (level - 1)
      updatedSheet.pm = basePM + addPMPerLevel * (updatedSheet.nivel - 1);

      // Add bonus PM if defined
      if (updatedSheet.bonusPM) {
        updatedSheet.pm += updatedSheet.bonusPM;
      }

      // Add manual PM edit if defined (applied after all calculations)
      if (updatedSheet.manualPMEdit) {
        updatedSheet.pm += updatedSheet.manualPMEdit;
      }
    }

    // Initialize current PM if not set (first time or reset)
    if (updatedSheet.currentPM === undefined) {
      updatedSheet.currentPM = updatedSheet.pm;
    }

    // Initialize increment if not set
    if (updatedSheet.pmIncrement === undefined) {
      updatedSheet.pmIncrement = 1;
    }
  }

  // Note: We allow current values to exceed maximums for temporary bonuses
  // (buffs, magic items, etc.). No validation needed here.

  // Step 7.7: Recalculate skills (resets others to 0)
  updatedSheet = recalculateCompleteSkills(updatedSheet);

  // Step 8: Apply non-defense bonuses (PV, PM, skills, etc.)
  // PM Debug - Initial state (calculate values for debug even if skipped)
  const debugBasePM = updatedSheet.classe.pm || 0;
  const debugAddPMPerLevel =
    updatedSheet.customPMPerLevel ?? updatedSheet.classe.addpm ?? 0;
  const pmDebug = {
    initialPM: updatedSheet.pm, // After reset with level progression and bonus
    classeBasePM: debugBasePM,
    classePMPerLevel: debugAddPMPerLevel,
    customPMPerLevel: updatedSheet.customPMPerLevel,
    bonusPM: updatedSheet.bonusPM,
    nivel: updatedSheet.nivel,
    pmFromLevels: debugAddPMPerLevel * (updatedSheet.nivel - 1),
    atributos: {
      INT: updatedSheet.atributos.Inteligência?.value || 0,
      CAR: updatedSheet.atributos.Carisma?.value || 0,
      SAB: updatedSheet.atributos.Sabedoria?.value || 0,
    },
    spellKeyAttr: updatedSheet.classe.spellPath?.keyAttribute || 'N/A',
    spellKeyAttrMod: updatedSheet.classe.spellPath?.keyAttribute
      ? updatedSheet.atributos[updatedSheet.classe.spellPath.keyAttribute]
          ?.value || 0
      : 0,
    bonuses: [] as Array<{
      source: string;
      bonusType: string;
      formula?: string;
      calculatedValue: number;
      pmBefore: number;
      pmAfter: number;
    }>,
  };

  updatedSheet.sheetBonuses.forEach((bonus) => {
    if (
      bonus.target.type !== 'Defense' &&
      bonus.target.type !== 'HPAttributeReplacement'
    ) {
      const bonusValue = calculateBonusValue(updatedSheet, bonus.modifier);

      if (
        bonus.target.type === 'PV' &&
        !options?.skipPVRecalc &&
        !hasManualMaxPV
      ) {
        updatedSheet.pv += bonusValue;
      } else if (
        bonus.target.type === 'PM' &&
        !options?.skipPMRecalc &&
        !hasManualMaxPM
      ) {
        const pmBefore = updatedSheet.pm;
        updatedSheet.pm += bonusValue;
        const pmAfter = updatedSheet.pm;

        // Track PM bonus details
        let sourceLabel = 'Unknown';
        if (bonus.source?.type === 'power') {
          sourceLabel = `Power: ${bonus.source.name}`;
        } else if (bonus.source?.type === 'origin') {
          sourceLabel = `Origin: ${bonus.source.originName}`;
        } else if (bonus.source?.type === 'race') {
          sourceLabel = `Race: ${bonus.source.raceName}`;
        }

        pmDebug.bonuses.push({
          source: sourceLabel,
          bonusType: bonus.modifier.type,
          formula:
            'formula' in bonus.modifier ? bonus.modifier.formula : undefined,
          calculatedValue: bonusValue,
          pmBefore,
          pmAfter,
        });
      } else if (bonus.target.type === 'Skill') {
        const skillName = bonus.target.name;
        addOtherBonusToSkill(updatedSheet, skillName, bonusValue);
      } else if (bonus.target.type === 'PickSkill') {
        // Re-apply PickSkill bonuses using manual selections
        // Find which power this bonus belongs to by checking the bonus source
        if (
          bonus.source?.type === 'power' &&
          manualSelections?.[bonus.source.name]
        ) {
          const powerName = bonus.source.name;
          const powerSelections = manualSelections[powerName];

          // All selections are now combined in a single SelectionOptions object
          let skillsToProcess: string[] = [];

          if (powerSelections?.skills) {
            skillsToProcess = powerSelections.skills;
          }

          if (skillsToProcess.length > 0) {
            const selectedSkills = skillsToProcess.slice(0, bonus.target.pick);
            selectedSkills.forEach((skillName: string) => {
              addOtherBonusToSkill(updatedSheet, skillName, bonusValue);
            });
          }
        }
      } else if (bonus.target.type === 'Displacement') {
        updatedSheet.displacement += bonusValue;
      } else if (bonus.target.type === 'ArmorPenalty') {
        updatedSheet.extraArmorPenalty =
          (updatedSheet.extraArmorPenalty || 0) + bonusValue;
      } else if (bonus.target.type === 'MaxSpaces') {
        updatedSheet.maxSpaces = (updatedSheet.maxSpaces || 0) + bonusValue;
      } else if (bonus.target.type === 'SpellDC') {
        // SpellDC bonuses are tracked in sheetBonuses for display
        // The actual calculation is done when casting spells
        // (stored for reference but not directly applied to sheet)
      }
    }
  });

  // Step 9: Reset defense to base and recalculate from ground up
  const baseDefense = updatedSheet.customDefenseBase ?? 10;
  updatedSheet.defesa = baseDefense;
  updatedSheet = calcDefense(updatedSheet); // Calculate base + equipment + attributes

  // Check if heavy armor is equipped
  const equippedArmors = updatedSheet.bag.equipments.Armadura || [];
  const heavyArmor = equippedArmors.some((armor) => isHeavyArmor(armor));

  // Apply custom attribute logic if defined
  if (updatedSheet.useDefenseAttribute === false && !heavyArmor) {
    // User explicitly disabled attribute, remove it
    const defaultAttr =
      updatedSheet.classe.name === 'Nobre'
        ? updatedSheet.atributos.Carisma.value
        : updatedSheet.atributos.Destreza.value;
    updatedSheet.defesa -= defaultAttr;
  } else if (
    updatedSheet.customDefenseAttribute &&
    updatedSheet.useDefenseAttribute !== false &&
    !heavyArmor
  ) {
    // User specified a custom attribute (and didn't disable it)
    const defaultAttr =
      updatedSheet.classe.name === 'Nobre'
        ? Atributo.CARISMA
        : Atributo.DESTREZA;

    if (updatedSheet.customDefenseAttribute !== defaultAttr) {
      // Remove default attribute value and add custom
      const defaultValue = updatedSheet.atributos[defaultAttr].value;
      const customValue =
        updatedSheet.atributos[updatedSheet.customDefenseAttribute].value;
      updatedSheet.defesa = updatedSheet.defesa - defaultValue + customValue;
    }
  }

  // Add manual bonus
  if (updatedSheet.bonusDefense) {
    updatedSheet.defesa += updatedSheet.bonusDefense;
  }

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

  // Step 12: Apply HP attribute replacement (Dom da Esperança)
  updatedSheet = applyHPAttributeReplacement(updatedSheet);

  // Step 13: Apply weapon bonuses
  updatedSheet = applyWeaponBonuses(updatedSheet, manualSelections);

  // PM Debug - Final output
  pmDebug.bonuses.push({
    source: '=== FINAL PM ===',
    bonusType: 'Total',
    calculatedValue: updatedSheet.pm - pmDebug.initialPM,
    pmBefore: pmDebug.initialPM,
    pmAfter: updatedSheet.pm,
  });

  // Step 14: Deduplicate arrays to prevent accumulation
  updatedSheet.spells = deduplicateSpells(updatedSheet.spells);
  updatedSheet.sheetActionHistory = deduplicateHistory(
    updatedSheet.sheetActionHistory
  );
  updatedSheet.steps = deduplicateSteps(updatedSheet.steps);

  return updatedSheet;
}
