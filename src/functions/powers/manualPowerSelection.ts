import { ClassPower } from '@/interfaces/Class';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { GeneralPower, OriginPower } from '@/interfaces/Poderes';
import {
  PowerSelectionRequirement,
  PowerSelectionRequirements,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import { RaceAbility } from '@/interfaces/Race';
import Skill from '@/interfaces/Skills';
import { Spell } from '@/interfaces/Spells';
import { ANIMAL_TOTEM_NAMES } from '@/data/systems/tormenta20/animalTotems';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { Armas } from '@/data/systems/tormenta20/equipamentos';
import { FAMILIAR_NAMES } from '@/data/systems/tormenta20/familiars';
import { getArcaneSpellsOfCircle } from '@/data/systems/tormenta20/magias/arcane';
import { getSpellsOfCircle } from '@/data/systems/tormenta20/magias/generalSpells';
import { getAttributeIncreasesInSamePlateau } from './general';
import { isPowerAvailable } from '../powers';

/**
 * Check if a power requires manual selection from the user
 */
export function getPowerSelectionRequirements(
  power: GeneralPower | ClassPower | RaceAbility | OriginPower
): PowerSelectionRequirements | null {
  const requirements: PowerSelectionRequirement[] = [];

  // Check sheetActions for manual selections
  if (power.sheetActions && power.sheetActions.length > 0) {
    power.sheetActions.forEach((sheetAction) => {
      const { action } = sheetAction;

      if (action.type === 'learnSkill' && action.pick > 0) {
        requirements.push({
          type: 'learnSkill',
          availableOptions: action.availableSkills,
          pick: action.pick,
          label: `Selecione ${action.pick} perícia${
            action.pick > 1 ? 's' : ''
          }`,
        });
      }

      if (action.type === 'addProficiency' && action.pick > 0) {
        requirements.push({
          type: 'addProficiency',
          availableOptions: action.availableProficiencies,
          pick: action.pick,
          label: `Selecione ${action.pick} proficiência${
            action.pick > 1 ? 's' : ''
          }`,
        });
      }

      if (action.type === 'getGeneralPower' && action.pick > 0) {
        requirements.push({
          type: 'getGeneralPower',
          availableOptions: action.availablePowers,
          pick: action.pick,
          label: `Selecione ${action.pick} poder${
            action.pick > 1 ? 'es' : ''
          } geral${action.pick > 1 ? 'is' : ''}`,
        });
      }

      if (action.type === 'learnSpell' && action.pick > 0) {
        requirements.push({
          type: 'learnSpell',
          availableOptions: action.availableSpells,
          pick: action.pick,
          label: `Selecione ${action.pick} magia${action.pick > 1 ? 's' : ''}`,
        });
      }

      if (action.type === 'learnAnySpellFromHighestCircle' && action.pick > 0) {
        requirements.push({
          type: 'learnAnySpellFromHighestCircle',
          availableOptions: [], // Will be populated dynamically in getFilteredAvailableOptions
          pick: action.pick,
          label: `Selecione ${action.pick} magia${
            action.pick > 1 ? 's' : ''
          } (qualquer círculo disponível)`,
          metadata: {
            allowedType: action.allowedType,
            schools: action.schools,
          },
        });
      }

      if (action.type === 'increaseAttribute') {
        requirements.push({
          type: 'increaseAttribute',
          availableOptions: [], // Will be populated dynamically in getFilteredAvailableOptions
          pick: 1, // Always pick 1 attribute
          label: 'Selecione 1 atributo para aumentar',
        });
      }

      if (action.type === 'selectWeaponSpecialization') {
        requirements.push({
          type: 'selectWeaponSpecialization',
          availableOptions: action.availableWeapons || [], // Will be populated dynamically if empty
          pick: 1, // Always pick 1 weapon
          label: 'Selecione 1 arma para especialização',
        });
      }

      if (action.type === 'selectFamiliar') {
        requirements.push({
          type: 'selectFamiliar',
          availableOptions: action.availableFamiliars || [], // Will be populated dynamically if empty
          pick: 1, // Always pick 1 familiar
          label: 'Selecione 1 familiar',
        });
      }

      if (action.type === 'selectAnimalTotem') {
        requirements.push({
          type: 'selectAnimalTotem',
          availableOptions: action.availableTotems || [], // Will be populated dynamically if empty
          pick: 1, // Always pick 1 totem
          label: 'Selecione 1 animal totêmico',
        });
      }

      if (action.type === 'buildGolpePessoal') {
        requirements.push({
          type: 'buildGolpePessoal',
          availableOptions: [], // No predefined options, will use builder interface
          pick: 1, // Always build 1 golpe
          label: 'Construa seu Golpe Pessoal',
        });
      }
    });
  }

  // Check sheetBonuses for PickSkill targets
  if (power.sheetBonuses && power.sheetBonuses.length > 0) {
    power.sheetBonuses.forEach((bonus) => {
      if (bonus.target.type === 'PickSkill' && bonus.target.pick > 0) {
        requirements.push({
          type: 'learnSkill',
          availableOptions: bonus.target.skills,
          pick: bonus.target.pick,
          label: `Selecione ${bonus.target.pick} perícia${
            bonus.target.pick > 1 ? 's' : ''
          }`,
        });
      }
    });
  }

  if (requirements.length === 0) {
    return null;
  }

  return {
    powerName: power.name,
    requirements,
  };
}

/**
 * Filter available options based on what the character already has
 */
export function getFilteredAvailableOptions(
  requirement: PowerSelectionRequirement,
  sheet: CharacterSheet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  const { type, availableOptions } = requirement;

  switch (type) {
    case 'learnSkill': {
      const skills = availableOptions as Skill[];
      return skills
        .filter((skill) => {
          // Check if skill is already in the skills array
          if (sheet.skills.includes(skill)) {
            return false;
          }

          // Check if skill is already trained in completeSkills
          if (sheet.completeSkills) {
            const existingSkill = sheet.completeSkills.find(
              (cs) => cs.name === skill
            );
            if (
              existingSkill &&
              existingSkill.training &&
              existingSkill.training > 0
            ) {
              return false;
            }
          }

          return true;
        })
        .sort((a, b) => a.localeCompare(b));
    }

    case 'addProficiency': {
      const proficiencies = availableOptions as string[];
      return proficiencies
        .filter((prof) => !sheet.classe.proficiencias.includes(prof))
        .sort((a, b) => a.localeCompare(b));
    }

    case 'getGeneralPower': {
      const powers = availableOptions as GeneralPower[];
      return powers
        .filter((power) => {
          // Filter out powers the character already has
          if (
            sheet.generalPowers?.some(
              (existing) => existing.name === power.name
            )
          ) {
            return false;
          }
          // Filter out powers whose requirements are not met
          if (!isPowerAvailable(sheet, power)) {
            return false;
          }
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    case 'learnSpell': {
      const spells = availableOptions as Spell[];
      return spells
        .filter(
          (spell) =>
            !sheet.spells?.some((existing) => existing.nome === spell.nome)
        )
        .sort((a, b) => a.nome.localeCompare(b.nome));
    }

    case 'learnAnySpellFromHighestCircle': {
      // Dynamically determine available spells from ANY circle up to the highest available
      const highestCircle =
        sheet.classe.spellPath?.spellCircleAvailableAtLevel(sheet.nivel) || 1;

      const allAvailableSpells: Spell[] = [];
      const allowedType = requirement.metadata?.allowedType || 'Both';

      // Get spells from all circles from 1 up to the highest available
      for (let circle = 1; circle <= highestCircle; circle += 1) {
        if (allowedType === 'Arcane') {
          allAvailableSpells.push(...getArcaneSpellsOfCircle(circle));
        } else if (allowedType === 'Divine') {
          allAvailableSpells.push(...getSpellsOfCircle(circle));
        } else {
          // Both - combine arcane and divine for this circle
          const arcaneSpells = getArcaneSpellsOfCircle(circle);
          const divineSpells = getSpellsOfCircle(circle);
          allAvailableSpells.push(...arcaneSpells, ...divineSpells);
        }
      }

      // Remove duplicates from allAvailableSpells (same spell might exist in both arcane and divine)
      const uniqueSpells = allAvailableSpells.filter(
        (spell, index, array) =>
          array.findIndex((s) => s.nome === spell.nome) === index
      );

      // Filter by schools if specified
      const allowedSchools = requirement.metadata?.schools || [];
      let availableSpells = uniqueSpells;
      if (allowedSchools.length > 0) {
        availableSpells = uniqueSpells.filter((spell) =>
          allowedSchools.includes(spell.school)
        );
      }

      // Filter out spells already known and sort by name
      return availableSpells
        .filter(
          (spell) =>
            !sheet.spells?.some((existing) => existing.nome === spell.nome)
        )
        .sort((a, b) => a.nome.localeCompare(b.nome));
    }

    case 'increaseAttribute': {
      // Get attributes that haven't been increased in the current plateau
      const usedAttributes = getAttributeIncreasesInSamePlateau(sheet);
      const availableAttributes = Object.values(Atributo).filter(
        (attr) => !usedAttributes.includes(attr)
      );

      // Return attribute names sorted alphabetically
      return availableAttributes.sort((a, b) => a.localeCompare(b));
    }

    case 'selectWeaponSpecialization': {
      // If specific weapons were provided, use those
      if (availableOptions && availableOptions.length > 0) {
        return (availableOptions as string[]).sort((a, b) =>
          a.localeCompare(b)
        );
      }

      // Otherwise, return all available weapons
      const allWeaponNames = Object.values(Armas).map((weapon) => weapon.nome);
      return allWeaponNames.sort((a, b) => a.localeCompare(b));
    }

    case 'selectFamiliar': {
      // If specific familiars were provided, use those
      if (availableOptions && availableOptions.length > 0) {
        return (availableOptions as string[]).sort((a, b) =>
          a.localeCompare(b)
        );
      }

      // Otherwise, return all available familiars
      return FAMILIAR_NAMES.sort((a, b) => a.localeCompare(b));
    }

    case 'selectAnimalTotem': {
      // If specific totems were provided, use those
      if (availableOptions && availableOptions.length > 0) {
        return (availableOptions as string[]).sort((a, b) =>
          a.localeCompare(b)
        );
      }

      // Otherwise, return all available totems
      return ANIMAL_TOTEM_NAMES.sort((a, b) => a.localeCompare(b));
    }

    default:
      return availableOptions;
  }
}

/**
 * Validate that the user's selections meet the requirements
 */
export function validateSelections(
  requirements: PowerSelectionRequirements,
  selections: SelectionOptions,
  sheet: CharacterSheet
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  requirements.requirements.forEach((requirement) => {
    const { type, pick } = requirement;

    let selectedCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let selectedItems: any[] = [];

    switch (type) {
      case 'learnSkill':
        selectedItems = selections.skills || [];
        selectedCount = selectedItems.length;
        break;

      case 'addProficiency':
        selectedItems = selections.proficiencies || [];
        selectedCount = selectedItems.length;
        break;

      case 'getGeneralPower':
        selectedItems = selections.powers || [];
        selectedCount = selectedItems.length;
        break;

      case 'learnSpell':
      case 'learnAnySpellFromHighestCircle':
        selectedItems = selections.spells || [];
        selectedCount = selectedItems.length;
        break;

      case 'increaseAttribute':
        selectedItems = selections.attributes || [];
        selectedCount = selectedItems.length;
        break;

      case 'selectWeaponSpecialization':
        selectedItems = selections.weapons || [];
        selectedCount = selectedItems.length;
        break;

      case 'selectFamiliar':
        selectedItems = selections.familiars || [];
        selectedCount = selectedItems.length;
        break;

      case 'selectAnimalTotem':
        selectedItems = selections.animalTotems || [];
        selectedCount = selectedItems.length;
        break;

      default:
        // Handle unknown types
        break;
    }

    if (selectedCount !== pick) {
      errors.push(
        `${requirement.label}: esperado ${pick}, selecionado ${selectedCount}`
      );
    }

    // Check if selections are available
    const availableOptions = getFilteredAvailableOptions(requirement, sheet);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getName = (item: any): string => {
      if (typeof item === 'string') return item;
      if ('name' in item) return item.name;
      if ('nome' in item) return item.nome;
      return String(item);
    };

    selectedItems.forEach((item) => {
      const itemName = getName(item);
      if (
        !availableOptions.some((available) => getName(available) === itemName)
      ) {
        errors.push(
          `Seleção inválida: ${itemName} não está disponível para ${requirement.label}`
        );
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Apply a power with manual selections instead of random picks
 */
export function applyPowerWithManualSelections(
  sheet: CharacterSheet,
  _power: GeneralPower | ClassPower,
  _selections: SelectionOptions
): CharacterSheet {
  // This will be implemented when we update the applyPower function
  // For now, we'll return the sheet unchanged
  return sheet;
}
