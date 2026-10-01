/**
 * Símbolo sagrado — o item e a melhoria Inscrito (Deuses de Arton), que faz um
 * item "contar como um símbolo sagrado desse deus (inclusive fornecendo o bônus
 * de +1 em testes de resistência)".
 *
 * O bônus é o MESMO nos dois casos e não acumula: dois símbolos, ou um símbolo
 * e uma armadura Inscrita, dão +1, não +2. Por isso os bônus de qualquer fonte
 * de símbolo sagrado saem sempre com a fonte do item "Símbolo sagrado" e passam
 * por `dedupeHolySymbolBonuses`.
 */
import CharacterSheet, { SheetBonus } from '../interfaces/CharacterSheet';
import Equipment from '../interfaces/Equipment';
import { equipamentoAventureiro } from '../data/systems/tormenta20/equipamentos-gerais';
import { getSheetWornArmor } from './wornArmor';

export const HOLY_SYMBOL_NAME = 'Símbolo sagrado';
export const INSCRITO_MOD_NAME = 'Inscrito';

const isHolySymbolBonus = (bonus: SheetBonus): boolean =>
  bonus.source?.type === 'equipment' &&
  bonus.source.equipmentName === HOLY_SYMBOL_NAME;

/** Os bônus do item "Símbolo sagrado" do catálogo (+1 nas três resistências). */
export function getHolySymbolBonuses(): SheetBonus[] {
  const item = equipamentoAventureiro.find((e) => e.nome === HOLY_SYMBOL_NAME);
  return (item?.sheetBonuses ?? []).map((bonus) => ({ ...bonus }));
}

/**
 * O item Inscrito está em uso? A regra pede o símbolo "vestido ou empunhado":
 * armadura só conta vestida e escudo só conta empunhado. Os demais grupos
 * seguem a regra geral da mochila (aplicam por estarem nela).
 */
function isInscritoActive(sheet: CharacterSheet, item: Equipment): boolean {
  if (!item.modifications?.some((m) => m.mod === INSCRITO_MOD_NAME)) {
    return false;
  }
  if (item.group === 'Armadura') {
    return !!item.id && getSheetWornArmor(sheet)?.id === item.id;
  }
  if (item.group === 'Escudo') {
    return (
      !!item.id &&
      (item.id === sheet.mainHandItemId || item.id === sheet.offHandItemId)
    );
  }
  return true;
}

/** Algum item Inscrito em uso concede o bônus de símbolo sagrado? */
export function hasActiveInscritoItem(
  sheet: CharacterSheet,
  items: Equipment[]
): boolean {
  return items.some((item) => isInscritoActive(sheet, item));
}

/**
 * Mantém um único bônus de símbolo sagrado por alvo. Os demais bônus passam
 * intactos e na mesma ordem.
 */
export function dedupeHolySymbolBonuses(bonuses: SheetBonus[]): SheetBonus[] {
  const seen = new Set<string>();
  return bonuses.filter((bonus) => {
    if (!isHolySymbolBonus(bonus)) return true;
    const key = JSON.stringify(bonus.target);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
