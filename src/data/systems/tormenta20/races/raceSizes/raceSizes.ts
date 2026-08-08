import { raceSize, RaceSize } from '../../../../../interfaces/Race';

export const RACE_SIZES: Record<raceSize, RaceSize> = {
  MINUSCULO: {
    modifiers: {
      maneuver: -5,
      stealth: 5,
    },
    naturalRange: 1.5,
    name: 'Minúsculo',
  },
  PEQUENO: {
    modifiers: {
      maneuver: -2,
      stealth: 2,
    },
    naturalRange: 1.5,
    name: 'Pequeno',
  },
  MEDIO: {
    modifiers: {
      maneuver: 0,
      stealth: 0,
    },
    naturalRange: 1.5,
    name: 'Médio',
  },
  GRANDE: {
    modifiers: {
      maneuver: 2,
      stealth: -2,
    },
    name: 'Grande',
    naturalRange: 1.5,
  },
  ENORME: {
    modifiers: {
      maneuver: 5,
      stealth: -5,
    },
    name: 'Enorme',
    naturalRange: 1.5,
  },
  COLOSSAL: {
    modifiers: {
      maneuver: 10,
      stealth: -10,
    },
    name: 'Colossal',
    naturalRange: 1.5,
  },
};

/** Escala de tamanho, do menor para o maior. Índice = degrau. */
export const SIZE_ORDER: raceSize[] = [
  'MINUSCULO',
  'PEQUENO',
  'MEDIO',
  'GRANDE',
  'ENORME',
  'COLOSSAL',
];

// A ficha guarda o objeto `RaceSize` inteiro, e passa por JSON (localStorage,
// nuvem, socket) — a identidade com a entrada de `RACE_SIZES` se perde. O nome
// sobrevive e é único, então é ele que serve de chave reversa.
const SIZE_KEY_BY_NAME = new Map<string, raceSize>(
  SIZE_ORDER.map((key) => [RACE_SIZES[key].name, key])
);

/** Chave da categoria a partir do objeto guardado na ficha. */
export const getRaceSizeKey = (size: RaceSize | undefined): raceSize =>
  (size?.name ? SIZE_KEY_BY_NAME.get(size.name) : undefined) ?? 'MEDIO';

/** Desloca a categoria em `steps` degraus, com clamp nas duas pontas. */
export const shiftSize = (size: raceSize, steps: number): raceSize => {
  const index = SIZE_ORDER.indexOf(size);
  if (index < 0) return size;
  const shifted = Math.min(Math.max(index + steps, 0), SIZE_ORDER.length - 1);
  return SIZE_ORDER[shifted];
};

/**
 * Passo de dano das armas por categoria de tamanho.
 *
 * JDA, Toques Finais (p. 106): "Criaturas Minúsculas usam armas *reduzidas*,
 * que causam um passo a menos de dano. Criaturas Grandes e Enormes usam armas
 * *aumentadas*, que causam um passo a mais de dano, e criaturas Colossais usam
 * armas *gigantes*, que causam dois passos a mais". Pequenas e Médias usam
 * armas normais (a tabela de dano do Capítulo 3 já é a delas).
 */
export const SIZE_DAMAGE_STEP: Record<raceSize, number> = {
  MINUSCULO: -1,
  PEQUENO: 0,
  MEDIO: 0,
  GRANDE: 1,
  ENORME: 1,
  COLOSSAL: 2,
};
