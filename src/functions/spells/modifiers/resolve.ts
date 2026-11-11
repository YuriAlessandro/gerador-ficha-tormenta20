import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type { Atributo } from '../../../data/systems/tormenta20/atributos';
import type { DiceRoll } from '../../../interfaces/DiceRoll';
import type { Aprimoramento, Spell } from '../../../interfaces/Spells';
import type {
  SpellChoiceOf,
  SpellEffectBonusKind,
  SpellModifierEffect,
} from '../../../interfaces/SpellModifiers';
import {
  addRollDice,
  applyRollBonus,
  AugmentedRoll,
  isHealingRollLabel,
  maximizeRoll,
} from '../../spellRollAugmentation';
import { getRollDamageType, getSpellDamageTypes } from '../damageTypes';
import { getSpellBasePm } from '../engenhoca';
import { getSpellKeyAttribute, getSpellPmLimitBase } from '../pmLimit';
import { collectSheetSpellModifiers } from './collect';
import {
  choiceValueOf,
  choiceValuesOf,
  isDamageRollLabel,
  spellMatchesFilter,
} from './match';

interface RollBonusTotal {
  perDie: number;
  flat: number;
}

/** Bônus de dano que depende do tipo da rolagem ou soma dados. */
export interface TypedDamageBonus {
  /** Ausente = qualquer rolagem de dano. */
  damageTypes?: string[];
  perDie: number;
  flat: number;
  extraDice: number;
}

/** Aprimoramento que um poder ou item acrescenta à magia. */
export interface ExtraAprimoramento extends Aprimoramento {
  source: string;
}

/**
 * Tudo o que os poderes e itens da ficha fazem com UMA magia. Montado por
 * `resolveSpellCast` e consumido pelo lançamento, lista, PDF, Foundry e
 * efeitos ativos — nenhum consumidor lê `spellModifiers` diretamente.
 */
export interface SpellCastProfile {
  /** Redução efetiva: a maior não cumulativa + as cumulativas. */
  pmReduction: number;
  /** Fontes que entram na redução efetiva. */
  pmReductionSources: string[];
  /** Custo final pela metade, depois das reduções (Alta Arcana). */
  pmHalve: boolean;
  healing: RollBonusTotal;
  damage: RollBonusTotal;
  /** Bônus de dano por tipo e dados extras (Aspecto do Inverno, Cetro). */
  typedDamage: TypedDamageBonus[];
  /** Aprimoramentos acrescentados (Proeminência Solar, Explosão Fulgente). */
  extraAprimoramentos: ExtraAprimoramento[];
  /**
   * Máximo de PM gastos no lançamento (JdA p. 224), já com bônus (Orbe
   * cristalina, Magia Ilimitada) e multiplicador (Celebrar Ritual). Ausente
   * sem ficha.
   */
  pmLimit?: number;
  /** Rolagens extras (Costela de lich), com id estável por fonte. */
  extraRolls: DiceRoll[];
  /** Somado à CD para resistir à magia. */
  dcBonus: number;
  /** PM extras para aprimoramentos (o maior; não cumulativos). */
  aprimoramentoPm: number;
  /** Efeito ativo: bônus de `kind` aumentam em `value`. */
  effectBonusIncrease: { kind: SpellEffectBonusKind; value: number }[];
  /** Efeito ativo: margem de ameaça extra por bônus de `kind`. */
  effectThreatMargin: { kind: SpellEffectBonusKind; value: number }[];
  /** Efeito ativo: PV temporários = `multiplier` × bônus de `kind`. */
  effectTempPV: { kind: SpellEffectBonusKind; multiplier: number }[];
  /**
   * "Uma magia só pode receber os benefícios de um esotérico por vez" (JdA),
   * salvo efeitos como o Esoterismo (limite 2). `esoterics` são os que valem
   * neste perfil (até `esotericLimit`); `esotericOptions`, todos os em uso que
   * afetariam a magia — mais opções que o limite = o jogador escolhe.
   */
  esoterics: string[];
  esotericLimit: number;
  esotericOptions: string[];
  /**
   * Fontes de "escolha N magias" (Foco em Magia) para as quais esta magia é
   * elegível: se está marcada e quantas vagas a fonte já usou.
   */
  spellChoices: SpellChoiceSlot[];
  /** Opções de lançamento disponíveis para esta magia (Magia Pungente…). */
  castOptions: SpellCastOptionSlot[];
  /** PM somados pelas opções marcadas. */
  castOptionPm: number;
  /** Rolagens maximizadas (Espírito dos Solstícios). */
  maximize: boolean;
  /** Novo tipo das rolagens de dano (Magia Sagrada/Profana). */
  damageTypeOverride?: string;
  /** Linhas legíveis do que se aplica, com a fonte, para a UI. */
  notes: string[];
}

