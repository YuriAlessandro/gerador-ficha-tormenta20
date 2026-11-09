import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type { DiceRoll } from '../../../interfaces/DiceRoll';
import type { Spell } from '../../../interfaces/Spells';
import type { SpellEffectBonusKind } from '../../../interfaces/SpellModifiers';
import {
  applyRollBonus,
  AugmentedRoll,
  isHealingRollLabel,
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
   * "Uma magia só pode receber os benefícios de um esotérico por vez" (JdA).
   * `esoteric` é o que vale neste perfil; `esotericOptions`, todos os em uso
   * que afetariam a magia — mais de um = o jogador escolhe no lançamento.
   */
  esoteric?: string;
  esotericOptions: string[];
  /**
   * Fontes de "escolha N magias" (Foco em Magia) para as quais esta magia é
   * elegível: se está marcada e quantas vagas a fonte já usou.
   */
  spellChoices: SpellChoiceSlot[];
  /** Linhas legíveis do que se aplica, com a fonte, para a UI. */
  notes: string[];
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
  /** Esotérico escolhido no lançamento (padrão: o primeiro em uso). */
  esoteric?: string;
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
    esotericOptions: [],
    spellChoices: [],
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
  profile.esotericOptions = Array.from(
    new Set(matching.filter((m) => m.esoteric).map((m) => m.source))
  );
  profile.esoteric =
    options.esoteric && profile.esotericOptions.includes(options.esoteric)
      ? options.esoteric
      : profile.esotericOptions[0];
  matching
    .filter((m) => !m.esoteric || m.source === profile.esoteric)
    .forEach(({ source, modifier: { effect } }) => {
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
          profile.notes.push(`Custo pela metade (${source})`);
          break;
        case 'RollBonus': {
          const total =
            effect.rolls === 'healing' ? profile.healing : profile.damage;
          total.perDie += effect.perDie ?? 0;
          total.flat += effect.flat ?? 0;
          const text = describeRollBonus(
            effect.rolls === 'healing' ? 'cura' : 'dano',
            effect.perDie,
            effect.flat
          );
          if (text) profile.notes.push(`${text} (${source})`);
          break;
        }
        case 'SpellDC':
          profile.dcBonus += effect.value;
          profile.notes.push(`${sign(effect.value)} na CD (${source})`);
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
        default:
          break;
      }
    });

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

/** Aplica os bônus de cura/dano do perfil às rolagens (já aumentadas). */
export function applySpellRollModifiers(
  rolls: AugmentedRoll[],
  profile: Pick<SpellCastProfile, 'healing' | 'damage'>
): AugmentedRoll[] {
  return rolls.map((roll) => {
    if (isHealingRollLabel(roll.label)) {
      return applyRollBonus(roll, profile.healing.perDie, profile.healing.flat);
    }
    if (isDamageRollLabel(roll.label, roll.damageType)) {
      return applyRollBonus(roll, profile.damage.perDie, profile.damage.flat);
    }
    return roll;
  });
}
