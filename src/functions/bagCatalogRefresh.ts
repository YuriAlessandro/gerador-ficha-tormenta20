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
