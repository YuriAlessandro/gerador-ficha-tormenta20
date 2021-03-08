import nomes from '../../utils/nomes';
import { generateRandomName } from '../general';

function getSplittedName(name) {
  const [firstName, ...rest] = name.split(' ');

  return [firstName, rest.join(' ')];
}
describe('Testa se é gerado nomes corretamente', () => {
  test('Se Osteon gera com base na raça antiga', () => {
    const race = {
      name: 'Osteon',
      oldRace: {
        name: 'Dahllan',
      },
    };

    const sex = 'Homem';

    const received = generateRandomName(race, sex);
    const namesArray = nomes[race.oldRace.name][sex];

    expect(namesArray).toContain(received);
  });

  test('Se Lefou gera um nome de cada tabela', () => {
    const race = {
      name: 'Lefou',
    };

    const sex = 'Mulher';

    const name = generateRandomName(race, sex);

    const [receivedFirst, receivedSecond] = getSplittedName(name);

    const firstNameArray = nomes[race.name].primeiroNome;
    const secondNameArray = nomes[race.name].segundoNome[sex];

    expect(firstNameArray).toContain(receivedFirst);
    expect(secondNameArray).toContain(receivedSecond);
  });
});
