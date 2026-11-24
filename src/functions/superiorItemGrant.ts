import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { dataRegistry } from '../data/registry';
import CharacterSheet from '../interfaces/CharacterSheet';
import Equipment, { DefenseEquipment } from '../interfaces/Equipment';
import {
  SuperiorItemGroup,
  SuperiorItemSelection,
} from '../interfaces/PowerSelections';
import { ItemMod } from '../interfaces/Rewards';
import { SupplementId } from '../types/supplement.types';
import { validateModificationCombination } from '../utils/superiorItemsValidation';
import { applyItemEnhancements } from './itemEnhancements/applyEnhancements';
import {
  toAppliedModification,
  withMaterialSnapshot,
} from './itemEnhancements/snapshot';
import { getEnhancedItemPrice } from './itemEnhancements/pricing';
import {
  isProficientWithDefense,
  isProficientWithWeapon,
} from './proficiencies';
import { getRandomItemFromArray } from './randomUtils';

/**
 * Item superior concedido por habilidade (ex.: Cavaleiro do Reino, do Vassalo:
 * "uma arma, armadura ou escudo superior com duas melhorias").
 */

const MATERIAL_ESPECIAL = 'Material especial';

export function getSuperiorItemOptions(
  group: SuperiorItemGroup,
  supplements: SupplementId[]
): Equipment[] {
  const market = dataRegistry.getEquipmentBySupplements(supplements);
  const pool: Record<SuperiorItemGroup, Equipment[]> = {
    Arma: market.weapons.filter((weapon) => !weapon.isAmmo),
    Armadura: market.armors,
    Escudo: market.shields,
  };
  // As listas do mercado podem misturar grupos (ex.: escudos entre armaduras).
  return _.uniqBy(
    pool[group].filter((item) => item.group === group),
    'nome'
  );
}

/**
 * Escolha completa: item definido e exatamente `pick` melhorias, com os
 * pré-requisitos na conta — é o "conta como duas melhorias" de Atroz,
 * Pungente e Sob medida.
 */
export function isSuperiorItemComplete(
  selection: SuperiorItemSelection | undefined,
  pick: number
): boolean {
  if (!selection?.itemName) return false;
  const { modifications, material } = selection;
  return (
    modifications.length === pick &&
    validateModificationCombination(modifications).isValid &&
    (!modifications.some((mod) => mod.mod === MATERIAL_ESPECIAL) || !!material)
  );
}

/** Monta o item escolhido, com `id` próprio. */
export function buildSuperiorItem(
  selection: SuperiorItemSelection,
  supplements: SupplementId[]
): Equipment | undefined {
  const catalogItem =
    selection.baseItem ??
    getSuperiorItemOptions(selection.group, supplements).find(
      (item) => item.nome === selection.itemName
    );
  if (!catalogItem) return undefined;

  const context = selection.group === 'Arma' ? 'weapon' : 'defense';
  const modifications = selection.modifications.map((mod) =>
    mod.mod === MATERIAL_ESPECIAL && selection.material
      ? withMaterialSnapshot(
          toAppliedModification(mod, selection.material),
          dataRegistry.getSpecialMaterialByName(selection.material),
          context
        )
      : toAppliedModification(mod)
  );

  const item = applyItemEnhancements({
    ..._.omit(_.cloneDeep(catalogItem), ['id', 'quantity']),
    modifications,
  } as Equipment);
  return { ...item, id: uuid(), preco: getEnhancedItemPrice(item).total };
}

/** Sorteio da ficha aleatória: item em que o personagem é proficiente. */
export function pickRandomSuperiorItem(
  sheet: CharacterSheet,
  groups: SuperiorItemGroup[],
  pick: number,
  supplements: SupplementId[]
): SuperiorItemSelection | undefined {
  const { proficiencias } = sheet.classe;
  const options = groups
    .map((group) => ({
      group,
      items: getSuperiorItemOptions(group, supplements).filter((item) =>
        group === 'Arma'
          ? isProficientWithWeapon(item, proficiencias)
          : isProficientWithDefense(item as DefenseEquipment, proficiencias)
      ),
    }))
    .filter(({ items }) => items.length > 0);
  if (options.length === 0) return undefined;

  const { group, items } = getRandomItemFromArray(options);
  const improvements = dataRegistry.getImprovementsBySupplements(supplements);
  const simple = (
    group === 'Arma' ? improvements.weapons : improvements.armors
  ).filter(
    (mod: ItemMod) => !mod.prerequisite && mod.mod !== MATERIAL_ESPECIAL
  );
  return {
    group,
    itemName: getRandomItemFromArray(items).nome,
    modifications: _.sampleSize(simple, pick),
  };
}
