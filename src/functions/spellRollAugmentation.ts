import { DiceRoll } from '@/interfaces/DiceRoll';
import { Aprimoramento, AprimoramentoDamageBonus } from '@/interfaces/Spells';
import { parseDamage } from './diceRoller';

/**
 * Motor puro (sem React) que conecta os aprimoramentos de uma magia às suas
 * rolagens de dano/cura. Dado o conjunto de rolagens base e quais
 * aprimoramentos foram ativados (com contagem), devolve as rolagens já
 * AUMENTADAS — de modo que a UI possa sempre confirmar o dano correto antes de
 * rolar, ao invés de deixar o usuário ajustar tudo na mão.
 *
 * Convenções T20 assumidas: cada ativação de um aprimoramento soma o bônus
 * completo (dados e modificador crescem linearmente com a contagem).
 *
 * O vínculo aprimoramento→rolagem é feito por LABEL (normalizado, sem acento e
 * case-insensitive), nunca por id — os ids das rolagens em `generalSpells.ts`
 * são `uuid()` avaliados no load do módulo e mudam a cada reload.
 */

export interface AprimoramentoSelection {
  aprimoramento: Aprimoramento;
  count: number;
}

export interface AugmentedRoll extends DiceRoll {
  /** Notação original, para o preview "6d6 → 8d6". */
  baseDice: string;
  /** true quando algum aprimoramento ativo alterou esta rolagem. */
  isAugmented: boolean;
  /** Resumo do que foi somado, ex.: "+2d6" (undefined quando não aumentada). */
  addedSummary?: string;
}

interface DiceAccumulator {
  bySides: Map<number, number>; // faces -> quantidade de dados
  modifier: number;
}

const STOPWORD_LABELS = new Set(['em', 'de', 'da', 'do', 'a', 'o', 'ao']);

const DAMAGE_TRIGGER = /aumenta\s+(?:o\s+dano|a\s+cura)/i;
const DICE_TOKEN = /([+-]?\d+d\d+(?:[+-]\d+)?)/i;
const DICE_TOKEN_GLOBAL = /([+-]?\d+d\d+(?:[+-]\d+)?)/gi;
const TYPE_WORD = '[a-zà-úãõâêôç]+';

export function normalizeLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function newAccumulator(): DiceAccumulator {
  return { bySides: new Map(), modifier: 0 };
}

function addGroups(
  acc: DiceAccumulator,
  groups: Array<{ count: number; sides: number }>,
  modifier: number
): void {
  groups.forEach((group) => {
    acc.bySides.set(
      group.sides,
      (acc.bySides.get(group.sides) ?? 0) + group.count
    );
  });
  acc.modifier += modifier;
}

function accToGroups(
  acc: DiceAccumulator
): Array<{ count: number; sides: number }> {
  return [...acc.bySides.entries()]
    .filter(([, count]) => count > 0)
    .map(([sides, count]) => ({ count, sides }));
}

/**
 * Monta a notação a partir de um acumulador, preservando a ordem de inserção
 * dos lados (dado base primeiro, dados adicionados por aprimoramento depois),
 * seguido do modificador numérico assinado. Ex.: 6d6 + 1d8 + 2 -> "6d6+1d8+2".
 */
function composeNotation(acc: DiceAccumulator): string {
  const groups = [...acc.bySides.entries()]
    .filter(([, count]) => count > 0)
    .map(([sides, count]) => `${count}d${sides}`);

  let notation = groups.join('+');
  if (acc.modifier > 0) notation += `+${acc.modifier}`;
  else if (acc.modifier < 0) notation += `${acc.modifier}`;

  if (!notation) notation = '0';
  return notation;
}

function hasAny(acc: DiceAccumulator): boolean {
  let hasDice = false;
  acc.bySides.forEach((count) => {
    if (count > 0) hasDice = true;
  });
  return hasDice || acc.modifier !== 0;
}

