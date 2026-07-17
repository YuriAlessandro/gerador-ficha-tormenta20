import EQUIPAMENTOS from '../../../data/systems/tormenta20/equipamentos';
import { GENERAL_EQUIPMENT } from '../../../data/systems/tormenta20/equipamentos-gerais';
import Equipment, {
  DefenseEquipment,
  equipGroup,
} from '../../../interfaces/Equipment';
import { dataRegistry } from '../../../data/registry';
import {
  SUPPLEMENT_METADATA,
  SupplementId,
} from '../../../types/supplement.types';

/**
 * One subgroup inside a category (e.g. "Armas Simples" inside "Arma").
 * Categories without subgroups have a single subgroup whose label === category.
 */
export interface CatalogSubgroup {
  key: string;
  label: string;
  items: Equipment[];
}

export interface CatalogCategory {
  group: equipGroup;
  label: string;
  subgroups: CatalogSubgroup[];
}

const armasSubgroups: CatalogSubgroup[] = [
  { key: 'simples', label: 'Simples', items: EQUIPAMENTOS.armasSimples },
  { key: 'marciais', label: 'Marciais', items: EQUIPAMENTOS.armasMarciais },
  { key: 'exoticas', label: 'Exóticas', items: EQUIPAMENTOS.armasExoticas },
  { key: 'fogo', label: 'De Fogo', items: EQUIPAMENTOS.armasDeFogo },
  { key: 'municao', label: 'Munição', items: EQUIPAMENTOS.municao },
];

const armadurasSubgroups: CatalogSubgroup[] = [
  {
    key: 'leves',
    label: 'Armaduras Leves',
    items: EQUIPAMENTOS.armadurasLeves as Equipment[],
  },
  {
    key: 'pesadas',
    label: 'Armaduras Pesadas',
    items: EQUIPAMENTOS.armaduraPesada as Equipment[],
  },
];

const escudosSubgroups: CatalogSubgroup[] = [
  {
    key: 'escudos',
    label: 'Escudos',
    items: EQUIPAMENTOS.escudos as Equipment[],
  },
];

const itemGeralSubgroups: CatalogSubgroup[] = [
  {
    key: 'aventureiro',
    label: 'Equipamentos de Aventureiro',
    items: GENERAL_EQUIPMENT.adventurerEquipment,
  },
  {
    key: 'ferramentas',
    label: 'Ferramentas',
    items: GENERAL_EQUIPMENT.tools,
  },
];

const alquimiaSubgroups: CatalogSubgroup[] = [
  {
    key: 'preparados',
    label: 'Preparados',
    items: GENERAL_EQUIPMENT.alchemyPrepared,
  },
  {
    key: 'catalisadores',
    label: 'Catalisadores',
    items: GENERAL_EQUIPMENT.alchemyCatalysts,
  },
  {
    key: 'venenos',
    label: 'Venenos',
    items: GENERAL_EQUIPMENT.alchemyPoisons,
  },
];

const flatSubgroup = (
  key: string,
  label: string,
  items: Equipment[]
): CatalogSubgroup[] => [{ key, label, items }];

export const EQUIPMENT_CATALOG: CatalogCategory[] = [
  { group: 'Arma', label: 'Armas', subgroups: armasSubgroups },
  { group: 'Armadura', label: 'Armaduras', subgroups: armadurasSubgroups },
  { group: 'Escudo', label: 'Escudos', subgroups: escudosSubgroups },
  { group: 'Item Geral', label: 'Item Geral', subgroups: itemGeralSubgroups },
  { group: 'Alquimía', label: 'Alquimía', subgroups: alquimiaSubgroups },
  {
    group: 'Esotérico',
    label: 'Esotérico',
    subgroups: flatSubgroup(
      'esotericos',
      'Esotéricos',
      GENERAL_EQUIPMENT.esoteric
    ),
  },
  {
    group: 'Vestuário',
    label: 'Vestuário',
    subgroups: flatSubgroup(
      'vestuario',
      'Vestuário',
      GENERAL_EQUIPMENT.clothing
    ),
  },
  {
    group: 'Alimentação',
    label: 'Alimentação',
    subgroups: flatSubgroup(
      'alimentacao',
      'Alimentação',
      GENERAL_EQUIPMENT.food
    ),
  },
  {
    group: 'Animal',
    label: 'Animais',
    subgroups: flatSubgroup('animais', 'Animais', GENERAL_EQUIPMENT.animals),
  },
  // Hospedagem, Veículo, Serviço currently have no catalog data — users add via custom item.
  { group: 'Hospedagem', label: 'Hospedagem', subgroups: [] },
  { group: 'Veículo', label: 'Veículos', subgroups: [] },
  { group: 'Serviço', label: 'Serviços', subgroups: [] },
];

export function getCategory(group: equipGroup): CatalogCategory | undefined {
  return EQUIPMENT_CATALOG.find((c) => c.group === group);
}

/**
 * Builds an equipment catalog merging core data with items from each active
 * supplement. Each non-core supplement contributes a single per-category
 * subgroup labelled with the supplement name, appended after the core
 * subgroups for that category. Items keep their `supplementId`/`supplementName`
 * fields (set by the registry) so the supplement chip still renders.
 */
export function buildEquipmentCatalog(
  supplementIds: SupplementId[]
): CatalogCategory[] {
  // Deep-clone the core catalog so we don't mutate the static export.
  const catalog: CatalogCategory[] = EQUIPMENT_CATALOG.map((cat) => ({
    ...cat,
    subgroups: cat.subgroups.map((sg) => ({ ...sg, items: [...sg.items] })),
  }));

  const supplementsOnly = supplementIds.filter(
    (id) => id !== SupplementId.TORMENTA20_CORE
  );
  if (supplementsOnly.length === 0) return catalog;

  const merged = dataRegistry.getEquipmentBySupplements(supplementIds);

  const findCategory = (group: equipGroup): CatalogCategory | undefined =>
    catalog.find((c) => c.group === group);

  supplementsOnly.forEach((supplementId) => {
    const meta = SUPPLEMENT_METADATA[supplementId];
    const supplementName = meta?.name ?? supplementId;
    const supplementAbbr = meta?.abbreviation ?? supplementName;

    const append = (group: equipGroup, items: Equipment[]) => {
      if (items.length === 0) return;
      const cat = findCategory(group);
      if (!cat) return;
      cat.subgroups.push({
        key: `${supplementId}-${group}`,
        label: supplementAbbr,
        items,
      });
    };

    const filterBy = <T extends Equipment>(arr: T[]): T[] =>
      arr.filter((it) => it.supplementId === supplementId);

    append('Arma', filterBy(merged.weapons));
    append('Armadura', filterBy(merged.armors));
    append('Escudo', filterBy(merged.shields));
    append('Item Geral', filterBy(merged.generalItems));
    append('Esotérico', filterBy(merged.esoteric));
    append('Vestuário', filterBy(merged.clothing));
    append('Alquimía', filterBy(merged.alchemy));
    append('Alimentação', filterBy(merged.food));
    append('Animal', filterBy(merged.animals));
  });

  return catalog;
}

/**
 * True when an item already in the bag came from the catalog (so it has
 * `baseDano`-style fields and can be cleanly replaced) rather than a custom one.
 */
export function isFromCatalog(item: Equipment): boolean {
  return !item.isCustom;
}

export function isDefenseGroup(group: equipGroup): boolean {
  return group === 'Armadura' || group === 'Escudo';
}

export function asDefenseEquipment(item: Equipment): DefenseEquipment | null {
  if (!isDefenseGroup(item.group)) return null;
  return item as DefenseEquipment;
}
