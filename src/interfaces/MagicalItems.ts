export interface ItemEnchantment {
  min: number;
  max: number;
  enchantment: string;
  effect: string;
  double?: boolean;
  onlyShield?: boolean;
}

export interface EnhancedItemEnchantment extends ItemEnchantment {
  enchantment: string;
  effect: string;
  appliesTo?: 'weapon' | 'armor' | 'shield' | 'all';
}

export interface GeneratedMagicalItem {
  id: string;
  itemName: string;
  itemType: 'weapon' | 'armor' | 'shield';
  enchantments: EnhancedItemEnchantment[];
  timestamp: Date;
}

export interface MagicalItemsState {
  generationMode: 'random' | 'manual';
  selectedItemType: 'weapon' | 'armor' | 'shield' | null;
  selectedItem: string | null;
  selectedEnchantments: ItemEnchantment[];
  enchantmentCount: number;
  minEnchantmentCount: number;
  maxEnchantmentCount: number;
  generatedHistory: GeneratedMagicalItem[];
}