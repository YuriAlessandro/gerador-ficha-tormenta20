import CharacterSheet from '@/interfaces/CharacterSheet';

/**
 * Bônus na CD das magias além de 10 + ½ nível + atributo: o ajuste manual
 * (`bonusSpellDC`) mais os bônus fixos de alvo `SpellDC` da ficha.
 */
export function getSpellDCBonus(
  sheet: Pick<CharacterSheet, 'bonusSpellDC' | 'sheetBonuses'>
): number {
  let total = sheet.bonusSpellDC ?? 0;
  (sheet.sheetBonuses ?? [])
    .filter((b) => b.target.type === 'SpellDC')
    .forEach((b) => {
      if (b.modifier.type === 'Fixed') {
        total += b.modifier.value;
      }
    });
  return total;
}
