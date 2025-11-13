import _ from 'lodash';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Skill, {
  SkillsAttrs,
  SkillsWithArmorPenalty,
} from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { calcDefense } from '@/data/systems/tormenta20/equipamentos';
import { getRaceDisplacement } from '@/data/systems/tormenta20/races/functions/functions';
import Bag from '@/interfaces/Bag';
import { CharacterAttributes } from '@/interfaces/Character';
import Equipment from '@/interfaces/Equipment';
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

  // Reset atkBonus to 0 (base value)
  resetWeapon.atkBonus = 0;

  // Reset damage string to remove any added bonuses
  if (resetWeapon.dano && resetWeapon.dano.includes('+')) {
    // Extract base damage (everything before the first '+')
    [resetWeapon.dano] = resetWeapon.dano.split('+');
  }

  // Reset critical to base value - this is more complex as we need to handle
  // various formats like "x2", "19", "19/x3", etc.
  // For now, we'll store original values or use a more sophisticated approach
  // TODO: Consider storing original weapon data separately

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
      updatedSheet.atributos[newAttribute].mod * updatedSheet.nivel;

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

  // Step 7.5: Reset PV and PM to base values before applying bonuses (to avoid accumulation)
  // PV base = classe.pv + (classe.addpv * (level - 1)) + (CON mod * level)
  const basePV = updatedSheet.classe.pv || 0;
  const addPVPerLevel =
    updatedSheet.customPVPerLevel ?? updatedSheet.classe.addpv ?? 0; // Use custom value if defined
  const conMod = updatedSheet.atributos.Constituição?.mod || 0;
  updatedSheet.pv =
    basePV +
    addPVPerLevel * (updatedSheet.nivel - 1) +
    conMod * updatedSheet.nivel;

  // Add bonus PV if defined
  if (updatedSheet.bonusPV) {
    updatedSheet.pv += updatedSheet.bonusPV;
  }

  // PM base = classe.pm + keyAttrMod + ((classe.addpm + keyAttrMod) * (level - 1))
  const basePM = updatedSheet.classe.pm || 0;
  const addPMPerLevel =
    updatedSheet.customPMPerLevel ?? updatedSheet.classe.addpm ?? 0; // Use custom value if defined

  // Get key attribute modifier for PM (spell casters use their key attribute)
  let keyAttrMod = 0;
  if (updatedSheet.classe.spellPath) {
    const keyAttr =
      updatedSheet.atributos[updatedSheet.classe.spellPath.keyAttribute];
    keyAttrMod = keyAttr?.mod || 0;
  }

  // Calculate PM: base + keyAttrMod + (perLevel + keyAttrMod) * (level - 1)
  updatedSheet.pm =
    basePM +
    keyAttrMod +
    (addPMPerLevel + keyAttrMod) * (updatedSheet.nivel - 1);

  // Add bonus PM if defined
  if (updatedSheet.bonusPM) {
    updatedSheet.pm += updatedSheet.bonusPM;
  }

  // Step 8: Apply non-defense bonuses (PV, PM, skills, etc.)
  // PM Debug - Initial state
  const pmDebug = {
    initialPM: updatedSheet.pm, // After reset with level progression and bonus
    classeBasePM: basePM,
    classePMPerLevel: addPMPerLevel,
    keyAttrMod,
    customPMPerLevel: updatedSheet.customPMPerLevel,
    bonusPM: updatedSheet.bonusPM,
    nivel: updatedSheet.nivel,
    pmFromLevels: (addPMPerLevel + keyAttrMod) * (updatedSheet.nivel - 1),
    atributos: {
      INT: updatedSheet.atributos.Inteligência?.mod || 0,
      CAR: updatedSheet.atributos.Carisma?.mod || 0,
      SAB: updatedSheet.atributos.Sabedoria?.mod || 0,
    },
    spellKeyAttr: updatedSheet.classe.spellPath?.keyAttribute || 'N/A',
    spellKeyAttrMod: updatedSheet.classe.spellPath?.keyAttribute
      ? updatedSheet.atributos[updatedSheet.classe.spellPath.keyAttribute]
          ?.mod || 0
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

      if (bonus.target.type === 'PV') {
        updatedSheet.pv += bonusValue;
      } else if (bonus.target.type === 'PM') {
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
      }
    }
  });

  // Step 9: Reset defense to base and recalculate from ground up
  const baseDefense = updatedSheet.customDefenseBase ?? 10;
  updatedSheet.defesa = baseDefense;
  updatedSheet = calcDefense(updatedSheet); // Calculate base + equipment + attributes

  // Check if heavy armor is equipped
  const equippedArmors = updatedSheet.bag.equipments.Armadura || [];
  const heavyArmor = equippedArmors.some(
    (armor) =>
      // Check if this is a heavy armor from the EQUIPAMENTOS list
      armor.nome &&
      [
        'Brunea',
        'Cota de Malha',
        'Loriga Segmentada',
        'Armadura de Placas',
        'Armadura Completa',
      ].includes(armor.nome)
  );

  // Apply custom attribute logic if defined
  if (updatedSheet.useDefenseAttribute === false && !heavyArmor) {
    // User explicitly disabled attribute, remove it
    const defaultAttr =
      updatedSheet.classe.name === 'Nobre'
        ? updatedSheet.atributos.Carisma.mod
        : updatedSheet.atributos.Destreza.mod;
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
      // Remove default attribute mod and add custom
      const defaultMod = updatedSheet.atributos[defaultAttr].mod;
      const customMod =
        updatedSheet.atributos[updatedSheet.customDefenseAttribute].mod;
      updatedSheet.defesa = updatedSheet.defesa - defaultMod + customMod;
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

  return updatedSheet;
}
