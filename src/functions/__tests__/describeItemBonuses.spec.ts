import _ from 'lodash';
import { describeItemBonuses } from '../equipmentDisplay';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import Equipment from '../../interfaces/Equipment';
import Skill from '../../interfaces/Skills';

const catalog = () =>
  dataRegistry.getEquipmentBySupplements([
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ]);

describe('describeItemBonuses', () => {
  it('agrupa valores mutuamente exclusivos do mesmo alvo com "/"', () => {
    const sensual = catalog().armors.find((a) => a.nome === 'Armadura sensual');
    if (!sensual) throw new Error('Armadura sensual ausente do catálogo');

    const labels = describeItemBonuses(_.cloneDeep(sensual));

    // 6 perícias de Carisma, uma linha cada — não 12.
    expect(labels).toHaveLength(6);
    expect(labels).toContain('(cond.) +2/+5 Diplomacia');
    expect(labels).toContain('(cond.) +2/+5 Intimidação');
    expect(labels.every((l) => l.startsWith('(cond.) '))).toBe(true);
  });

  it('bônus incondicional sai sem o prefixo', () => {
    const item: Equipment = {
      nome: 'Bandana',
      group: 'Vestuário',
      spaces: 0,
      sheetBonuses: [
        {
          source: { type: 'equipment', equipmentName: 'Bandana' },
          target: { type: 'Skill', name: Skill.INTIMIDACAO },
          modifier: { type: 'Fixed', value: 1 },
        },
      ],
    };
    expect(describeItemBonuses(item)).toEqual(['+1 Intimidação']);
  });

  it('item sem bônus devolve lista vazia', () => {
    const item: Equipment = { nome: 'Corda', group: 'Item Geral', spaces: 1 };
    expect(describeItemBonuses(item)).toEqual([]);
  });

  it('ignora modificadores que dependem da ficha', () => {
    const item: Equipment = {
      nome: 'Item estranho',
      group: 'Item Geral',
      spaces: 1,
      sheetBonuses: [
        {
          source: { type: 'equipment', equipmentName: 'Item estranho' },
          target: { type: 'Skill', name: Skill.DIPLOMACIA },
          modifier: { type: 'LevelCalc', formula: 'level/2' },
        },
      ],
    };
    expect(describeItemBonuses(item)).toEqual([]);
  });
});
