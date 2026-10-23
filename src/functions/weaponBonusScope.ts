import Equipment, { WeaponCategory } from '../interfaces/Equipment';
import {
  SheetBonus,
  SheetChangeSource,
  StatModifier,
} from '../interfaces/CharacterSheet';
import { CharacterAttributes } from '../interfaces/Character';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { getEffectiveWeaponCategory } from './proficiencies';
import {
  isFiringWeapon,
  isLightOrAgileMeleeWeapon,
  isSword,
} from './weaponTraits';
import { evaluateFormula } from '../premium/functions/safeFormulaEval';

/**
 * Filtros de escopo de um bônus de arma (subconjunto dos alvos WeaponDamage /
 * WeaponAttack / WeaponThreatMargin / WeaponCriticalMultiplier). `proficiencyRequired`
 * fica de fora do matching estático porque depende da ficha (ver `weaponMatchesBonus`
 * em recalculateSheet.ts, que soma essa checagem).
 */
export interface WeaponBonusScope {
  weaponName?: string;
  weaponTags?: string[];
  meleeOnly?: boolean;
  rangedOnly?: boolean;
  thrownOnly?: boolean;
  firingOnly?: boolean;
  lightOrAgileOnly?: boolean;
  twoHandedOnly?: boolean;
  swordOnly?: boolean;
  weaponCategories?: WeaponCategory[];
}

/**
 * Matching ESTÁTICO arma × escopo (independe da ficha). Fonte única do casamento
 * de filtros — `weaponMatchesBonus` (recalculateSheet.ts) e `Weapon.tsx` delegam
 * aqui para não divergir. Não avalia `proficiencyRequired` (precisa da ficha).
 */
export function weaponMatchesScope(
  weapon: Equipment,
  scope: WeaponBonusScope
): boolean {
  // Arma específica por nome.
  if (scope.weaponName && weapon.nome !== scope.weaponName) {
    return false;
  }

  // Escopo por categoria de proficiência (simples/marcial/exótica/de fogo).
  // Resolve via getEffectiveWeaponCategory para cobrir cópias legadas de armas
  // core embutidas em fichas salvas (sem o campo `weaponCategory`).
  if (scope.weaponCategories && scope.weaponCategories.length > 0) {
    const category = getEffectiveWeaponCategory(weapon);
    if (!category || !scope.weaponCategories.includes(category)) {
      return false;
    }
  }

  // Apenas armas de arremesso (têm `arremesso: true`).
  if (scope.thrownOnly && !weapon.arremesso) {
    return false;
  }

  // Apenas armas corpo a corpo: exclui armas à distância (têm `alcance` real e
  // não são de arremesso — arcos, bestas, armas de fogo). Armas de arremesso
  // (adaga, azagaia) continuam valendo por serem usáveis corpo a corpo.
  if (scope.meleeOnly) {
    const { alcance } = weapon;
    const isRanged = !!alcance && alcance !== '-' && !weapon.arremesso;
    if (isRanged) {
      return false;
    }
  }

  // Apenas armas à distância: exclui corpo a corpo puro. Armas de arremesso
  // contam como à distância para este filtro (podem ser arremessadas).
  if (scope.rangedOnly) {
    const { alcance } = weapon;
    const isRangedWeapon = !!alcance && alcance !== '-';
    if (!isRangedWeapon) {
      return false;
    }
  }

  // Apenas armas de disparo (arcos, bestas, fogo, funda) — à distância e NÃO
  // arremesso.
  if (scope.firingOnly && !isFiringWeapon(weapon)) {
    return false;
  }

  // Apenas armas corpo a corpo leves ou ágeis.
  if (scope.lightOrAgileOnly && !isLightOrAgileMeleeWeapon(weapon)) {
    return false;
  }

  // Apenas armas empunhadas com as duas mãos (armas leves nunca são twoHanded).
  if (scope.twoHandedOnly && !weapon.twoHanded) {
    return false;
  }

  // Apenas espadas.
  if (scope.swordOnly && !isSword(weapon)) {
    return false;
  }

  // Tags da arma (armaDeMar, alongada, heredrimm...).
  if (scope.weaponTags && scope.weaponTags.length > 0) {
    const weaponTags = weapon.weaponTags || [];
    const hasMatchingTag = scope.weaponTags.some((tag) =>
      weaponTags.includes(tag)
    );
    if (!hasMatchingTag) {
      return false;
    }
  }

  return true;
}