function extractLabel(part: string): string | undefined {
  // 1. Tipo logo após o dado: "+2d6 de fogo".
  const trailing = part.match(
    new RegExp(`\\d+d\\d+(?:[+-]\\d+)?\\s+de\\s+(${TYPE_WORD})`, 'i')
  );
  if (trailing) return trailing[1];

  // 2. "dano de <tipo>" / "cura de <tipo>".
  const typed = part.match(
    new RegExp(`(?:dano|cura)\\s+de\\s+(${TYPE_WORD})`, 'i')
  );
  if (typed) return typed[1];

  // 3. "dano <descritor>" (inicial, por rodada, ...), descartando conectivos.
  const desc = part.match(
    new RegExp(`dano\\s+(${TYPE_WORD}(?:\\s+${TYPE_WORD})?)`, 'i')
  );
  if (desc) {
    const candidate = desc[1].trim();
    if (!STOPWORD_LABELS.has(candidate.toLowerCase())) return candidate;
  }

  return undefined;
}

/**
 * Extrai vínculos estruturados a partir do texto do aprimoramento. Usado como
 * degradação segura para conteúdo antigo/homebrew sem `damageBonus`. Retorna
 * `[]` quando não é possível interpretar com confiança — nesse caso nada é
 * aplicado automaticamente e o override manual continua disponível.
 */
export function parseDamageBonusFromText(
  text: string
): AprimoramentoDamageBonus[] {
  if (!DAMAGE_TRIGGER.test(text)) return [];

  // Remove parênteses (variantes condicionais tipo "(ou +1d12 em mortos-vivos)")
  // e normaliza espaços.
  const cleaned = text
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const startIdx = cleaned.toLowerCase().indexOf('aumenta');
  const clause = startIdx >= 0 ? cleaned.slice(startIdx) : cleaned;

  const hasDice = DICE_TOKEN.test(clause);

  if (!hasDice) {
    // Bônus fixo: "aumenta o dano em 10."
    const flatMatch = clause.match(
      /aumenta\s+(?:o\s+dano|a\s+cura)[^.]*?\bem\s+(\d+)\b/i
    );
    if (flatMatch) {
      return [
        { dicePerActivation: '', flatPerActivation: Number(flatMatch[1]) },
      ];
    }
    return [];
  }

  const parts = clause.split(/\s+e\s+/i);
  const infos = parts.map((part) => {
    const diceMatch = part.match(DICE_TOKEN);
    const ownDice = diceMatch ? diceMatch[1].replace(/^\+/, '') : undefined;
    return {
      dice: ownDice,
      label: extractLabel(part),
      mentionsDamage: /dano|cura/i.test(part),
    };
  });

  // Uma parte qualifica como bônus se tem dado próprio, ou se descreve dano/cura
  // com um rótulo (herdando o dado de outra parte — "dano inicial e por rodada
  // em +1d6").
  const qualifies = infos.map(
    (info) => Boolean(info.dice) || Boolean(info.label && info.mentionsDamage)
  );

  // Preenche o dado das partes qualificadas que só têm rótulo, a partir da
  // parte qualificada mais próxima (adiante e depois atrás).
  for (let i = 0; i < infos.length; i += 1) {
    if (qualifies[i] && !infos[i].dice) {
      let j = i + 1;
      while (j < infos.length && !infos[j].dice) j += 1;
      if (j < infos.length) {
        infos[i].dice = infos[j].dice;
      } else {
        let k = i - 1;
        while (k >= 0 && !infos[k].dice) k -= 1;
        if (k >= 0) infos[i].dice = infos[k].dice;
      }
    }
  }

  const bonuses: AprimoramentoDamageBonus[] = [];
  infos.forEach((info, i) => {
    if (!qualifies[i] || !info.dice) return;
    const bonus: AprimoramentoDamageBonus = { dicePerActivation: info.dice };
    if (info.label) bonus.targetRollLabel = info.label;
    bonuses.push(bonus);
  });

  return bonuses;
}

