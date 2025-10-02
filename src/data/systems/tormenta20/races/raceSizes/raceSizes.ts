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
