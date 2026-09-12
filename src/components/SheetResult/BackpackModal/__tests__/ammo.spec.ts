import {
  AMMO_LABELS,
  ammoTypeLabel,
  calcAmmoSpaces,
  findAmmoStack,
  findConsumableAmmoStack,
  getAmmoTypeSuggestions,
  getAmmoUnits,
  seedAmmoUnits,
} from '../ammo';
import Equipment, { BagEquipments } from '../../../../interfaces/Equipment';

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

describe('AMMO_LABELS', () => {
  test('has a label for every ammo type', () => {
    expect(AMMO_LABELS.Flechas).toBe('Flechas');
    expect(AMMO_LABELS.Virotes).toBe('Virotes');
    expect(AMMO_LABELS.Balas).toBe('Balas');
    expect(AMMO_LABELS.Pedras).toBe('Pedras');
    expect(AMMO_LABELS['Bola de Ferro']).toBe('Bolas de Ferro');
  });
});

describe('calcAmmoSpaces', () => {
  test('returns 0 for non-ammo items', () => {
    const sword: Equipment = { id: 'a', nome: 'Espada', group: 'Arma' };
    expect(calcAmmoSpaces(sword)).toBe(0);
  });

  test('uses ceil(units / unitsPerSpace) — default 20', () => {
    const flechas: Equipment = {
      id: 'b',
      nome: 'Flechas (20)',
      group: 'Arma',
      isAmmo: true,
      ammoType: 'Flechas',
      ammoPackSize: 20,
      unitsRemaining: 47,
    };
    expect(calcAmmoSpaces(flechas)).toBe(3);
  });

  test('honors ammoUnitsPerSpace override (Bola de Ferro = 2)', () => {
    const bolas: Equipment = {
      id: 'c',
      nome: 'Bola de ferro (1)',
      group: 'Arma',
      isAmmo: true,
      ammoType: 'Bola de Ferro',
      ammoPackSize: 1,
      ammoUnitsPerSpace: 2,
      unitsRemaining: 5,
    };
    expect(calcAmmoSpaces(bolas)).toBe(3);
  });

  test('returns 0 when stack is empty', () => {
    const empty: Equipment = {
      id: 'd',
      nome: 'Flechas (20)',
      group: 'Arma',
      isAmmo: true,
      ammoPackSize: 20,
      unitsRemaining: 0,
    };
    expect(calcAmmoSpaces(empty)).toBe(0);
  });
});

describe('findAmmoStack / getAmmoUnits', () => {
  test('finds the ammo stack matching a type', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'b',
        nome: 'Flechas (20)',
        group: 'Arma',
        isAmmo: true,
        ammoType: 'Flechas',
        ammoPackSize: 20,
        unitsRemaining: 40,
      },
    ];
    const stack = findAmmoStack(bag, 'Flechas');
    expect(stack?.id).toBe('b');
    expect(getAmmoUnits(bag, 'Flechas')).toBe(40);
  });

  test('returns undefined / 0 when no stack matches', () => {
    const bag = emptyBag();
    expect(findAmmoStack(bag, 'Virotes')).toBeUndefined();
    expect(getAmmoUnits(bag, 'Virotes')).toBe(0);
  });

  test('ignores non-ammo items even when names overlap', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'x',
        nome: 'Flechas (20)',
        group: 'Arma',
        // no isAmmo flag — would be a coincidental name in a custom item
      },
    ];
    expect(findAmmoStack(bag, 'Flechas')).toBeUndefined();
  });
});

describe('seedAmmoUnits (legacy migration)', () => {
  test('enriches legacy ammo by name and seeds unitsRemaining', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'a',
        nome: 'Flechas (20)',
        group: 'Arma',
        quantity: 2,
      },
    ];
    seedAmmoUnits(bag);
    const item = bag.Arma[0];
    expect(item.isAmmo).toBe(true);
    expect(item.ammoType).toBe('Flechas');
    expect(item.ammoPackSize).toBe(20);
    expect(item.unitsRemaining).toBe(40);
    expect(item.quantity).toBe(1);
  });

  test('migra a Munição genérica do tesouro SEM inventar um ammoType', () => {
    // 'Munição (20)' sai da tabela de tesouro e a linha do livro não diz de que
    // tipo é. Ela ganha contador e espaços como as outras, mas cravar um tipo
    // aqui decidiria a regra em silêncio — quem escolhe é o jogador, no editor.
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'm',
        nome: 'Munição (20)',
        group: 'Arma',
        quantity: 1,
      },
    ];
    seedAmmoUnits(bag);
    const item = bag.Arma[0];
    expect(item.isAmmo).toBe(true);
    expect(item.ammoType).toBeUndefined();
    expect(item.ammoPackSize).toBe(20);
    expect(item.unitsRemaining).toBe(20);
  });

  test('não apaga um ammoType que o jogador já escolheu para a Munição genérica', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'm',
        nome: 'Munição (20)',
        group: 'Arma',
        ammoType: 'Balas',
      },
    ];
    seedAmmoUnits(bag);
    expect(bag.Arma[0].ammoType).toBe('Balas');
  });

  test('handles Bola de ferro legacy with packSize=1, unitsPerSpace=2', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'b',
        nome: 'Bola de ferro (1)',
        group: 'Arma',
        quantity: 5,
      },
    ];
    seedAmmoUnits(bag);
    const item = bag.Arma[0];
    expect(item.isAmmo).toBe(true);
    expect(item.ammoType).toBe('Bola de Ferro');
    expect(item.ammoUnitsPerSpace).toBe(2);
    expect(item.unitsRemaining).toBe(5);
  });

  test('is idempotent: second run does not double units', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'a',
        nome: 'Flechas (20)',
        group: 'Arma',
        quantity: 2,
      },
    ];
    seedAmmoUnits(bag);
    const before = bag.Arma[0].unitsRemaining;
    seedAmmoUnits(bag);
    expect(bag.Arma[0].unitsRemaining).toBe(before);
  });

  test('does not touch non-ammo items', () => {
    const bag = emptyBag();
    bag.Arma = [{ id: 'x', nome: 'Espada', group: 'Arma', quantity: 1 }];
    seedAmmoUnits(bag);
    expect(bag.Arma[0].isAmmo).toBeUndefined();
    expect(bag.Arma[0].unitsRemaining).toBeUndefined();
  });

  test('respects existing isAmmo + unitsRemaining (already migrated)', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'a',
        nome: 'Flechas (20)',
        group: 'Arma',
        isAmmo: true,
        ammoType: 'Flechas',
        ammoPackSize: 20,
        unitsRemaining: 17,
        quantity: 1,
      },
    ];
    seedAmmoUnits(bag);
    expect(bag.Arma[0].unitsRemaining).toBe(17);
  });
});

