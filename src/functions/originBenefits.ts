import CharacterSheet from '@/interfaces/CharacterSheet';
import Origin from '@/interfaces/Origin';
import { OriginBenefit } from '@/interfaces/WizardSelections';
import { OriginPower } from '@/interfaces/Poderes';
import Skill from '@/interfaces/Skills';

/**
 * Removes origin benefits from the character sheet
 * This includes skills and powers granted by the origin
 *
 * NOTE: Items are NOT removed because Bag uses a complex BagEquipments structure
 * that groups items by category, making it difficult to track which items came from origin.
 * Skills can be removed if selectedBenefits is persisted in sheet.origin.
 */
export function removeOriginBenefits(sheet: CharacterSheet): CharacterSheet {
  const updatedSheet = { ...sheet };

  // If we have selectedBenefits, remove those skills
  if (sheet.origin?.selectedBenefits) {
    const skillsToRemove = sheet.origin.selectedBenefits
      .filter((b) => b.type === 'skill')
      .map((b) => b.name);

    updatedSheet.skills = sheet.skills.filter(
      (skill) => !skillsToRemove.includes(skill)
    );
  }

  // Remove origin powers
  updatedSheet.origin = undefined;

  return updatedSheet;
}

/**
 * Applies origin benefits to the character sheet based on selected benefits
 *
 * NOTE: Items are NOT added to the bag because Bag uses a complex BagEquipments structure
 * that requires proper grouping by category (Arma, Armadura, etc.). This would require
 * significant refactoring. For now, origin items should be manually added by the user.
 */
export function applyOriginBenefits(
  sheet: CharacterSheet,
  origin: Origin,
  selectedBenefits: OriginBenefit[]
): CharacterSheet {
  const updatedSheet = { ...sheet };

  // Get used skills for origin.getPowersAndSkills
  const usedSkills: Skill[] = sheet.skills;

  // Get all available benefits
  const originBenefits = origin.getPowersAndSkills
    ? origin.getPowersAndSkills(usedSkills, origin)
    : {
        powers: { origin: origin.poderes as OriginPower[], general: [] },
        skills: origin.pericias,
      };

  // Initialize origin object
  const originPowers: OriginPower[] = [];

  // Apply selected benefits
  selectedBenefits.forEach((benefit) => {
    switch (benefit.type) {
      case 'skill': {
        // Add skill if not already present
        const skillExists = updatedSheet.skills.some((s) => s === benefit.name);
        if (!skillExists) {
          updatedSheet.skills = [...updatedSheet.skills, benefit.name as Skill];
        }
        break;
      }

      case 'item': {
        // NOTE: Items are not automatically added to bag due to BagEquipments complexity
        // Users will need to manually add origin items to their bag
        break;
      }

      case 'power': {
        // Find the power in origin benefits
        const power = originBenefits.powers.origin.find(
          (p) => p.name === benefit.name
        );
        if (power) {
          originPowers.push(power);
        }
        break;
      }

      default:
        break;
    }
  });

  // Update origin with powers and selected benefits
  updatedSheet.origin = {
    name: origin.name,
    powers: originPowers,
    selectedBenefits,
  };

  return updatedSheet;
}

/**
 * For regional origins, automatically grants all benefits
 *
 * NOTE: Items are NOT added to the bag (same limitation as applyOriginBenefits)
 */
export function applyRegionalOriginBenefits(
  sheet: CharacterSheet,
  origin: Origin
): CharacterSheet {
  if (!origin.isRegional) {
    throw new Error(
      'applyRegionalOriginBenefits should only be called for regional origins'
    );
  }

  const updatedSheet = { ...sheet };

  // Get used skills
  const usedSkills: Skill[] = sheet.skills;

  // Get all benefits
  const originBenefits = origin.getPowersAndSkills
    ? origin.getPowersAndSkills(usedSkills, origin)
    : {
        powers: { origin: origin.poderes as OriginPower[], general: [] },
        skills: origin.pericias,
      };

  // Add all skills
  originBenefits.skills.forEach((skill) => {
    const skillExists = updatedSheet.skills.some((s) => s === skill);
    if (!skillExists) {
      updatedSheet.skills = [...updatedSheet.skills, skill as Skill];
    }
  });

  // NOTE: Items are not added to bag (see note in applyOriginBenefits)

  // Set origin with all powers
  updatedSheet.origin = {
    name: origin.name,
    powers: originBenefits.powers.origin,
    // Regional origins don't need selectedBenefits since all are granted
  };

  return updatedSheet;
}
