import { Atributo } from '../../data/systems/tormenta20/atributos';
import { getEffectiveAttributeModifier } from '../../functions/effectiveAttributes';
import { getDerivedSpells } from '../../functions/spells/derivedSpells';
import {
  getEngenhocaResistDC,
  getSpellBasePm,
  getSpellCircleNumber,
} from '../../functions/spells/engenhoca';
import { getSpellDCBonus } from '../../functions/spells/spellDC';
import { getSpellDisplayName } from '../../functions/spells/spellDisplayName';
import { getSpellTradition } from '../../functions/spells/spellTradition';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { DiceRoll } from '../../interfaces/DiceRoll';
import { Aprimoramento, Spell } from '../../interfaces/Spells';
import { SupplementId } from '../../types/supplement.types';
import { buildChange, buildOnUseEffect, isRecord } from '../effects';
import {
  ATTRIBUTE_KEYS,
  toActivation,
  toDamageTypeKey,
  toDuration,
  toRangeKey,
  toSchoolKey,
} from '../enums';
import { foundryId, textToHtml } from '../normalize';
import {
  FoundryEffect,
  FoundryEffectChange,
  FoundryItem,
  FoundryRoll,
} from '../types';

/**
 * Atributo-chave de conjuração da ficha — mesma precedência de
 * `recalculateSheet` (`spellKeyAttr`): classe, multiclasse, override manual.
 */
export function getSpellKeyAttribute(
  sheet: CharacterSheet
): Atributo | undefined {
  const fromClass = sheet.classe.spellPath?.keyAttribute;
  if (fromClass) return fromClass;

  const multiclass = Object.values(sheet.multiclassSpellPaths ?? {});
  if (multiclass.length > 0) return multiclass[0].keyAttribute;

  return sheet.overrideKeyAttribute;
}

/** Rolagens da ficha → `system.rolls` (chave única por item, partes de 3). */
export function buildFormulaRolls(
  rolls: DiceRoll[] | undefined
): FoundryRoll[] {
  return (rolls ?? [])
    .filter((roll) => roll.dice?.trim())
    .map((roll, index) => {
      const isHealing = /cura/i.test(roll.label);
      const damageType = isHealing
        ? 'curapv'
        : toDamageTypeKey(roll.damageType);
      return {
        name: roll.label || `Rolagem ${index + 1}`,
        key: `dano${index}`,
        type: 'dano' as const,
        parts: [[roll.dice.trim(), damageType, '']],
        versatil: '',
        adaptavel: '',
      };
    });
}

function getSpellType(sheet: CharacterSheet, spell: Spell): string {
  if (spell.engenhoca) return 'eng';

  const tradition = getSpellTradition(spell.nome);
  if (tradition === 'arcane') return 'arc';
  if (tradition === 'divine') return 'div';
  if (tradition === 'universal') return 'uni';

  // Magia que o catálogo não conhece (personalizada/homebrew): segue a classe.
  return sheet.classe.spellPath?.spellType === 'Divine' ? 'div' : 'arc';
}

function getAprimoramentoChanges(
  aprimoramento: Aprimoramento
): FoundryEffectChange[] {
  return (aprimoramento.damageBonus ?? []).flatMap((bonus) => {
    if (bonus.dicePerActivation) {
      return [buildChange('dano', bonus.dicePerActivation, 'custom')];
    }
    if (bonus.flatPerActivation) {
      return [buildChange('dano', bonus.flatPerActivation, 'add')];
    }
    return [];
  });
}

function buildAprimoramentoEffects(
  spell: Spell,
  name: string
): FoundryEffect[] {
  return (spell.aprimoramentos ?? []).map((aprimoramento) =>
    buildOnUseEffect({
      itemName: name,
      text: aprimoramento.text,
      cost: aprimoramento.trick ? null : aprimoramento.addPm,
      repeatable: /^\s*aumenta/i.test(aprimoramento.text),
      changes: getAprimoramentoChanges(aprimoramento),
    })
  );
}