/**
 * O bônus deve ser aplicado POR MODO de ataque (em Weapon.tsx) em vez de bakeado
 * na string `dano`/`atkBonus` da arma inteira?
 *
 * - Bônus `thrownOnly` sempre (só valem no modo de arremesso).
 * - Bônus `meleeOnly`/`rangedOnly` numa arma HÍBRIDA de arremesso (adaga,
 *   machadinha, azagaia, lança...): ela tem modo corpo a corpo E modo arremesso;
 *   bakear vazaria para o outro modo. Armas puras (só corpo a corpo, ou só
 *   disparo) têm um único modo relevante → podem ser bakeadas normalmente.
 */
export function isModeScopedForWeapon(
  weapon: Equipment,
  scope: WeaponBonusScope
): boolean {
  if (scope.thrownOnly) return true;
  if (weapon.arremesso && (scope.meleeOnly || scope.rangedOnly)) return true;
  return false;
}

/**
 * O bônus NÃO é bakeado por `applyWeaponBonuses` (recalculateSheet) e portanto
 * precisa ser somado AO VIVO na exibição e na rolagem?
 *
 * É o complemento EXATO do que o baking aplica — os dois lados têm que
 * concordar, senão o bônus some da ficha (era o bug da Fúria nas armas de
 * arremesso do catálogo) ou entra duas vezes. Dois motivos para um bônus ficar
 * de fora do baking:
 *
 *  1. **Escopo por modo** (`isModeScopedForWeapon`): bakear na string
 *     `dano`/`atkBonus` vazaria o bônus para o outro modo de uma arma híbrida
 *     de arremesso.
 *  2. **Arma com `hasManualEdits`**: `applyWeaponBonuses` retorna cedo e não
 *     bakeia NADA nela — o valor digitado pelo usuário é a base. Só as fontes
 *     voláteis (efeitos ativos) voltam ao vivo por cima dessa base; bônus
 *     permanentes de poder continuam congelados, que é o sentido da edição
 *     manual.
 */
export function isLiveWeaponBonus(
  weapon: Equipment,
  scope: WeaponBonusScope,
  sourceType: SheetChangeSource['type']
): boolean {
  if (weapon.hasManualEdits) return sourceType === 'activeEffect';
  return isModeScopedForWeapon(weapon, scope);
}

/**
 * Contexto opcional para resolver `{classLevel}` / `capBy: 'classLevel'` fora do
 * recalculateSheet. Sem ele, o nível de classe recai no nível total (`nivel`),
 * que é o comportamento correto para ficha mono-classe.
 */
export interface SimpleModifierContext {
  /** Map<className, classLevel> — use `getClassLevelsMap` (multiclass.ts). */
  classLevels?: Map<string, number>;
  /** `bonus.source`; só o `className` (fontes do tipo `power`) é lido. */
  source?: SheetChangeSource;
  /**
   * Total de poderes da Tormenta da ficha (`countTormentaPowers`), para os
   * modificadores `TormentaPowersCalc`. Ausente = 0, como no motor completo.
   */
  tPowQtd?: number;
}

/**
 * Nível de classe da fonte do bônus. Espelha `resolveClassLevel` em
 * recalculateSheet.ts — os dois avaliadores precisam concordar.
 */
const resolveClassLevel = (
  nivel: number,
  ctx?: SimpleModifierContext
): number => {
  const className =
    ctx?.source?.type === 'power' ? ctx.source.className : undefined;
  if (!className || !ctx?.classLevels) return nivel;
  return ctx.classLevels.get(className) ?? nivel;
};

/**
 * Avaliador leve de modificador para o cálculo por modo e para o texto de
 * efeitos em Weapon.tsx, onde não há acesso à resolução completa de fonte/nível
 * de classe do recalculateSheet. Suporta `Fixed`, `Attribute`, `CappedAttribute`,
 * `LevelCalc` e `TormentaPowersCalc`.
 *
 * `LevelCalc` usa `evaluateFormula` (parser próprio, sem `eval`) porque este
 * módulo é importado por componentes que renderizam conteúdo homebrew. Fórmulas
 * fora da whitelist — inclusive oficiais, como o ternário de "Resistência a
 * Dano" — retornam 0 em vez de lançar.
 *
 * Outros tipos retornam 0 (são bakeados no `dano` pelo recalculateSheet).
 */