export interface SpellCastOptionSlot {
  /** `fonte:id`, estável — é o que `ResolveSpellCastOptions.castOptions` usa. */
  key: string;
  source: string;
  label: string;
  addPm: number;
  active: boolean;
  /** Efeito ativo oferecido depois do lançamento, se a opção for marcada. */
  activeEffectKey?: string;
}

export interface SpellChoiceSlot {
  /** Onde a escolha fica gravada (ver `ResolvedSpellChoice.key`). */
  key: string;
  source: string;
  /** A magia (ou a escola dela, se `of: 'school'`) está escolhida. */
  chosen: boolean;
  of: SpellChoiceOf;
  /** O que marcar esta magia registra (o nome, a escola ou o tipo de dano). */
  value?: string;
  used: number;
  max: number;
}

export interface ResolveSpellCastOptions {
  /**
   * Esotéricos escolhidos no lançamento. Faltando (ou inválidos), completa
   * com os primeiros em uso até o limite.
   */
  esoterics?: string[];
  /** Chaves das opções de lançamento marcadas. */
  castOptions?: string[];
}

/**
 * O que o lançamento decidiu e o que vem depois dele precisa saber: os
 * esotéricos e opções escolhidos (para o efeito ativo da magia refletir a
 * mesma escolha) e os efeitos ativos das opções marcadas (Barreira Mística).
 */
export interface SpellCastContext {
  resolveOptions: ResolveSpellCastOptions;
  effectKeys: string[];
}

const sign = (n: number): string => (n >= 0 ? `+${n}` : `${n}`);

function describeRollBonus(
  what: string,
  perDie?: number,
  flat?: number
): string {
  const parts: string[] = [];
  if (perDie) parts.push(`${sign(perDie)} por dado de ${what}`);
  if (flat) parts.push(`${sign(flat)} de ${what}`);
  return parts.join(' e ');
}

