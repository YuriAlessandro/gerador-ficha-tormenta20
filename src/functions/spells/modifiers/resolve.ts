import type CharacterSheet from '../../../interfaces/CharacterSheet';
import type { Spell } from '../../../interfaces/Spells';
import type { SpellEffectBonusKind } from '../../../interfaces/SpellModifiers';
import {
  applyRollBonus,
  AugmentedRoll,
  isHealingRollLabel,
} from '../../spellRollAugmentation';
import { getSpellBasePm } from '../engenhoca';
import { collectSheetSpellModifiers } from './collect';
import { isDamageRollLabel, spellMatchesFilter } from './match';

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
  /** Efeito ativo: margem de ameaça extra por bônus de `kind`. */
  effectThreatMargin: { kind: SpellEffectBonusKind; value: number }[];
  /** Efeito ativo: PV temporários = `multiplier` × bônus de `kind`. */
  effectTempPV: { kind: SpellEffectBonusKind; multiplier: number }[];
  /** Linhas legíveis do que se aplica, com a fonte, para a UI. */
  notes: string[];
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
  spell: Spell
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
    effectThreatMargin: [],
    effectTempPV: [],
    notes: [],
  };

  const modifiers = sheet ? collectSheetSpellModifiers(sheet) : [];
  modifiers
    .filter(({ modifier }) => spellMatchesFilter(spell, modifier.filter))
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
