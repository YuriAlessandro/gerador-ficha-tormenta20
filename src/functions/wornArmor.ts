/**
 * Armadura VESTIDA da ficha — fonte única para "está usando armadura pesada?".
 *
 * A regra de T20 fala em *usar* armadura, não em carregá-la. Armadura na mochila
 * não protege, não penaliza deslocamento e não liga poder nenhum. Isso já era
 * respeitado por `calcDefense` e pela cláusula `wearingHeavyArmor` das condições
 * de bônus, mas cada consumidor reimplementava a resolução (quatro cópias, uma
 * delas checando a mochila inteira em vez da peça vestida). Aqui é o ponto único.
 */
import CharacterSheet from '../interfaces/CharacterSheet';
import { DefenseEquipment } from '../interfaces/Equipment';
import { isHeavyArmor } from '../data/systems/tormenta20/equipamentos';
import { getWornArmor } from '../components/SheetResult/BackpackModal/wielding';

/**
 * A armadura de fato vestida, ou `undefined`. Delega para `getWornArmor`, que
 * trata o sentinela `WORN_ARMOR_NONE` e o fallback legado (ficha com exatamente
 * uma armadura e sem `wornArmorId` conta como vestida). Com ≥2 armaduras e sem
 * seleção o resultado é ambíguo e nenhuma vale — mesmo contrato de `calcDefense`.
 */
export function getSheetWornArmor(
  sheet: CharacterSheet
): DefenseEquipment | undefined {
  const armors = (sheet.bag?.equipments?.Armadura ?? []) as DefenseEquipment[];
  return getWornArmor(armors, sheet.wornArmorId);
}

/** True quando a armadura vestida é pesada. */
export function isWearingHeavyArmor(sheet: CharacterSheet): boolean {
  const worn = getSheetWornArmor(sheet);
  return !!worn && isHeavyArmor(worn);
}
