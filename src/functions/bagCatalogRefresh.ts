import CharacterSheet from '../interfaces/CharacterSheet';
import Equipment from '../interfaces/Equipment';
import { dataRegistry } from '../data/registry';
import { SupplementId } from '../types/supplement.types';
import {
  canWieldOneHanded,
  isTwoHanded,
} from '../components/SheetResult/BackpackModal/wielding';

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

export function buildCatalogIndex(): Map<string, Equipment> {
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
    catalog.vehicles,
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

/**
 * Carimba em `item` o dado estático de `catalogItem`. Exportado para os itens
 * de origem escritos como texto (`convertOriginItemsToBagEquipments`): eles
 * nascem por este mesmo carimbo, e a ficha nova sai igual à reaberta.
 */
export function stampCatalogData(
  item: Equipment,
  catalogItem: Equipment
): void {
  /* eslint-disable no-param-reassign */
  if (!item.descricao && catalogItem.descricao) {
    item.descricao = catalogItem.descricao;
  }

  // Classificação da arma (corpo a corpo / arremesso / disparo + munição).
  // Preenche só o que está AUSENTE, como a `descricao` acima: um item que já
  // tem `alcance` — inclusive '-' — carrega escolha explícita, do catálogo ou
  // do jogador no editor, e é intocável.
  //
  // Existe porque a mochila é snapshot congelado: um arco comprado antes destes
  // campos existirem rolaria Luta e somaria Força para sempre, mesmo depois do
  // catálogo (ou do pacote homebrew, que recompila a cada load) ser corrigido.
  //
  // Fica ANTES do early-return de `hasEnhancementOwnership` de propósito: são
  // campos de classificação, não de bônus, e uma arma encantada precisa da cura
  // tanto quanto uma limpa. `specialActions` fica de fora — é reconstruído de
  // `baseSpecialActions` pelo pipeline de aprimoramentos, e escrever aqui
  // brigaria com ele.
  if (item.alcance === undefined && catalogItem.alcance !== undefined) {
    item.alcance = catalogItem.alcance;
    if (catalogItem.arremesso) item.arremesso = true;
  }
  if (item.ammoType === undefined && catalogItem.ammoType !== undefined) {
    item.ammoType = catalogItem.ammoType;
  }
  // Tags da arma (alongada, leve, espada...) também são classificação: soma as
  // do catálogo que faltam, sem remover nenhuma que o item já tenha. Tags
  // editadas pelo jogador são intocáveis.
  const missingTags = item.hasManualTags
    ? []
    : (catalogItem.weaponTags ?? []).filter(
        (tag) => !(item.weaponTags ?? []).includes(tag)
      );
  if (missingTags.length > 0) {
    item.weaponTags = [...(item.weaponTags ?? []), ...missingTags];
  }
  // Empunhadura de uma mão quando montado (Lança Montada, Lança de Justa):
  // sem o carimbo, a lança comprada antes do campo existir seguiria presa às
  // duas mãos. Só o ausente — um `false` explícito no item é intocável.
  if (
    item.oneHandedWhenMounted === undefined &&
    catalogItem.oneHandedWhenMounted
  ) {
    item.oneHandedWhenMounted = true;
  }
  // Empunhadura (`twoHanded`): ESPELHA o catálogo, nos dois sentidos. Ao
  // contrário das tags, não há edição do jogador a preservar — o editor de item
  // não expõe o campo (só o formulário de item custom, e custom não chega
  // aqui). Sem isto, uma correção de catálogo (Besta Leve de volta a uma mão,
  // Arco Longo para duas) nunca alcançava a cópia já gravada na mochila.
  if (catalogItem.twoHanded) {
    item.twoHanded = true;
  } else if (item.twoHanded !== undefined) {
    delete item.twoHanded;
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

/**
 * Ajusta as mãos de um item cuja empunhadura acabou de mudar pelo catálogo.
 * Só resolve o que não muda número nenhum:
 *  - virou arma de uma mão e ocupava as duas → fica na principal, solta a outra;
 *  - virou arma de duas mãos e estava numa mão só, com a outra LIVRE → passa a
 *    ocupar as duas.
 * Se a outra mão segura outro item (ex.: Arco Longo antigo + escudo), nada muda:
 * tirar o escudo da mão em silêncio baixaria a Defesa sem o jogador fazer nada.
 * O estado fica como o legado já tolerado, e o jogador resolve ao editar.
 */
function reconcileWielding(sheet: CharacterSheet, item: Equipment): void {
  /* eslint-disable no-param-reassign */
  const { id } = item;
  if (!id) return;
  const inMain = sheet.mainHandItemId === id;
  const inOff = sheet.offHandItemId === id;
  const inExtra1 = sheet.extraHand1ItemId === id;
  const inExtra2 = sheet.extraHand2ItemId === id;

  if (!isTwoHanded(item)) {
    if (inMain && inOff) sheet.offHandItemId = undefined;
    if (inExtra1 && inExtra2) sheet.extraHand2ItemId = undefined;
    return;
  }
  // A Lança Montada aceita uma mão só: o slot é escolha do jogador.
  if (canWieldOneHanded(item)) return;
  if (inMain && !inOff && !sheet.offHandItemId) sheet.offHandItemId = id;
  if (inOff && !inMain && !sheet.mainHandItemId) sheet.mainHandItemId = id;
  if (inExtra1 && !inExtra2 && !sheet.extraHand2ItemId) {
    sheet.extraHand2ItemId = id;
  }
  if (inExtra2 && !inExtra1 && !sheet.extraHand1ItemId) {
    sheet.extraHand1ItemId = id;
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
      if (!catalogItem) return;

      const wasTwoHanded = isTwoHanded(item);
      stampCatalogData(item, catalogItem);
      if (isTwoHanded(item) !== wasTwoHanded) reconcileWielding(sheet, item);
    });
  });
}

export default refreshBagItemsFromCatalog;
