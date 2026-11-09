import type { SheetBonus } from '../../../interfaces/CharacterSheet';
import type { SpellEffectBonusKind } from '../../../interfaces/SpellModifiers';
import type { SpellCastProfile } from './resolve';

/**
 * Aplica a parte "efeito ativo" do perfil (`EffectThreatMargin`,
 * `EffectTempPV`) às opções do efeito que a magia coloca na ficha.
 *
 * Tipos estruturais de propósito: o efeito ativo é do premium, mas a regra
 * (o que o Medalhão Afiado ou a Égide da Fé fazem) mora aqui, junto do resto
 * do motor. O premium só chama `applySpellEffectModifiers` no registro.
 */

type EffectBonus = Omit<SheetBonus, 'source'>;

interface EffectScaleLike {
  buildBonuses: (value: number) => EffectBonus[];
  buildGrantsTempPV?: (value: number) => number | undefined;
}

export interface EffectOptionLike {
  bonuses: EffectBonus[];
  grantsTempPV?: number;
  scale?: EffectScaleLike;
}

const isKind = (bonus: EffectBonus, kind: SpellEffectBonusKind): boolean => {
  switch (kind) {
    case 'attack':
      return (
        bonus.target.type === 'AllAttackBonus' ||
        bonus.target.type === 'WeaponAttack'
      );
    case 'defense':
      return bonus.target.type === 'Defense';
    default:
      return false;
  }
};

/** Valor fixo positivo do bônus — penalidade (Perdição) não é "bônus". */
const fixedBonusValue = (bonus: EffectBonus): number =>
  bonus.modifier.type === 'Fixed' && bonus.modifier.value > 0
    ? bonus.modifier.value
    : 0;

/**
 * Margem de ameaça espelhando cada bônus de ataque, com o MESMO filtro de
 * arma (bônus só corpo a corpo não amplia a margem à distância).
 */
function threatMarginsFor(
  bonuses: EffectBonus[],
  value: number
): EffectBonus[] {
  const seen = new Set<string>();
  const margins: EffectBonus[] = [];
  bonuses
    .filter((bonus) => isKind(bonus, 'attack') && fixedBonusValue(bonus) > 0)
    .forEach((bonus) => {
      const target: EffectBonus['target'] =
        bonus.target.type === 'WeaponAttack'
          ? { ...bonus.target, type: 'WeaponThreatMargin' }
          : { type: 'WeaponThreatMargin' };
      const key = JSON.stringify(target);
      if (seen.has(key)) return;
      seen.add(key);
      margins.push({ target, modifier: { type: 'Fixed', value } });
    });
  return margins;
}

function transformBonuses(
  bonuses: EffectBonus[],
  profile: SpellCastProfile
): EffectBonus[] {
  const extra = profile.effectThreatMargin.flatMap(({ kind, value }) =>
    kind === 'attack' ? threatMarginsFor(bonuses, value) : []
  );
  return extra.length > 0 ? [...bonuses, ...extra] : bonuses;
}

function tempPVFor(bonuses: EffectBonus[], profile: SpellCastProfile): number {
  return profile.effectTempPV.reduce((sum, { kind, multiplier }) => {
    // O maior bônus do tipo (Bênção dá o mesmo valor em ataque e dano; o
    // ataque pode aparecer em mais de um alvo).
    const best = Math.max(
      0,
      ...bonuses.filter((b) => isKind(b, kind)).map(fixedBonusValue)
    );
    return sum + best * multiplier;
  }, 0);
}

const addTempPV = (
  base: number | undefined,
  extra: number
): number | undefined => (extra > 0 ? (base ?? 0) + extra : base);

export function hasSpellEffectModifiers(profile: SpellCastProfile): boolean {
  return (
    profile.effectThreatMargin.length > 0 || profile.effectTempPV.length > 0
  );
}

export function applySpellEffectModifiers<T extends EffectOptionLike>(
  option: T,
  profile: SpellCastProfile
): T {
  if (!hasSpellEffectModifiers(profile)) return option;
  const { scale } = option;
  return {
    ...option,
    bonuses: transformBonuses(option.bonuses, profile),
    grantsTempPV: addTempPV(
      option.grantsTempPV,
      tempPVFor(option.bonuses, profile)
    ),
    scale: scale
      ? {
          ...scale,
          buildBonuses: (value: number) =>
            transformBonuses(scale.buildBonuses(value), profile),
          buildGrantsTempPV: (value: number) =>
            addTempPV(
              scale.buildGrantsTempPV?.(value),
              tempPVFor(scale.buildBonuses(value), profile)
            ),
        }
      : undefined,
  };
}
