import _ from 'lodash';

import Bag from '@/interfaces/Bag';
import CharacterSheet, {
  DamageReduction,
  DamageType,
  SheetAction,
  SheetActionHistoryEntry,
  SheetChangeSource,
  Step,
} from '@/interfaces/CharacterSheet';
import { calculateCompanionStats } from '@/data/systems/tormenta20/herois-de-arton/companion';
import Equipment from '@/interfaces/Equipment';
import { ManualPowerSelections } from '@/interfaces/PowerSelections';
import { RequirementType } from '@/interfaces/Poderes';
import Skill, {
  SkillsWithArmorPenalty,
  getSheetSkillNames,
  getSkillAttr,
  isOficioSkill,
} from '@/interfaces/Skills';
import { Spell } from '@/interfaces/Spells';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import {
  calcDefense,
  isHeavyArmor,
} from '@/data/systems/tormenta20/equipamentos';
import { getRaceDisplacement } from '@/data/systems/tormenta20/races/functions/functions';
import { ClassAbility, ClassDescription } from '@/interfaces/Class';
import { CONDITION_TEMPLATES } from '@/premium/data/conditions';
import { aggregateConditionBonuses } from '@/premium/functions/conditionAggregation';
import type { SheetBonus } from '@/interfaces/CharacterSheet';
import {
  isMulticlass,
  calculateMulticlassPV,
  calculateMulticlassPM,
  getClassLevel,
  getMulticlassAvailableAbilities,
  findClassDescription,
} from './multiclass';
import { stepUpDamage, addFlatDamageBonus } from './weaponDamageStep';
import { updateBrigaRolls } from './powers/lutador-special';
import { expandAttributeBonus } from './attributeExpansion';
import { isWeaponMelee } from './weaponSkill';
import { isBonusActive } from './bonusConditions';
import {
  getNonProficientArmorPenalty,
  getSheetProficiencias,
  isProficientWithWeapon,
} from './proficiencies';
import { stampUsedSupplements } from './contentSources';
import {
  isModeScopedForWeapon,
  weaponMatchesScope,
  WeaponBonusScope,
} from './weaponBonusScope';
import {
  getTradicaoPerdidaPmValue,
  getDeusMenorPmBonus,
} from './powers/general';
import { applyItemEnhancements } from './itemEnhancements/applyEnhancements';
import { getDefenseMaterialRd } from './itemEnhancements/materialEffects';
import { injectConjuradoraSpells } from './itemEnhancements/injectConjuradoraSpells';
import { migrateLegacyEquipState } from '../components/SheetResult/BackpackModal/wielding';

import {
  applyRaceAbilities,
  applyPower,
  applyOptionChosenTexts,
  calculateMaxSpaces,
  calculateCurrencySpaces,
} from './general';
import {
  countTormentaPowers,
  getVirtudePaladinescaPMBonus,
} from './randomUtils';
import { getRemovedPowers } from './reverseSheetActions';

/**
 * Finds a class definition by name and optional subname.
 * Delegates to findClassDescription which searches all supplements.
 */
function findClassDefinition(
  name: string,
  subname?: string
): ClassDescription | undefined {
  return findClassDescription(name, subname);
}

// Note: resetAttributesToBase was removed as part of attribute system simplification.
// The value field now directly contains the modifier (no separate base/mod distinction).

/**
 * Removes duplicate entries from sheetActionHistory based on source
 */
function deduplicateHistory(
  history: SheetActionHistoryEntry[]
): SheetActionHistoryEntry[] {
  const seen = new Map<string, SheetActionHistoryEntry>();

  history.forEach((action) => {
    // Create a key based on source type and identifying properties
    let key = `${action.source.type}`;

    if (action.source.type === 'race' && 'raceName' in action.source) {
      key += `-${action.source.raceName}`;
    } else if (action.source.type === 'class' && 'className' in action.source) {
      key += `-${action.source.className}`;
    } else if (
      action.source.type === 'origin' &&
      'originName' in action.source
    ) {
      key += `-${action.source.originName}`;
    } else if (action.source.type === 'levelUp' && 'level' in action.source) {
      key += `-${action.source.level}`;
    } else if (action.source.type === 'power' && 'name' in action.source) {
      key += `-${action.source.name}`;
      // For powers with multiple instances (like Aumento de Atributo), include changes in key
      if (action.changes && action.changes.length > 0) {
        const changesKey = JSON.stringify(action.changes);
        key += `-${changesKey}`;
      }
    }

    // Include powerName to differentiate entries from different abilities with the same source
    if (action.powerName) {
      key += `-pn:${action.powerName}`;
    }

    // Only keep the first occurrence
    if (!seen.has(key)) {
      seen.set(key, action);
    }
  });

  return Array.from(seen.values());
}

/**
 * Removes duplicate steps from the steps array
 */
function deduplicateSteps(steps: Step[]): Step[] {
  const seen = new Set<string>();
  const uniqueSteps: Step[] = [];

  steps.forEach((step) => {
    // Create a key based on label and type
    const key = `${step.type || ''}-${step.label}`;

    // For defense increments, keep only the last one
    if (step.label.includes('Incrementou Defesa')) {
      // Remove previous defense increments
      const previousIndex = uniqueSteps.findIndex((s) =>
        s.label.includes('Incrementou Defesa')
      );
      if (previousIndex !== -1) {
        uniqueSteps.splice(previousIndex, 1);
      }
      uniqueSteps.push(step);
    } else if (!seen.has(key)) {
      seen.add(key);
      uniqueSteps.push(step);
    }
  });

  return uniqueSteps;
}

/**
 * Removes duplicate spells from the spells array
 */
function deduplicateSpells(spells: Spell[]): Spell[] {
  const seen = new Set<string>();
  const uniqueSpells: Spell[] = [];

  spells.forEach((spell) => {
    if (!seen.has(spell.nome)) {
      seen.add(spell.nome);
      uniqueSpells.push(spell);
    }
  });

  return uniqueSpells;
}

const resolveClassLevel = (
  sheet: CharacterSheet,
  source?: SheetChangeSource
): number => {
  const className = source?.type === 'power' ? source.className : undefined;
  return className ? getClassLevel(sheet, className) : sheet.nivel;
};

// We need to copy the applyStatModifiers function locally since it's not exported
/**
 * Maior círculo de magia que o personagem pode lançar atualmente (0 se não for
 * conjurador). Considera a classe principal e multiclasse.
 */
const maxSpellCircleOf = (sheet: CharacterSheet): number =>
  sheet.classe?.spellPath?.spellCircleAvailableAtLevel?.(sheet.nivel) ?? 0;

export const calculateBonusValue = (
  sheet: CharacterSheet,
  bonus: {
    type: string;
    value?: number;
    attribute?: string;
    formula?: string;
    capBy?: 'level' | 'classLevel';
    breakpoints?: { fromLevel: number; value: number }[];
    by?: 'level' | 'classLevel';
    base?: {
      kind: 'fixed' | 'level' | 'spellCircle' | 'attribute';
      value?: number;
      attribute?: string;
    };
    capByLevel?: boolean;
    capByAttribute?: string;
  },
  source?: SheetChangeSource
): number => {
  if (bonus.type === 'Level') {
    return sheet.nivel;
  }
  if (bonus.type === 'HalfLevel') {
    return Math.floor(sheet.nivel / 2);
  }
  if (bonus.type === 'Attribute') {
    const attr = bonus.attribute as Atributo;
    return sheet.atributos[attr]?.value || 0;
  }
  if (bonus.type === 'SpecialAttribute') {
    if (bonus.attribute === 'spellKeyAttr') {
      let attr = sheet.classe.spellPath?.keyAttribute;

      // Multiclass fallback: if primary class has no spellPath, check secondary
      if (!attr && sheet.multiclassSpellPaths) {
        const spellPathEntries = Object.values(sheet.multiclassSpellPaths);
        if (spellPathEntries.length > 0) {
          attr = spellPathEntries[0].keyAttribute;
        }
      }

      return sheet.atributos[
        attr || sheet.overrideKeyAttribute || Atributo.CARISMA
      ].value;
    }
  }
  if (bonus.type === 'LevelCalc' && bonus.formula) {
    // Handle formulas like 'Math.floor(({level} + 3) / 4)' or with {classLevel}.
    let formula = bonus.formula.replace(/{level}/g, sheet.nivel.toString());
    if (formula.includes('{classLevel}')) {
      formula = formula.replace(
        /{classLevel}/g,
        resolveClassLevel(sheet, source).toString()
      );
    }
    try {
      // eslint-disable-next-line no-eval
      return eval(formula);
    } catch {
      return 0;
    }
  }
  if (bonus.type === 'CappedAttribute') {
    const attr = bonus.attribute as Atributo;
    const attrValue = sheet.atributos[attr]?.value ?? 0;
    const cap =
      bonus.capBy === 'classLevel'
        ? resolveClassLevel(sheet, source)
        : sheet.nivel;
    return Math.max(0, Math.min(attrValue, cap));
  }
  if (bonus.type === 'LevelBreakpoints') {
    const lvl =
      bonus.by === 'classLevel'
        ? resolveClassLevel(sheet, source)
        : sheet.nivel;
    // Maior `fromLevel` que seja <= nível atual (independe da ordem da lista).
    let best: { fromLevel: number; value: number } | null = null;
    (bonus.breakpoints || []).forEach((bp) => {
      if (lvl >= bp.fromLevel && (!best || bp.fromLevel > best.fromLevel)) {
        best = bp;
      }
    });
    return best ? (best as { fromLevel: number; value: number }).value : 0;
  }
  if (bonus.type === 'ScaledValue' && bonus.base) {
    let v = 0;
    if (bonus.base.kind === 'fixed') v = bonus.base.value || 0;
    else if (bonus.base.kind === 'level') v = sheet.nivel;
    else if (bonus.base.kind === 'spellCircle') v = maxSpellCircleOf(sheet);
    else if (bonus.base.kind === 'attribute')
      v = sheet.atributos[bonus.base.attribute as Atributo]?.value ?? 0;
    if (bonus.capByLevel) v = Math.min(v, sheet.nivel);
    if (bonus.capByAttribute)
      v = Math.min(
        v,
        sheet.atributos[bonus.capByAttribute as Atributo]?.value ?? 0
      );
    return Math.max(0, v);
  }
  if (bonus.type === 'Fixed') {
    return bonus.value || 0;
  }
  return 0;
};

// Helper function to check if a weapon matches bonus criteria. Delega o
// matching estático a `weaponMatchesScope` (fonte única, compartilhada com
// Weapon.tsx) e soma a checagem de proficiência, que depende da ficha.
const weaponMatchesBonus = (
  weapon: Equipment,
  bonus: WeaponBonusScope & { proficiencyRequired?: boolean },
  sheet: CharacterSheet
): boolean => {
  if (!weaponMatchesScope(weapon, bonus)) {
    return false;
  }

  // Bônus que exigem proficiência com a arma (ex.: Armas da Ambição) só se
  // aplicam quando o personagem sabe usá-la.
  if (
    bonus.proficiencyRequired &&
    !isProficientWithWeapon(weapon, getSheetProficiencias(sheet))
  ) {
    return false;
  }

  return true;
};

