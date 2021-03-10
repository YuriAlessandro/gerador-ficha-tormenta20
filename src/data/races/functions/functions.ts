import Race, { RaceSize } from '../../../interfaces/Race';
import { RACE_SIZES } from '../raceSizes/raceSizes';

function getDefaultSize(race: Race) {
  if (race.size) {
    return race.size;
  }

  return RACE_SIZES.MEDIO;
}

const DEFAULT_RACE_DISPLACEMENT = 9;

function getDefaultDisplacement(race: Race) {
  if (race.displacement) {
    return race.displacement;
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