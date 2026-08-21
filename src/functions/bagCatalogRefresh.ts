import CharacterSheet from '../interfaces/CharacterSheet';
import Equipment from '../interfaces/Equipment';
import { dataRegistry } from '../data/registry';
import { SupplementId } from '../types/supplement.types';

/**
 * Re-carimba nos itens da mochila o dado ESTÁTICO que veio do catálogo.
 *
 * A mochila é persistida por inteiro: o item salvo é o snapshot tirado do
 * catálogo no momento da compra. Quando uma regra é cadastrada depois — a
 * `descricao` de um item que nunca teve, ou os `sheetBonuses` de uma armadura
 * que só tinha preço e Defesa — a correção só alcança ficha NOVA. É o mesmo
 * problema de `origin.powers` e da arma natural do Centauro, e a cura é a
 * mesma: carimbar na carga da ficha.
 *
 * Regras de prudência:
 *  - **nunca** sobrescreve o que o usuário escreveu (`descricao` só é
 *    preenchida quando ausente; `isCustom` é intocado);
 *  - itens já modificados/encantados são pulados: `applyItemEnhancements`
 *    congela `baseSheetBonuses` e recompõe `sheetBonuses` a partir dele, então
 *    escrever por cima aqui desmontaria as melhorias;
 *  - o catálogo do registry é cache COMPARTILHADO — só lemos e copiamos, nunca
 *    guardamos a referência nem mutamos o objeto de origem.
 */

/** Todos os suplementos oficiais + homebrews ativos. */
const allSupplements = (): SupplementId[] => [
  ...Object.values(SupplementId),
  ...(dataRegistry.getRuntimeSupplementIds() as SupplementId[]),
];

function buildCatalogIndex(): Map<string, Equipment> {
  const catalog = dataRegistry.getEquipmentBySupplements(allSupplements());
  const index = new Map<string, Equipment>();

  const groups: Equipment[][] = [
    catalog.weapons,
    catalog.armors,
    catalog.shields,
    catalog.generalItems,
    catalog.esoteric,
    catalog.clothing,
    catalog.alchemy,
    catalog.food,
    catalog.animals,
  ];

  groups.forEach((group) => {
    group.forEach((item) => {
      // Primeiro cadastro vence: nomes repetidos entre suplementos mantêm a
      // definição do livro básico, que é a canônica.
      if (!index.has(item.nome)) index.set(item.nome, item);
    });
  });

  return index;
}

/** Um item que o pipeline de aprimoramentos já assumiu como dono. */
const hasEnhancementOwnership = (item: Equipment): boolean =>
  item.baseSheetBonuses !== undefined;

function refreshItem(item: Equipment, catalogItem: Equipment): void {
  /* eslint-disable no-param-reassign */
  if (!item.descricao && catalogItem.descricao) {
    item.descricao = catalogItem.descricao;
  }

  if (hasEnhancementOwnership(item)) return;

  if (catalogItem.sheetBonuses) {
    item.sheetBonuses = catalogItem.sheetBonuses.map((bonus) => ({ ...bonus }));
  }
  if (catalogItem.conditionalBonuses) {
    item.conditionalBonuses = catalogItem.conditionalBonuses.map(
      (conditional) => ({ ...conditional })
    );
  }
  /* eslint-enable no-param-reassign */
}

export function refreshBagItemsFromCatalog(sheet: CharacterSheet): void {
  const equipments = sheet.bag?.equipments;
  if (!equipments) return;

  let index: Map<string, Equipment> | undefined;

  Object.values(equipments).forEach((items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item: Equipment) => {
      if (!item?.nome || item.isCustom) return;

      // Construção preguiçosa: fichas com mochila vazia não pagam pelo índice.
      if (!index) index = buildCatalogIndex();

      const catalogItem = index.get(item.nome);
      if (catalogItem) refreshItem(item, catalogItem);
    });
  });
}

export default refreshBagItemsFromCatalog;
