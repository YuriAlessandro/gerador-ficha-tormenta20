import { describe, it, expect } from 'vitest';
import Bag, { getItemSpaces } from '../Bag';
import Equipment from '../Equipment';

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

/**
 * `getItemSpaces` é a conta canônica de espaço por item — a ficha, a modal da
 * Mochila e o PDF passam todos por aqui. Munição normalmente ignora `spaces` e
 * deriva o custo das unidades restantes; um espaço digitado à mão precisa
 * vencer essa regra, senão zerar munição não surte efeito nenhum.
 */
describe('getItemSpaces — override manual de espaço', () => {
  const flechas = {
    nome: 'Flechas (20)',
    group: 'Arma',
    isAmmo: true,
    ammoUnitsPerSpace: 20,
    unitsRemaining: 40,
    spaces: 1,
  } as unknown as Equipment;

  it('munição sem edição manual usa a regra de unidades por espaço', () => {
    expect(getItemSpaces(flechas)).toBe(2);
  });

  it('munição com espaço manual usa o valor digitado', () => {
    expect(
      getItemSpaces({ ...flechas, spaces: 0, hasManualSpaces: true })
    ).toBe(0);
  });

  it('item comum multiplica espaço por quantidade', () => {
    const corda = {
      nome: 'Corda',
      group: 'Item Geral',
      spaces: 1,
      quantity: 3,
    } as unknown as Equipment;
    expect(getItemSpaces(corda)).toBe(3);
  });
});