/**
 * Munição autoral convive com a oficial: "Flechas élficas (10)" ao lado de
 * "Flechas (20)". Pilhas `isCustom` também nunca empilham entre si. Tratar só a
 * primeira escondia metade do estoque e, pior, fazia o ataque virar um no-op
 * silencioso assim que ela zerava.
 */
describe('várias pilhas do mesmo tipo', () => {
  const twoStacks = (
    firstUnits: number,
    secondUnits: number
  ): BagEquipments => {
    const b = emptyBag();
    b.Arma = [
      {
        id: 'a',
        nome: 'Flechas (20)',
        group: 'Arma',
        isAmmo: true,
        ammoType: 'Flechas',
        unitsRemaining: firstUnits,
      },
      {
        id: 'b',
        nome: 'Flechas élficas (10)',
        group: 'Arma',
        isAmmo: true,
        isCustom: true,
        ammoType: 'Flechas',
        unitsRemaining: secondUnits,
      },
    ];
    return b;
  };

  test('o contador SOMA todas as pilhas do tipo', () => {
    expect(getAmmoUnits(twoStacks(20, 10), 'Flechas')).toBe(30);
  });

  test('a pilha consumível pula a que está vazia', () => {
    const bag = twoStacks(0, 10);
    // `findAmmoStack` segue devolvendo a primeira (é o leitor de identidade)…
    expect(findAmmoStack(bag, 'Flechas')?.id).toBe('a');
    // …mas quem gasta projétil pega a que ainda tem saldo.
    expect(findConsumableAmmoStack(bag, 'Flechas')?.id).toBe('b');
  });

  test('sem saldo em nenhuma pilha, não há de onde consumir', () => {
    expect(findConsumableAmmoStack(twoStacks(0, 0), 'Flechas')).toBeUndefined();
    expect(getAmmoUnits(twoStacks(0, 0), 'Flechas')).toBe(0);
  });
});

describe('vocabulário aberto de tipos de munição', () => {
  test('ammoTypeLabel cai no próprio nome para tipo autoral', () => {
    expect(ammoTypeLabel('Flechas')).toBe('Flechas');
    expect(ammoTypeLabel('Bola de Ferro')).toBe('Bolas de Ferro');
    expect(ammoTypeLabel('Cartuchos a vapor')).toBe('Cartuchos a vapor');
  });

  test('uma arma encontra a pilha de um tipo autoral', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'c',
        nome: 'Cartuchos a vapor (6)',
        group: 'Arma',
        isAmmo: true,
        isCustom: true,
        ammoType: 'Cartuchos a vapor',
        unitsRemaining: 6,
      },
    ];
    expect(getAmmoUnits(bag, 'Cartuchos a vapor')).toBe(6);
    expect(findConsumableAmmoStack(bag, 'Cartuchos a vapor')?.id).toBe('c');
  });

  test('as sugestões trazem os 5 do livro mais os tipos da mochila', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'c',
        nome: 'Cartuchos a vapor (6)',
        group: 'Arma',
        isAmmo: true,
        ammoType: 'Cartuchos a vapor',
      },
      // Arma apontando para um tipo NÃO entra: quem define o vocabulário é o
      // pacote de munição, senão um typo na arma viraria sugestão.
      {
        id: 'w',
        nome: 'Pistola a vapor',
        group: 'Arma',
        ammoType: 'Cartuxos a vapor',
      },
    ];
    const suggestions = getAmmoTypeSuggestions(bag);
    expect(suggestions).toContain('Flechas');
    expect(suggestions).toContain('Bola de Ferro');
    expect(suggestions).toContain('Cartuchos a vapor');
    expect(suggestions).not.toContain('Cartuxos a vapor');
  });

  test('as sugestões não repetem um tipo do livro já presente na mochila', () => {
    const bag = emptyBag();
    bag.Arma = [
      {
        id: 'a',
        nome: 'Flechas (20)',
        group: 'Arma',
        isAmmo: true,
        ammoType: 'Flechas',
      },
    ];
    const suggestions = getAmmoTypeSuggestions(bag);
    expect(suggestions.filter((t) => t === 'Flechas')).toHaveLength(1);
  });
});
