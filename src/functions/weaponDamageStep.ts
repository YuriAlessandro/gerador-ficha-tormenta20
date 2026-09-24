// Sequência linear de dano para o sistema de "passo de dado" do Tormenta 20.
// Cada item representa um nível na escala. Aumentar 1 passo = avançar 1 índice.
// Forma: [count, faces] (count=0 representa dano fixo "1").
const DAMAGE_LADDER: Array<[number, number]> = [
  [0, 1], // 1 (fixo)
  [1, 2], // 1d2
  [1, 3], // 1d3
  [1, 4], // 1d4
  [1, 6], // 1d6
  [1, 8], // 1d8
  [1, 10], // 1d10
  [1, 12], // 1d12
  [3, 6], // 3d6
  [4, 6], // 4d6
  [4, 8], // 4d8
  [4, 10], // 4d10
  [4, 12], // 4d12 (máximo)
];

/**
 * Ramo `2dX` da Tabela 3-2 (JDA, p. 145, linhas 7-8): 1d10 | 2d6 | 2d8 | 2d10 |
 * 3d10 | 4d10 | 4d12.
 *
 * Existe porque a tabela oficial é um reticulado, não uma cadeia: `2d6` aparece
 * como "Normal" numa linha (com +1 passo = 3d6) e como "–1 Passo" na seguinte
 * (com +1 passo = 2d8). O `DAMAGE_LADDER` acima escolheu o primeiro caminho, e a
 * consequência é que `2d8`/`2d10` — o dano da Briga do Lutador a partir do 17º
 * nível — não subia passo NENHUM, porque não está em degrau algum.
 *
 * Este ramo é OPT-IN (`allowAltLadder`) de propósito. Ligá-lo por padrão mudaria
 * o dano de armas 2dX já existentes na mochila (montante, machado táurico,
 * pistola) para todo personagem Grande ou com bônus de passo — uma decisão de
 * regra que o Step 11.7 do `recalculateSheet` deferiu explicitamente. Só o
 * ataque desarmado (`unarmedDamage.ts`), onde a cadeia oficial da Briga OBRIGA
 * uma resposta, o consome hoje.
 *
 * As pernas baixas são compartilhadas com o ramo principal para que passos
 * negativos a partir de `2d6` caiam de volta na cadeia canônica (2d6 −1 = 1d10).
 */
const TWO_DICE_LADDER: Array<[number, number]> = [
  [0, 1], // 1 (fixo)
  [1, 2], // 1d2
  [1, 3], // 1d3
  [1, 4], // 1d4
  [1, 6], // 1d6
  [1, 8], // 1d8
  [1, 10], // 1d10
  [2, 6], // 2d6
  [2, 8], // 2d8
  [2, 10], // 2d10
  [3, 10], // 3d10
  [4, 10], // 4d10
  [4, 12], // 4d12 (máximo)
];

const DICE_RE = /^(\d+)d(\d+)(.*)$/;
const FIXED_RE = /^(\d+)(.*)$/;

export interface StepUpOptions {
  /**
   * Permite resolver o dado no ramo `2dX` da Tabela 3-2 quando ele não existe na
   * escala principal. Ver `TWO_DICE_LADDER`.
   */
  allowAltLadder?: boolean;
}

const formatRung = (rung: [number, number], rest: string): string => {
  const [count, faces] = rung;
  if (count === 0) return `${faces}${rest}`;
  return `${count}d${faces}${rest}`;
};

const indexIn = (
  ladder: Array<[number, number]>,
  count: number,
  faces: number
): number =>
  ladder.findIndex(
    ([rungCount, rungFaces]) => rungCount === count && rungFaces === faces
  );

/**
 * Escala em que o dado atual vive, e o índice dele nela. A principal SEMPRE
 * ganha: `1d10` existe nas duas, e uma arma 1d10 é uma arma normal — `1d10 +1`
 * continua sendo `1d12`. O ramo alternativo só é consultado para dados que a
 * principal não conhece (`2d6`, `2d8`, `2d10`, `3d10`).
 */
