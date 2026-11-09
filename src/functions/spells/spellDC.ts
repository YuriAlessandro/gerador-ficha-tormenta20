import type CharacterSheet from '../../interfaces/CharacterSheet';
import type { Spell } from '../../interfaces/Spells';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { resolveSpellCast } from './modifiers';

/**
 * Bônus de CD que vale para TODAS as magias: o campo da ficha mais os bônus
 * fixos de alvo `SpellDC`. Os bônus por magia (Foco em Magia, Varinha arcana)
 * vêm do motor de modificadores (`SpellCastProfile.dcBonus`).
 */
export function getSheetSpellDCBonus(sheet: CharacterSheet): number {
  let total = sheet.bonusSpellDC ?? 0;
  (sheet.sheetBonuses ?? [])
    .filter((b) => b.target.type === 'SpellDC')
    .forEach((b) => {
      if (b.modifier.type === 'Fixed') total += b.modifier.value;
    });
  return total;
}

/** Atributo-chave das magias da ficha, como a aba de magias usa. */
export function getSheetSpellKeyAttribute(sheet: CharacterSheet): Atributo {
  return (
    sheet.classe?.spellPath?.keyAttribute ??
    sheet.overrideKeyAttribute ??
    Atributo.SABEDORIA
  );
}

/**
 * CD para resistir à magia: 10 + ½ nível + atributo-chave + bônus da ficha +
 * bônus da própria magia. Usa o valor BASE do atributo (o app usa o efetivo,
 * com bônus temporários; fora dele — PDF — não há efeito ativo).
 */
export function getSpellResistDC(sheet: CharacterSheet, spell: Spell): number {
  const attribute = spell.customKeyAttr ?? getSheetSpellKeyAttribute(sheet);
  return (
    10 +
    Math.floor((sheet.nivel ?? 1) / 2) +
    (sheet.atributos?.[attribute]?.value ?? 0) +
    getSheetSpellDCBonus(sheet) +
    resolveSpellCast(sheet, spell).dcBonus
  );
}
