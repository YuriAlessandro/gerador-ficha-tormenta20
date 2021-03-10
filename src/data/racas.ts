import AGGELUS from './races/aggelus';
import ANAO from './races/anao';
import DAHLLAN from './races/dahllan';
import ELFO from './races/elfo';
import GOBLIN from './races/goblin';
import LEFEU from './races/lefou';
import MINOTAURO from './races/minotauro';
import QAREEN from './races/qareen';
import GOLEM from './races/golem';
import HYNNE from './races/hynne';
import HUMANO from './races/humano';
import KLIREN from './races/kliren';
import MEDUSA from './races/medusa';
import OSTEON from './races/osteon';
import SEREIA from './races/sereia';
import SILFIDE from './races/silfide';
import SULFURE from './races/sulfure';
import TROG from './races/trog';
import Race from '../interfaces/Race';

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

export function getRaceByName(name: string): Race {
  const race = RACAS.find((element) => element.name === name);
  if (race) {
    if (race.setup) {
      return race.setup(race, RACAS);
    }
    return race;
  }

  const [defaultRace] = RACAS;
  if (defaultRace.setup) {
    return defaultRace.setup(defaultRace, RACAS);
  }
  return defaultRace;
}
