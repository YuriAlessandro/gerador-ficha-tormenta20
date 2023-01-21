import { getRaceByName } from '../../data/races';
import { nomes, generateRandomName, lefou } from '../../data/nomes';
import Race from '../../interfaces/Race';

function getSplittedName(name: string) {
  const [firstName, ...rest] = name.split(' ');

  return [firstName, rest.join(' ')];
}

const nameTesters: Record<
  string,
  (name: string, sex: 'Homem' | 'Mulher', race: Race) => void
> = {
  default: (name, sex, race) => {
    const expectedNames = nomes[race.name][sex];
    expect(expectedNames).toContain(name);
  },
  Lefou: (name, sex) => {
    const [receivedFirst, receivedSecond] = getSplittedName(name);

    const firstNameArray = lefou.names;
    const secondNameArray = lefou.surnames[sex];

    expect(firstNameArray).toContain(receivedFirst);
    expect(secondNameArray).toContain(receivedSecond);
  },
  Osteon: (name, sex, race) => {
    if (race.oldRace) {
      if (nameTesters[race.oldRace.name]) {
        return nameTesters[race.oldRace.name](name, sex, race.oldRace);
      }
      return nameTesters.default(name, sex, race.oldRace);
    }

    throw new Error('Osteon old race not found');
  },
};

function testNameBasedOnRace(
  name: string,
  sex: 'Homem' | 'Mulher',
  race: Race
) {
  if (nameTesters[race.name]) {
    return nameTesters[race.name](name, sex, race);
  }

  return nameTesters.default(name, sex, race);
}

describe('Testa nomes são gerados corretamente', () => {
  test('Pro osteon com base na raça Lefou', () => {
    const race = getRaceByName('Osteon');
    race.oldRace = getRaceByName('Lefou');
    const sex = 'Homem';

    const name = generateRandomName(race, sex);

    testNameBasedOnRace(name, sex, race);
  });

  test('Pro Osteon com base em raça aleatória', () => {
    Array(10)
      .fill(0)
      .forEach(() => {
        const race = getRaceByName('Osteon');
        const sex = 'Homem';

        const name = generateRandomName(race, sex);

        testNameBasedOnRace(name, sex, race);
      });
  });

  test('Pro Lefou', () => {
    const race = getRaceByName('Lefou');

    const sex = 'Mulher';

    const name = generateRandomName(race, sex);

    testNameBasedOnRace(name, sex, race);
  });
});
