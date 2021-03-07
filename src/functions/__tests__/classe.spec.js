import GUERREIRO from '../../utils/classesDetalhado/guerreiro';
import { addClassPer } from '../general.ts';

function countPers(basicPers, received) {
  return basicPers.map((group) => ({
    ...group,
    counter: group.list.reduce(
      (acc, pericia) => (received.includes(pericia) ? acc + 1 : acc),
      0
    ),
  }));
}

function getExpectedLength(classe, racePers) {
  const basicPersQtd = classe.periciasbasicas.reduce((acc, { type, list }) => {
    if (type === 'or') {
      return acc + 1;
    }

    if (type === 'and') {
      return acc + list.length;
    }

    return acc;
  }, 0);

  return classe.periciasrestantes.qtd + basicPersQtd + racePers.length;
}

describe('Testa perícias da classe Guerreiro', () => {
  const racePers = ['Cavalgar'];
  const received = addClassPer(GUERREIRO, racePers);
  const expectedLength = getExpectedLength(GUERREIRO, racePers);

  test('Se a quantidade de perícias e se mantém as perícias da raça', () => {
    expect(received).toHaveLength(expectedLength);
    expect(received).toContain('Cavalgar');
  });

  test('Se os tipos das perícias básicas estão adicionando corretamente', () => {
    const basicCounter = countPers(GUERREIRO.periciasbasicas, received);

    basicCounter.forEach(({ type, counter, list }) => {
      if (type === 'or') {
        expect(counter).toBeGreaterThan(0);
      }

      if (type === 'and') {
        expect(counter).toBe(list.length);
      }
    });
  });
});
