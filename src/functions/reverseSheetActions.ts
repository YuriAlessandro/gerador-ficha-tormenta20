import _ from 'lodash';
import CharacterSheet, {
  SheetActionReceipt,
} from '@/interfaces/CharacterSheet';
import { Atributo } from '@/data/atributos';
import { GeneralPower } from '@/interfaces/Poderes';
import { ClassPower } from '@/interfaces/Class';
import Skill from '@/interfaces/Skills';

/**
 * Reverses attribute modifications by finding the original value
 */
function reverseAttributeChange(
  sheet: CharacterSheet,
  attribute: Atributo,
  powerName: string
): void {
  // Find the original modification in history to get the exact value that was added
  const relevantHistory = sheet.sheetActionHistory.find(
    (entry) =>
      entry.powerName === powerName &&
      entry.changes.some(
        (change) =>
          change.type === 'Attribute' && change.attribute === attribute
      )
  );

  if (relevantHistory) {
    const attributeChange = relevantHistory.changes.find(
      (change) => change.type === 'Attribute' && change.attribute === attribute
    ) as { type: 'Attribute'; attribute: Atributo; value: number };

    if (attributeChange) {
      // Subtract the modification value that was applied
      const originalValue = sheet.atributos[attribute].mod;
      const modificationValue = attributeChange.value - originalValue;
      sheet.atributos[attribute].mod -= modificationValue;
    }
  }
}

/**
 * Reverses proficiency additions
 */
function reverseProficiencyAdded(
  sheet: CharacterSheet,
  proficiency: string
): void {
  const index = sheet.classe.proficiencias.indexOf(proficiency);
  if (index > -1) {
    sheet.classe.proficiencias.splice(index, 1);
  }
}

/**
 * Reverses skill additions
 */
function reverseSkillsAdded(sheet: CharacterSheet, skills: string[]): void {
  skills.forEach((skill) => {
    const index = sheet.skills.indexOf(skill as Skill);
    if (index > -1) {
      sheet.skills.splice(index, 1);
    }
  });
}

/**
 * Reverses sense additions
 */
function reverseSenseAdded(sheet: CharacterSheet, sense: string): void {
  if (sheet.sentidos) {
    const index = sheet.sentidos.indexOf(sense);
    if (index > -1) {
      sheet.sentidos.splice(index, 1);
    }
  }
}

/**
 * Reverses equipment additions
 */
function reverseEquipmentAdded(
  sheet: CharacterSheet,
  equipment: unknown
): void {
  // This is complex as equipment can be nested in the bag
  // For now, we'll implement a basic version
  // eslint-disable-next-line no-console
  console.warn('Equipment reversal not fully implemented yet', equipment);
}

/**
 * Reverses general power additions
 */
function reversePowerAdded(sheet: CharacterSheet, powerName: string): void {
  if (sheet.generalPowers) {
    const index = sheet.generalPowers.findIndex(
      (power) => power.name === powerName
    );
    if (index > -1) {
      sheet.generalPowers.splice(index, 1);
    }
  }
}

/**
 * Reverses spell learning
 */
function reverseSpellsLearned(
  sheet: CharacterSheet,
  spellNames: string[]
): void {
  if (sheet.spells) {
    spellNames.forEach((spellName) => {
      const spellIndex = sheet.spells.findIndex(
        (spell) => spell.nome === spellName
      );
      if (spellIndex > -1) {
        sheet.spells.splice(spellIndex, 1);
      }
    });
  }
}

/**
 * Reverses attribute increases from "Aumento de Atributo"
 */
function reverseAttributeIncrease(
  sheet: CharacterSheet,
  attribute: Atributo,
  _plateau: number
): void {
  // Decrease the attribute by 1
  sheet.atributos[attribute].mod -= 1;
}

/**
 * Reverses a specific sheet action change
 */
function reverseSheetActionChange(
  sheet: CharacterSheet,
  change: SheetActionReceipt,
  powerName: string
): void {
  switch (change.type) {
    case 'Attribute':
      reverseAttributeChange(sheet, change.attribute, powerName);
      break;

    case 'ProficiencyAdded':
      reverseProficiencyAdded(sheet, change.proficiency);
      break;

    case 'SkillsAdded':
      reverseSkillsAdded(sheet, change.skills);
      break;

    case 'SenseAdded':
      reverseSenseAdded(sheet, change.sense);
      break;

    case 'EquipmentAdded':
      reverseEquipmentAdded(sheet, change.equipment);
      break;

    case 'PowerAdded':
      reversePowerAdded(sheet, change.powerName);
      break;

    case 'SpellsLearned':
      reverseSpellsLearned(sheet, change.spellNames);
      break;

    case 'AttributeIncreasedByAumentoDeAtributo':
      reverseAttributeIncrease(sheet, change.attribute, change.plateau);
      break;

    default:
      // eslint-disable-next-line no-console
      console.warn(
        `Unknown sheet action change type: ${(change as { type: string }).type}`
      );
  }
}

/**
 * Removes all sheet bonuses that were applied by a specific power
 */
function removeSheetBonusesFromPower(
  sheet: CharacterSheet,
  powerName: string
): void {
  // Remove all sheet bonuses that came from this power
  sheet.sheetBonuses = sheet.sheetBonuses.filter(
    (bonus) => bonus.source.type !== 'power' || bonus.source.name !== powerName
  );
}

/**
 * Reverses all sheet actions that were applied by a specific power
 */
export function reversePowerActions(
  sheet: CharacterSheet,
  powerName: string
): CharacterSheet {
  const updatedSheet = _.cloneDeep(sheet);

  // 1. Remove sheet bonuses from this power first
  removeSheetBonusesFromPower(updatedSheet, powerName);

  // 2. Find all history entries for this power
  const powerHistoryEntries = updatedSheet.sheetActionHistory.filter(
    (entry) => entry.powerName === powerName
  );

  // 3. Reverse each action in reverse order (LIFO)
  powerHistoryEntries.reverse().forEach((historyEntry) => {
    historyEntry.changes.forEach((change) => {
      reverseSheetActionChange(updatedSheet, change, powerName);
    });
  });

  // 4. Remove history entries for this power
  updatedSheet.sheetActionHistory = updatedSheet.sheetActionHistory.filter(
    (entry) => entry.powerName !== powerName
  );

  return updatedSheet;
}

/**
 * Reverses multiple powers at once
 */
export function reverseMultiplePowerActions(
  sheet: CharacterSheet,
  powerNames: string[]
): CharacterSheet {
  return powerNames.reduce(
    (acc, powerName) => reversePowerActions(acc, powerName),
    sheet
  );
}

/**
 * Gets a list of powers that were removed from the sheet
 */
export function getRemovedPowers(
  originalPowers: (GeneralPower | ClassPower)[],
  newPowers: (GeneralPower | ClassPower)[]
): string[] {
  const originalNames = originalPowers.map((p) => p.name);
  const newNames = newPowers.map((p) => p.name);

  return originalNames.filter((name) => !newNames.includes(name));
}

/**
 * Gets a list of powers that were added to the sheet
 */
export function getAddedPowers(
  originalPowers: (GeneralPower | ClassPower)[],
  newPowers: (GeneralPower | ClassPower)[]
): string[] {
  const originalNames = originalPowers.map((p) => p.name);
  const newNames = newPowers.map((p) => p.name);

  return newNames.filter((name) => !originalNames.includes(name));
}