export function resolveSpellCast(
  sheet: CharacterSheet | undefined,
  spell: Spell,
  options: ResolveSpellCastOptions = {}
): SpellCastProfile {
  // Redução gravada na própria magia (poderes que ensinam a magia de novo,
  // ver `addOrCheapenSpell`): é não cumulativa, como a regra geral.
  const persisted = spell.manaReduction ?? 0;
  let bestNonCumulative = persisted;
  let bestSource: string | undefined;
  let cumulative = 0;
  const cumulativeSources: string[] = [];

  const profile: SpellCastProfile = {
    pmReduction: 0,
    pmReductionSources: [],
    pmHalve: false,
    healing: { perDie: 0, flat: 0 },
    damage: { perDie: 0, flat: 0 },
    typedDamage: [],
    extraAprimoramentos: [],
    extraRolls: [],
    dcBonus: 0,
    aprimoramentoPm: 0,
    effectBonusIncrease: [],
    effectThreatMargin: [],
    effectTempPV: [],
    esoterics: [],
    esotericLimit: 1,
    esotericOptions: [],
    spellChoices: [],
    castOptions: [],
    castOptionPm: 0,
    maximize: false,
    notes: [],
  };

  let aprimoramentoSource: string | undefined;

  const collected = sheet ? collectSheetSpellModifiers(sheet) : [];

  // Vagas de "escolha N magias" em que esta magia pode entrar (uma por fonte).
  const choiceSources = new Set<string>();
  collected.forEach(({ choice }) => {
    if (!choice || choiceSources.has(choice.key)) return;
    choiceSources.add(choice.key);
    if (!spellMatchesFilter(spell, choice.eligible, sheet)) return;
    profile.spellChoices.push({
      key: choice.key,
      source: choice.source,
      chosen: choiceValuesOf(spell, choice.of, choice.eligible).some((v) =>
        choice.chosen.includes(v)
      ),
      of: choice.of,
      value: choiceValueOf(spell, choice.of, choice.eligible),
      used: choice.chosen.length,
      max: choice.max,
    });
  });

  const matching = collected.filter(({ modifier, choice }) =>
    spellMatchesFilter(
      spell,
      modifier.filter,
      sheet,
      choice && { values: choice.chosen, of: choice.of }
    )
  );
  // Esotéricos em uso que afetariam a magia (antes das etapas: a opção do
  // Esoterismo só aparece quando há dois para canalizar).
  profile.esotericOptions = Array.from(
    new Set(matching.filter((m) => m.esoteric).map((m) => m.source))
  );

  const attributeValue = (attribute: string | undefined): number => {
    if (!sheet || !attribute) return 0;
    const key =
      attribute === 'key' ? getSpellKeyAttribute(sheet, spell) : attribute;
    return key ? sheet.atributos?.[key as Atributo]?.value ?? 0 : 0;
  };
  let pmLimitBonus = 0;
  let pmLimitMultiplier = 1;

  const applyEffect = (
    effect: SpellModifierEffect,
    source: string,
    // O que o jogador escolheu para a fonte do modificador (tipo de dano do
    // Cetro elemental genérico).
    chosen: string[] = [],
    // Efeitos de uma opção marcada não viram notas: a opção já aparece.
    quiet = false,
    // Fonte que identifica a opção de lançamento; `source` é só o rótulo.
    optionSource = source
  ): void => {
    const note = (text: string) => {
      if (!quiet) profile.notes.push(text);
    };
    switch (effect.type) {
      case 'PmReduction':
        if (effect.cumulative) {
          cumulative += effect.value;
          cumulativeSources.push(source);
        } else if (effect.value > bestNonCumulative) {
          bestNonCumulative = effect.value;
          bestSource = source;
        }
        break;
      case 'PmHalve':
        profile.pmHalve = true;
        note(`Custo pela metade (${source})`);
        break;
      case 'RollBonus': {
        const fromAttribute = effect.flatAttribute
          ? Math.max(
              effect.flatAttributeMin ?? -Infinity,
              sheet?.atributos?.[effect.flatAttribute]?.value ?? 0
            )
          : 0;
        const flat = (effect.flat ?? 0) + fromAttribute;
        const damageTypes =
          effect.damageTypes === 'chosen' ? chosen : effect.damageTypes;
        const typed =
          effect.rolls === 'damage' && (!!damageTypes || !!effect.extraDice);
        if (typed) {
          profile.typedDamage.push({
            damageTypes,
            perDie: effect.perDie ?? 0,
            flat,
            extraDice: effect.extraDice ?? 0,
          });
        } else {
          const total =
            effect.rolls === 'healing' ? profile.healing : profile.damage;
          total.perDie += effect.perDie ?? 0;
          total.flat += flat;
        }
        let what = effect.rolls === 'healing' ? 'cura' : 'dano';
        if (damageTypes?.length) what = `dano de ${damageTypes.join('/')}`;
        const parts = [describeRollBonus(what, effect.perDie, flat)];
        if (effect.extraDice) {
          parts.push(
            `+${effect.extraDice} ${
              effect.extraDice === 1 ? 'dado' : 'dados'
            } de ${what}`
          );
        }
        const text = parts.filter(Boolean).join(' e ');
        if (text) note(`${text} (${source})`);
        break;
      }
      case 'EsotericLimit':
        profile.esotericLimit = Math.max(profile.esotericLimit, effect.value);
        break;
      case 'RollMaximize':
        profile.maximize = true;
        break;
      case 'DamageTypeOverride':
        profile.damageTypeOverride = effect.damageType;
        break;
      case 'SpellDC':
        profile.dcBonus += effect.value;
        note(`${sign(effect.value)} na CD (${source})`);
        break;
      case 'AprimoramentoPm':
        if (effect.value > profile.aprimoramentoPm) {
          profile.aprimoramentoPm = effect.value;
          aprimoramentoSource = source;
        }
        break;
      case 'ExtraRoll': {
        // 'spell': o tipo da própria magia (o primeiro, se tiver mais de um).
        const damageType =
          effect.damageType === 'spell'
            ? getSpellDamageTypes(spell)[0]
            : effect.damageType;
        if (effect.damageType === 'spell' && !damageType) break;
        const label =
          effect.damageType === 'spell'
            ? `Dano de ${damageType}`
            : effect.label;
        profile.extraRolls.push({
          id: `spell-modifier:${source}:${label}`,
          label: `${label} (${source})`,
          dice: effect.dice,
          damageType,
        });
        break;
      }
      case 'EffectBonusIncrease':
        profile.effectBonusIncrease.push({
          kind: effect.kind,
          value: effect.value,
        });
        break;
      case 'EffectThreatMargin':
        profile.effectThreatMargin.push({
          kind: effect.kind,
          value: effect.value,
        });
        break;
      case 'EffectTempPV':
        profile.effectTempPV.push({
          kind: effect.kind,
          multiplier: effect.multiplier,
        });
        break;
      case 'ExtraAprimoramento':
        profile.extraAprimoramentos.push({
          addPm: effect.addPm,
          text: `${effect.text} (${source})`,
          source,
        });
        break;
      case 'PmLimit': {
        const added = (effect.value ?? 0) + attributeValue(effect.attribute);
        pmLimitBonus += added;
        if (effect.multiplier) {
          pmLimitMultiplier = Math.max(pmLimitMultiplier, effect.multiplier);
        }
        if (added) note(`${sign(added)} no limite de PM (${source})`);
        break;
      }
      case 'CastOption': {
        const raisesEsotericLimit = (effect.effects ?? []).some(
          (sub) => sub.type === 'EsotericLimit'
        );
        if (raisesEsotericLimit && profile.esotericOptions.length < 2) break;
        const key = `${optionSource}:${effect.id}`;
        if (profile.castOptions.some((o) => o.key === key)) break;
        const active = !!options.castOptions?.includes(key);
        profile.castOptions.push({
          key,
          source,
          label: effect.label,
          addPm: effect.addPm,
          active,
          activeEffectKey: effect.activeEffectKey,
        });
        if (active) {
          profile.castOptionPm += effect.addPm;
          (effect.effects ?? [])
            .filter((sub) => sub.type !== 'CastOption')
            .forEach((sub) =>
              applyEffect(sub, source, chosen, true, optionSource)
            );
        }
        break;
      }
      default:
        break;
    }
  };

  // 1ª etapa: tudo que não é esotérico — inclusive o Esoterismo, que define
  // quantos esotéricos a 2ª etapa aceita.
  matching
    .filter((m) => !m.esoteric)
    .forEach(({ source, label, modifier: { effect }, choice }) =>
      applyEffect(effect, label ?? source, choice?.chosen, false, source)
    );

  // 2ª etapa: os esotéricos que valem, até o limite.
  const picked = Array.from(new Set(options.esoterics ?? []))
    .filter((name) => profile.esotericOptions.includes(name))
    .slice(0, profile.esotericLimit);
  profile.esoterics = [
    ...picked,
    ...profile.esotericOptions.filter((name) => !picked.includes(name)),
  ].slice(0, profile.esotericLimit);
  matching
    .filter((m) => m.esoteric && profile.esoterics.includes(m.source))
    .forEach(({ source, label, modifier: { effect }, choice }) =>
      applyEffect(effect, label ?? source, choice?.chosen, false, source)
    );

  if (aprimoramentoSource) {
    profile.notes.push(
      `+${profile.aprimoramentoPm} PM para aprimoramentos (${aprimoramentoSource})`
    );
  }
  if (sheet) {
    profile.pmLimit =
      (getSpellPmLimitBase(sheet, spell) + pmLimitBonus) * pmLimitMultiplier;
  }
  profile.pmReduction = bestNonCumulative + cumulative;
  if (bestSource) profile.pmReductionSources.push(bestSource);
  profile.pmReductionSources.push(...cumulativeSources);
  return profile;
}

