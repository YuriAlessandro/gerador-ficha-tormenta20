import {
  AMMO_LABELS,
  calcAmmoSpaces,
  findAmmoStack,
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