function buildSpell(spell: Spell, name: string): FoundryItem {
  const activation = toActivation(spell.execucao);
  const range = toRangeKey(spell.alcance);
  // Alcance em texto livre não tem chave no sistema: vai para a descrição.
  const rangeNote =
    range === undefined && spell.alcance?.trim()
      ? `Alcance: ${spell.alcance.trim()}\n`
      : '';

  return {
    _id: foundryId(),
    name,
    type: 'magia',
    effects: buildAprimoramentoEffects(spell, name),
    flags: {},
    system: {
      description: {
        value: textToHtml(`${rangeNote}${spell.description ?? ''}`),
        unidentified: '',
      },
      circulo: Math.max(1, getSpellCircleNumber(spell)),
      escola: toSchoolKey(spell.school),
      ativacao: {
        execucao: activation.execucao,
        special: activation.special,
        custo: 0,
        qtd: '',
        condicao: '',
      },
      duracao: toDuration(spell.duracao),
      alcance: range ?? 'spec',
      alvo: spell.alvo ?? '',
      area: spell.area ?? '',
      resistencia: {
        txt: spell.resistencia ?? '',
        pericia: '',
        atributo: '',
        bonus: 0,
      },
      rolls: buildFormulaRolls(spell.rolls),
    },
  };
}

/**
 * Bônus de CD da magia no Foundry, que calcula 10 + ½ nível + atributo +
 * `resistencia.bonus`. Engenhoca usa Inteligência e soma os aparatos.
 */
function getResistanceBonus(
  sheet: CharacterSheet,
  spell: Spell,
  dcBonus: number
): number {
  if (!spell.engenhoca) return dcBonus;
  return (
    getEngenhocaResistDC(sheet, spell, dcBonus) -
    10 -
    Math.floor((sheet.nivel ?? 1) / 2) -
    getEffectiveAttributeModifier(sheet, Atributo.INTELIGENCIA)
  );
}

/**
 * Magias da ficha mais a lista derivada (Usurpar), que a ficha mostra mas
 * nunca grava em `sheet.spells` — ver `derivedSpells.ts`.
 */
function getSheetSpells(sheet: CharacterSheet): {
  spell: Spell;
  derived: boolean;
}[] {
  const derived = getDerivedSpells(
    sheet,
    sheet.supplements ?? [SupplementId.TORMENTA20_CORE]
  );
  return [
    ...(sheet.spells ?? []).map((spell) => ({ spell, derived: false })),
    ...derived.map((spell) => ({ spell, derived: true })),
  ];
}

export function buildSpellItems(sheet: CharacterSheet): FoundryItem[] {
  const keyAttribute = getSpellKeyAttribute(sheet);
  const dcBonus = getSpellDCBonus(sheet);

  return getSheetSpells(sheet).map(({ spell, derived }) => {
    const item = buildSpell(spell, getSpellDisplayName(spell));
    item.system.tipo = getSpellType(sheet, spell);
    item.system.preparada = !!(spell.memorized || spell.alwaysPrepared);
    // A frente da ficha em abas só lista favoritos. A lista derivada tem
    // ~140 magias: favoritá-las enterraria o resto.
    if (!derived) item.flags = { tormenta20: { favorito: true } };

    if (isRecord(item.system.ativacao)) {
      item.system.ativacao.custo = Math.max(
        0,
        getSpellBasePm(spell) - (spell.manaReduction ?? 0)
      );
    }

    // A CD só é calculada pelo sistema quando a magia tem atributo E texto de
    // resistência; o atributo é o do conjurador (engenhoca: Inteligência).
    const attribute = spell.engenhoca
      ? Atributo.INTELIGENCIA
      : spell.customKeyAttr ?? keyAttribute;
    if (attribute && isRecord(item.system.resistencia)) {
      item.system.resistencia.atributo = ATTRIBUTE_KEYS[attribute];
      item.system.resistencia.bonus = getResistanceBonus(sheet, spell, dcBonus);
    }

    return item;
  });
}
