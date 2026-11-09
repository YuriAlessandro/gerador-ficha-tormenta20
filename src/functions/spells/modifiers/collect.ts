import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type Equipment from '../../../interfaces/Equipment';
import type {
  SpellModifier,
  SpellModifierChoiceSpec,
  SpellModifierFilter,
} from '../../../interfaces/SpellModifiers';
import { isItemWielded } from '../../../components/SheetResult/BackpackModal/wielding';
import { getClassLevel } from '../../multiclass';
import {
  extractSpellModifierSource,
  getCatalogSpellModifierSource,
  SpellModifierEntry,
  SpellModifierSourceKind,
} from './catalog';

/** "Escolha N magias" já resolvido para a ficha. */
export interface ResolvedSpellChoice {
  source: string;
  max: number;
  /** Magias marcadas pelo jogador (cortadas em `max`). */
  chosen: string[];
  eligible?: SpellModifierFilter;
}

/** Um modificador e a fonte que o concede (para o rótulo na UI). */
export interface SourcedSpellModifier {
  source: string;
  modifier: SpellModifier;
  /** Vem de um esotérico — só um por magia (ver `resolveSpellCast`). */
  esoteric?: boolean;
  /** A fonte deixa escolher magias (filtro `chosen`). */
  choice?: ResolvedSpellChoice;
}

interface ResolvedEntry {
  modifiers: SpellModifier[];
  spellChoice?: SpellModifierChoiceSpec;
}

/**
 * Resolve os modificadores de uma entrada da ficha: o catálogo manda (versão
 * atual, mesmo em ficha antiga); conteúdo criado à mão na ficha usa a própria
 * cópia. Os de escolha de opção (Mestre em Escola) vêm da opção gravada em
 * `optionChoices[optionKey]`.
 */
function resolveEntry(
  sheet: CharacterSheet,
  kind: SpellModifierSourceKind,
  name: string,
  entry: SpellModifierEntry,
  isCustom: boolean
): ResolvedEntry {
  const source =
    (!isCustom && getCatalogSpellModifierSource(kind, name)) ||
    extractSpellModifierSource(entry);
  const chosen = source.choices.flatMap(({ optionKey, options }) =>
    Array.from(new Set(sheet.optionChoices?.[optionKey] ?? [])).flatMap(
      (optionName) => options[optionName] ?? []
    )
  );
  return {
    modifiers: [...source.modifiers, ...chosen],
    spellChoice: source.spellChoice,
  };
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

function resolveChoiceMax(
  sheet: CharacterSheet,
  spec: SpellModifierChoiceSpec,
  picks: number
): number {
  const { count } = spec;
  switch (count.type) {
    case 'fixed':
      return count.value;
    case 'picks':
      return picks;
    case 'attribute': {
      const value = sheet.atributos?.[count.attribute]?.value ?? 0;
      return Math.max(count.min ?? 0, value);
    }
    default:
      return 0;
  }
}

interface Candidate {
  kind: SpellModifierSourceKind;
  name: string;
  entry: SpellModifierEntry;
  isCustom: boolean;
  esoteric?: boolean;
}

/** Todos os modificadores de magia ativos na ficha, deduplicados por fonte. */
export function collectSheetSpellModifiers(
  sheet: CharacterSheet
): SourcedSpellModifier[] {
  // As mesmas fontes de `buildPowerSources`, lidas com tolerância: efeitos
  // ativos e exportações recebem fichas parciais.
  const asPower =
    (isCustom: boolean) =>
    (power: { name: string }): Candidate => ({
      kind: 'power',
      name: power.name,
      entry: power as SpellModifierEntry,
      isCustom,
    });
  const candidates: Candidate[] = [
    ...[
      ...(sheet.classPowers ?? []),
      ...(sheet.raca?.abilities ?? []),
      ...(sheet.origin?.powers ?? []),
      ...(sheet.devoto?.poderes ?? []),
      ...(sheet.generalPowers ?? []),
    ].map(asPower(false)),
    ...gainedClassAbilities(sheet).map(
      (ability): Candidate => ({
        kind: 'ability',
        name: ability.name,
        entry: ability as SpellModifierEntry,
        isCustom: false,
      })
    ),
    ...[
      ...(sheet.customPowers ?? []),
      ...(sheet.customGrantedPowers ?? []),
    ].map(asPower(true)),
  ];
  const groups = sheet.bag?.equipments ?? {};
  (Object.values(groups) as (Equipment[] | undefined)[]).forEach((items) => {
    (items ?? []).forEach((item) => {
      if (!item.nome || !isItemInUse(sheet, item)) return;
      candidates.push({
        kind: 'item',
        name: item.nome,
        entry: item,
        isCustom: !!item.isCustom,
        esoteric: item.group === 'Esotérico',
      });
    });
  });

  // Quantas vezes cada fonte aparece ANTES de deduplicar ("uma magia por vez
  // que o poder foi escolhido").
  const picks = new Map<string, number>();
  candidates.forEach(({ kind, name }) => {
    const key = `${kind}:${name}`;
    picks.set(key, (picks.get(key) ?? 0) + 1);
  });

  const result: SourcedSpellModifier[] = [];
  const seen = new Set<string>();
  candidates.forEach(({ kind, name, entry, isCustom, esoteric }) => {
    // Poder repetido (duas fontes, ou dois itens iguais) não dobra o efeito.
    const key = `${kind}:${name}`;
    if (seen.has(key)) return;
    seen.add(key);
    const { modifiers, spellChoice } = resolveEntry(
      sheet,
      kind,
      name,
      entry,
      isCustom
    );
    if (modifiers.length === 0) return;
    let choice: ResolvedSpellChoice | undefined;
    if (spellChoice) {
      const max = resolveChoiceMax(sheet, spellChoice, picks.get(key) ?? 1);
      choice = {
        source: name,
        max,
        chosen: (sheet.spellModifierChoices?.[name] ?? []).slice(0, max),
        eligible: spellChoice.eligible,
      };
    }
    modifiers.forEach((modifier) =>
      result.push({ source: name, modifier, esoteric, choice })
    );
  });

  return result;
}
