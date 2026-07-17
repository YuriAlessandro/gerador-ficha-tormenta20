import { describe, it, expect } from 'vitest';
import Bag from '../Bag';

/**
 * Regressão do bug "itens padrão voltando sozinhos ao inventário".
 *
 * O construtor do Bag injeta Mochila/Saco de dormir/Traje de viajante por padrão.
 * Ao re-hidratar uma ficha salva (localStorage/cloud/socket), esses defaults NÃO
 * devem ser reinjetados — senão itens apagados pelo usuário reaparecem a cada reload.
 *
 * `Bag.fromStored` é a porta de entrada única para essa re-hidratação e sempre pula
 * os defaults. Este teste trava o comportamento (o bug já regrediu duas vezes).
 */
describe('Bag.fromStored (re-hidratação de ficha salva)', () => {
  const DEFAULT_NAMES = ['Mochila', 'Saco de dormir', 'Traje de viajante'];

  it('não reinjeta os itens padrão quando o usuário esvaziou "Item Geral"', () => {
    // Ficha salva onde o usuário apagou todos os defaults.
    const stored = {
      equipments: { 'Item Geral': [] },
    } as unknown as Parameters<typeof Bag.fromStored>[0];

    const bag = Bag.fromStored(stored);

    expect(bag.equipments['Item Geral']).toEqual([]);
  });

  it('preserva itens salvos sem misturar os defaults', () => {
    const stored = {
      equipments: {
        'Item Geral': [{ nome: 'Corda', group: 'Item Geral', spaces: 1 }],
      },
    } as unknown as Parameters<typeof Bag.fromStored>[0];

    const bag = Bag.fromStored(stored);

    const names = bag.equipments['Item Geral'].map((e) => e.nome);
    expect(names).toEqual(['Corda']);
    DEFAULT_NAMES.forEach((d) => expect(names).not.toContain(d));
  });

  it('lida com bag indefinido (ficha sem mochila salva)', () => {
    const bag = Bag.fromStored(undefined);
    expect(bag.equipments['Item Geral']).toEqual([]);
  });

  it('preserva o displayOrder salvo', () => {
    const stored = {
      equipments: {
        'Item Geral': [
          { nome: 'Corda', group: 'Item Geral', spaces: 1, id: 'a' },
        ],
      },
      displayOrder: ['a'],
    } as unknown as Parameters<typeof Bag.fromStored>[0];

    const bag = Bag.fromStored(stored);
    expect(bag.displayOrder).toEqual(['a']);
  });

  it('construtor padrão (criação de personagem) ainda traz os defaults', () => {
    const bag = new Bag();
    const names = bag.equipments['Item Geral'].map((e) => e.nome);
    DEFAULT_NAMES.forEach((d) => expect(names).toContain(d));
  });
});
