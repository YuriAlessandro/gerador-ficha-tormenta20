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

const DICE_RE = /^(\d+)d(\d+)(.*)$/;
const FIXED_RE = /^(\d+)(.*)$/;

const formatRung = (rung: [number, number], rest: string): string => {
  const [count, faces] = rung;
  if (count === 0) return `${faces}${rest}`;
  return `${count}d${faces}${rest}`;
};

const findLadderIndex = (count: number, faces: number): number =>
  DAMAGE_LADDER.findIndex(
    ([rungCount, rungFaces]) => rungCount === count && rungFaces === faces
  );

const stepUpSinglePart = (part: string, steps: number): string => {
  const trimmed = part.trim();

  const diceMatch = trimmed.match(DICE_RE);
  if (diceMatch) {
    const [, countStr, facesStr, rest] = diceMatch;
    const count = parseInt(countStr, 10);
    const faces = parseInt(facesStr, 10);
    const idx = findLadderIndex(count, faces);
    if (idx === -1) return part;
    const targetIdx = Math.min(
      DAMAGE_LADDER.length - 1,
      Math.max(0, idx + steps)
    );
    return formatRung(DAMAGE_LADDER[targetIdx], rest);
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
export const stepUpDamage = (damage: string, steps: number): string => {
  if (!damage || steps === 0) return damage;
  return damage
    .split('/')
    .map((part) => stepUpSinglePart(part, steps))
    .join('/');
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
