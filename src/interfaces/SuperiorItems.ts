export interface ItemModification {
  min: number;
  max: number;
  mod: string;
  description?: string;
  prerequisite?: string;
  double?: boolean;
  /** What item types this modification applies to */
  appliesTo?: 'weapon' | 'armor' | 'shield' | 'all';
  /** Optional supplement ID for supplement-specific modifications */
  supplementId?: string;
}

export interface EnhancedItemModification extends ItemModification {
  description: string;
  prerequisite?: string;
  mod: string; // Allow overriding the mod name
}

export interface GeneratedSuperiorItem {
  id: string;
  itemName: string;
  itemType: 'weapon' | 'armor' | 'shield';
  modifications: EnhancedItemModification[];
  timestamp: Date;
}

export interface SuperiorItemsState {
  generationMode: 'random' | 'manual';
  selectedItemType: 'weapon' | 'armor' | 'shield' | null;
  selectedItem: string | null;
  selectedModifications: ItemModification[];
  modificationCount: number;
  minModificationCount: number;
  maxModificationCount: number;
  generatedHistory: GeneratedSuperiorItem[];
}
