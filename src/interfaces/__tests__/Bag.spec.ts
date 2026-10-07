import { describe, it, expect } from 'vitest';
import Bag, { getItemSpaces, stackByName } from '../Bag';
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

/**
 * Regressão de "aumento a quantidade e a ficha não registra; para apagar tenho
 * que remover o mesmo item 3 vezes".
 *
 * A concessão de itens alquímicos (Laboratório Pessoal) punha a MESMA
 * referência do catálogo N vezes na mochila, e as N entradas ficavam com um id
 * só. Exibição, edição e remoção resolvem por id, então as N viravam um card
 * que não obedecia.
 */
describe('Bag — ids únicos', () => {
  const fogo = (over: Partial<Equipment> = {}): Equipment => ({
    nome: 'Fogo alquímico',
    group: 'Alquimía',
    spaces: 0.5,
    preco: 10,
    ...over,
  });

  it('ficha salva com ids repetidos é reparada ao carregar', () => {
    const stored = {
      equipments: {
        Alquimía: [
          fogo({ id: 'dup', quantity: 2 }),
          fogo({ id: 'dup' }),
          fogo({ id: 'dup' }),
        ],
      },
      displayOrder: ['dup'],
    } as unknown as Parameters<typeof Bag.fromStored>[0];

    const bag = Bag.fromStored(stored);

    const ids = bag.equipments.Alquimía.map((e) => e.id);
    expect(new Set(ids).size).toBe(3);
    // A primeira ocorrência mantém o id: é para ela que empunhadura e
    // displayOrder salvos apontam.
    expect(ids[0]).toBe('dup');
    expect(bag.equipments.Alquimía[0].quantity).toBe(2);
    expect(bag.displayOrder).toEqual(ids);
    expect(bag.getOrderedEquipments()).toHaveLength(3);
  });

  it('a mesma referência adicionada N vezes vira N itens distintos, sem mutar as posições irmãs', () => {
    const catalogItem = fogo();
    const bag = new Bag({}, true);

    bag.addEquipment({ Alquimía: [catalogItem, catalogItem, catalogItem] });

    const list = bag.equipments.Alquimía;
    expect(new Set(list.map((e) => e.id)).size).toBe(3);
    expect(list[1]).not.toBe(list[0]);
    expect(list[2]).not.toBe(list[0]);
  });

  it('id repetido entre categorias diferentes também é separado', () => {
    const bag = Bag.fromStored({
      equipments: {
        'Item Geral': [
          { id: 'x', nome: 'Corda', group: 'Item Geral', spaces: 1 },
        ],
        Alquimía: [fogo({ id: 'x' })],
      },
    } as unknown as Parameters<typeof Bag.fromStored>[0]);

    expect(bag.equipments['Item Geral'][0].id).toBe('x');
    expect(bag.equipments.Alquimía[0].id).not.toBe('x');
  });
});

describe('stackByName', () => {
  const item = (nome: string, over: Partial<Equipment> = {}): Equipment => ({
    nome,
    group: 'Alquimía',
    spaces: 0.5,
    ...over,
  });

  it('agrupa repetidos em uma entrada com quantity', () => {
    const fogo = item('Fogo alquímico');
    const acido = item('Ácido');

    const stacked = stackByName([fogo, acido, fogo, fogo]);

    expect(stacked.map((e) => [e.nome, e.quantity])).toEqual([
      ['Fogo alquímico', 3],
      ['Ácido', 1],
    ]);
  });

  it('devolve clones sem id e não toca no objeto de origem', () => {
    const fogo = item('Fogo alquímico', { id: 'catalogo' });

    const [stacked] = stackByName([fogo, fogo]);

    expect(stacked).not.toBe(fogo);
    expect(stacked.id).toBeUndefined();
    expect(fogo).toEqual(item('Fogo alquímico', { id: 'catalogo' }));
  });

  it('concessão empilhada entra na mochila como UMA entrada ocupando o mesmo espaço', () => {
    const fogo = item('Fogo alquímico');
    const bag = new Bag({}, true);

    bag.addEquipment({ Alquimía: stackByName([fogo, fogo, fogo]) });

    expect(bag.equipments.Alquimía).toHaveLength(1);
    expect(bag.equipments.Alquimía[0].quantity).toBe(3);
    expect(bag.getSpaces()).toBe(1.5);
    // O catálogo não ganha id nem quantity.
    expect(fogo).toEqual(item('Fogo alquímico'));
  });
});
