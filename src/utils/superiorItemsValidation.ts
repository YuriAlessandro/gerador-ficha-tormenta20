import { ItemMod } from '../interfaces/Rewards';

export interface ValidationResult {
  isValid: boolean;
  missingPrerequisites: string[];
  errors: string[];
}

export const validateModificationRequirement = (
  modification: ItemMod,
  selectedModifications: ItemMod[]
): boolean => {
  if (!modification.prerequisite) {
    return true;
  }

  return selectedModifications.some(
    (mod) => mod.mod === modification.prerequisite
  );
};

export const validateModificationCombination = (
  modifications: ItemMod[]
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    missingPrerequisites: [],
    errors: [],
  };

  modifications.forEach((mod) => {
    if (mod.prerequisite) {
      const hasPrerequisite = modifications.some(
        (m) => m.mod === mod.prerequisite
      );
      if (!hasPrerequisite) {
        result.isValid = false;
        result.missingPrerequisites.push(mod.prerequisite);
        result.errors.push(`${mod.mod} requer ${mod.prerequisite}`);
      }
    }
  });

  return result;
};

export const addModificationWithPrerequisites = (
  modification: ItemMod,
  currentModifications: ItemMod[],
  allModifications: ItemMod[]
): ItemMod[] => {
  const result = [...currentModifications];

  if (modification.prerequisite) {
    const hasPrerequisite = result.some(
      (mod) => mod.mod === modification.prerequisite
    );
    if (!hasPrerequisite) {
      const prerequisiteMod = allModifications.find(
        (mod) => mod.mod === modification.prerequisite
      );
      if (prerequisiteMod) {
        result.push(prerequisiteMod);
      }
    }
  }

  if (!result.some((mod) => mod.mod === modification.mod)) {
    result.push(modification);
  }

  return result;
};

export const calculateModificationCost = (modifications: ItemMod[]): number =>
  modifications.reduce((cost, mod) => cost + (mod.double ? 2 : 1), 0);

export const getAvailableModifications = (
  allModifications: ItemMod[],
  selectedModifications: ItemMod[]
): ItemMod[] =>
  allModifications.filter((mod) => {
    if (selectedModifications.some((selected) => selected.mod === mod.mod)) {
      return false;
    }

    return validateModificationRequirement(mod, selectedModifications);
  });

export const removeModificationWithDependents = (
  modificationToRemove: ItemMod,
  currentModifications: ItemMod[]
): ItemMod[] => {
  const result = currentModifications.filter(
    (mod) => mod.mod !== modificationToRemove.mod
  );

  const dependents = result.filter(
    (mod) => mod.prerequisite === modificationToRemove.mod
  );

  if (dependents.length > 0) {
    return dependents.reduce(
      (acc, dependent) => removeModificationWithDependents(dependent, acc),
      result
    );
  }

  return result;
};
