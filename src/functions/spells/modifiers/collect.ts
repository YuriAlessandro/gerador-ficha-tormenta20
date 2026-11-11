import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type Equipment from '../../../interfaces/Equipment';
import type {
  SpellChoiceOf,
  SpellModifier,
  SpellModifierChoiceSpec,
  SpellModifierFilter,
} from '../../../interfaces/SpellModifiers';
import { isItemWielded } from '../../../components/SheetResult/BackpackModal/wielding';
import { dataRegistry } from '../../../data/registry';
import { getClassLevel } from '../../multiclass';
import { isModificationSuperseded } from '../../modifications/modificationEffects';
import {
  extractSpellModifierSource,
  getCatalogSpellModifierSource,
  SpellModifierEntry,
  SpellModifierSourceKind,
} from './catalog';

/** "Escolha N magias" já resolvido para a ficha. */
export interface ResolvedSpellChoice {
  /**
   * Onde a escolha fica gravada (`spellModifierChoices[key]`): o nome do
   * poder ou item; melhoria de item (Harmonizado), por item.
   */
  key: string;
  /** Rótulo na interface. */
  source: string;
  max: number;
  /** Magias (ou escolas) marcadas pelo jogador, cortadas em `max`. */
  chosen: string[];
  of: SpellChoiceOf;
  eligible?: SpellModifierFilter;
}