/**
 * Custo final de um lançamento cujo custo bruto (base + aprimoramentos) é
 * `rawCost`. Reduções valem sobre o total; metade depois de tudo; e "uma
 * habilidade nunca pode ter seu custo reduzido para menos de 1 PM" (JdA).
 * Custo que já era 0 (truque, engenhoca) continua 0.
 */
export function computeSpellPmCost(
  rawCost: number,
  profile: Pick<SpellCastProfile, 'pmReduction' | 'pmHalve'>
): number {
  if (rawCost <= 0) return rawCost;
  let cost = rawCost - profile.pmReduction;
  if (profile.pmHalve) cost = Math.floor(cost / 2);
  if (cost === rawCost) return rawCost;
  return Math.max(1, cost);
}

/** Custo exibido da magia sem aprimoramentos. */
export function getSpellDisplayPmCost(
  sheet: CharacterSheet | undefined,
  spell: Spell
): number {
  return computeSpellPmCost(
    getSpellBasePm(spell),
    resolveSpellCast(sheet, spell)
  );
}

/**
 * Aplica o perfil às rolagens da magia (já aumentadas pelos aprimoramentos):
 * bônus de cura/dano, troca do tipo de dano e, por último, maximização.
 */
export function applySpellRollModifiers(
  rolls: AugmentedRoll[],
  profile: Pick<
    SpellCastProfile,
    'healing' | 'damage' | 'typedDamage' | 'maximize' | 'damageTypeOverride'
  >
): AugmentedRoll[] {
  return rolls.map((roll) => {
    let result = roll;
    if (isHealingRollLabel(roll.label)) {
      result = applyRollBonus(
        roll,
        profile.healing.perDie,
        profile.healing.flat
      );
    } else if (isDamageRollLabel(roll.label, roll.damageType)) {
      // Tipo ORIGINAL da rolagem: a troca de tipo vem depois.
      const rollType = getRollDamageType(roll);
      const typed = (profile.typedDamage ?? []).filter(
        (bonus) =>
          !bonus.damageTypes ||
          (!!rollType && bonus.damageTypes.includes(rollType))
      );
      typed.forEach((bonus) => {
        if (bonus.extraDice) result = addRollDice(result, bonus.extraDice);
      });
      const perDie =
        profile.damage.perDie + typed.reduce((sum, b) => sum + b.perDie, 0);
      const flat =
        profile.damage.flat + typed.reduce((sum, b) => sum + b.flat, 0);
      result = applyRollBonus(result, perDie, flat);
      if (profile.damageTypeOverride) {
        result = { ...result, damageType: profile.damageTypeOverride };
      }
    }
    return profile.maximize ? maximizeRoll(result) : result;
  });
}
