import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type { Spell } from '../../../interfaces/Spells';
import { collectSheetSpellModifiers, ResolvedSpellChoice } from './collect';
import { choiceValuesOf, spellMatchesFilter } from './match';
import { resolveSpellCast } from './resolve';

/**
 * Marca/desmarca `spell` para a fonte de "escolha N magias" (Foco em Magia,
 * Estola…). Devolve o novo `spellModifierChoices`, ou `undefined` quando não
 * há o que mudar (magia inelegível, ou todas as vagas já ocupadas).
 */
export function toggleSpellModifierChoice(
  sheet: CharacterSheet,
  key: string,
  spell: Spell
): CharacterSheet['spellModifierChoices'] | undefined {
  const slot = resolveSpellCast(sheet, spell).spellChoices.find(
    (s) => s.key === key
  );
  const value = slot?.value;
  if (!slot || !value) return undefined;
  const current = sheet.spellModifierChoices?.[key] ?? [];
  if (slot.chosen) {
    // Desmarca tudo que esta magia registraria (tipo de dano: qualquer um
    // dos tipos dela que esteja marcado).
    const own = choiceValuesOf(spell, slot.of);
    return {
      ...sheet.spellModifierChoices,
      [key]: current.filter((name) => !own.includes(name)),
    };
  }
  if (slot.used >= slot.max) return undefined;
  // Escolhas além do máximo (poder removido, atributo menor) são descartadas
  // ao marcar uma nova, para a lista não crescer fantasma.
  return {
    ...sheet.spellModifierChoices,
    [key]: [...current.slice(0, slot.max - 1), value],
  };
}

/** Escolhas "escolha N magias" da ficha, uma por fonte. */
export function getSheetSpellChoices(
  sheet: CharacterSheet
): ResolvedSpellChoice[] {
  const bySource = new Map<string, ResolvedSpellChoice>();
  collectSheetSpellModifiers(sheet).forEach(({ choice }) => {
    if (choice && !bySource.has(choice.key)) {
      bySource.set(choice.key, choice);
    }
  });
  return Array.from(bySource.values());
}

/** Um valor que a escolha pode registrar e as magias da ficha que o dão. */
export interface SpellChoiceOption {
  value: string;
  spells: string[];
}

/**
 * O que a escolha pode registrar a partir das magias da ficha: os nomes das
 * magias elegíveis, as escolas delas (Tomo hermético) ou os tipos de dano
 * delas (Cetro elemental). Valores já escolhidos sem magia na ficha (magia
 * removida) continuam na lista, para poderem ser desmarcados.
 */
export function getSpellChoiceOptions(
  sheet: CharacterSheet,
  choice: Pick<ResolvedSpellChoice, 'of' | 'eligible' | 'chosen'>,
  spells: Spell[] = sheet.spells ?? []
): SpellChoiceOption[] {
  const byValue = new Map<string, string[]>();
  spells.forEach((spell) => {
    // Ficha antiga pode ter buraco na lista de magias.
    if (!spell || !spellMatchesFilter(spell, choice.eligible, sheet)) return;
    choiceValuesOf(spell, choice.of, choice.eligible).forEach((value) => {
      const list = byValue.get(value) ?? [];
      if (!list.includes(spell.nome)) list.push(spell.nome);
      byValue.set(value, list);
    });
  });
  choice.chosen.forEach((value) => {
    if (!byValue.has(value)) byValue.set(value, []);
  });
  return Array.from(byValue.entries())
    .map(([value, names]) => ({ value, spells: names }))
    .sort((a, b) => a.value.localeCompare(b.value, 'pt-BR'));
}

/** Grava as escolhas de uma fonte (vazio remove a chave). */
export function setSpellModifierChoices(
  sheet: CharacterSheet,
  key: string,
  values: string[]
): CharacterSheet['spellModifierChoices'] {
  const next = { ...sheet.spellModifierChoices };
  if (values.length > 0) next[key] = Array.from(new Set(values));
  else delete next[key];
  return Object.keys(next).length > 0 ? next : undefined;
}
