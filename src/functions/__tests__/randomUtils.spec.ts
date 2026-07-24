import { pickFromArray, pickFromAllowed } from '../randomUtils';

/**
 * Regressão do crash "Cannot read properties of undefined (reading
 * 'normalize')" no painel de fichas da mesa: o sorteio completava o pedido com
 * `undefined` quando as opções acabavam, e esses buracos vazavam para dentro da
 * ficha (proficiências, perícias, poderes concedidos) para explodir muito
 * depois, longe da origem.
 */
describe('pickFromArray', () => {
  it('devolve a quantidade pedida quando há opções suficientes', () => {
    const picked = pickFromArray(['a', 'b', 'c', 'd'], 3);

    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
    picked.forEach((p) => expect(['a', 'b', 'c', 'd']).toContain(p));
  });

  it('para no que existe quando o pool é menor que o pedido (sem undefined)', () => {
    const picked = pickFromArray(['a', 'b'], 5);

    expect(picked).toHaveLength(2);
    expect(picked).not.toContain(undefined);
    expect(new Set(picked)).toEqual(new Set(['a', 'b']));
  });

  it('devolve vazio quando não há nenhuma opção', () => {
    expect(pickFromArray([], 3)).toEqual([]);
  });
});

describe('pickFromAllowed', () => {
  it('não completa com undefined quando tudo já foi escolhido', () => {
    const picked = pickFromAllowed(
      ['Armaduras Pesadas', 'Escudos'],
      2,
      ['Escudos'] // personagem já é proficiente com escudos
    );

    expect(picked).toEqual(['Armaduras Pesadas']);
  });

  it('devolve vazio quando o personagem já tem todas as opções', () => {
    expect(pickFromAllowed(['Armas de Fogo'], 1, ['Armas de Fogo'])).toEqual(
      []
    );
  });
});
