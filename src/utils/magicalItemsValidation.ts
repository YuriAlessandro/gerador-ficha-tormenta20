import { ItemE } from '../interfaces/Rewards';

export const calculateEnchantmentCost = (enchantments: ItemE[]): number =>
  enchantments.reduce(
    (total, enchantment) => total + (enchantment.double ? 2 : 1),
    0
  );

export const validateEnchantmentCombination = (
  enchantments: ItemE[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const totalCost = calculateEnchantmentCost(enchantments);
  if (totalCost > 5) {
    errors.push('O custo total dos encantamentos não pode exceder 5 pontos');
  }

  const enchantmentNames = enchantments.map((e) => e.enchantment);
  const uniqueNames = new Set(enchantmentNames);
  if (enchantmentNames.length !== uniqueNames.size) {
    errors.push(
      'Não é possível selecionar o mesmo encantamento múltiplas vezes'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const addEnchantmentIfValid = (
  enchantment: ItemE,
  selectedEnchantments: ItemE[]
): ItemE[] => {
  const newEnchantments = [...selectedEnchantments, enchantment];
  const validation = validateEnchantmentCombination(newEnchantments);

  if (validation.isValid) {
    return newEnchantments;
  }

  return selectedEnchantments;
};

export const validateEnchantmentForItemType = (
  enchantment: ItemE,
  itemType: 'weapon' | 'armor' | 'shield' | 'esoteric'
): boolean => {
  // If it's a shield-only enchantment, only allow for shields
  if (enchantment.onlyShield && itemType !== 'shield') {
    return false;
  }

  return true;
};

/**
 * O encanto pode entrar junto com os já escolhidos? "Pré-requisito: outro
 * encanto" exige um encanto que não tenha essa mesma exigência; exclusões
 * ("um esotérico khalmyrita não pode ser nímbico") valem nos dois sentidos.
 */
export const canAddEnchantment = (
  enchantment: ItemE,
  selected: ItemE[]
): boolean => {
  const others = selected.filter(
    (e) => e.enchantment !== enchantment.enchantment
  );
  if (
    enchantment.requiresOtherEnchantment &&
    !others.some((e) => !e.requiresOtherEnchantment)
  ) {
    return false;
  }
  return !others.some(
    (e) =>
      e.excludes?.includes(enchantment.enchantment) ||
      enchantment.excludes?.includes(e.enchantment)
  );
};

/**
 * Remove os encantos que perderam o pré-requisito ("outro encanto") depois de
 * uma remoção.
 */
export const dropUnsupportedEnchantments = (selected: ItemE[]): ItemE[] =>
  selected.some((e) => !e.requiresOtherEnchantment)
    ? selected
    : selected.filter((e) => !e.requiresOtherEnchantment);
