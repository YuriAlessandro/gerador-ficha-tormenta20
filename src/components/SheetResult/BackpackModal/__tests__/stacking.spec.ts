import Equipment, { BagEquipments } from '../../../../interfaces/Equipment';
import { isStackable } from '../stacking';
import { addItemToEquipments } from '../useBackpackState';

function emptyBag(): BagEquipments {
  return {
    Arma: [],
    Armadura: [],
    Escudo: [],
    'Item Geral': [],
    Alquimía: [],
    Esotérico: [],
    Vestuário: [],
    Hospedagem: [],
    Alimentação: [],
    Animal: [],
    Veículo: [],
    Serviço: [],
  };
}

const adaga = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'adaga-base',
  nome: 'Adaga',
  group: 'Arma',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  preco: 2,
  ...over,
});

/** Adaga da Tormenta: adaga de catálogo com apelido + os dois encantamentos. */
const adagaDaTormenta = (): Equipment =>
  adaga({
    id: 'adaga-tormenta',
    customDisplayName: 'Adaga da Tormenta',
    dano: '1d4+2',
    atkBonus: 2,
    hasManualEdits: undefined,
    enchantments: [{ enchantment: 'Formidável' }, { enchantment: 'Tumular' }],
  });

describe('isStackable', () => {
  test('um item de catálogo intocado empilha', () => {
    expect(isStackable(adaga())).toBe(true);
  });

  test('encantamentos tornam o item único', () => {
    expect(
      isStackable(adaga({ enchantments: [{ enchantment: 'Tumular' }] }))
    ).toBe(false);
  });

  test('modificações tornam o item único', () => {
    expect(isStackable(adaga({ modifications: [{ mod: 'Certeira' }] }))).toBe(
      false
    );
  });

  test('apelido torna o item único', () => {
    expect(isStackable(adaga({ customDisplayName: 'Adaga da Tormenta' }))).toBe(
      false
    );
  });

  test('estatísticas editadas à mão tornam o item único', () => {
    expect(isStackable(adaga({ hasManualEdits: true }))).toBe(false);
  });

  test('arrays vazios não impedem o empilhamento', () => {
    expect(isStackable(adaga({ enchantments: [], modifications: [] }))).toBe(
      true
    );
  });

  test('apelido só com espaços não conta como identidade própria', () => {
    expect(isStackable(adaga({ customDisplayName: '   ' }))).toBe(true);
  });
});

describe('addItemToEquipments - empilhamento', () => {
  test('duas adagas comuns continuam empilhando', () => {
    const bag = emptyBag();
    bag.Arma = [adaga()];

    const { equipments } = addItemToEquipments(
      bag,
      ['adaga-base'],
      adaga({ id: 'adaga-2' }),
      1
    );

    expect(equipments.Arma).toHaveLength(1);
    expect(equipments.Arma[0].quantity).toBe(2);
  });

  test('adaga comum NÃO empilha na Adaga da Tormenta encantada', () => {
    // O bug: o merge mantinha `existing` e só somava quantity, devolvendo duas
    // adagas encantadas e sumindo com a adaga comum.
    const bag = emptyBag();
    bag.Arma = [adagaDaTormenta()];

    const { equipments } = addItemToEquipments(
      bag,
      ['adaga-tormenta'],
      adaga({ id: 'adaga-comum' }),
      1
    );

    expect(equipments.Arma).toHaveLength(2);
    const encantada = equipments.Arma.find((i) => i.id === 'adaga-tormenta')!;
    const comum = equipments.Arma.find((i) => i.id === 'adaga-comum')!;
    expect(encantada.quantity ?? 1).toBe(1);
    expect(encantada.enchantments).toHaveLength(2);
    expect(comum.enchantments).toBeUndefined();
    expect(comum.dano).toBe('1d4');
  });

  test('a Adaga da Tormenta não empilha numa adaga comum já na mochila', () => {
    // Ordem inversa: aqui o bug perdia os encantamentos do item adicionado.
    const bag = emptyBag();
    bag.Arma = [adaga()];

    const { equipments } = addItemToEquipments(
      bag,
      ['adaga-base'],
      adagaDaTormenta(),
      1
    );

    expect(equipments.Arma).toHaveLength(2);
    const encantada = equipments.Arma.find((i) => i.id === 'adaga-tormenta')!;
    expect(encantada.enchantments).toHaveLength(2);
    expect(encantada.customDisplayName).toBe('Adaga da Tormenta');
  });

  test('itens que não empilham recebem ids distintos', () => {
    // Sem isso, as duas entradas agem como uma só: empunhadura, edição e
    // remoção resolvem por id.
    const bag = emptyBag();
    bag.Arma = [adagaDaTormenta()];

    const { equipments } = addItemToEquipments(
      bag,
      ['adaga-tormenta'],
      adaga({ id: 'adaga-tormenta' }), // mesmo id, como vem do catálogo contaminado
      1
    );

    expect(equipments.Arma).toHaveLength(2);
    const ids = equipments.Arma.map((i) => i.id);
    expect(new Set(ids).size).toBe(2);
  });

  test('não guarda a referência do objeto recebido (catálogo é compartilhado)', () => {
    const bag = emptyBag();
    const doCatalogo = adaga({ id: undefined });

    const { equipments } = addItemToEquipments(bag, [], doCatalogo, 1);

    expect(equipments.Arma[0]).not.toBe(doCatalogo);
    expect(doCatalogo.id).toBeUndefined(); // não contaminou o catálogo
  });

  test('o displayOrder recebe o id realmente inserido', () => {
    const bag = emptyBag();
    bag.Arma = [adagaDaTormenta()];

    const { displayOrder, equipments, addedId } = addItemToEquipments(
      bag,
      ['adaga-tormenta'],
      adaga({ id: 'adaga-tormenta' }),
      1
    );

    const inserido = equipments.Arma.find((i) => i.id !== 'adaga-tormenta')!;
    expect(addedId).toBe(inserido.id);
    expect(displayOrder).toContain(inserido.id);
  });

  test('duas Adagas da Tormenta não se fundem entre si', () => {
    const bag = emptyBag();
    bag.Arma = [adagaDaTormenta()];

    const { equipments } = addItemToEquipments(
      bag,
      ['adaga-tormenta'],
      { ...adagaDaTormenta(), id: 'adaga-tormenta-2' },
      1
    );

    expect(equipments.Arma).toHaveLength(2);
  });
});