// Helper function to reset weapon to base values (remove previous bonuses)
const resetWeaponToBase = (weapon: Equipment): Equipment => {
  const resetWeapon = { ...weapon };

  // If weapon has manual edits, preserve the current values
  // Only reset weapons that don't have manual edits (i.e., system-added weapons)
  if (resetWeapon.hasManualEdits) {
    // Preserve user edits - only reset atkBonus if it's a system bonus
    // User-edited damage and critical are kept as-is
    return resetWeapon;
  }

  // Armas com aprimoramentos (modificações/encantamentos) já tiveram
  // dano/atkBonus/critico recomputados a partir dos snapshots `base*` pela
  // reaplicação de aprimoramentos (Step 17, que roda ANTES de applyWeaponBonuses)
  // e portanto representam "base + delta de aprimoramento". NÃO resetar para a
  // base pristina aqui — os bônus de efeito ativo são somados por cima desse
  // valor. A idempotência é garantida porque o Step 17 recomputa do zero a cada
  // recálculo, descartando o baking de efeito ativo do recálculo anterior.
  const isEnhanced = !!(
    resetWeapon.modifications?.length || resetWeapon.enchantments?.length
  );
  if (isEnhanced) {
    return resetWeapon;
  }

  // For weapons without manual edits, reset to base values
  // If base values exist, use them; otherwise, extract from current values

  // Reset atkBonus to base or 0
  resetWeapon.atkBonus = resetWeapon.baseAtkBonus ?? 0;

  // Reset damage to base value or extract base if not stored
  if (resetWeapon.baseDano) {
    resetWeapon.dano = resetWeapon.baseDano;
  } else if (resetWeapon.dano && resetWeapon.dano.includes('+')) {
    // Fallback: strip the baked flat bonus to recover the base damage. Handle
    // dual-mode strings per segment ("1d6+5/1d6+5" -> "1d6/1d6") so versatile/
    // double-damage weapons aren't corrupted to a single mode.
    resetWeapon.dano = resetWeapon.dano
      .split('/')
      .map((part) => part.split('+')[0])
      .join('/');
    resetWeapon.baseDano = resetWeapon.dano;
  }

  // Reset critical to base value
  // If baseCritico doesn't exist yet, initialize it with the current critico value
  // This prevents cumulative bonus application on subsequent recalculateSheet calls
  if (resetWeapon.baseCritico) {
    resetWeapon.critico = resetWeapon.baseCritico;
  } else if (resetWeapon.critico) {
    // First time processing this weapon - store current critico as base
    resetWeapon.baseCritico = resetWeapon.critico;
  }

  return resetWeapon;
};

// Helper function to recalculate HP with attribute replacement
const applyHPAttributeReplacement = (sheet: CharacterSheet): CharacterSheet => {
  const updatedSheet = _.cloneDeep(sheet);

  // Check if there's an HP attribute replacement
  const hpReplacement = updatedSheet.sheetBonuses.find(
    (bonus) => bonus.target.type === 'HPAttributeReplacement'
  );

  if (hpReplacement && hpReplacement.target.type === 'HPAttributeReplacement') {
    const { newAttribute } = hpReplacement.target;

    // Recalculate HP using the new attribute instead of Constitution
    const baseHp = updatedSheet.classe.pv;
    const attrValue = updatedSheet.atributos[newAttribute].value;
    // Atributo negativo reduz PV, mas ganho mínimo por nível é 1
    const addpv =
      updatedSheet.customPVPerLevel ?? updatedSheet.classe.addpv ?? 0;
    const pvPerLevelGain = Math.max(addpv + attrValue, 1);

    updatedSheet.pv =
      baseHp + attrValue + pvPerLevelGain * (updatedSheet.nivel - 1);
  }

  return updatedSheet;
};

// Helper function to apply weapon bonuses
const applyWeaponBonuses = (
  sheet: CharacterSheet,
  _manualSelections?: ManualPowerSelections
): CharacterSheet => {
  const updatedSheet = _.cloneDeep(sheet);

  // Apply weapon bonuses to all weapons in the bag
  updatedSheet.bag.equipments.Arma = updatedSheet.bag.equipments.Arma.map(
    (weapon) => {
      // Start with a clean weapon (reset any previous bonuses)
      const weaponCopy = resetWeaponToBase(weapon);

      // Skip automatic bonuses for manually edited weapons
      // The user's manual values should be preserved exactly as they set them
      if (weapon.hasManualEdits) {
        return weaponCopy;
      }

      // Calculate total bonuses for this weapon
      let totalAttackBonus = 0;
      let totalDamageBonus = 0;
      let totalDamageSteps = 0;
      let totalThreatMarginBonus = 0;
      let setThreatMargin: number | undefined;
      let totalCriticalMultiplierBonus = 0;
      let setCritMultiplier: number | undefined;

      updatedSheet.sheetBonuses.forEach((bonus) => {
        // Bônus com escopo POR MODO (arremesso, ou melee/ranged em arma híbrida
        // de arremesso) são aplicados por modo de ataque em Weapon.tsx — não
        // devem ser bakeados na string `dano`/`atkBonus` da arma inteira
        // (vazaria para o outro modo). Armas puras (só corpo a corpo, ou só
        // disparo) têm um único modo relevante e são bakeadas normalmente.
        if (
          (bonus.target.type === 'WeaponDamage' ||
            bonus.target.type === 'WeaponAttack') &&
          isModeScopedForWeapon(weapon, bonus.target)
        ) {
          return;
        }

        if (
          (bonus.target.type === 'WeaponDamage' ||
            bonus.target.type === 'WeaponAttack' ||
            bonus.target.type === 'WeaponDamageStep' ||
            bonus.target.type === 'WeaponThreatMargin' ||
            bonus.target.type === 'WeaponCriticalMultiplier') &&
          weaponMatchesBonus(weapon, bonus.target, updatedSheet)
        ) {
          const bonusValue = calculateBonusValue(
            updatedSheet,
            bonus.modifier,
            bonus.source
          );

          if (bonus.target.type === 'WeaponAttack') {
            totalAttackBonus += bonusValue;
          } else if (bonus.target.type === 'WeaponDamage') {
            totalDamageBonus += bonusValue;
          } else if (bonus.target.type === 'WeaponDamageStep') {
            totalDamageSteps += bonusValue;
          } else if (bonus.target.type === 'WeaponThreatMargin') {
            if (bonus.target.mode === 'set') {
              // Define a margem; com vários, prevalece a mais ampla (menor nº).
              setThreatMargin =
                setThreatMargin === undefined
                  ? bonusValue
                  : Math.min(setThreatMargin, bonusValue);
            } else {
              totalThreatMarginBonus += bonusValue;
            }
          } else if (bonus.target.type === 'WeaponCriticalMultiplier') {
            if (bonus.target.mode === 'set') {
              // Define o multiplicador; com vários, prevalece o maior.
              setCritMultiplier =
                setCritMultiplier === undefined
                  ? bonusValue
                  : Math.max(setCritMultiplier, bonusValue);
            } else {
              totalCriticalMultiplierBonus += bonusValue;
            }
          }
        }
      });

      // Apply totaled bonuses. Soma POR CIMA do atkBonus já presente (que, para
      // armas com aprimoramento, é base + delta de aprimoramento; para armas
      // comuns, é a base resetada) em vez de sobrescrever — senão o bônus de
      // ataque do encantamento seria descartado.
      if (totalAttackBonus !== 0) {
        weaponCopy.atkBonus = (weaponCopy.atkBonus ?? 0) + totalAttackBonus;
      }

      if (totalDamageSteps > 0 && weaponCopy.dano) {
        weaponCopy.dano = stepUpDamage(weaponCopy.dano, totalDamageSteps);
      }

      if (totalDamageBonus > 0) {
        // Soma por modo (trata "1d6/1d6" como dois modos) e mescla qualquer
        // modificador já presente — concatenar "+N" cru deixaria o bônus só no
        // último modo de armas de dano duplo (ex.: Bordão + Estilo de Duas Mãos).
        weaponCopy.dano = weaponCopy.dano
          ? addFlatDamageBonus(weaponCopy.dano, totalDamageBonus)
          : `+${totalDamageBonus}`;
      }

      const hasMarginChange =
        totalThreatMarginBonus > 0 || setThreatMargin !== undefined;
      const hasMultChange =
        totalCriticalMultiplierBonus > 0 || setCritMultiplier !== undefined;

      if ((hasMarginChange || hasMultChange) && weaponCopy.critico) {
        // Critical string may be "19", "x2" or "19/x2". Threat margin modifies
        // the numeric part before "/" (or the whole string if no "/"); the
        // multiplier modifies the "xN" portion.
        const parts = weaponCopy.critico.split('/');
        let marginPart: string | null = null;
        let multPart: string | null = null;

        if (parts.length === 1) {
          const [only] = parts;
          if (only.includes('x')) {
            multPart = only;
          } else {
            marginPart = only;
          }
        } else {
          [marginPart, multPart] = parts;
        }

        if (hasMarginChange) {
          // Margem base (20 implícito quando a arma só tem multiplicador, ex.:
          // "x2"). `set` define a margem; o aumento (estreitamento) é aplicado
          // por cima.
          let currentRange =
            marginPart !== null ? parseInt(marginPart, 10) : 20;
          if (Number.isNaN(currentRange)) currentRange = 20;
          if (setThreatMargin !== undefined) currentRange = setThreatMargin;
          marginPart = `${Math.max(
            1,
            Math.min(20, currentRange - totalThreatMarginBonus)
          )}`;
        }

        if (hasMultChange) {
          // Multiplicador base (x2 implícito quando a arma só tem margem, ex.:
          // "19"). `set` define o multiplicador; o aumento soma por cima.
          let currentMult =
            multPart !== null
              ? parseInt(multPart.match(/x(\d+)/)?.[1] || '2', 10)
              : 2;
          if (Number.isNaN(currentMult)) currentMult = 2;
          if (setCritMultiplier !== undefined) currentMult = setCritMultiplier;
          multPart = `x${Math.max(
            2,
            currentMult + totalCriticalMultiplierBonus
          )}`;
        }

        if (marginPart !== null && multPart !== null) {
          weaponCopy.critico = `${marginPart}/${multPart}`;
        } else if (marginPart !== null) {
          weaponCopy.critico = marginPart;
        } else if (multPart !== null) {
          weaponCopy.critico = multPart;
        }
      }

      return weaponCopy;
    }
  );

  return updatedSheet;
};

