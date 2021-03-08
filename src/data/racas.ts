import AGGELUS from './racasDetalhado/aggelus';
import ANAO from './racasDetalhado/anao';
import DAHLLAN from './racasDetalhado/dahllan';
import ELFO from './racasDetalhado/elfo';
import GOBLIN from './racasDetalhado/goblin';
import LEFEU from './racasDetalhado/lefou';
import MINOTAURO from './racasDetalhado/minotauro';
import QAREEN from './racasDetalhado/qareen';
import GOLEM from './racasDetalhado/golem';
import HYNNE from './racasDetalhado/hynne';
import HUMANO from './racasDetalhado/humano';
import KLIREN from './racasDetalhado/kliren';
import MEDUSA from './racasDetalhado/medusa';
import OSTEON from './racasDetalhado/osteon';
import SEREIA from './racasDetalhado/sereia';
import SILFIDE from './racasDetalhado/silfide';
import SULFURE from './racasDetalhado/sulfure';
import TROG from './racasDetalhado/trog';
import Race from '../interfaces/Race';
import { getRandomItemFromArray } from '../functions/randomUtils';

const RACAS = [
  AGGELUS,
  ANAO,
  DAHLLAN,
  ELFO,
  GOBLIN,
  LEFEU,
  MINOTAURO,
  QAREEN,
  GOLEM,
  HYNNE,
  HUMANO,
  KLIREN,
  MEDUSA,
  OSTEON,
  SEREIA,
  SILFIDE,
  SULFURE,
  TROG,
];

export default RACAS;

type RaceGenerator = {
  (race: Race): Race;
};

const raceSetups: Record<string, RaceGenerator> = {
  default(race) {
    return race;
  },

  Osteon(race) {
    const validRaces = RACAS.filter(
      (element) => element.name !== 'Golem' && element.name !== 'Osteon'
    );

    return {
      ...race,
      oldRace: getRandomItemFromArray(validRaces),
    };
  },
};

export function setupRace(race: Race): Race {
  if (raceSetups[race.name]) {
    return raceSetups[race.name](race);
  }

  return raceSetups.default(race);
}

export function getRaceByName(name: string): Race {
  const race = RACAS.find((element) => element.name === name);
  if (race) {
    return setupRace(race);
  }

  const [defaultRace] = RACAS;

  return setupRace(defaultRace);
}
