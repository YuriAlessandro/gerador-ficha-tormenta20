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
  itemType: 'weapon' | 'armor' | 'shield'
): boolean => {
  // If it's a shield-only enchantment, only allow for shields
  if (enchantment.onlyShield && itemType !== 'shield') {
    return false;
  }

  return true;
};
