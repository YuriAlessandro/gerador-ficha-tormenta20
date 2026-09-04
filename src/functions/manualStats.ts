import Equipment, { ManualStatField } from '../interfaces/Equipment';

const WEAPON_STAT_FIELDS: ManualStatField[] = ['dano', 'atkBonus', 'critico'];
const DEFENSE_STAT_FIELDS: ManualStatField[] = ['defenseBonus', 'armorPenalty'];

/**
 * Estatísticas que o jogador digitou à mão neste item.
 *
 * Fonte única da marcação "modificado manualmente" na ficha e do estado inicial
 * do editor de item. Um item gravado ANTES de `manualStatFields` existir só tem
 * a flag `hasManualEdits` — aí o grupo inteiro (de arma ou de defesa) conta como
 * editado, que é o comportamento congelado de fato pelo motor.
 */
export function getManualStatFields(
  item: Equipment
): ReadonlySet<ManualStatField> {
  if (!item.hasManualEdits) return new Set();
  if (item.manualStatFields) return new Set(item.manualStatFields);
  return new Set(
    item.group === 'Arma' ? WEAPON_STAT_FIELDS : DEFENSE_STAT_FIELDS
  );
}

export default getManualStatFields;