/**
 * Resolve os bônus de um aprimoramento: usa o vínculo estruturado
 * `damageBonus` quando presente, senão cai no fallback de texto.
 */
function resolveBonuses(
  aprimoramento: Aprimoramento
): AprimoramentoDamageBonus[] {
  if (aprimoramento.damageBonus && aprimoramento.damageBonus.length > 0) {
    return aprimoramento.damageBonus;
  }
  return parseDamageBonusFromText(aprimoramento.text);
}

/**
 * Índices das rolagens base atingidas por um bônus: casa por label
 * (substring normalizada); sem label, cai na única rolagem existente; se houver
 * mais de uma e nenhum label casar, o bônus é ignorado (nunca chuta).
 */
function resolveTargetIndexes(
  baseRolls: DiceRoll[],
  bonus: AprimoramentoDamageBonus
): number[] {
  if (bonus.targetRollLabel) {
    const needle = normalizeLabel(bonus.targetRollLabel);
    return baseRolls.reduce<number[]>((acc, roll, index) => {
      if (normalizeLabel(roll.label).includes(needle)) acc.push(index);
      return acc;
    }, []);
  }
  return baseRolls.length === 1 ? [0] : [];
}

/**
 * Aumenta as rolagens base de acordo com os aprimoramentos ativos.
 * Preserva `id`, `label`, `description` e `damageType` de cada rolagem para
 * que a seleção do usuário permaneça estável entre recálculos.
 */
export function augmentSpellRolls(
  baseRolls: DiceRoll[],
  selections: AprimoramentoSelection[]
): AugmentedRoll[] {
  // Acumuladores base (dado original) e adicionado (soma dos aprimoramentos).
  const baseAcc = baseRolls.map((roll) => {
    const parsed = parseDamage(roll.dice);
    const acc = newAccumulator();
    if (parsed) addGroups(acc, parsed.diceGroups, parsed.modifier);
    return acc;
  });
  const addedAcc = baseRolls.map(() => newAccumulator());

  selections.forEach(({ aprimoramento, count }) => {
    if (count <= 0) return;
    const bonuses = resolveBonuses(aprimoramento);

    bonuses.forEach((bonus) => {
      const parsedBonus = parseDamage(bonus.dicePerActivation);
      const perActivationModifier =
        (parsedBonus?.modifier ?? 0) + (bonus.flatPerActivation ?? 0);
      const scaledGroups = (parsedBonus?.diceGroups ?? []).map((group) => ({
        count: group.count * count,
        sides: group.sides,
      }));
      const scaledModifier = perActivationModifier * count;

      // Nada a somar (ex.: bônus só de texto não numérico).
      if (scaledGroups.length === 0 && scaledModifier === 0) return;

      const targetIndexes = resolveTargetIndexes(baseRolls, bonus);
      targetIndexes.forEach((index) => {
        addGroups(addedAcc[index], scaledGroups, scaledModifier);
      });
    });
  });

  return baseRolls.map((roll, index) => {
    const added = addedAcc[index];
    const isAugmented = hasAny(added);

    const total = newAccumulator();
    addGroups(total, accToGroups(baseAcc[index]), baseAcc[index].modifier);
    addGroups(total, accToGroups(added), added.modifier);

    let addedSummary: string | undefined;
    if (isAugmented) {
      const summary = composeNotation(added);
      addedSummary =
        summary.startsWith('+') || summary.startsWith('-')
          ? summary
          : `+${summary}`;
    }

    return {
      ...roll,
      baseDice: roll.dice,
      dice: isAugmented ? composeNotation(total) : roll.dice,
      isAugmented,
      addedSummary,
    };
  });
}

// Reexport para testes que queiram varrer todos os tokens de dado num texto.
export function extractAllDiceTokens(text: string): string[] {
  return [...text.matchAll(DICE_TOKEN_GLOBAL)].map((m) => m[1]);
}