// Helper function to add bonus to skill
const addOtherBonusToSkill = (
  sheet: CharacterSheet,
  skillName: string,
  bonusValue: number
) => {
  if (!sheet.completeSkills) return;

  const skill = sheet.completeSkills.find((s) => s.name === skillName);
  if (skill) {
    skill.others = (skill.others || 0) + bonusValue;
  }
};

// Helper function to apply only defense bonuses from powers
const applyDefenseBonuses = (sheet: CharacterSheet): CharacterSheet => {
  const updatedSheet = _.cloneDeep(sheet);

  updatedSheet.sheetBonuses.forEach((bonus) => {
    if (bonus.target.type === 'Defense') {
      const bonusValue = calculateBonusValue(
        updatedSheet,
        bonus.modifier,
        bonus.source
      );
      updatedSheet.defesa += bonusValue;
    }
  });

  return updatedSheet;
};

/**
 * Estilo de Uma Arma: +2 na Defesa e +2 nos testes de ataque com a arma
 * empunhada, mas SÓ quando há uma arma corpo a corpo em uma das mãos e nada
 * na outra (regra condicional). Como a condição depende da empunhadura atual
 * (`mainHandItemId`/`offHandItemId`), os bônus não podem ser `sheetBonuses`
 * estáticos no dado do poder — são injetados dinamicamente aqui, antes do
 * cálculo de Defesa (Step 10) e de armas (Step 13). Como `recalculateSheet`
 * zera `sheetBonuses` no Step 1, a injeção é idempotente: aparece/some
 * conforme a empunhadura muda.
 */
/**
 * Deuses menores concedem um poder só; para as classes divinas que receberiam
 * dois, a regra troca o segundo poder por PM extras (ver `getDeusMenorPmBonus`).
 * O valor depende do deus e do nível, então não cabe como `sheetBonuses`
 * estático no dado — é injetado aqui, ANTES do Step 8 (que soma os bônus de
 * PM). Como o Step 1 zera `sheetBonuses`, a injeção é idempotente: some sozinha
 * se o jogador trocar de divindade ou de classe.
 */
const injectDeusMenorPmBonus = (sheet: CharacterSheet): CharacterSheet => {
  const bonus = getDeusMenorPmBonus(sheet);
  if (bonus <= 0) return sheet;

  const updatedSheet = _.cloneDeep(sheet);
  updatedSheet.sheetBonuses.push({
    source: {
      type: 'divinity',
      divinityName: sheet.devoto?.divindade.name ?? '',
    },
    target: { type: 'PM' },
    modifier: { type: 'Fixed', value: bonus },
  });

  return updatedSheet;
};

const injectEstiloDeUmaArmaBonuses = (
  sheet: CharacterSheet
): CharacterSheet => {
  const hasPower = (sheet.generalPowers || []).some(
    (p) => p.name === 'Estilo de Uma Arma'
  );
  if (!hasPower) return sheet;

  const { mainHandItemId, offHandItemId } = sheet;

  // Arma de duas mãos ocupa as duas mãos (mesmo id nos dois slots) → não vale.
  if (mainHandItemId && mainHandItemId === offHandItemId) return sheet;

  // Exatamente uma mão ocupada e a outra vazia.
  let occupiedId: string | undefined;
  if (mainHandItemId && !offHandItemId) {
    occupiedId = mainHandItemId;
  } else if (offHandItemId && !mainHandItemId) {
    occupiedId = offHandItemId;
  }
  if (!occupiedId) return sheet;

  // O item empunhado precisa ser uma arma corpo a corpo (escudos ficam em
  // `Escudo`, então não casam aqui).
  const weapon = (sheet.bag.equipments.Arma || []).find(
    (w) => w.id === occupiedId
  );
  if (!weapon || !isWeaponMelee(weapon)) return sheet;

  const updatedSheet = _.cloneDeep(sheet);
  updatedSheet.sheetBonuses.push(
    {
      source: { type: 'power', name: 'Estilo de Uma Arma' },
      target: { type: 'Defense' },
      modifier: { type: 'Fixed', value: 2 },
    },
    {
      source: { type: 'power', name: 'Estilo de Uma Arma' },
      target: {
        type: 'WeaponAttack',
        weaponName: weapon.nome,
        meleeOnly: true,
      },
      modifier: { type: 'Fixed', value: 2 },
    }
  );

  return updatedSheet;
};

/**
 * Estilo de Arma e Escudo: se um escudo estiver empunhado, o bônus na Defesa
 * que ele fornece aumenta em +2. Injetamos um `sheetBonus` de Defesa (em vez de
 * alterar o `defenseBonus` do escudo) porque `calcDefense` lê o valor estático
 * do equipamento, enquanto os bônus condicionais passam por `applyDefenseBonuses`.
 * Idempotente: `sheetBonuses` é zerado a cada recálculo, então o +2 aparece/some
 * conforme a empunhadura muda.
 */
const injectEstiloDeArmaEEscudoBonuses = (
  sheet: CharacterSheet
): CharacterSheet => {
  const hasPower = (sheet.generalPowers || []).some(
    (p) => p.name === 'Estilo de Arma e Escudo'
  );
  if (!hasPower) return sheet;

  const { mainHandItemId, offHandItemId } = sheet;

  // Precisa ter um escudo empunhado em uma das mãos.
  const hasShieldWielded = (sheet.bag.equipments.Escudo || []).some(
    (shield) =>
      shield.id !== undefined &&
      (shield.id === mainHandItemId || shield.id === offHandItemId)
  );
  if (!hasShieldWielded) return sheet;

  const updatedSheet = _.cloneDeep(sheet);
  updatedSheet.sheetBonuses.push({
    source: { type: 'power', name: 'Estilo de Arma e Escudo' },
    target: { type: 'Defense' },
    modifier: { type: 'Fixed', value: 2 },
  });

  return updatedSheet;
};

// Copy of calcDisplacement function from general.ts
const calcDisplacement = (
  bag: Bag,
  raceDisplacement: number,
  maxSpaces: number,
  baseDisplacement: number,
  dinheiro = 0,
  dinheiroTC = 0,
  dinheiroTO = 0,
  ignoreEncumbrance = false,
  hasHeavyArmor = false
): number => {
  if (!ignoreEncumbrance) {
    const totalUsedSpaces =
      bag.getSpaces() +
      calculateCurrencySpaces(dinheiro, dinheiroTC, dinheiroTO);
    const isOverloaded = totalUsedSpaces > maxSpaces;

    if (isOverloaded || hasHeavyArmor) {
      // Penalidade de armadura pesada/sobrecarga, mas bônus (poderes,
      // condições, efeitos ativos como Ímpeto) ainda somam por cima.
      return raceDisplacement - 3 + baseDisplacement;
    }
  }

  return raceDisplacement + baseDisplacement;
};

// Helper functions for applying different types of powers and abilities

function recalculateCompleteSkills(sheet: CharacterSheet): CharacterSheet {
  const updatedSheet = _.cloneDeep(sheet);

  // Calculate armor penalty for skills that are affected by armor. Use the
  // wielding/worn-aware variant so multiple armors in the bag don't double-
  // count — only the worn armor and the wielded shield contribute.
  let armorPenalty = 0;
  if (updatedSheet.bag.getActiveArmorPenalty) {
    armorPenalty = updatedSheet.bag.getActiveArmorPenalty(
      updatedSheet.wornArmorId,
      updatedSheet.mainHandItemId,
      updatedSheet.offHandItemId
    );
  } else if (updatedSheet.bag.getArmorPenalty) {
    armorPenalty = updatedSheet.bag.getArmorPenalty();
  } else {
    armorPenalty = updatedSheet.bag.armorPenalty;
  }

  // Non-proficient armor/shield (T20 rule): the armor penalty of active items
  // the character can't use extends to ALL Força/Destreza-based skills, not
  // only the standard armor-penalty skills (which already take the full
  // penalty above and must not double-count).
  const nonProficientArmorPenalty = getNonProficientArmorPenalty(updatedSheet);

  // Helper function to determine training bonus
  const skillTrainingMod = (isTrained: boolean, level: number): number => {
    if (!isTrained) return 0;
    if (level >= 15) return 6;
    if (level >= 7) return 4;
    return 2;
  };

  // If completeSkills already exists, update it while preserving manual edits
  if (updatedSheet.completeSkills) {
    updatedSheet.completeSkills = updatedSheet.completeSkills.map((skill) => {
      // Check if skill is in the skills array (base training from character creation)
      const isBaseSkillTrained = Object.values(updatedSheet.skills).includes(
        skill.name
      );

      // Preserve existing training value if skill was manually trained/untrained
      // (i.e., if completeSkills has training but skills array doesn't, or vice versa)
      // We keep the existing training value in completeSkills as it may have been manually edited
      const existingTraining = skill.training || 0;
      const baseTraining = skillTrainingMod(
        isBaseSkillTrained,
        updatedSheet.nivel
      );

      // Manual untrain wins over base recalculation: if the user explicitly
      // unchecked a skill that came from character creation, the flag survives
      // subsequent recalculations triggered by other edits.
      let finalTraining: number;
      if (skill.manuallyUntrained) {
        finalTraining = 0;
      } else if (existingTraining > 0 && !isBaseSkillTrained) {
        finalTraining = existingTraining; // Manually trained - preserve
      } else {
        finalTraining = baseTraining;
      }

      // Reset 'others' to base value (armor penalty only)
      // This prevents accumulation of bonuses from sheetBonuses
      // The sheetBonuses (from race abilities, powers, etc.) will be reapplied
      // after this function is called
      const isAffectedByArmor = SkillsWithArmorPenalty.includes(skill.name);
      const skillAttr = skill.modAttr ?? getSkillAttr(skill.name);
      const isStrDexSkill =
        skillAttr === Atributo.FORCA || skillAttr === Atributo.DESTREZA;
      let basePenalty = 0;
      if (isAffectedByArmor) basePenalty = armorPenalty;
      else if (isStrDexSkill) basePenalty = nonProficientArmorPenalty;
      const baseOthers = basePenalty > 0 ? basePenalty * -1 : 0;

      return {
        ...skill,
        halfLevel: Math.floor(updatedSheet.nivel / 2),
        training: finalTraining,
        others: baseOthers + (skill.manualOthers ?? 0),
        manualOthers: skill.manualOthers,
        manuallyUntrained: skill.manuallyUntrained,
      };
    });

    // Rede de segurança: o map acima só atualiza linhas que JÁ existem. Um
    // Ofício customizado que entrou em `skills` sem linha correspondente (ficha
    // salva antes deste recálculo, import, edição manual) sumiria da tabela.
    // Restrito a Ofício de propósito: reconciliar qualquer perícia faltante
    // ressuscitaria linhas que o SkillsEditDrawer remove ao destreinar.
    const presentSkills = new Set(
      updatedSheet.completeSkills.map((skill) => skill.name)
    );
    const missingOficios = updatedSheet.skills
      .filter((name) => isOficioSkill(name) && !presentSkills.has(name))
      .map((name) => ({
        name,
        halfLevel: Math.floor(updatedSheet.nivel / 2),
        training: skillTrainingMod(true, updatedSheet.nivel),
        modAttr: Atributo.INTELIGENCIA,
        others: 0,
      }));

    if (missingOficios.length > 0) {
      updatedSheet.completeSkills = [
        ...updatedSheet.completeSkills,
        ...missingOficios,
      ];
    }
  } else {
    // Create completeSkills from scratch if it doesn't exist.
    // Inclui os Ofícios customizados de `skills`, que não existem em SkillsAttrs.
    updatedSheet.completeSkills = getSheetSkillNames(updatedSheet.skills)
      .map((skill) => {
        const attr = getSkillAttr(skill);
        if (!attr) return null;

        const isAffectedByArmor = SkillsWithArmorPenalty.includes(skill);
        const isStrDexSkill =
          attr === Atributo.FORCA || attr === Atributo.DESTREZA;
        let basePenalty = 0;
        if (isAffectedByArmor) basePenalty = armorPenalty;
        else if (isStrDexSkill) basePenalty = nonProficientArmorPenalty;

        return {
          name: skill,
          halfLevel: Math.floor(updatedSheet.nivel / 2),
          training: skillTrainingMod(
            Object.values(updatedSheet.skills).includes(skill),
            updatedSheet.nivel
          ),
          modAttr: attr,
          others: basePenalty > 0 ? basePenalty * -1 : 0,
        };
      })
      .filter(
        (skill): skill is NonNullable<typeof skill> =>
          !!skill && (!isOficioSkill(skill.name) || skill.training > 0)
      );
  }

  return updatedSheet;
}

function applyDivinePowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  if (!sheetClone.devoto?.poderes) return sheetClone;

  sheetClone = (sheetClone.devoto.poderes || []).reduce((acc, power) => {
    const powerSelections = manualSelections?.[power.name];
    const [newAcc] = applyPower(acc, power, powerSelections);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyClassAbilities(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  // Get the full list of class abilities
  // Priority: originalAbilities > class definition lookup > current abilities
  let { originalAbilities } = sheetClone.classe;

  if (!originalAbilities) {
    // Look up the class definition to get the full abilities list
    const classDefinition = findClassDefinition(
      sheetClone.classe.name,
      sheetClone.classe.subname
    );
    if (classDefinition) {
      originalAbilities = classDefinition.abilities;
    } else {
      // Fallback to current abilities if class not found
      originalAbilities = sheetClone.classe.abilities;
    }
  }

  // For multiclass: filter by primary class level, not character level
  const primaryClassLevel = getClassLevel(sheet, sheetClone.classe.name);
  const filterLevel = primaryClassLevel > 0 ? primaryClassLevel : sheet.nivel;
  const availableAbilities: ClassAbility[] = originalAbilities
    .filter((ability) => ability.nivel <= filterLevel)
    .map((a) => ({ ...a, sourceClassName: sheetClone.classe.name }));

  // Preserve originalAbilities for future level changes
  if (!sheetClone.classe.originalAbilities) {
    sheetClone.classe.originalAbilities = [...originalAbilities];
  }

  // For multiclass: also include abilities from secondary classes
  let allAbilities = availableAbilities;
  if (isMulticlass(sheet)) {
    const multiclassAbilities = getMulticlassAvailableAbilities(sheet);
    // Filter out primary class abilities (already in availableAbilities) to avoid duplicates
    const primaryAbilityNames = new Set(availableAbilities.map((a) => a.name));
    const secondaryAbilities = multiclassAbilities.filter(
      (a) => !primaryAbilityNames.has(a.name)
    );
    allAbilities = [...availableAbilities, ...secondaryAbilities];
  }

  sheetClone.classe.abilities = allAbilities;

  // Briga (Lutador/Atleta): dano desarmado escala com o nível de classe
  updateBrigaRolls(sheetClone);

  // Apply text modifications from chooseFromOptions history
  applyOptionChosenTexts(sheetClone);

  sheetClone = allAbilities.reduce((acc, ability) => {
    const abilitySelections = manualSelections?.[ability.name];
    const [newAcc] = applyPower(acc, ability, abilitySelections);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyGeneralPowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  sheetClone = (sheetClone.generalPowers || []).reduce((acc, power) => {
    const powerName = power.name;
    const powerSelections = manualSelections?.[powerName];

    // All selections are now combined for repeatable powers

    const [newAcc] = applyPower(acc, power, powerSelections);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyClassPowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  sheetClone = (sheetClone.classPowers || []).reduce((acc, power) => {
    const powerName = power.name;
    const powerSelections = manualSelections?.[powerName];

    // All selections are now combined for repeatable powers

    const [newAcc] = applyPower(
      acc,
      { ...power, sourceClassName: sheetClone.classe.name },
      powerSelections
    );
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

function applyOriginPowers(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  let sheetClone = _.cloneDeep(sheet);

  if (!sheetClone.origin?.powers) return sheetClone;

  sheetClone = (sheetClone.origin.powers || []).reduce((acc, power) => {
    const powerSelections = manualSelections?.[power.name];
    const [newAcc] = applyPower(acc, power, powerSelections);
    return newAcc;
  }, sheetClone);

  return sheetClone;
}

/**
 * Aplica a complicação (Heróis de Arton) embutida na ficha. As penalidades
 * (sheetBonuses) precisam ser reaplicadas a cada recalc porque o Step 1 zera
 * sheetBonuses; sheetActions são idempotentes via sheetActionHistory.
 */
function applyComplication(
  sheet: CharacterSheet,
  manualSelections?: ManualPowerSelections
): CharacterSheet {
  if (!sheet.complication) return sheet;

  const complicationSelections = manualSelections?.[sheet.complication.name];
  const [newSheet] = applyPower(
    _.cloneDeep(sheet),
    sheet.complication,
    complicationSelections
  );
  return newSheet;
}

/**
 * Checks if the character has a specific class ability
 */
function hasClassAbility(sheet: CharacterSheet, abilityName: string): boolean {
  // Check in class abilities
  const classAbilities = sheet.classe.abilities || [];
  if (
    classAbilities.some(
      (ability) => ability.name === abilityName && ability.nivel <= sheet.nivel
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if equipment bonus condition is met
 */
function isConditionMet(
  sheet: CharacterSheet,
  condition: { type: string; value: string }
): boolean {
  if (condition.type === 'hasClassAbility') {
    return hasClassAbility(sheet, condition.value);
  }

  if (condition.type === 'isClass') {
    return sheet.classe.name === condition.value;
  }

  return false;
}

/**
 * Collects and applies bonuses from all equipment in the bag
 */
function applyEquipmentBonuses(sheet: CharacterSheet): CharacterSheet {
  const updatedSheet = _.cloneDeep(sheet);

  // Collect all equipment from the bag
  const allEquipment: Equipment[] = [
    ...(updatedSheet.bag.equipments['Item Geral'] || []),
    ...(updatedSheet.bag.equipments.Vestuário || []),
    ...(updatedSheet.bag.equipments.Alquimía || []),
    ...(updatedSheet.bag.equipments.Arma || []),
    ...(updatedSheet.bag.equipments.Armadura || []),
    ...(updatedSheet.bag.equipments.Escudo || []),
    ...(updatedSheet.bag.equipments.Alimentação || []),
    ...(updatedSheet.bag.equipments.Animal || []),
    ...(updatedSheet.bag.equipments.Veículo || []),
    ...(updatedSheet.bag.equipments.Serviço || []),
    ...(updatedSheet.bag.equipments.Hospedagem || []),
  ];

  // Process each equipment
  allEquipment.forEach((equip) => {
    // Add direct sheet bonuses. DamageReduction bonuses from equipment
    // materials are intentionally excluded here: armor-material RD is computed
    // in Step 14 from the WORN armor/shield only (see getDefenseMaterialRd), so
    // collecting them here would double-count and also grant RD from armor
    // sitting unused in the bag.
    if (equip.sheetBonuses) {
      updatedSheet.sheetBonuses.push(
        ...equip.sheetBonuses.filter(
          (bonus) => bonus.target.type !== 'DamageReduction'
        )
      );
    }

    // Process conditional bonuses
    if (equip.conditionalBonuses) {
      equip.conditionalBonuses.forEach((conditional) => {
        if (isConditionMet(updatedSheet, conditional.condition)) {
          updatedSheet.sheetBonuses.push(...conditional.bonuses);
        }
      });
    }

    // Process selectable bonus (if a skill was selected)
    if (equip.selectableBonus && equip.selectedBonusSkill) {
      const skillBonus = {
        source: { type: 'equipment' as const, equipmentName: equip.nome },
        target: { type: 'Skill' as const, name: equip.selectedBonusSkill },
        modifier: {
          type: 'Fixed' as const,
          value: equip.selectableBonus.bonusValue,
        },
      };
      updatedSheet.sheetBonuses.push(skillBonus);
    }
  });

  return updatedSheet;
}

/**
 * Applies bonuses from active conditions, obeying the T20 non-stacking rule:
 * conditions with the same effect target do not accumulate — only the most
 * severe applies (aggregation via `aggregateConditionBonuses`).
 *
 * Conditions são puramente temporárias: emitem `SheetBonus` (Skill, Defense,
 * Displacement, AllAttackBonus, etc.) e nunca mutam `atributos[attr].value`.
 * Penalidades de "testes de atributo" são modeladas como `Skill` bonuses para
 * cada perícia derivada do atributo (via `skillsByAttrsPenalty` em conditions.ts).
 * Isso preserva PM máximo, Defesa, PV e demais stats derivados — eles continuam
 * lendo o atributo base, conforme o RAW de T20.
 */
function applyConditionBonuses(sheet: CharacterSheet): CharacterSheet {
  const updated = _.cloneDeep(sheet);

  const active = updated.activeConditions ?? [];
  if (active.length === 0) return updated;

  const collected: SheetBonus[] = [];
  active.forEach((ac) => {
    const tpl = CONDITION_TEMPLATES[ac.id];
    if (!tpl?.mechanical || !tpl.generateBonuses) return;
    tpl.generateBonuses(updated).forEach((b) => {
      collected.push({
        source: { type: 'condition', conditionId: ac.id },
        target: b.target,
        modifier: b.modifier,
      });
    });
  });

  const aggregated = aggregateConditionBonuses(collected);
  aggregated.forEach((b) => {
    updated.sheetBonuses.push(b);
  });

  return updated;
}

/**
 * Aplica os bônus dos efeitos ativos (poderes com bônus temporário, ex.:
 * Inspiração do Bardo). Espelha `applyConditionBonuses`, mas:
 *  - cada `ActiveEffect` carrega seus próprios `bonuses` (já resolvidos no
 *    momento do uso a partir do tier escolhido), então não há `generate`;
 *  - efeitos distintos somam (v1) — não há regra de não-acúmulo entre eles;
 *  - PM/PV temporários (`grantsTempPM/PV`) NÃO são tratados aqui: são
 *    aplicados imperativamente ao ativar/desativar o efeito, evitando
 *    compounding a cada recálculo (sheetBonuses é zerado no Step 1, mas
 *    tempPM/tempPV não têm "base" para recomputar).
 */
function applyActiveEffectBonuses(sheet: CharacterSheet): CharacterSheet {
  const updated = _.cloneDeep(sheet);

  const active = updated.activeEffects ?? [];
  if (active.length === 0) return updated;

  active.forEach((eff) => {
    eff.bonuses.forEach((b) => {
      const source = {
        type: 'activeEffect' as const,
        powerKey: eff.powerKey,
        name: eff.name,
      };

      // Bônus que miram um atributo são expandidos em suas perícias/dano/Defesa
      // derivados (o motor não muta `atributos[attr].value` — vazaria pro estado
      // persistido). Mesma estratégia das condições e dos efeitos pré-canned.
      if (b.target.type === 'Attribute') {
        const { attribute } = b.target;
        expandAttributeBonus(attribute, b.modifier).forEach((expanded) => {
          updated.sheetBonuses.push({
            source,
            target: expanded.target,
            modifier: expanded.modifier,
          });
        });
        return;
      }

      updated.sheetBonuses.push({
        source,
        target: b.target,
        modifier: b.modifier,
      });
    });
  });

  return updated;
}

/**
 * Reverts the side effects of a power/ability identified by `powerName` by
 * walking its `sheetActionHistory` entries and undoing arrays mutated outside
 * `sheetBonuses` (which is wiped in Step 1 of `recalculateSheet`).
 *
 * Mutates `sheet` in place. Used by:
 *   - `recalculateSheet` Step 0: to revert removed `generalPowers/classPowers/origin.powers`.
 *   - `applyRaceCustomizationToSheet`: to revert removed race abilities when
 *     a customizable race (Duende/Moreau/Golem Desperto) is reconfigured.
 */
export function reverseSheetActionsForPower(
  sheet: CharacterSheet,
  powerName: string
): void {
  const powerHistoryEntries = sheet.sheetActionHistory.filter(
    (entry) => entry.powerName === powerName
  );

  // Reverse each action in reverse order (LIFO)
  powerHistoryEntries.reverse().forEach((historyEntry) => {
    historyEntry.changes.forEach((change) => {
      switch (change.type) {
        case 'Attribute': {
          // Find the original modification to get the exact value that was added
          const relevantHistory = sheet.sheetActionHistory.find(
            (entry) =>
              entry.powerName === powerName &&
              entry.changes.some(
                (c) =>
                  c.type === 'Attribute' && c.attribute === change.attribute
              )
          );
          if (relevantHistory) {
            const attributeChange = relevantHistory.changes.find(
              (c) => c.type === 'Attribute' && c.attribute === change.attribute
            ) as { type: 'Attribute'; attribute: Atributo; value: number };
            if (attributeChange) {
              const originalValue = sheet.atributos[change.attribute].value;
              const modificationValue = attributeChange.value - originalValue;
              sheet.atributos[change.attribute].value -= modificationValue;
            }
          }
          break;
        }

        case 'ProficiencyAdded': {
          const profIndex = sheet.classe.proficiencias.indexOf(
            change.proficiency
          );
          if (profIndex > -1) {
            sheet.classe.proficiencias.splice(profIndex, 1);
          }
          break;
        }

        case 'SkillsAdded': {
          change.skills.forEach((skill: string) => {
            const skillIndex = sheet.skills.indexOf(skill as Skill);
            if (skillIndex > -1) {
              sheet.skills.splice(skillIndex, 1);
            }
          });
          break;
        }

        case 'SenseAdded': {
          if (sheet.sentidos) {
            const senseIndex = sheet.sentidos.indexOf(change.sense);
            if (senseIndex > -1) {
              sheet.sentidos.splice(senseIndex, 1);
            }
          }
          break;
        }

        case 'PowerAdded': {
          if (sheet.generalPowers) {
            const powerIndex = sheet.generalPowers.findIndex(
              (power) => power.name === change.powerName
            );
            if (powerIndex > -1) {
              sheet.generalPowers.splice(powerIndex, 1);
            }
          }
          break;
        }

        case 'ClassPowerAdded': {
          if (sheet.classPowers) {
            const powerIndex = sheet.classPowers.findIndex(
              (power) => power.name === change.powerName
            );
            if (powerIndex > -1) {
              sheet.classPowers.splice(powerIndex, 1);
            }
          }
          break;
        }

        case 'SpellsLearned': {
          if (sheet.spells) {
            change.spellNames.forEach((spellName: string) => {
              const spellIndex = sheet.spells.findIndex(
                (spell) => spell.nome === spellName
              );
              if (spellIndex > -1) {
                sheet.spells.splice(spellIndex, 1);
              }
            });
          }
          break;
        }

        case 'AttributeIncreasedByAumentoDeAtributo':
          sheet.atributos[change.attribute].value -= 1;
          break;

        default:
          // Other action types not yet implemented
          break;
      }
    });
  });

  // Remove history entries for this power.
  // Note: powers granted via a `getGeneralPower` sheetAction store the entry
  // keyed by the *source ability* name (e.g. "Linhagem Rubra"), not by the
  // granted power name. So besides dropping entries keyed by this power, also
  // strip any `PowerAdded`/`ClassPowerAdded` change that references it and drop
  // entries left without changes — keeping other grants from the same ability.
  sheet.sheetActionHistory = sheet.sheetActionHistory
    .filter((entry) => entry.powerName !== powerName)
    .map((entry) => ({
      ...entry,
      changes: entry.changes.filter(
        (change) =>
          !(
            (change.type === 'PowerAdded' ||
              change.type === 'ClassPowerAdded') &&
            change.powerName === powerName
          )
      ),
    }))
    .filter((entry) => entry.changes.length > 0);
}

/**
 * Synthesizes sheetActionHistory entries for powers that were removed by the user
 * but could be re-granted by abilities with `getGeneralPower` sheetActions.
 *
 * This fixes a bug where old sheets (created before the history system) have empty
 * sheetActionHistory, causing `isActionAlreadyApplied()` to return false and
 * re-executing `getGeneralPower` actions — which re-adds a random power from
 * `availablePowers`, making the removed power effectively impossible to delete.
 *
 * By synthesizing a history entry for the source ability, `isActionAlreadyApplied`
 * returns true and skips re-execution.
 */
function synthesizeHistoryForRemovedPowers(
  sheet: CharacterSheet,
  removedPowerNames: string[]
): void {
  // Collect all abilities that have getGeneralPower sheetActions
  const sourcesWithGetPower: Array<{
    abilityName: string;
    sheetAction: SheetAction;
    availablePowerNames: string[];
  }> = [];

  const collectFromActions = (
    abilityName: string,
    sheetActions: SheetAction[] | undefined
  ) => {
    if (!sheetActions) return;
    sheetActions.forEach((sa) => {
      if (sa.action.type === 'getGeneralPower') {
        sourcesWithGetPower.push({
          abilityName,
          sheetAction: sa,
          availablePowerNames: sa.action.availablePowers.map((p) => p.name),
        });
      }
    });
  };

  // Class abilities
  (sheet.classe.abilities || []).forEach((ability) =>
    collectFromActions(ability.name, ability.sheetActions)
  );

  // Race abilities
  (sheet.raca.abilities || []).forEach((ability) =>
    collectFromActions(ability.name, ability.sheetActions)
  );

  // Origin powers
  (sheet.origin?.powers || []).forEach((power) =>
    collectFromActions(power.name, power.sheetActions)
  );

  // Deity powers
  (sheet.devoto?.poderes || []).forEach((power) =>
    collectFromActions(power.name, power.sheetActions)
  );

  // For each removed power, check if any source could have granted it
  removedPowerNames.forEach((removedPower) => {
    sourcesWithGetPower.forEach((source) => {
      if (!source.availablePowerNames.includes(removedPower)) return;

      // Check if history already records this source ability granting THIS
      // specific power. Per-ability granularity is too coarse: an ability that
      // can grant several powers (e.g. Linhagem Rubra → any Tormenta power)
      // would wrongly look "already handled" for a different removed power.
      const hasHistory = sheet.sheetActionHistory.some(
        (entry) =>
          entry.powerName === source.abilityName &&
          entry.changes.some(
            (c) => c.type === 'PowerAdded' && c.powerName === removedPower
          )
      );

      if (!hasHistory) {
        sheet.sheetActionHistory.push({
          source: source.sheetAction.source,
          powerName: source.abilityName,
          changes: [{ type: 'PowerAdded', powerName: removedPower }],
        });
      }
    });
  });
}

/**
 * Options for controlling what gets recalculated
 */
export interface RecalculateOptions {
  /** Skip PM (Pontos de Mana) recalculation - use when only equipment changes */
  skipPMRecalc?: boolean;
  /** Skip PV (Pontos de Vida) recalculation - use when only equipment changes */
  skipPVRecalc?: boolean;
}

/**
 * Recalculates the entire character sheet after changes have been made.
 * This function applies all powers, abilities, and bonuses to ensure
 * the sheet is consistent and up-to-date.
 *
 * @param sheet - The updated character sheet
 * @param originalSheet - Optional original sheet state to detect removed powers
 * @param manualSelections - Optional manual selections for powers that require them
 * @param options - Optional flags to control what gets recalculated
 */
export function recalculateSheet(
  sheet: CharacterSheet,
  originalSheet?: CharacterSheet,
  manualSelections?: ManualPowerSelections,
  options?: RecalculateOptions
): CharacterSheet {
  let updatedSheet = _.cloneDeep(sheet);
  let removedPowerNames: string[] = [];

  // One-shot migration: legacy sheets created before the wielding/worn-armor
  // system have no slot or armor selection. Without this seed, a sheet with
  // (e.g.) 1 shield in the bag would silently lose its defense bonus because
  // the new rules require an explicit `offHandItemId`. Marks the sheet as
  // migrated so later "soltar"/"tirar" actions are preserved across recalcs.
  updatedSheet = migrateLegacyEquipState(updatedSheet);

  // Migração: limpar `conditionAttributePenalties` (deprecated). Versões
  // anteriores aplicavam penalidades de condições mutando `atributos[attr].value`
  // e rastreando o delta neste ledger. Isso vazava efeitos temporários para o
  // estado persistido (PM máximo, Defesa, perícias) e corrompia atributos
  // editados manualmente. Agora condições só emitem `Skill` bonuses; o ledger
  // é revertido aqui (devolvendo `atributos` ao valor base) e descartado para
  // sempre. Após esta passagem, a ficha é salva limpa naturalmente.
  if (updatedSheet.conditionAttributePenalties) {
    (
      Object.entries(updatedSheet.conditionAttributePenalties) as [
        Atributo,
        number
      ][]
    ).forEach(([attr, delta]) => {
      if (updatedSheet.atributos[attr]) {
        updatedSheet.atributos[attr] = {
          ...updatedSheet.atributos[attr],
          value: updatedSheet.atributos[attr].value - delta,
        };
      }
    });
    updatedSheet.conditionAttributePenalties = undefined;
  }

  // Migração: remover Canalizar Reparos de fichas Golem Desperto antigas
  // (era incluído antes do commit 711e921, mas só deve existir no Golem básico
  // ou como Maravilha Mecânica do chassi Mashin)
  if (
    updatedSheet.raca.name === 'Golem Desperto' &&
    updatedSheet.raca.abilities
  ) {
    updatedSheet.raca.abilities = updatedSheet.raca.abilities.filter(
      (ability) => ability.name !== 'Canalizar Reparos'
    );

    if (updatedSheet.sheetActionHistory) {
      updatedSheet.sheetActionHistory = updatedSheet.sheetActionHistory
        .map((entry) => {
          if (entry.source.type !== 'race') return entry;
          return {
            ...entry,
            changes: entry.changes.filter(
              (change) =>
                !(
                  change.type === 'PowerAdded' &&
                  change.powerName === 'Canalizar Reparos'
                )
            ),
          };
        })
        .filter((entry) => entry.changes.length > 0);
    }
  }

  // Note: Attribute reset/re-application was removed - value now contains the final modifier directly.
  // Race bonuses are already included in value from initial creation.

  // Step 0: If we have the original sheet, identify removed powers
  if (originalSheet) {
    // Find removed general powers
    const originalGeneralPowers = originalSheet.generalPowers || [];
    const newGeneralPowers = updatedSheet.generalPowers || [];
    const removedGeneralPowers = getRemovedPowers(
      originalGeneralPowers,
      newGeneralPowers
    );

    // Find removed class powers
    const originalClassPowers = originalSheet.classPowers || [];
    const newClassPowers = updatedSheet.classPowers || [];
    const removedClassPowers = getRemovedPowers(
      originalClassPowers,
      newClassPowers
    );

    // Find removed origin powers
    const originalOriginPowerNames = (originalSheet.origin?.powers || []).map(
      (p) => p.name
    );
    const newOriginPowerNames = (updatedSheet.origin?.powers || []).map(
      (p) => p.name
    );
    const removedOriginPowers = originalOriginPowerNames.filter(
      (name) => !newOriginPowerNames.includes(name)
    );

    removedPowerNames = [
      ...removedGeneralPowers,
      ...removedClassPowers,
      ...removedOriginPowers,
    ];

    // Complicação (Heróis de Arton) removida ou trocada: reverte as
    // sheetActions da complicação antiga como se fosse um poder removido
    if (
      originalSheet.complication &&
      originalSheet.complication.name !== updatedSheet.complication?.name
    ) {
      removedPowerNames.push(originalSheet.complication.name);
    }

    // Only reverse sheet actions (not bonuses) since bonuses will be cleared anyway
    removedPowerNames.forEach((powerName) => {
      reverseSheetActionsForPower(updatedSheet, powerName);
    });

    // If the user removed a general power that a race ability deterministically
    // replays from a stored choice (Osteon "Memória Póstuma", Yidishan
    // "Natureza Orgânica", Lefou "Deformidade", Mashin "Chassi"), clear the
    // stored choice. Otherwise the special action (special.ts) would re-inject
    // the removed power into `generalPowers` on every recalculation, making it
    // impossible to delete via the Powers edit drawer. The `cleared` sentinel
    // (not `undefined`) keeps the special action from falling through to its
    // random path and rolling a replacement.
    if (
      updatedSheet.osteonMemoriaPostumaChoice?.type === 'power' &&
      removedPowerNames.includes(updatedSheet.osteonMemoriaPostumaChoice.value)
    ) {
      updatedSheet.osteonMemoriaPostumaChoice = { type: 'cleared' };
    }
    if (
      updatedSheet.yidishanNaturezaChoice?.type === 'power' &&
      removedPowerNames.includes(updatedSheet.yidishanNaturezaChoice.value)
    ) {
      updatedSheet.yidishanNaturezaChoice = { type: 'cleared' };
    }
    if (
      updatedSheet.lefouDeformidadePower &&
      removedPowerNames.includes(updatedSheet.lefouDeformidadePower)
    ) {
      updatedSheet.lefouDeformidadePower = undefined;
    }
    if (
      updatedSheet.mashinChassiChoice?.type === 'power' &&
      removedPowerNames.includes(updatedSheet.mashinChassiChoice.value)
    ) {
      updatedSheet.mashinChassiChoice = { type: 'cleared' };
    }
  }

  // Step 0.5: Synthesize history entries for removed powers so that
  // getGeneralPower actions from source abilities don't re-execute
  if (removedPowerNames.length > 0) {
    synthesizeHistoryForRemovedPowers(updatedSheet, removedPowerNames);
  }

  // Step 1: Clear existing bonuses to avoid accumulation
  updatedSheet.sheetBonuses = [];

  // Step 1.5: Recalculate maxSpaces based on current Força modifier
  updatedSheet.maxSpaces = calculateMaxSpaces(
    updatedSheet.atributos.Força.value
  );

  // Step 1.6: Reset extraArmorPenalty to avoid accumulation across recalculations
  updatedSheet.extraArmorPenalty = 0;

  // Step 2: Apply general powers (most important for manual additions)
  updatedSheet = applyGeneralPowers(updatedSheet, manualSelections);

  // Step 3: Apply class powers (with manual selections)
  updatedSheet = applyClassPowers(updatedSheet, manualSelections);

  // Step 4: Apply race abilities
  updatedSheet = applyRaceAbilities(updatedSheet);

  // Step 5: Apply class abilities (filter by level)
  updatedSheet = applyClassAbilities(updatedSheet, manualSelections);

  // Step 6: Apply divine powers
  updatedSheet = applyDivinePowers(updatedSheet, manualSelections);

  // Step 7: Apply origin powers
  updatedSheet = applyOriginPowers(updatedSheet, manualSelections);

  // Step 7.2: Apply complication (Heróis de Arton)
  updatedSheet = applyComplication(updatedSheet, manualSelections);

  // Step 7.3: Apply equipment bonuses
  updatedSheet = applyEquipmentBonuses(updatedSheet);

  // Step 7.4: Apply active condition bonuses
  //   - Attribute targets mutate atributos directly (before skills/defense recalc)
  //   - Other targets are pushed to sheetBonuses for the main loop
  updatedSheet = applyConditionBonuses(updatedSheet);

  // Step 7.45: Apply active effect bonuses (powers with temporary bonus,
  // e.g. Bard's Inspiração). Parallel pipeline to conditions — does not
  // replace it. Pushes SheetBonus entries for the main loop below.
  updatedSheet = applyActiveEffectBonuses(updatedSheet);

  // Check for manual max overrides - when set, skip ALL recalculation for that stat
  // Player takes full control of these values when manually defined
  const hasManualMaxPV =
    updatedSheet.manualMaxPV != null && updatedSheet.manualMaxPV > 0;
  const hasManualMaxPM =
    updatedSheet.manualMaxPM != null && updatedSheet.manualMaxPM > 0;

  // Step 7.5: Reset PV and PM to base values AFTER all powers applied (to use correct attributes)
  // Skip PV recalculation if flag is set (e.g., equipment-only changes)
  if (!options?.skipPVRecalc) {
    if (hasManualMaxPV) {
      // Player has set manual max - skip all calculations, just use the manual value
      updatedSheet.pv = updatedSheet.manualMaxPV!;
    } else if (updatedSheet.classLevels && isMulticlass(updatedSheet)) {
      // Multiclass PV calculation
      updatedSheet.pv = calculateMulticlassPV(updatedSheet);
    } else {
      // PV base = classe.pv + conMod + max(addpv + conMod, 1) * (nivel - 1)
      const basePV = updatedSheet.classe.pv || 0;
      const addPVPerLevel =
        updatedSheet.customPVPerLevel ?? updatedSheet.classe.addpv ?? 0; // Use custom value if defined
      const conMod = updatedSheet.atributos.Constituição?.value || 0;
      // Constituição negativa reduz PV, mas ganho mínimo por nível é 1
      const pvPerLevelGain = Math.max(addPVPerLevel + conMod, 1);
      updatedSheet.pv =
        basePV + conMod + pvPerLevelGain * (updatedSheet.nivel - 1);

      // Add bonus PV if defined
      if (updatedSheet.bonusPV) {
        updatedSheet.pv += updatedSheet.bonusPV;
      }

      // Add manual PV edit if defined (applied after all calculations)
      if (updatedSheet.manualPVEdit) {
        updatedSheet.pv += updatedSheet.manualPVEdit;
      }
    }

    // Initialize current PV if not set (first time or reset)
    if (updatedSheet.currentPV === undefined) {
      updatedSheet.currentPV = updatedSheet.pv;
    }

    // Migrate old over-max PV to temp PV
    if (
      updatedSheet.currentPV > updatedSheet.pv &&
      updatedSheet.tempPV === undefined
    ) {
      updatedSheet.tempPV = updatedSheet.currentPV - updatedSheet.pv;
      updatedSheet.currentPV = updatedSheet.pv;
    }

    // Initialize increment if not set
    if (updatedSheet.pvIncrement === undefined) {
      updatedSheet.pvIncrement = 1;
    }
  }

  // Skip PM recalculation if flag is set (e.g., equipment-only changes)
  if (!options?.skipPMRecalc) {
    if (hasManualMaxPM) {
      // Player has set manual max - skip all calculations, just use the manual value
      updatedSheet.pm = updatedSheet.manualMaxPM!;
    } else if (updatedSheet.classLevels && isMulticlass(updatedSheet)) {
      // Multiclass PM calculation
      updatedSheet.pm = calculateMulticlassPM(updatedSheet);
    } else {
      // PM base = classe.pm + (classe.addpm * (level - 1))
      // Note: Key attribute bonus (INT/CAR/SAB) is NOT added here - it comes from
      // class abilities (e.g., "Magias") via sheetBonuses to avoid double-counting
      const basePM = updatedSheet.classe.pm || 0;
      const addPMPerLevel =
        updatedSheet.customPMPerLevel ?? updatedSheet.classe.addpm ?? 0; // Use custom value if defined

      // Calculate PM: base + perLevel * (level - 1)
      updatedSheet.pm = basePM + addPMPerLevel * (updatedSheet.nivel - 1);

      // Add bonus PM if defined
      if (updatedSheet.bonusPM) {
        updatedSheet.pm += updatedSheet.bonusPM;
      }

      // Add manual PM edit if defined (applied after all calculations)
      if (updatedSheet.manualPMEdit) {
        updatedSheet.pm += updatedSheet.manualPMEdit;
      }
    }

    // Paladino: Virtudes Paladinescas (bônus progressivo de PM por quantidade)
    if (!hasManualMaxPM) {
      updatedSheet.pm += getVirtudePaladinescaPMBonus(updatedSheet.classPowers);
    }

    // Initialize current PM if not set (first time or reset)
    if (updatedSheet.currentPM === undefined) {
      updatedSheet.currentPM = updatedSheet.pm;
    }

    // Migrate old over-max PM to temp PM
    if (
      updatedSheet.currentPM > updatedSheet.pm &&
      updatedSheet.tempPM === undefined
    ) {
      updatedSheet.tempPM = updatedSheet.currentPM - updatedSheet.pm;
      updatedSheet.currentPM = updatedSheet.pm;
    }

    // Initialize increment if not set
    if (updatedSheet.pmIncrement === undefined) {
      updatedSheet.pmIncrement = 1;
    }
  }

  // Step 7.7: Recalculate skills (resets others to 0)
  updatedSheet = recalculateCompleteSkills(updatedSheet);

  // Step 7.8: PM extras de deus menor (depende da divindade e do nível, por
  // isso é injetado aqui e não vem estático do dado). Precisa vir antes do
  // Step 8, que é quem soma os bônus de PM.
  updatedSheet = injectDeusMenorPmBonus(updatedSheet);

  // Step 8: Apply non-defense bonuses (PV, PM, skills, etc.)
  // Antes de aplicar, remove bônus cuja condição (opcional) não é satisfeita.
  // Como todos os consumidores abaixo (PV/PM/perícias, defesa, deslocamento,
  // armas, RD) leem o mesmo array, este filtro único gateia todos eles.
  updatedSheet.sheetBonuses = updatedSheet.sheetBonuses.filter((bonus) =>
    isBonusActive(updatedSheet, bonus)
  );

  // PM Debug - Initial state (calculate values for debug even if skipped)
  const debugBasePM = updatedSheet.classe.pm || 0;
  const debugAddPMPerLevel =
    updatedSheet.customPMPerLevel ?? updatedSheet.classe.addpm ?? 0;
  const pmDebug = {
    initialPM: updatedSheet.pm, // After reset with level progression and bonus
    classeBasePM: debugBasePM,
    classePMPerLevel: debugAddPMPerLevel,
    customPMPerLevel: updatedSheet.customPMPerLevel,
    bonusPM: updatedSheet.bonusPM,
    nivel: updatedSheet.nivel,
    pmFromLevels: debugAddPMPerLevel * (updatedSheet.nivel - 1),
    atributos: {
      INT: updatedSheet.atributos.Inteligência?.value || 0,
      CAR: updatedSheet.atributos.Carisma?.value || 0,
      SAB: updatedSheet.atributos.Sabedoria?.value || 0,
    },
    spellKeyAttr: updatedSheet.classe.spellPath?.keyAttribute || 'N/A',
    spellKeyAttrMod: updatedSheet.classe.spellPath?.keyAttribute
      ? updatedSheet.atributos[updatedSheet.classe.spellPath.keyAttribute]
          ?.value || 0
      : 0,
    bonuses: [] as Array<{
      source: string;
      bonusType: string;
      formula?: string;
      calculatedValue: number;
      pmBefore: number;
      pmAfter: number;
    }>,
  };

  updatedSheet.sheetBonuses.forEach((bonus) => {
    if (
      bonus.target.type !== 'Defense' &&
      bonus.target.type !== 'HPAttributeReplacement' &&
      bonus.target.type !== 'DamageReduction'
    ) {
      const bonusValue = calculateBonusValue(
        updatedSheet,
        bonus.modifier,
        bonus.source
      );

      if (
        bonus.target.type === 'PV' &&
        !options?.skipPVRecalc &&
        !hasManualMaxPV
      ) {
        updatedSheet.pv += bonusValue;
      } else if (
        bonus.target.type === 'PM' &&
        !options?.skipPMRecalc &&
        !hasManualMaxPM
      ) {
        // Tradição Perdida: substitui a contribuição do atributo-chave da
        // classe (spellKeyAttr) no total de PM pelo atributo escolhido no poder
        // (limitado por patamar). Fora desse caso, usa o valor normal.
        const tradicaoPerdidaPm =
          bonus.modifier.type === 'SpecialAttribute' &&
          bonus.modifier.attribute === 'spellKeyAttr'
            ? getTradicaoPerdidaPmValue(updatedSheet)
            : null;
        const pmValue = tradicaoPerdidaPm ?? bonusValue;

        const pmBefore = updatedSheet.pm;
        updatedSheet.pm += pmValue;
        const pmAfter = updatedSheet.pm;

        // Track PM bonus details
        let sourceLabel = 'Unknown';
        if (bonus.source?.type === 'power') {
          sourceLabel = `Power: ${bonus.source.name}`;
        } else if (bonus.source?.type === 'origin') {
          sourceLabel = `Origin: ${bonus.source.originName}`;
        } else if (bonus.source?.type === 'race') {
          sourceLabel = `Race: ${bonus.source.raceName}`;
        }

        pmDebug.bonuses.push({
          source: sourceLabel,
          bonusType: bonus.modifier.type,
          formula:
            'formula' in bonus.modifier ? bonus.modifier.formula : undefined,
          calculatedValue: pmValue,
          pmBefore,
          pmAfter,
        });
      } else if (bonus.target.type === 'Skill') {
        const skillName = bonus.target.name;
        addOtherBonusToSkill(updatedSheet, skillName, bonusValue);
      } else if (bonus.target.type === 'PickSkill') {
        // Re-apply PickSkill. Prioridade: seleção manual → escolha persistida
        // em optionChoices (homebrew com optionKey, sobrevive ao recálculo sem
        // manualSelections).
        let skillsToProcess: string[] = [];
        if (
          bonus.source?.type === 'power' &&
          manualSelections?.[bonus.source.name]?.skills
        ) {
          skillsToProcess = manualSelections[bonus.source.name].skills ?? [];
        } else if (bonus.target.optionKey) {
          skillsToProcess =
            updatedSheet.optionChoices?.[bonus.target.optionKey] ?? [];
        }

        if (skillsToProcess.length > 0) {
          const selectedSkills = skillsToProcess.slice(0, bonus.target.pick);
          selectedSkills.forEach((skillName: string) => {
            addOtherBonusToSkill(updatedSheet, skillName, bonusValue);
          });
        }
      } else if (bonus.target.type === 'Displacement') {
        updatedSheet.displacement += bonusValue;
      } else if (bonus.target.type === 'DisplacementOverride') {
        updatedSheet.displacement = bonusValue;
      } else if (bonus.target.type === 'AllAttackBonus') {
        addOtherBonusToSkill(updatedSheet, 'Luta' as Skill, bonusValue);
        addOtherBonusToSkill(updatedSheet, 'Pontaria' as Skill, bonusValue);
      } else if (bonus.target.type === 'ArmorPenalty') {
        updatedSheet.extraArmorPenalty =
          (updatedSheet.extraArmorPenalty || 0) + bonusValue;
      } else if (bonus.target.type === 'MaxSpaces') {
        updatedSheet.maxSpaces = (updatedSheet.maxSpaces || 0) + bonusValue;
      } else if (bonus.target.type === 'SpellDC') {
        // SpellDC bonuses are tracked in sheetBonuses for display
        // The actual calculation is done when casting spells
        // (stored for reference but not directly applied to sheet)
      } else if (bonus.target.type === 'ModifySkillAttribute') {
        const { attribute, skill: skillName } = bonus.target;

        if (updatedSheet.completeSkills) {
          updatedSheet.completeSkills = updatedSheet.completeSkills.map(
            (skill) => {
              if (skill.name === skillName) {
                return {
                  ...skill,
                  modAttr: attribute,
                };
              }
              return skill;
            }
          );
        }
      } else if (bonus.target.type === 'Proficiency') {
        const { proficiency } = bonus.target;
        if (
          proficiency &&
          !updatedSheet.classe.proficiencias.includes(proficiency)
        ) {
          updatedSheet.classe.proficiencias = [
            ...updatedSheet.classe.proficiencias,
            proficiency,
          ];
        }
      }
    }
  });

  // Step 8.5: Inject Estilo de Uma Arma bonuses (condicional à empunhadura).
  // Precisa rodar APÓS sheetBonuses estarem populados e ANTES dos Steps 9-10
  // (Defesa) e 13 (armas), que consomem os bônus injetados.
  updatedSheet = injectEstiloDeUmaArmaBonuses(updatedSheet);
  updatedSheet = injectEstiloDeArmaEEscudoBonuses(updatedSheet);

  // Step 9: Reset defense to base and recalculate from ground up
  const baseDefense = updatedSheet.customDefenseBase ?? 10;
  updatedSheet.defesa = baseDefense;
  updatedSheet = calcDefense(updatedSheet);

  // Check if heavy armor is equipped
  const equippedArmors = updatedSheet.bag.equipments.Armadura || [];
  const heavyArmor = equippedArmors.some((armor) => isHeavyArmor(armor));

  // Apply custom attribute logic if defined
  if (updatedSheet.useDefenseAttribute === false && !heavyArmor) {
    // User explicitly disabled attribute, remove it
    const defaultAttr =
      updatedSheet.classe.name === 'Nobre'
        ? updatedSheet.atributos.Carisma.value
        : updatedSheet.atributos.Destreza.value;
    updatedSheet.defesa -= defaultAttr;
  } else if (
    updatedSheet.customDefenseAttribute &&
    updatedSheet.useDefenseAttribute !== false &&
    !heavyArmor
  ) {
    // User specified a custom attribute (and didn't disable it)
    const defaultAttr =
      updatedSheet.classe.name === 'Nobre'
        ? Atributo.CARISMA
        : Atributo.DESTREZA;

    if (updatedSheet.customDefenseAttribute !== defaultAttr) {
      // Remove default attribute value and add custom
      const defaultValue = updatedSheet.atributos[defaultAttr].value;
      const customValue =
        updatedSheet.atributos[updatedSheet.customDefenseAttribute].value;
      updatedSheet.defesa = updatedSheet.defesa - defaultValue + customValue;
    }
  }

  // Add manual bonus
  if (updatedSheet.bonusDefense) {
    updatedSheet.defesa += updatedSheet.bonusDefense;
  }

  // Step 10: Apply defense bonuses from powers AFTER base calculation
  updatedSheet = applyDefenseBonuses(updatedSheet);

  // Step 11: Recalculate displacement from ground up.
  // DisplacementOverride (from active conditions like Caído/Imóvel) wins over
  // everything — it's a rule that fixes displacement to a specific value.
  const displacementOverrideBonus = updatedSheet.sheetBonuses.find(
    (bonus) => bonus.target.type === 'DisplacementOverride'
  );

  const baseDisplacementBonuses = updatedSheet.sheetBonuses
    .filter((bonus) => bonus.target.type === 'Displacement')
    .reduce(
      (acc, bonus) =>
        acc + calculateBonusValue(updatedSheet, bonus.modifier, bonus.source),
      0
    );

  if (displacementOverrideBonus) {
    updatedSheet.displacement = calculateBonusValue(
      updatedSheet,
      displacementOverrideBonus.modifier,
      displacementOverrideBonus.source
    );
  } else if (updatedSheet.customDisplacement !== undefined) {
    // Base manual + bônus (poderes/condições/efeitos ativos) por cima.
    updatedSheet.displacement =
      updatedSheet.customDisplacement + baseDisplacementBonuses;
  } else {
    updatedSheet.displacement = calcDisplacement(
      updatedSheet.bag,
      getRaceDisplacement(updatedSheet.raca),
      updatedSheet.customMaxSpaces ?? updatedSheet.maxSpaces,
      baseDisplacementBonuses,
      updatedSheet.dinheiro,
      updatedSheet.dinheiroTC,
      updatedSheet.dinheiroTO,
      updatedSheet.raca.ignoreEncumbrance ?? false,
      heavyArmor
    );
  }

  // Preserve custom size if set
  if (updatedSheet.customSize) {
    updatedSheet.size = updatedSheet.customSize;
  }

  // Step 12: Apply HP attribute replacement (Dom da Esperança)
  updatedSheet = applyHPAttributeReplacement(updatedSheet);

  // Step 14: Calculate Damage Reduction from sheetBonuses + manual
  const computedRd: DamageReduction = {};

  updatedSheet.sheetBonuses.forEach((bonus) => {
    if (bonus.target.type === 'DamageReduction') {
      const bonusValue = calculateBonusValue(
        updatedSheet,
        bonus.modifier,
        bonus.source
      );
      const { damageType } = bonus.target;
      computedRd[damageType] = (computedRd[damageType] ?? 0) + bonusValue;
    }
  });

  // Material especial em armadura/escudo EQUIPADO (ex.: Adamante RD 5 pesada /
  // 2 leve e escudos). Só o item de fato equipado contribui — armaduras na
  // mochila não dão RD.
  let wornArmorItem = updatedSheet.wornArmorId
    ? equippedArmors.find((armor) => armor.id === updatedSheet.wornArmorId)
    : undefined;
  if (
    !wornArmorItem &&
    !updatedSheet.wornArmorId &&
    equippedArmors.length === 1
  ) {
    [wornArmorItem] = equippedArmors; // legacy compat (sem wornArmorId)
  }
  const equippedShields = updatedSheet.bag.equipments.Escudo || [];
  const wornShield = equippedShields.find(
    (shield) =>
      shield.id === updatedSheet.mainHandItemId ||
      shield.id === updatedSheet.offHandItemId
  );
  [
    ...(wornArmorItem
      ? getDefenseMaterialRd(wornArmorItem, isHeavyArmor(wornArmorItem))
      : []),
    ...(wornShield ? getDefenseMaterialRd(wornShield, false) : []),
  ].forEach((dr) => {
    computedRd[dr.damageType] = (computedRd[dr.damageType] ?? 0) + dr.value;
  });

  // Bárbaro: Resistência a Dano (RD Geral escalável com nível de Bárbaro)
  const barbaroLevel = getClassLevel(updatedSheet, 'Bárbaro');
  if (barbaroLevel >= 5) {
    const rdValue = 2 * Math.min(5, 1 + Math.floor((barbaroLevel - 5) / 3));
    computedRd.Geral = (computedRd.Geral ?? 0) + rdValue;
  }

  // Cavaleiro: Bastião (RD Geral 5, requer armadura pesada)
  if (updatedSheet.cavaleiroCaminho === 'Bastião' && heavyArmor) {
    computedRd.Geral = (computedRd.Geral ?? 0) + 5;
  }

  // Cavaleiro/Guerreiro: Especialização em Armadura (RD Geral 5, requer armadura pesada)
  const hasEspecArmadura = (updatedSheet.classPowers || []).some(
    (p) => p.name === 'Especialização em Armadura'
  );
  if (hasEspecArmadura && heavyArmor) {
    computedRd.Geral = (computedRd.Geral ?? 0) + 5;
  }

  // Encastelado (RD Geral 2 + escala, requer armadura pesada)
  const hasEncastelado = (updatedSheet.generalPowers || []).some(
    (p) => p.name === 'Encastelado'
  );
  if (hasEncastelado && heavyArmor) {
    const encouracadoDependents = (updatedSheet.generalPowers || []).filter(
      (p) =>
        p.name !== 'Encastelado' &&
        p.requirements?.some((reqGroup) =>
          reqGroup.some(
            (req) =>
              req.type === RequirementType.PODER && req.name === 'Encouraçado'
          )
        )
    ).length;
    computedRd.Geral = (computedRd.Geral ?? 0) + 2 + encouracadoDependents;
  }

  // Selvagem Sanguinário (RD Geral 1, sem armadura pesada)
  const hasSelvagem = [
    ...(updatedSheet.generalPowers || []),
    ...(updatedSheet.origin?.powers || []),
  ].some((p) => p.name === 'Selvagem Sanguinário');
  if (hasSelvagem && !heavyArmor) {
    computedRd.Geral = (computedRd.Geral ?? 0) + 1;
  }

  // Carapaça Corrompida (RD Geral 1 + escala com poderes da Tormenta)
  const hasCarapaca = (updatedSheet.generalPowers || []).some(
    (p) => p.name === 'Carapaça Corrompida'
  );
  if (hasCarapaca) {
    const otherTormentaPowers = countTormentaPowers(updatedSheet) - 1;
    const rdValue = 1 + Math.floor(Math.max(0, otherTormentaPowers) / 2);
    computedRd.Geral = (computedRd.Geral ?? 0) + rdValue;
  }

  // Pele Corrompida (RD 6 tipos, escala com poderes da Tormenta)
  const hasPeleCorr = (updatedSheet.generalPowers || []).some(
    (p) => p.name === 'Pele Corrompida'
  );
  if (hasPeleCorr) {
    const otherTormentaPowers = countTormentaPowers(updatedSheet) - 1;
    const rdValue = 2 + 2 * Math.floor(Math.max(0, otherTormentaPowers) / 2);
    const types: DamageType[] = [
      'Ácido',
      'Eletricidade',
      'Fogo',
      'Frio',
      'Luz',
      'Trevas',
    ];
    types.forEach((dt) => {
      computedRd[dt] = (computedRd[dt] ?? 0) + rdValue;
    });
  }

  if (updatedSheet.bonusRd) {
    Object.entries(updatedSheet.bonusRd).forEach(([key, value]) => {
      if (value !== undefined && value !== 0) {
        const dt = key as DamageType;
        computedRd[dt] = Math.max(0, (computedRd[dt] ?? 0) + value);
      }
    });
  }

  updatedSheet.reducaoDeDano =
    Object.keys(computedRd).length > 0 ? computedRd : undefined;

  // PM Debug - Final output
  pmDebug.bonuses.push({
    source: '=== FINAL PM ===',
    bonusType: 'Total',
    calculatedValue: updatedSheet.pm - pmDebug.initialPM,
    pmBefore: pmDebug.initialPM,
    pmAfter: updatedSheet.pm,
  });

  // Step 15: Recalculate companion stats (Treinador)
  if (updatedSheet.companions?.length) {
    const trainerLevel =
      getClassLevel(updatedSheet, 'Treinador') || updatedSheet.nivel;
    const trainerCharisma =
      updatedSheet.atributos[Atributo.CARISMA]?.value ?? 0;
    updatedSheet.companions = updatedSheet.companions.map((companion) =>
      calculateCompanionStats(companion, trainerLevel, trainerCharisma)
    );
  }

  // Step 16: Deduplicate arrays to prevent accumulation
  updatedSheet.spells = deduplicateSpells(updatedSheet.spells);
  updatedSheet.sheetActionHistory = deduplicateHistory(
    updatedSheet.sheetActionHistory
  );
  updatedSheet.steps = deduplicateSteps(updatedSheet.steps);

  // Step 17: Reapply item enhancements (superior-item modifications and magical
  // enchantments). Items with `modifications` and/or `enchantments` are
  // recomputed from their `base*` snapshots; items without enhancements are
  // passed through unchanged. Reads `base*` fields (not current values), então é
  // puro/idempotente. Roda ANTES do baking de bônus de arma (Step 17.5) para que
  // os bônus de efeito ativo sejam aplicados por cima do valor com aprimoramento
  // — antes, o Step de armas rodava primeiro e tinha seu dano/atk sobrescrito
  // aqui, perdendo o bônus de dano de efeitos ativos em armas mágicas.
  if (updatedSheet.bag?.equipments) {
    const reapplied = _.cloneDeep(updatedSheet.bag.equipments);
    (Object.keys(reapplied) as (keyof typeof reapplied)[]).forEach((cat) => {
      const list = reapplied[cat] as Equipment[] | undefined;
      if (!Array.isArray(list)) return;
      list.forEach((item, idx) => {
        if (!item) return;
        // applyItemEnhancements short-circuits items without any enhancement
        // or prior base capture, so calling it unconditionally is cheap and
        // ensures stale derived state (e.g. specialActions left behind by a
        // removed Arremesso enchantment) gets cleaned up.
        // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-explicit-any
        (list as any)[idx] = applyItemEnhancements(item);
      });
    });
    updatedSheet.bag = new Bag(reapplied, true, updatedSheet.bag.displayOrder);
  }

  // Step 17.5: Apply weapon bonuses (atk/dano/margem/crít de poderes e efeitos
  // ativos). Roda DEPOIS da reaplicação de aprimoramentos (Step 17) para que o
  // baking seja somado por cima do dano/atk com aprimoramento e não seja
  // sobrescrito por ele.
  updatedSheet = applyWeaponBonuses(updatedSheet, manualSelections);

  // Step 18: Inject spells granted by the Conjuradora enchantment into
  // `sheet.spells`. Spells previously injected (tagged via `equipmentSource`)
  // are stripped first so removing the enchantment also removes the spell.
  updatedSheet.spells = injectConjuradoraSpells(
    updatedSheet.spells,
    updatedSheet.bag?.equipments
  );

  // Carimba os suplementos runtime usados (preserva inativos não verificáveis).
  stampUsedSupplements(updatedSheet);

  return updatedSheet;
}