const resolveLadder = (
  count: number,
  faces: number,
  options?: StepUpOptions
): { ladder: Array<[number, number]>; index: number } | null => {
  const primary = indexIn(DAMAGE_LADDER, count, faces);
  if (primary !== -1) return { ladder: DAMAGE_LADDER, index: primary };
  if (!options?.allowAltLadder) return null;
  const alt = indexIn(TWO_DICE_LADDER, count, faces);
  if (alt !== -1) return { ladder: TWO_DICE_LADDER, index: alt };
  return null;
};

const stepUpSinglePart = (
  part: string,
  steps: number,
  options?: StepUpOptions
): string => {
  const trimmed = part.trim();

  const diceMatch = trimmed.match(DICE_RE);
  if (diceMatch) {
    const [, countStr, facesStr, rest] = diceMatch;
    const count = parseInt(countStr, 10);
    const faces = parseInt(facesStr, 10);
    const resolved = resolveLadder(count, faces, options);
    if (!resolved) return part;
    const { ladder, index } = resolved;
    const targetIdx = Math.min(ladder.length - 1, Math.max(0, index + steps));
    return formatRung(ladder[targetIdx], rest);
  }

  // Dano fixo "1" (com possível modificador, ex: "1+2")
  const fixedMatch = trimmed.match(FIXED_RE);
  if (fixedMatch) {
    const [, valueStr, rest] = fixedMatch;
    if (parseInt(valueStr, 10) === 1) {
      const targetIdx = Math.min(DAMAGE_LADDER.length - 1, Math.max(0, steps));
      return formatRung(DAMAGE_LADDER[targetIdx], rest);
    }
  }

  return part;
};

// Aumenta o dado de dano em N passos seguindo a escala canônica do Tormenta 20.
// Suporta strings compostas (ex: "1d8/1d10") e retorna a string original quando
// não há dado parsável (ex: "-").
export const stepUpDamage = (
  damage: string,
  steps: number,
  options?: StepUpOptions
): string => {
  if (!damage || steps === 0) return damage;
  return damage
    .split('/')
    .map((part) => stepUpSinglePart(part, steps, options))
    .join('/');
};

/**
 * Média esperada de uma string de dano, usada para comparar degraus que vivem em
 * ramos DIFERENTES da Tabela 3-2 (onde o índice na escada não é comparável:
 * `2d8`, índice 8 no ramo alternativo, vale mais que `1d12`, índice 7 no
 * principal). Lê apenas o primeiro modo de uma string composta e ignora o
 * modificador fixo — o que interessa é a ordem, não o valor exato.
 */
export const damageAverage = (damage: string): number => {
  const [first] = (damage || '').split('/');
  const match = first.trim().match(DICE_RE);
  if (!match) {
    const fixed = first.trim().match(FIXED_RE);
    return fixed ? parseInt(fixed[1], 10) : 0;
  }
  const count = parseInt(match[1], 10);
  const faces = parseInt(match[2], 10);
  return (count * (faces + 1)) / 2;
};

const addBonusToSinglePart = (part: string, bonus: number): string => {
  const trimmed = part.trim();
  if (!trimmed || trimmed === '-') return part;
  // Captura um modificador fixo já existente (ex: "2d6+2") para mesclar em vez
  // de duplicar; mantém o lado esquerdo (dado) intacto.
  const match = trimmed.match(/^(.*?)([+-]\d+)?$/);
  if (!match) return trimmed;
  const base = match[1];
  const existing = match[2] ? parseInt(match[2], 10) : 0;
  const total = existing + bonus;
  if (total === 0) return base;
  return total > 0 ? `${base}+${total}` : `${base}${total}`;
};

// Soma um bônus fixo de dano a uma string de dano. Diferente de concatenar
// "+N" diretamente, trata corretamente o modo duplo (cada lado do "/" recebe o
// bônus, ex: "1d6/1d6" + 5 => "1d6+5/1d6+5") e mescla um modificador já
// presente (ex: "2d6+2" + 5 => "2d6+7"). Retorna a string original quando não
// há nada parsável (ex: "-").
export const addFlatDamageBonus = (damage: string, bonus: number): string => {
  if (!damage || bonus === 0) return damage;
  return damage
    .split('/')
    .map((part) => addBonusToSinglePart(part, bonus))
    .join('/');
};
