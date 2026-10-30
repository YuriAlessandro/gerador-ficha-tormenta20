import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getRandomItemFromArray,
  isStrictRandomMode,
  pickFaith,
  pickFromArray,
  randomFloat,
  RandomGap,
  rollDice,
  runWithoutRandomness,
  shuffleArray,
  StrictRandomLimitError,
} from '../randomUtils';

/**
 * Portão de aleatoriedade (Builds v2, bloco 1B): fora do modo estrito tudo
 * sorteia como sempre; dentro dele nenhum sorteio chama `Math.random` — vira
 * lacuna registrada e a primeira opção.
 */
const forbidMathRandom = () =>
  vi.spyOn(Math, 'random').mockImplementation(() => {
    throw new Error('Math.random chamado no modo estrito');
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('modo normal', () => {
  it('consome Math.random como antes', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.99);

    expect(getRandomItemFromArray(['a', 'b', 'c'])).toBe('c');
    expect(spy).toHaveBeenCalledTimes(1);

    expect(rollDice(2, 6)).toBe(12);
    expect(spy).toHaveBeenCalledTimes(3);

    expect(randomFloat()).toBe(0.99);
    expect(spy).toHaveBeenCalledTimes(4);
  });
});

describe('modo estrito', () => {
  it('não chama Math.random e registra uma lacuna por sorteio', () => {
    forbidMathRandom();
    const gaps: RandomGap[] = [];

    const results = runWithoutRandomness(
      () => ({
        item: getRandomItemFromArray(['a', 'b'], 'X'),
        picked: pickFromArray(['a', 'b', 'c'], 2, 'Y'),
        roll: rollDice(4, 6, 1, 'Z'),
        float: randomFloat('W'),
        shuffled: shuffleArray([3, 1, 2], 'V'),
        faith: pickFaith({ Khalmyr: 0, Lena: 1 }, 'U'),
      }),
      (gap) => gaps.push(gap)
    );

    expect(results).toEqual({
      item: 'a',
      picked: ['a', 'b'],
      roll: 3,
      float: 0,
      shuffled: [3, 1, 2],
      faith: 'Lena',
    });
    expect(gaps.map((gap) => gap.label)).toEqual([
      'X',
      'Y',
      'Z',
      'W',
      'V',
      'U',
    ]);
    expect(gaps[0]).toEqual({
      label: 'X',
      kind: 'choice',
      options: ['a', 'b'],
      picked: ['a'],
    });
    expect(gaps[1]).toMatchObject({ kind: 'choice', count: 2 });
    expect(gaps[2]).toMatchObject({ kind: 'roll', count: 4 });
    expect(gaps[3]).toMatchObject({ kind: 'chance' });
    expect(gaps[4]).toMatchObject({ kind: 'order' });
    expect(gaps[5]).toMatchObject({ options: ['Lena'], picked: ['Lena'] });
  });

  it('restaura o modo normal mesmo com exceção', () => {
    expect(() =>
      runWithoutRandomness(
        () => {
          throw new Error('falhou');
        },
        () => undefined
      )
    ).toThrow('falhou');
    expect(isStrictRandomMode()).toBe(false);
  });

  it('aninhado: cada execução recebe as próprias lacunas', () => {
    forbidMathRandom();
    const outer: RandomGap[] = [];
    const inner: RandomGap[] = [];

    runWithoutRandomness(
      () => {
        runWithoutRandomness(
          () => getRandomItemFromArray([1, 2], 'interno'),
          (gap) => inner.push(gap)
        );
        expect(isStrictRandomMode()).toBe(true);
        getRandomItemFromArray([1, 2], 'externo');
      },
      (gap) => outer.push(gap)
    );

    expect(inner.map((gap) => gap.label)).toEqual(['interno']);
    expect(outer.map((gap) => gap.label)).toEqual(['externo']);
    expect(isStrictRandomMode()).toBe(false);
  });

  it('interrompe laço que depende do sorteio para terminar', () => {
    forbidMathRandom();
    expect(() =>
      runWithoutRandomness(
        () => {
          let value = rollDice(4, 6, 1, 'atributo');
          while (value < 8) value = rollDice(4, 6, 1, 'atributo');
          return value;
        },
        () => undefined
      )
    ).toThrow(StrictRandomLimitError);
    expect(isStrictRandomMode()).toBe(false);
  });
});
