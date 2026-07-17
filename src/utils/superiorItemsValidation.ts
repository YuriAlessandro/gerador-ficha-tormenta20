import { ItemMod } from '../interfaces/Rewards';

export interface ValidationResult {
  isValid: boolean;
  missingPrerequisites: string[];
  errors: string[];
}

/** Normaliza um pré-requisito para array (`undefined` → `[]`). */
const prereqList = (
  prereq: string | string[] | undefined
): readonly string[] => {
  if (!prereq) return [];
  return Array.isArray(prereq) ? prereq : [prereq];
};

/** Junta uma lista de pré-requisitos para exibir ao usuário. */
export const formatPrerequisite = (
  prereq: string | string[] | undefined
): string => prereqList(prereq).join(' ou ');

/**
 * Variante de checagem de pré-requisito que opera sobre uma lista de nomes
 * (em vez de `ItemMod[]`). Útil para reward generators que rastreiam só o
 * nome da modificação tomada.
 */
export const isPrereqMetByNames = (
  prereq: string | string[] | undefined,
  appliedNames: readonly string[]
): boolean => {
  const list = prereqList(prereq);
  if (list.length === 0) return true;
  return list.some((name) => appliedNames.includes(name));
};

/**
 * Verifica se ao menos um dos pré-requisitos está presente nas modificações
 * tomadas. Pré-requisito ausente sempre conta como satisfeito.
 */
const isPrereqMet = (
  prereq: string | string[] | undefined,
  taken: ItemMod[]
): boolean => {
  const list = prereqList(prereq);
  if (list.length === 0) return true;
  return list.some((name) => taken.some((t) => t.mod === name));
};

export const validateModificationRequirement = (
  modification: ItemMod,
  selectedModifications: ItemMod[]
): boolean => isPrereqMet(modification.prerequisite, selectedModifications);

export const validateModificationCombination = (
  modifications: ItemMod[]
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    missingPrerequisites: [],
    errors: [],
  };

  modifications.forEach((mod) => {
    if (!mod.prerequisite) return;
    if (isPrereqMet(mod.prerequisite, modifications)) return;

    const list = prereqList(mod.prerequisite);
    result.isValid = false;
    result.missingPrerequisites.push(...list);
    result.errors.push(
      `${mod.mod} requer ${formatPrerequisite(mod.prerequisite)}`
    );
  });

  return result;
};

export const addModificationWithPrerequisites = (
  modification: ItemMod,
  currentModifications: ItemMod[],
  allModifications: ItemMod[]
): ItemMod[] => {
  const result = [...currentModifications];

  if (
    modification.prerequisite &&
    !isPrereqMet(modification.prerequisite, result)
  ) {
    // Para OR, adiciona o primeiro do array como escolha padrão. O usuário
    // pode trocar removendo e selecionando outro pré-requisito antes.
    const [firstPrereq] = prereqList(modification.prerequisite);
    const prerequisiteMod = allModifications.find(
      (mod) => mod.mod === firstPrereq
    );
    if (prerequisiteMod) {
      result.push(prerequisiteMod);
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

  // Remove em cascata só se NENHUM dos pré-requisitos restantes ainda satisfizer.
  const dependents = result.filter((mod) => {
    const list = prereqList(mod.prerequisite);
    if (list.length === 0) return false;
    if (!list.includes(modificationToRemove.mod)) return false;
    return !isPrereqMet(mod.prerequisite, result);
  });

  if (dependents.length > 0) {
    return dependents.reduce(
      (acc, dependent) => removeModificationWithDependents(dependent, acc),
      result
    );
  }

  return result;
};
