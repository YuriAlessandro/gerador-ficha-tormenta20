import { injectConjuradoraSpells } from '../injectConjuradoraSpells';
import Equipment, { BagEquipments } from '../../../interfaces/Equipment';
import { Spell, spellsCircles } from '../../../interfaces/Spells';

const dummySpell: Spell = {
  nome: 'Magia personalizada do usuário',
  execucao: 'Padrão',
  alcance: 'Toque',
  duracao: 'Instantânea',
  description: 'Test',
  spellCircle: spellsCircles.c1,
  school: 'Evoc',
  isCustom: true,
};

function makeBag(items: Equipment[]): BagEquipments {
  return {
    Arma: items,
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

describe('injectConjuradoraSpells', () => {
  test('returns spells unchanged when no Conjuradora is present', () => {
    const bag = makeBag([
      {
        id: 'w1',
        nome: 'Espada Longa',
        group: 'Arma',
        dano: '1d8',
      },
    ]);
    const result = injectConjuradoraSpells([dummySpell], bag);
    expect(result).toEqual([dummySpell]);
  });

  test('strips previously-injected spells when no Conjuradora is present', () => {
    const stale: Spell = { ...dummySpell, equipmentSource: 'old-id' };
    const bag = makeBag([]);
    const result = injectConjuradoraSpells([dummySpell, stale], bag);
    expect(result).toEqual([dummySpell]);
  });

  test('injects a spell from Conjuradora item when name matches catalog', () => {
    // Curar Ferimentos exists in the divine catalog (1st circle)
    const bag = makeBag([
      {
        id: 'w1',
        nome: 'Espada Longa',
        group: 'Arma',
        dano: '1d8',
        enchantments: [
          {
            enchantment: 'Conjuradora',
            selectedSpell: 'Curar Ferimentos',
          },
        ],
      },
    ]);
    const result = injectConjuradoraSpells([], bag);
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Curar Ferimentos');
    expect(result[0].equipmentSource).toBe('w1');
  });

  test('idempotent: re-injecting yields the same list', () => {
    const bag = makeBag([
      {
        id: 'w1',
        nome: 'Espada Longa',
        group: 'Arma',
        dano: '1d8',
        enchantments: [
          { enchantment: 'Conjuradora', selectedSpell: 'Curar Ferimentos' },
        ],
      },
    ]);
    const first = injectConjuradoraSpells([], bag);
    const second = injectConjuradoraSpells(first, bag);
    expect(second).toHaveLength(1);
    expect(second[0].nome).toBe('Curar Ferimentos');
  });

  test('removes injected spell when Conjuradora is removed from the item', () => {
    const injected: Spell = {
      ...dummySpell,
      nome: 'Curar Ferimentos',
      equipmentSource: 'w1',
    };
    const bag = makeBag([
      {
        id: 'w1',
        nome: 'Espada Longa',
        group: 'Arma',
        dano: '1d8',
        enchantments: [],
      },
    ]);
    const result = injectConjuradoraSpells([injected], bag);
    expect(result).toEqual([]);
  });

  test('skips Conjuradora entry without selectedSpell', () => {
    const bag = makeBag([
      {
        id: 'w1',
        nome: 'Espada Longa',
        group: 'Arma',
        dano: '1d8',
        enchantments: [{ enchantment: 'Conjuradora' }],
      },
    ]);
    const result = injectConjuradoraSpells([], bag);
    expect(result).toEqual([]);
  });

  test('does not inject duplicate when spell is already present in sheet.spells', () => {
    const existing: Spell = { ...dummySpell, nome: 'Curar Ferimentos' };
    const bag = makeBag([
      {
        id: 'w1',
        nome: 'Espada Longa',
        group: 'Arma',
        dano: '1d8',
        enchantments: [
          { enchantment: 'Conjuradora', selectedSpell: 'Curar Ferimentos' },
        ],
      },
    ]);
    const result = injectConjuradoraSpells([existing], bag);
    // The user-owned entry stays; no duplicate injected.
    expect(result).toEqual([existing]);
  });
});