/** Um modificador e a fonte que o concede (para o rótulo na UI). */
export interface SourcedSpellModifier {
  /** Identidade da fonte (o esotérico escolhido no lançamento). */
  source: string;
  /**
   * Rótulo curto nas notas, quando difere da fonte: "Varinha arcana" para o
   * efeito do próprio item, "Poderoso (Varinha arcana)" para a melhoria.
   */
  label?: string;
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
export function isItemInUse(sheet: CharacterSheet, item: Equipment): boolean {
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
  /** Nome no catálogo. */
  name: string;
  /** Rótulo da fonte; item com melhorias: "Varinha arcana (Poderoso)". */
  label: string;
  entry: SpellModifierEntry;
  isCustom: boolean;
  esoteric?: boolean;
  /** Melhorias de item superior que mexem nas magias. */
  improvements?: ResolvedImprovement[];
}

interface ResolvedImprovement {
  mod: string;
  modifiers: SpellModifier[];
  spellChoice?: SpellModifierChoiceSpec;
}

/** "Material especial" aparece pelo material: "Mitral", "Gelo Eterno". */
function modificationLabel(mod: string, specialMaterial?: string): string {
  if (mod !== 'Material especial' || !specialMaterial) return mod;
  const material = dataRegistry.getSpecialMaterialByName(specialMaterial);
  return (
    material?.esotericEffect?.material ??
    material?.weaponEffect?.material ??
    specialMaterial
  );
}

type ImprovementContext = 'weapon' | 'defense' | 'esoteric';

/** Em que lista de melhorias o item procura as dele. */
function improvementContext(item: Equipment): ImprovementContext | undefined {
  if (item.group === 'Esotérico') return 'esoteric';
  if (item.group === 'Arma') return 'weapon';
  if (item.group === 'Armadura' || item.group === 'Escudo') return 'defense';
  return undefined;
}

/**
 * A arma, armadura ou escudo está em uso para as melhorias dele valerem
 * (Canônico, Deslumbrante)? Arma e escudo, empunhados; armadura, vestida. Ficha
 * que nunca marcou mãos ou armadura segue a regra legada (tudo em uso).
 */
function isGearInUse(sheet: CharacterSheet, item: Equipment): boolean {
  if (item.group === 'Armadura') {
    return !sheet.wornArmorId || sheet.wornArmorId === item.id;
  }
  if (item.group === 'Arma' || item.group === 'Escudo') {
    const hands = [
      sheet.mainHandItemId,
      sheet.offHandItemId,
      sheet.extraHand1ItemId,
      sheet.extraHand2ItemId,
    ];
    if (hands.every((id) => id === undefined)) return true;
    return isItemWielded(item.id, sheet);
  }
  return true;
}

/**
 * Melhorias do item com efeito em magia (Poderoso, Canalizador, Harmonizado,
 * Canônico…), lidas do catálogo pelo nome. A superior anula a que ela
 * substitui (Potencializador sobre Canalizador). "Devoto da divindade
 * escolhida" vira a divindade gravada na melhoria; sem ela, não vale.
 */
function itemImprovements(
  sheet: CharacterSheet,
  item: Equipment
): ResolvedImprovement[] {
  const context = improvementContext(item);
  if (!context || !isGearInUse(sheet, item)) return [];
  const appliedMods = item.modifications ?? [];
  const applied = appliedMods.map((m) => m.mod);
  return appliedMods
    .filter(({ mod }) => !isModificationSuperseded(mod, applied))
    .map(({ mod, specialMaterial, deity }) => {
      // Material especial em esotérico: o efeito é o do material ("Mitral").
      if (mod === 'Material especial') {
        return {
          mod: modificationLabel(mod, specialMaterial),
          modifiers:
            context === 'esoteric' && specialMaterial
              ? dataRegistry.getSpecialMaterialByName(specialMaterial)
                  ?.esotericSpellModifiers ?? []
              : [],
        };
      }
      const data = dataRegistry.getImprovementByName(mod, context);
      const modifiers = (data?.spellModifiers ?? []).flatMap((modifier) => {
        if (modifier.filter?.devoteeOf !== 'chosen') return [modifier];
        if (!deity) return [];
        return [
          { ...modifier, filter: { ...modifier.filter, devoteeOf: deity } },
        ];
      });
      return { mod, modifiers, spellChoice: data?.spellChoice };
    })
    .filter(({ modifiers }) => modifiers.length > 0);
}

/**
 * Rótulo do item como fonte: "Varinha arcana (Poderoso)". Melhoria com escolha
 * mostra a escolha — "(Harmonizado: Bola de Fogo)" —, o que também separa duas
 * varinhas iguais harmonizadas para magias diferentes.
 */
const itemLabel = (sheet: CharacterSheet, item: Equipment): string => {
  const context = improvementContext(item);
  const mods = (item.modifications ?? []).map(
    ({ mod, specialMaterial, deity }) => {
      const label = modificationLabel(mod, specialMaterial);
      if (deity) return `${label}: ${deity}`;
      const hasChoice =
        !!context &&
        !!dataRegistry.getImprovementByName(mod, context)?.spellChoice;
      const chosen = hasChoice
        ? sheet.spellModifierChoices?.[`${mod}@${item.id ?? item.nome}`] ?? []
        : [];
      return chosen.length > 0 ? `${label}: ${chosen.join(', ')}` : label;
    }
  );
  return mods.length > 0 ? `${item.nome} (${mods.join(', ')})` : item.nome;
};

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
      label: power.name,
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
        label: ability.name,
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
        label: itemLabel(sheet, item),
        entry: item,
        isCustom: !!item.isCustom,
        esoteric: item.group === 'Esotérico',
        improvements: itemImprovements(sheet, item),
      });
    });
  });

  // Quantas vezes cada fonte aparece ANTES de deduplicar ("uma magia por vez
  // que o poder foi escolhido").
  const picks = new Map<string, number>();
  candidates.forEach(({ kind, label }) => {
    const key = `${kind}:${label}`;
    picks.set(key, (picks.get(key) ?? 0) + 1);
  });

  const toChoice = (
    key: string,
    source: string,
    spec: SpellModifierChoiceSpec,
    picked: number
  ): ResolvedSpellChoice => {
    const max = resolveChoiceMax(sheet, spec, picked);
    return {
      key,
      source,
      max,
      chosen: (sheet.spellModifierChoices?.[key] ?? []).slice(0, max),
      eligible: spec.eligible,
      of: spec.of ?? 'spell',
    };
  };

  const result: SourcedSpellModifier[] = [];
  const seen = new Set<string>();
  candidates.forEach(
    ({ kind, name, label, entry, isCustom, esoteric, improvements }) => {
      // Poder repetido (duas fontes, ou dois itens iguais) não dobra o efeito.
      const key = `${kind}:${label}`;
      if (seen.has(key)) return;
      seen.add(key);
      const { modifiers, spellChoice } = resolveEntry(
        sheet,
        kind,
        name,
        entry,
        isCustom
      );
      // A escolha do próprio item (Tomo hermético) segue gravada pelo nome.
      const choice =
        spellChoice && toChoice(name, name, spellChoice, picks.get(key) ?? 1);
      modifiers.forEach((modifier) =>
        result.push({
          source: label,
          ...(label !== name ? { label: name } : {}),
          modifier,
          esoteric,
          choice,
        })
      );
      // Melhorias: mesma fonte (o item continua sendo UM esotérico); a escolha
      // do Harmonizado é por item, para duas varinhas não dividirem a magia.
      (improvements ?? []).forEach((improvement) => {
        const itemId = (entry as Equipment).id ?? name;
        const improvementChoice =
          improvement.spellChoice &&
          toChoice(
            `${improvement.mod}@${itemId}`,
            `${improvement.mod} (${name})`,
            improvement.spellChoice,
            1
          );
        improvement.modifiers.forEach((modifier) =>
          result.push({
            source: label,
            label: `${improvement.mod} (${name})`,
            modifier,
            esoteric,
            choice: improvementChoice,
          })
        );
      });
    }
  );

  return result;
}