export function evaluateSimpleModifier(
  modifier: StatModifier,
  atributos: CharacterAttributes,
  nivel: number,
  ctx?: SimpleModifierContext
): number {
  if (modifier.type === 'Fixed') {
    return modifier.value || 0;
  }
  if (modifier.type === 'Attribute') {
    return atributos[modifier.attribute as Atributo]?.value ?? 0;
  }
  if (modifier.type === 'CappedAttribute') {
    const attrValue = atributos[modifier.attribute as Atributo]?.value ?? 0;
    const cap =
      modifier.capBy === 'classLevel' ? resolveClassLevel(nivel, ctx) : nivel;
    return Math.max(0, Math.min(attrValue, cap));
  }
  if (
    (modifier.type === 'LevelCalc' || modifier.type === 'TormentaPowersCalc') &&
    modifier.formula
  ) {
    try {
      return evaluateFormula(modifier.formula, {
        level: nivel,
        classLevel: resolveClassLevel(nivel, ctx),
        tPowQtd: ctx?.tPowQtd ?? 0,
      });
    } catch {
      // Fórmula reprovada pela whitelist (ternários oficiais, homebrew inválido).
      return 0;
    }
  }
  return 0;
}

/** Contexto da ficha necessário para avaliar os modificadores dos bônus vivos. */
export interface LiveWeaponBonusContext {
  atributos: CharacterAttributes;
  nivel: number;
  classLevels?: Map<string, number>;
  /**
   * O ataque é o modo de arremesso de uma arma de arremesso (perícia Pontaria)?
   * A linha da arma na ficha e o corpo a corpo passam `false` — o padrão de
   * exibição é o modo corpo a corpo, coerente com `getWeaponSkill`.
   */
  thrownMode?: boolean;
  /**
   * O personagem é proficiente com esta arma? Bônus marcados com
   * `proficiencyRequired` (Armas da Ambição, Armas da Destruição) só valem
   * quando `true`. `undefined` = quem chamou não sabe → trata como proficiente,
   * mesma falha segura de `isProficientWithWeapon` para arma sem categoria.
   */
  isProficient?: boolean;
}

/**
 * Soma os bônus de arma que NÃO foram bakeados (ver `isLiveWeaponBonus`) e que
 * valem para a arma e o modo de ataque atuais. Fonte única de `Weapon.tsx`:
 * linha exibida, preview de modo e rolagem usam esta função para não divergir.
 *
 * Regra de modo: bônus com escopo por modo valem `thrownOnly`/`rangedOnly` no
 * arremesso e `meleeOnly` no corpo a corpo (arremessar É atacar à distância).
 * Bônus vivos por edição manual não têm escopo de modo e valem em qualquer um,
 * desde que casem estaticamente com a arma.
 */
export function sumLiveWeaponBonuses(
  weapon: Equipment,
  bonuses: SheetBonus[] | undefined,
  targetType: 'WeaponAttack' | 'WeaponDamage' | 'WeaponDamageStep',
  ctx: LiveWeaponBonusContext
): number {
  if (!bonuses?.length) return 0;
  const thrown = !!ctx.thrownMode;

  return bonuses.reduce((sum, bonus) => {
    if (bonus.target.type !== targetType) return sum;
    const scope = bonus.target as WeaponBonusScope & {
      proficiencyRequired?: boolean;
    };
    if (!isLiveWeaponBonus(weapon, scope, bonus.source.type)) return sum;
    if (!weaponMatchesScope(weapon, scope)) return sum;
    // Espelha a checagem de `weaponMatchesBonus` (recalculateSheet): sem ela o
    // caminho vivo aplicaria um bônus que o baking recusa.
    if (scope.proficiencyRequired && ctx.isProficient === false) return sum;

    if (isModeScopedForWeapon(weapon, scope)) {
      const appliesInMode = thrown
        ? !!scope.thrownOnly || !!scope.rangedOnly
        : !!scope.meleeOnly;
      if (!appliesInMode) return sum;
    }

    return (
      sum +
      evaluateSimpleModifier(bonus.modifier, ctx.atributos, ctx.nivel, {
        classLevels: ctx.classLevels,
        source: bonus.source,
      })
    );
  }, 0);
}

/**
 * Ajustes de crítico acumulados de uma lista de bônus `WeaponThreatMargin` /
 * `WeaponCriticalMultiplier`. `set*` define o valor (com vários, prevalece a
 * margem mais ampla / o maior multiplicador); `*Bonus` soma por cima.
 */
export interface CriticalAdjustments {
  marginBonus: number;
  setMargin?: number;
  multiplierBonus: number;
  setMultiplier?: number;
}

export const emptyCriticalAdjustments = (): CriticalAdjustments => ({
  marginBonus: 0,
  multiplierBonus: 0,
});

