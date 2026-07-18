import { describe, expect, it } from 'vitest';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import {
  MARKET_CATEGORIES,
  getDescriptor,
  getItemKey,
  BAG_KEY_BY_GROUP,
} from '@/components/CharacterCreationWizard/steps/MarketStep/marketCategories';
import { getSupplementInitials } from '@/functions/equipmentDisplay';
import Equipment from '@/interfaces/Equipment';

const ALL_SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
];

describe('catálogo de equipamento do mercado', () => {
  it('devolve a MESMA referência para a mesma combinação de suplementos', () => {
    dataRegistry.clearCache();
    const first = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);
    const second = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);

    // Identidade estável é o que sustenta a memoização do passo Mercado.
    expect(second).toBe(first);
  });

  it('recalcula quando a combinação de suplementos muda', () => {
    dataRegistry.clearCache();
    const all = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);
    const coreOnly = dataRegistry.getEquipmentBySupplements([
      SupplementId.TORMENTA20_CORE,
    ]);

    expect(coreOnly).not.toBe(all);
    expect(coreOnly.weapons.length).toBeLessThan(all.weapons.length);
  });

  it('não duplica itens dentro de uma categoria', () => {
    dataRegistry.clearCache();
    const catalog = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);

    MARKET_CATEGORIES.forEach(({ key }) => {
      const items = catalog[key] as Equipment[];
      const keys = items.map(getItemKey);
      expect(new Set(keys).size, `categoria ${key}`).toBe(keys.length);
    });
  });
});

describe('sigla do suplemento', () => {
  it('mantém conectores em minúscula', () => {
    expect(getSupplementInitials('Ameaças de Arton')).toBe('AdA');
    expect(getSupplementInitials('Heróis de Arton')).toBe('HdA');
    expect(getSupplementInitials('Guia de Deuses Menores')).toBe('GdDM');
  });

  it('devolve undefined sem nome', () => {
    expect(getSupplementInitials(undefined)).toBeUndefined();
    expect(getSupplementInitials('')).toBeUndefined();
  });

  it('gera sigla para todo suplemento presente no catálogo', () => {
    dataRegistry.clearCache();
    const catalog = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);

    MARKET_CATEGORIES.forEach(({ key }) => {
      (catalog[key] as Equipment[]).forEach((item) => {
        if (!item.supplementName) return;
        const initials = getSupplementInitials(item.supplementName);
        expect(initials, item.supplementName).toBeTruthy();
        // Precisa caber numa coluna estreita.
        expect((initials as string).length).toBeLessThanOrEqual(5);
      });
    });
  });
});

describe('descritores de categoria', () => {
  it('cobre todas as chaves de MarketEquipment', () => {
    dataRegistry.clearCache();
    const catalog = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);
    const described = MARKET_CATEGORIES.map((c) => c.key).sort();

    expect(described).toEqual(Object.keys(catalog).sort());
  });

  it('todo grupo de item do catálogo tem destino na mochila', () => {
    dataRegistry.clearCache();
    const catalog = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);

    MARKET_CATEGORIES.forEach(({ key }) => {
      (catalog[key] as Equipment[]).forEach((item) => {
        expect(BAG_KEY_BY_GROUP[item.group], item.nome).toBeDefined();
      });
    });
  });

  it('armas expõem dano, crítico, tipo e alcance; armaduras expõem defesa', () => {
    dataRegistry.clearCache();
    const catalog = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);

    const weapons = getDescriptor('weapons');
    const espadaLonga = catalog.weapons.find((i) => i.nome === 'Espada Longa');
    expect(espadaLonga).toBeDefined();

    const read = (statKey: string, item: Equipment) =>
      weapons.stats.find((s) => s.key === statKey)?.get(item);

    expect(read('dano', espadaLonga as Equipment)).toBe('1d8');
    expect(read('critico', espadaLonga as Equipment)).toBe('19');
    expect(read('tipo', espadaLonga as Equipment)).toBe('Corte');
    expect(read('weaponCategory', espadaLonga as Equipment)).toBe('Marcial');

    const armors = getDescriptor('armors');
    const completa = catalog.armors.find(
      (i) => i.nome === 'Armadura Completa'
    ) as Equipment;
    expect(armors.stats.find((s) => s.key === 'defesa')?.get(completa)).toBe(
      '+10'
    );
  });

  it('só munição/alquimia/alimentação aceitam quantidade', () => {
    dataRegistry.clearCache();
    const catalog = dataRegistry.getEquipmentBySupplements(ALL_SUPPLEMENTS);

    const espada = catalog.weapons.find(
      (i) => i.nome === 'Espada Longa'
    ) as Equipment;
    const flecha = catalog.weapons.find((i) => i.isAmmo) as Equipment;

    expect(getDescriptor('weapons').allowsQuantity(espada)).toBe(false);
    expect(getDescriptor('weapons').allowsQuantity(flecha)).toBe(true);
    expect(getDescriptor('alchemy').allowsQuantity(catalog.alchemy[0])).toBe(
      true
    );
    expect(getDescriptor('armors').allowsQuantity(catalog.armors[0])).toBe(
      false
    );
  });
});
