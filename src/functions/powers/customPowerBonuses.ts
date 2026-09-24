import {
  SheetBonus,
  StatModifier,
  StatModifierTarget,
} from '../../interfaces/CharacterSheet';
import { isFormulaSafe } from '../../premium/functions/safeFormulaEval';

/**
 * Teto de bônus por poder personalizado. Deliberadamente menor que o
 * `HOMEBREW_CAPS.maxBonusesPerAbility` (20): homebrew é conteúdo publicado e
 * revisado, isto é um campo livre dentro da ficha.
 */
export const MAX_CUSTOM_POWER_BONUSES = 10;

/** Espelha `HOMEBREW_CAPS.fixedBonusMin/Max` de `premium/functions/homebrewValidation.ts`. */
const FIXED_MIN = -50;
const FIXED_MAX = 50;

/** Teto de faixas numa escala por nível (`LevelBreakpoints`). */
const MAX_BREAKPOINTS = 20;

/**
 * Alvos que um poder personalizado pode declarar.
 *
 * É um subconjunto DELIBERADAMENTE menor do que o aceito pelo homebrew — não
 * derivar do `VALID_TARGET_TYPES` de lá, senão esta lista cresce sozinha quando
 * o homebrew ganhar um alvo novo. Ficaram de fora:
 *
 * - `TrainSkill`, `PickSkill`, `PickAttribute`: são MARCADORES de tempo de
 *   compilação. O homebrew os converte em `sheetActions` (`learnSkill`,
 *   `increaseAttribute`) no `compileAbilityActions`; o `recalculateSheet` não
 *   tem ramo para eles. Oferecidos aqui seriam no-op silencioso.
 * - `Proficiency`: `applyPower` escreve em `classe.proficiencias` e o recálculo
 *   nunca reseta esse array — a proficiência sobreviveria à remoção do poder.
 * - `HPAttributeReplacement`, `SizeOverride`, `SizeSteps`, `MovementType`,
 *   `DisplacementOverride`: nem o `SheetBonusBuilder` os expõe.
 */
const ALLOWED_TARGETS = new Set<StatModifierTarget['type']>([
  'Attribute',
  'Skill',
  'PV',
  'PM',
  'Defense',
  'Displacement',
  'DamageReduction',
  'AllAttackBonus',
  'ArmorPenalty',
  'MaxSpaces',
  'SpellDC',
  'ModifySkillAttribute',
  'WeaponDamage',
  'WeaponAttack',
  'WeaponThreatMargin',
  'WeaponCriticalMultiplier',
]);

/** Modificadores aceitos. Espelha o `MODIFIER_OPTIONS` do `SheetBonusBuilder`. */
const ALLOWED_MODIFIERS = new Set<StatModifier['type']>([
  'Fixed',
  'LevelBreakpoints',
  'Attribute',
  'CappedAttribute',
  'LevelCalc',
  'TormentaPowersCalc',
]);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.trunc(value)));

/**
 * `LevelCalc` e `TormentaPowersCalc` caem num `eval()` cru dentro do
 * `calculateBonusValue` (recalculateSheet.ts). Nos poderes de livro a fórmula é
 * literal do repositório e no homebrew ela passa pelo `validateHomebrew`; aqui
 * ela vem do usuário e viaja pela nuvem, então a whitelist é obrigatória.
 *
 * No build OSS o stub devolve `undefined` (falsy) e toda fórmula é descartada —
 * falha fechado, que é o lado certo de errar.
 */
const hasSafeFormula = (modifier: StatModifier): boolean => {
  if (modifier.type !== 'LevelCalc' && modifier.type !== 'TormentaPowersCalc') {
    return true;
  }
  return (
    typeof modifier.formula === 'string' && isFormulaSafe(modifier.formula)
  );
};

/** Poda/clampa um modificador; devolve `undefined` quando ele é inaceitável. */
function sanitizeModifier(modifier: StatModifier): StatModifier | undefined {
  if (!modifier || !ALLOWED_MODIFIERS.has(modifier.type)) return undefined;
  if (!hasSafeFormula(modifier)) return undefined;

  if (modifier.type === 'Fixed') {
    if (!Number.isFinite(modifier.value)) return undefined;
    return { ...modifier, value: clamp(modifier.value, FIXED_MIN, FIXED_MAX) };
  }

  if (modifier.type === 'LevelBreakpoints') {
    const breakpoints = (
      Array.isArray(modifier.breakpoints) ? modifier.breakpoints : []
    )
      .filter(
        (bp) => Number.isFinite(bp?.fromLevel) && Number.isFinite(bp?.value)
      )
      .slice(0, MAX_BREAKPOINTS)
      .map((bp) => ({
        fromLevel: clamp(bp.fromLevel, 1, 20),
        value: clamp(bp.value, FIXED_MIN, FIXED_MAX),
      }));
    if (breakpoints.length === 0) return undefined;
    // `by: 'classLevel'` seria mentira: `resolveClassLevel` devolve o nível
    // TOTAL quando o `source` não tem `className`, e poder personalizado não
    // pertence a classe nenhuma.
    return { ...modifier, breakpoints, by: 'level' };
  }

  return modifier;
}

/**
 * Poda bônus vindos do usuário (diálogo, localStorage, nuvem, ficha
 * compartilhada) até o que o motor sabe aplicar com segurança.
 *
 * Espelha o papel do `compileAbilityBonuses` do homebrew
 * (`premium/functions/compileRace.ts`), mas vive no core porque o caminho de
 * recálculo é público — e é deliberadamente mais restrito. Manter as duas
 * listas em sincronia ao mexer numa delas.
 */
export function sanitizeCustomPowerBonuses(
  bonuses: SheetBonus[] | undefined
): SheetBonus[] {
  if (!Array.isArray(bonuses)) return [];

  return bonuses
    .slice(0, MAX_CUSTOM_POWER_BONUSES)
    .reduce<SheetBonus[]>((acc, bonus) => {
      if (!bonus?.target || !bonus?.modifier) return acc;
      if (!ALLOWED_TARGETS.has(bonus.target.type)) return acc;

      const modifier = sanitizeModifier(bonus.modifier);
      if (!modifier) return acc;

      acc.push({ source: bonus.source, target: bonus.target, modifier });
      return acc;
    }, []);
}

/**
 * Carimba a origem dos bônus de um poder personalizado. Chamado a cada
 * recálculo (e não gravado no save) para o vínculo sobreviver a renomear o
 * poder — é o que faz os chips "Aplicado na ficha" casarem em
 * `sheetBonuses/appliedBonuses.ts`.
 */
export function stampCustomPowerSource(
  bonuses: SheetBonus[],
  powerName: string
): SheetBonus[] {
  return bonuses.map((bonus) => ({
    ...bonus,
    source: { type: 'power' as const, name: powerName },
  }));
}
