import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type { DiceRoll } from '../../../interfaces/DiceRoll';
import type { Spell } from '../../../interfaces/Spells';
import type {
  SpellEffectBonusKind,
  SpellModifierEffect,
} from '../../../interfaces/SpellModifiers';
import {
  applyRollBonus,
  AugmentedRoll,
  isHealingRollLabel,
  maximizeRoll,
} from '../../spellRollAugmentation';
import { getSpellBasePm } from '../engenhoca';
import { collectSheetSpellModifiers } from './collect';
import { choiceValueOf, isDamageRollLabel, spellMatchesFilter } from './match';

interface RollBonusTotal {
  perDie: number;
  flat: number;
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
  source: string;
  /** A magia (ou a escola dela, se `of: 'school'`) está escolhida. */
  chosen: boolean;
  of: 'spell' | 'school';
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
    if (!choice || choiceSources.has(choice.source)) return;
    choiceSources.add(choice.source);
    if (!spellMatchesFilter(spell, choice.eligible, sheet)) return;
    profile.spellChoices.push({
      source: choice.source,
      chosen: choice.chosen.includes(choiceValueOf(spell, choice.of)),
      of: choice.of,
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

  const applyEffect = (
    effect: SpellModifierEffect,
    source: string,
    // Efeitos de uma opção marcada não viram notas: a opção já aparece.
    quiet = false
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
        const total =
          effect.rolls === 'healing' ? profile.healing : profile.damage;
        const fromAttribute = effect.flatAttribute
          ? Math.max(
              effect.flatAttributeMin ?? -Infinity,
              sheet?.atributos?.[effect.flatAttribute]?.value ?? 0
            )
          : 0;
        const flat = (effect.flat ?? 0) + fromAttribute;
        total.perDie += effect.perDie ?? 0;
        total.flat += flat;
        const text = describeRollBonus(
          effect.rolls === 'healing' ? 'cura' : 'dano',
          effect.perDie,
          flat
        );
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
      case 'ExtraRoll':
        profile.extraRolls.push({
          id: `spell-modifier:${source}:${effect.label}`,
          label: `${effect.label} (${source})`,
          dice: effect.dice,
          damageType: effect.damageType,
        });
        break;
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
      case 'CastOption': {
        const raisesEsotericLimit = (effect.effects ?? []).some(
          (sub) => sub.type === 'EsotericLimit'
        );
        if (raisesEsotericLimit && profile.esotericOptions.length < 2) break;
        const key = `${source}:${effect.id}`;
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
            .forEach((sub) => applyEffect(sub, source, true));
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
    .forEach(({ source, modifier: { effect } }) => applyEffect(effect, source));

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
    .forEach(({ source, modifier: { effect } }) => applyEffect(effect, source));

  if (aprimoramentoSource) {
    profile.notes.push(
      `+${profile.aprimoramentoPm} PM para aprimoramentos (${aprimoramentoSource})`
    );
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
    'healing' | 'damage' | 'maximize' | 'damageTypeOverride'
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
      result = applyRollBonus(roll, profile.damage.perDie, profile.damage.flat);
      if (profile.damageTypeOverride) {
        result = { ...result, damageType: profile.damageTypeOverride };
      }
    }
    return profile.maximize ? maximizeRoll(result) : result;
  });
}
