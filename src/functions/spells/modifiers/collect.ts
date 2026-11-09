import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type Equipment from '../../../interfaces/Equipment';
import type { SpellModifier } from '../../../interfaces/SpellModifiers';
import { isItemWielded } from '../../../components/SheetResult/BackpackModal/wielding';
import { getClassLevel } from '../../multiclass';
import {
  extractSpellModifierSource,
  getCatalogSpellModifierSource,
  SpellModifierEntry,
  SpellModifierSourceKind,
} from './catalog';

/** Um modificador e a fonte que o concede (para o rótulo na UI). */
export interface SourcedSpellModifier {
  source: string;
  modifier: SpellModifier;
}

/**
 * Resolve os modificadores de uma entrada da ficha: o catálogo manda (versão
 * atual, mesmo em ficha antiga); conteúdo criado à mão na ficha usa a própria
 * cópia. Os de escolha (Mestre em Escola) vêm da opção gravada em
 * `optionChoices[optionKey]`.
 */
function resolveEntry(
  sheet: CharacterSheet,
  kind: SpellModifierSourceKind,
  name: string,
  entry: SpellModifierEntry,
  isCustom: boolean
): SpellModifier[] {
  const source =
    (!isCustom && getCatalogSpellModifierSource(kind, name)) ||
    extractSpellModifierSource(entry);
  const chosen = source.choices.flatMap(({ optionKey, options }) =>
    Array.from(new Set(sheet.optionChoices?.[optionKey] ?? [])).flatMap(
      (optionName) => options[optionName] ?? []
    )
  );
  return [...source.modifiers, ...chosen];
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

/**
 * Habilidades de classe JÁ ganhas: `classe.abilities` pode trazer as de todos
 * os níveis (ver `hasPowerNamed`), e Alta Arcana não pode valer no 1º nível.
 * Multiclasse: o nível que conta é o da classe que concede a habilidade.
 */
function gainedClassAbilities(sheet: CharacterSheet): { name: string }[] {
  const { classe } = sheet;
  if (!classe?.abilities) return [];
  return classe.abilities.filter((ability) => {
    const className = ability.sourceClassName ?? classe.name;
    const classLevel = getClassLevel(sheet, className);
    return ability.nivel <= classLevel;
  });
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
    ...(sheet.raca?.abilities ?? []),
    ...(sheet.origin?.powers ?? []),
    ...(sheet.devoto?.poderes ?? []),
    ...(sheet.generalPowers ?? []),
  ];
  bookPowers.forEach((power) =>
    push(
      'power',
      power.name,
      resolveEntry(
        sheet,
        'power',
        power.name,
        power as SpellModifierEntry,
        false
      )
    )
  );
  gainedClassAbilities(sheet).forEach((ability) =>
    push(
      'ability',
      ability.name,
      resolveEntry(
        sheet,
        'ability',
        ability.name,
        ability as SpellModifierEntry,
        false
      )
    )
  );
  [...(sheet.customPowers ?? []), ...(sheet.customGrantedPowers ?? [])].forEach(
    (power) =>
      push(
        'power',
        power.name,
        resolveEntry(
          sheet,
          'power',
          power.name,
          power as SpellModifierEntry,
          true
        )
      )
  );

  const groups = sheet.bag?.equipments ?? {};
  (Object.values(groups) as (Equipment[] | undefined)[]).forEach((items) => {
    (items ?? []).forEach((item) => {
      if (!item.nome || !isItemInUse(sheet, item)) return;
      push(
        'item',
        item.nome,
        resolveEntry(sheet, 'item', item.nome, item, !!item.isCustom)
      );
    });
  });

  return result;
}
