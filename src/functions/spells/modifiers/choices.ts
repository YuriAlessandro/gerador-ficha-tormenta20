import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type { Spell } from '../../../interfaces/Spells';
import { choiceValuesOf } from './match';
import { resolveSpellCast } from './resolve';

/**
 * Marca/desmarca `spell` para a fonte de "escolha N magias" (Foco em Magia,
 * Estola…). Devolve o novo `spellModifierChoices`, ou `undefined` quando não
 * há o que mudar (magia inelegível, ou todas as vagas já ocupadas).
 */
export function toggleSpellModifierChoice(
  sheet: CharacterSheet,
  source: string,
  spell: Spell
): CharacterSheet['spellModifierChoices'] | undefined {
  const slot = resolveSpellCast(sheet, spell).spellChoices.find(
    (s) => s.source === source
  );
  const value = slot?.value;
  if (!slot || !value) return undefined;
  const current = sheet.spellModifierChoices?.[source] ?? [];
  if (slot.chosen) {
    // Desmarca tudo que esta magia registraria (tipo de dano: qualquer um
    // dos tipos dela que esteja marcado).
    const own = choiceValuesOf(spell, slot.of);
    return {
      ...sheet.spellModifierChoices,
      [source]: current.filter((name) => !own.includes(name)),
    };
  }
  if (slot.used >= slot.max) return undefined;
  // Escolhas além do máximo (poder removido, atributo menor) são descartadas
  // ao marcar uma nova, para a lista não crescer fantasma.
  return {
    ...sheet.spellModifierChoices,
    [source]: [...current.slice(0, slot.max - 1), value],
  };
}
