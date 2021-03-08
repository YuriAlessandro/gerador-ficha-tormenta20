import nomes from '../../utils/nomes';
import RACAS from '../../utils/racas';
import { generateRandomName } from '../utils';
import { Race } from '../../interfaces/CharacterSheet';

function getSplittedName(name: string) {
  const [firstName, ...rest] = name.split(' ');

  return [firstName, rest.join(' ')];
}

const races = RACAS as Race[];

describe('Testa se é gerado nomes corretamente', () => {
  test('Se Osteon gera com base na raça antiga', () => {
    const race = races.find((element) => element.name === 'Osteon') as Race;
    if (race.setup) {
      race.setup(races);
    }
    const oldRace = race.oldRace as Race;
    const sex = 'Homem';

    const received = generateRandomName(race, sex);
    const namesArray = nomes[oldRace.name][sex];

    expect(namesArray).toContain(received);
  });

  test('Se Lefou gera um nome de cada tabela', () => {
    const race = races.find((element) => element.name === 'Lefou') as Race;

    const sex = 'Mulher';

    const name = generateRandomName(race, sex);

    const [receivedFirst, receivedSecond] = getSplittedName(name);

    const firstNameArray = nomes[race.name].primeiroNome;
    const secondNameOptions = nomes[race.name].segundoNome as {
      [key: string]: string[];
    };
    const secondNameArray = secondNameOptions[sex];

    expect(firstNameArray).toContain(receivedFirst);
    expect(secondNameArray).toContain(receivedSecond);
  });
});
