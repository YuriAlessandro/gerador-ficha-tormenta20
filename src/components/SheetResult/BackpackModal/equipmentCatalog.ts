import EQUIPAMENTOS, {
  Armas,
} from '../../../data/systems/tormenta20/equipamentos';
import { GENERAL_EQUIPMENT } from '../../../data/systems/tormenta20/equipamentos-gerais';
import Equipment, {
  DefenseEquipment,
  equipGroup,
} from '../../../interfaces/Equipment';
import { dataRegistry } from '../../../data/registry';
import { SupplementId } from '../../../types/supplement.types';

/**
 * One subgroup inside a category (e.g. "Armas Simples" inside "Arma").
 * Categories without subgroups have a single subgroup whose label === category.
 *
 * `ontologyTag` drives the subfilter chips in `ItemSubfilterChips`:
 *   - Armas: 'simples' | 'marcial' | 'exótica' | 'fogo' | 'munição'
 *   - Armaduras: 'leve' | 'pesada'
 *   - Alquimia: 'preparado' | 'catalisador' | 'veneno'
 *   - Item Geral: 'aventureiro' | 'ferramentas'
 *   - Demais: '' (sem subfiltro por subgrupo)
 */
export interface CatalogSubgroup {
  key: string;
  label: string;
  /** Tag ontológica usada pelos chips de subfiltro. '' = sem subfiltro. */
  ontologyTag: string;
  items: Equipment[];
}

export interface CatalogCategory {
  group: equipGroup;
  label: string;
  subgroups: CatalogSubgroup[];
}

const armasSubgroups: CatalogSubgroup[] = [
  {
    key: 'simples',
    label: 'Simples',
    ontologyTag: 'simples',
    // Ataque Desarmado fica fora de `EQUIPAMENTOS.armasSimples` (não deve
    // entrar nos pools de "arma simples aleatória" das origens) — prepended
    // só aqui, na lista que o modal de adicionar item de fato renderiza.
    items: [Armas.ATAQUE_DESARMADO, ...EQUIPAMENTOS.armasSimples],
  },
  {
    key: 'marciais',
    label: 'Marciais',
    ontologyTag: 'marcial',
    items: EQUIPAMENTOS.armasMarciais,
  },
  {
    key: 'exoticas',
    label: 'Exóticas',
    ontologyTag: 'exótica',
    items: EQUIPAMENTOS.armasExoticas,
  },
  {
    key: 'fogo',
    label: 'De Fogo',
    ontologyTag: 'fogo',
    items: EQUIPAMENTOS.armasDeFogo,
  },
  {
    key: 'municao',
    label: 'Munição',
    ontologyTag: 'munição',
    items: EQUIPAMENTOS.municao,
  },
];

const armadurasSubgroups: CatalogSubgroup[] = [
  {
    key: 'leves',
    label: 'Armaduras Leves',
    ontologyTag: 'leve',
    items: EQUIPAMENTOS.armadurasLeves as Equipment[],
  },
  {
    key: 'pesadas',
    label: 'Armaduras Pesadas',
    ontologyTag: 'pesada',
    items: EQUIPAMENTOS.armaduraPesada as Equipment[],
  },
];

const escudosSubgroups: CatalogSubgroup[] = [
  {
    key: 'escudos',
    label: 'Escudos',
    ontologyTag: '',
    items: EQUIPAMENTOS.escudos as Equipment[],
  },
];

const itemGeralSubgroups: CatalogSubgroup[] = [
  {
    key: 'aventureiro',
    label: 'Equipamentos de Aventureiro',
    ontologyTag: 'aventureiro',
    items: GENERAL_EQUIPMENT.adventurerEquipment,
  },
  {
    key: 'ferramentas',
    label: 'Ferramentas',
    ontologyTag: 'ferramentas',
    items: GENERAL_EQUIPMENT.tools,
  },
];

const alquimiaSubgroups: CatalogSubgroup[] = [
  {
    key: 'preparados',
    label: 'Preparados',
    ontologyTag: 'preparado',
    items: GENERAL_EQUIPMENT.alchemyPrepared,
  },
  {
    key: 'catalisadores',
    label: 'Catalisadores',
    ontologyTag: 'catalisador',
    items: GENERAL_EQUIPMENT.alchemyCatalysts,
  },
  {
    key: 'venenos',
    label: 'Venenos',
    ontologyTag: 'veneno',
    items: GENERAL_EQUIPMENT.alchemyPoisons,
  },
];

