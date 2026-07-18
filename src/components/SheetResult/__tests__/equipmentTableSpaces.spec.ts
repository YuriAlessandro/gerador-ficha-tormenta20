import { describe, expect, it } from 'vitest';
import Bag, { getItemSpaces } from '@/interfaces/Bag';
import Equipment, { BagEquipments } from '@/interfaces/Equipment';
import { CATEGORY_ORDER } from '@/components/SheetResult/BackpackModal/itemTypeStyles';
import { getStatsForGroup } from '@/functions/equipmentStats';

const emptyBag = (): BagEquipments => ({
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
});

describe('espaços por item', () => {
  it('multiplica pela quantidade', () => {
    const item: Equipment = {
      nome: 'Corda',
      group: 'Item Geral',
      spaces: 1,
      quantity: 3,
    };
    expect(getItemSpaces(item)).toBe(3);
  });

  it('trata item sem quantidade como 1', () => {
    const item: Equipment = { nome: 'Corda', group: 'Item Geral', spaces: 2 };
    expect(getItemSpaces(item)).toBe(2);
  });

  it('munição usa unidades por espaço, não quantidade', () => {
    const flechas: Equipment = {
      nome: 'Flechas (20)',
      group: 'Arma',
      spaces: 1,
      isAmmo: true,
      unitsRemaining: 25,
      ammoUnitsPerSpace: 20,
    };
    // 25 unidades / 20 por espaço = 2 espaços (arredondado para cima)
    expect(getItemSpaces(flechas)).toBe(2);
  });

  it('item sem espaços declarados ocupa 0', () => {
    expect(getItemSpaces({ nome: 'Mochila', group: 'Item Geral' })).toBe(0);
  });

  it('a soma dos subtotais bate exatamente com o total da mochila', () => {
    const equipments = emptyBag();
    equipments.Arma = [
      { nome: 'Espada Longa', group: 'Arma', spaces: 1 },
      {
        nome: 'Flechas (20)',
        group: 'Arma',
        spaces: 1,
        isAmmo: true,
        unitsRemaining: 35,
        ammoUnitsPerSpace: 20,
      },
    ];
    equipments.Armadura = [
      {
        nome: 'Armadura Completa',
        group: 'Armadura',
        spaces: 5,
        defenseBonus: 10,
        armorPenalty: 5,
      },
    ];
    equipments['Item Geral'] = [
      { nome: 'Corda', group: 'Item Geral', spaces: 1, quantity: 4 },
    ];

    // `skipDefaults` para o total refletir só os itens acima — sem ele o Bag
    // ainda insere Mochila/Saco de dormir/Traje de viajante.
    const bag = new Bag(equipments, true);

    // É assim que a tabela da ficha calcula cada subtotal de categoria.
    const somaDosSubtotais = Object.values(bag.getEquipments())
      .flat()
      .reduce((acc, item) => acc + getItemSpaces(item), 0);

    expect(somaDosSubtotais).toBe(bag.getSpaces());
    // 1 (espada) + 2 (35 flechas) + 5 (armadura) + 4 (4 cordas)
    expect(bag.getSpaces()).toBe(12);
  });
});

describe('colunas por categoria na ficha', () => {
  it('armas mostram dano, crítico, tipo, alcance e categoria', () => {
    expect(getStatsForGroup('Arma').map((s) => s.key)).toEqual([
      'dano',
      'critico',
      'tipo',
      'alcance',
      'weaponCategory',
    ]);
  });

  it('defesas mostram defesa e penalidade', () => {
    expect(getStatsForGroup('Armadura').map((s) => s.key)).toEqual([
      'defesa',
      'penalidade',
    ]);
    expect(getStatsForGroup('Escudo').map((s) => s.key)).toEqual([
      'defesa',
      'penalidade',
    ]);
  });

  it('categorias mundanas não têm colunas descritivas', () => {
    expect(getStatsForGroup('Item Geral')).toEqual([]);
    expect(getStatsForGroup('Alquimía')).toEqual([]);
  });

  it('todo grupo conhecido é consultável sem quebrar', () => {
    CATEGORY_ORDER.forEach((group) => {
      expect(Array.isArray(getStatsForGroup(group)), group).toBe(true);
    });
  });
});