/** Acumula um bônus de crítico já avaliado em `adj` (muta e devolve). */
export function addCriticalAdjustment(
  adj: CriticalAdjustments,
  target: SheetBonus['target'],
  value: number
): CriticalAdjustments {
  if (target.type === 'WeaponThreatMargin') {
    if (target.mode === 'set') {
      adj.setMargin =
        adj.setMargin === undefined ? value : Math.min(adj.setMargin, value);
    } else {
      adj.marginBonus += value;
    }
  } else if (target.type === 'WeaponCriticalMultiplier') {
    if (target.mode === 'set') {
      adj.setMultiplier =
        adj.setMultiplier === undefined
          ? value
          : Math.max(adj.setMultiplier, value);
    } else {
      adj.multiplierBonus += value;
    }
  }
  return adj;
}

/**
 * Aplica os ajustes numa string de crítico ("19", "x2" ou "19/x2"). Fonte
 * única da aritmética: o baking (`applyWeaponBonuses`) e o caminho vivo
 * (`resolveLiveWeaponCritico`) passam por aqui.
 */
export function applyCriticalAdjustments(
  critico: string,
  adj: CriticalAdjustments
): string {
  const hasMarginChange = adj.marginBonus > 0 || adj.setMargin !== undefined;
  const hasMultChange =
    adj.multiplierBonus > 0 || adj.setMultiplier !== undefined;
  if (!critico || (!hasMarginChange && !hasMultChange)) return critico;

  // A margem é a parte numérica antes da "/" (ou a string inteira, sem "/");
  // o multiplicador é a parte "xN".
  const parts = critico.split('/');
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
    let currentRange = marginPart !== null ? parseInt(marginPart, 10) : 20;
    if (Number.isNaN(currentRange)) currentRange = 20;
    if (adj.setMargin !== undefined) currentRange = adj.setMargin;
    marginPart = `${Math.max(1, Math.min(20, currentRange - adj.marginBonus))}`;
  }

  if (hasMultChange) {
    // Multiplicador base (x2 implícito quando a arma só tem margem, ex.:
    // "19"). `set` define o multiplicador; o aumento soma por cima.
    let currentMult =
      multPart !== null
        ? parseInt(multPart.match(/x(\d+)/)?.[1] || '2', 10)
        : 2;
    if (Number.isNaN(currentMult)) currentMult = 2;
    if (adj.setMultiplier !== undefined) currentMult = adj.setMultiplier;
    multPart = `x${Math.max(2, currentMult + adj.multiplierBonus)}`;
  }

  if (marginPart !== null && multPart !== null) {
    return `${marginPart}/${multPart}`;
  }
  return marginPart ?? multPart ?? critico;
}

/**
 * Crítico efetivo de um ataque, somando AO VIVO os bônus de margem de ameaça e
 * multiplicador que o baking não alcançou. Complemento de `applyWeaponBonuses`,
 * que só escreve em `weapon.critico`:
 *
 *  - **Arma com `hasManualEdits`**: nada é bakeado; os efeitos ativos (Fúria,
 *    efeitos personalizados) voltam ao vivo por cima do valor digitado — mesma
 *    regra de `isLiveWeaponBonus`. Sem isso o efeito aparecia no tooltip ✨ da
 *    arma e a rolagem continuava critando só no 20.
 *  - **Modo de ataque com `critico` próprio** (`WeaponAction.critico`): o
 *    override é o valor cru do catálogo, então TODOS os bônus que casam com a
 *    arma entram nele (só os efeitos ativos, se a arma foi editada à mão).
 */
export function resolveLiveWeaponCritico(
  weapon: Equipment,
  bakedCritico: string,
  actionCritico: string | undefined,
  bonuses: SheetBonus[] | undefined,
  ctx: LiveWeaponBonusContext
): string {
  const usesOverride = actionCritico !== undefined;
  const base = usesOverride ? actionCritico : bakedCritico;
  if (!bonuses?.length || (!usesOverride && !weapon.hasManualEdits)) {
    return base;
  }

  const adj = emptyCriticalAdjustments();
  bonuses.forEach((bonus) => {
    if (
      bonus.target.type !== 'WeaponThreatMargin' &&
      bonus.target.type !== 'WeaponCriticalMultiplier'
    ) {
      return;
    }
    if (weapon.hasManualEdits && bonus.source.type !== 'activeEffect') return;
    const scope = bonus.target as WeaponBonusScope & {
      proficiencyRequired?: boolean;
    };
    if (!weaponMatchesScope(weapon, scope)) return;
    if (scope.proficiencyRequired && ctx.isProficient === false) return;
    addCriticalAdjustment(
      adj,
      bonus.target,
      evaluateSimpleModifier(bonus.modifier, ctx.atributos, ctx.nivel, {
        classLevels: ctx.classLevels,
        source: bonus.source,
      })
    );
  });

  return applyCriticalAdjustments(base, adj);
}