const flatSubgroup = (
  key: string,
  label: string,
  items: Equipment[]
): CatalogSubgroup[] => [{ key, label, ontologyTag: '', items }];

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
  // Hospedagem e Serviço currently have no catalog data — users add via custom item.
  { group: 'Hospedagem', label: 'Hospedagem', subgroups: [] },
  {
    group: 'Veículo',
    label: 'Veículos',
    subgroups: flatSubgroup('veiculos', 'Veículos', GENERAL_EQUIPMENT.vehicles),
  },
  { group: 'Serviço', label: 'Serviços', subgroups: [] },
];

export function getCategory(group: equipGroup): CatalogCategory | undefined {
  return EQUIPMENT_CATALOG.find((c) => c.group === group);
}

/** Mapeamento de weaponCategory para ontologyTag de armas. */
const WEAPON_CAT_ONTOLOGY: Record<string, string> = {
  simple: 'simples',
  martial: 'marcial',
  exotic: 'exótica',
  firearm: 'fogo',
};

/** Rótulo de seção para armas de suplemento com quebra por categoria. */
const WEAPON_CAT_LABEL: Record<string, string> = {
  simple: 'Simples',
  martial: 'Marciais',
  exotic: 'Exóticas',
  firearm: 'De Fogo',
};

/**
 * Builds an equipment catalog merging core data with items from each active
 * supplement. For weapons, supplement items are split by `weaponCategory` so
 * they integrate cleanly into the existing ontology subgroups. For armors,
 * they are split by `isHeavyArmor`. Other categories get a single per-supplement
 * subgroup appended after the core subgroups.
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
    // Suplementos runtime (homebrew) não estão em SUPPLEMENT_METADATA — sem
    // este resolver o rótulo do subgrupo seria o id cru (`homebrew:<id>`).
    const { abbreviation: supplementAbbr } =
      dataRegistry.getSupplementLabel(supplementId);

    const filterBy = <T extends Equipment>(arr: T[]): T[] =>
      arr.filter((it) => it.supplementId === supplementId);

    // ── Armas: split por weaponCategory ──────────────────────────────────
    const suppWeapons = filterBy(merged.weapons);
    (['simple', 'martial', 'exotic', 'firearm'] as const).forEach((wcat) => {
      const catItems = suppWeapons.filter((w) => w.weaponCategory === wcat);
      if (catItems.length === 0) return;
      findCategory('Arma')?.subgroups.push({
        key: `${supplementId}-${wcat}`,
        label: `${WEAPON_CAT_LABEL[wcat]} — ${supplementAbbr}`,
        ontologyTag: WEAPON_CAT_ONTOLOGY[wcat],
        items: catItems,
      });
    });
    // Armas sem weaponCategory (custom / ammo) como subgrupo genérico
    const uncategorizedWeapons = suppWeapons.filter((w) => !w.weaponCategory);
    if (uncategorizedWeapons.length > 0) {
      findCategory('Arma')?.subgroups.push({
        key: `${supplementId}-Arma`,
        label: supplementAbbr,
        ontologyTag: '',
        items: uncategorizedWeapons,
      });
    }

    // ── Armaduras: split por isHeavyArmor ────────────────────────────────
    const suppArmors = filterBy(merged.armors);
    const leveArmors = suppArmors.filter(
      (a) => !(a as DefenseEquipment).isHeavyArmor
    );
    const pesadaArmors = suppArmors.filter(
      (a) => !!(a as DefenseEquipment).isHeavyArmor
    );
    if (leveArmors.length > 0) {
      findCategory('Armadura')?.subgroups.push({
        key: `${supplementId}-armadura-leve`,
        label: `Leves — ${supplementAbbr}`,
        ontologyTag: 'leve',
        items: leveArmors,
      });
    }
    if (pesadaArmors.length > 0) {
      findCategory('Armadura')?.subgroups.push({
        key: `${supplementId}-armadura-pesada`,
        label: `Pesadas — ${supplementAbbr}`,
        ontologyTag: 'pesada',
        items: pesadaArmors,
      });
    }

    // ── Escudos e demais: subgrupo único por suplemento ──────────────────
    const append = (group: equipGroup, items: Equipment[]) => {
      if (items.length === 0) return;
      const cat = findCategory(group);
      if (!cat) return;
      cat.subgroups.push({
        key: `${supplementId}-${group}`,
        label: supplementAbbr,
        ontologyTag: '',
        items,
      });
    };

    append('Escudo', filterBy(merged.shields));
    append('Item Geral', filterBy(merged.generalItems));
    append('Esotérico', filterBy(merged.esoteric));
    append('Vestuário', filterBy(merged.clothing));
    append('Alquimía', filterBy(merged.alchemy));
    append('Alimentação', filterBy(merged.food));
    append('Animal', filterBy(merged.animals));
    append('Veículo', filterBy(merged.vehicles));
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
