import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type Equipment from '../../../interfaces/Equipment';
import type {
  HasSpellModifiers,
  SpellModifier,
} from '../../../interfaces/SpellModifiers';
import { isItemWielded } from '../../../components/SheetResult/BackpackModal/wielding';
import { getCatalogSpellModifiers, SpellModifierSourceKind } from './catalog';

/** Um modificador e a fonte que o concede (para o rótulo na UI). */
export interface SourcedSpellModifier {
  source: string;
  modifier: SpellModifier;
}

/**
 * Resolve os modificadores de uma entrada da ficha: o catálogo manda (versão
 * atual, mesmo em ficha antiga); conteúdo criado à mão na ficha usa a própria
 * cópia.
 */
function resolveEntry(
  kind: SpellModifierSourceKind,
  name: string,
  entry: HasSpellModifiers,
  isCustom: boolean
): SpellModifier[] {
  if (isCustom) return entry.spellModifiers ?? [];
  return getCatalogSpellModifiers(kind, name) ?? entry.spellModifiers ?? [];
}

/**
 * O item está em uso? "Para usar um esotérico, você precisa empunhá-lo" (JdA):
 * esotérico só conta empunhado. Ficha que nunca marcou nada nas mãos segue a
 * regra legada da mochila ("tudo está equipado"), senão toda ficha antiga
 * perderia o efeito de uma vez. Demais itens contam por estar na mochila.
 */
function isItemInUse(sheet: CharacterSheet, item: Equipment): boolean {
  if (item.group !== 'Esotérico') return true;
  const hands = [
    sheet.mainHandItemId,
    sheet.offHandItemId,
    sheet.extraHand1ItemId,
    sheet.extraHand2ItemId,
  ];
  if (hands.every((id) => id === undefined)) return true;
  return isItemWielded(item.id, sheet);
}

/** Todos os modificadores de magia ativos na ficha, deduplicados por fonte. */
export function collectSheetSpellModifiers(
  sheet: CharacterSheet
): SourcedSpellModifier[] {
  const result: SourcedSpellModifier[] = [];
  const seen = new Set<string>();
  const push = (
    kind: SpellModifierSourceKind,
    name: string,
    modifiers: SpellModifier[]
  ) => {
    // Poder repetido (duas fontes, ou dois itens iguais) não dobra o efeito.
    const key = `${kind}:${name}`;
    if (seen.has(key) || modifiers.length === 0) return;
    seen.add(key);
    modifiers.forEach((modifier) => result.push({ source: name, modifier }));
  };

  // As mesmas fontes de `buildPowerSources`, lidas com tolerância: efeitos
  // ativos e exportações recebem fichas parciais.
  const bookPowers: { name: string }[] = [
    ...(sheet.classPowers ?? []),
    ...(sheet.classe?.abilities ?? []),
    ...(sheet.raca?.abilities ?? []),
    ...(sheet.origin?.powers ?? []),
    ...(sheet.devoto?.poderes ?? []),
    ...(sheet.generalPowers ?? []),
  ];
  bookPowers.forEach((power) =>
    push(
      'power',
      power.name,
      resolveEntry('power', power.name, power as HasSpellModifiers, false)
    )
  );
  [...(sheet.customPowers ?? []), ...(sheet.customGrantedPowers ?? [])].forEach(
    (power) =>
      push(
        'power',
        power.name,
        resolveEntry('power', power.name, power as HasSpellModifiers, true)
      )
  );

  const groups = sheet.bag?.equipments ?? {};
  (Object.values(groups) as (Equipment[] | undefined)[]).forEach((items) => {
    (items ?? []).forEach((item) => {
      if (!item.nome || !isItemInUse(sheet, item)) return;
      push(
        'item',
        item.nome,
        resolveEntry('item', item.nome, item, !!item.isCustom)
      );
    });
  });

  return result;
}
