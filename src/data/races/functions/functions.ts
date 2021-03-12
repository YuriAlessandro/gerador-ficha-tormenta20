import Race, { RaceSize } from '../../../interfaces/Race';
import { RACE_SIZES } from '../raceSizes/raceSizes';

export const DEFAULT_RACE_SIZE = RACE_SIZES.MEDIO;
export const DEFAULT_RACE_DISPLACEMENT = 9;

function getDefaultSize(race: Race) {
  if (race.size) {
    return race.size;
  }

  return DEFAULT_RACE_SIZE;
}

function getDefaultDisplacement(race: Race) {
  if (race.getDisplacement) {
    return race.getDisplacement(race);
  }

  return DEFAULT_RACE_DISPLACEMENT;
}

export function getRaceSize(race: Race): RaceSize {
  if (race.getSize) {
    return race.getSize(race);
  }

  return getDefaultSize(race);
}

export function getRaceDisplacement(race: Race): number {
  if (race.getDisplacement) {
    return race.getDisplacement(race);
  }

  return getDefaultDisplacement(race);
}
