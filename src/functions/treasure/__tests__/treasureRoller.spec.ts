import { TREASURE_DATASETS } from '@/data/treasure/treasureDatasets';
import type { TreasureItemInfo } from '../treasureItemInfo';
import {
  Die,
  chooseTwoDice,
  createTreasureContext,
  rollItemColumn,
  rollMoneyColumn,
  rollTreasure,
} from '../treasureRoller';

/** Dado roteirizado: devolve os valores na ordem e falha se sobrar/faltar. */
function scripted(values: number[]): Die & { remaining: () => number } {
  const queue = [...values];
  const die = ((sides: number) => {
    const v = queue.shift();
    if (v === undefined)
      throw new Error(`dado sem valor roteirizado (d${sides})`);
    if (v < 1 || v > sides)
      throw new Error(`valor ${v} inválido para d${sides}`);
    return v;
  }) as Die & { remaining: () => number };
  die.remaining = () => queue.length;
  return die;
}

const INFO_BASE: TreasureItemInfo = {
  melee: false,
  firingNotSling: false,
  ammo: false,
  cutOrPierce: false,
  armor: false,
  heavyArmor: false,
  shield: false,
};
const meleeCut = () => ({ ...INFO_BASE, melee: true, cutOrPierce: true });
const lightArmor = () => ({ ...INFO_BASE, armor: true });

const { basic, supplements: sup } = TREASURE_DATASETS;

const ctx = (
  mode: 'basic' | 'supplements',
  values: number[],
  info = meleeCut
) => {
  const die = scripted(values);
  return {
    die,
    c: createTreasureContext(TREASURE_DATASETS[mode], die, () => info()),
  };
};

const itemRow = (mode: 'basic' | 'supplements', nd: string, roll: number) =>
  TREASURE_DATASETS[mode].tables.tesouroPorNd.byNd[nd].items.find(
    (r) => roll >= r.min && roll <= r.max
  )!;

describe('coluna Dinheiro', () => {
  it('+% soma 20 à rolagem de riqueza, com teto de 100', () => {
    const row = sup.tables.tesouroPorNd.byNd['4'].money.find(
      (r) => r.label === '1 riqueza menor +%'
    )!;
    // riqueza: d%=95 → 115 → teto 100 → linha "4d10x100"; 4d10 = 1,2,3,4
    const { c, die } = ctx('supplements', [95, 1, 2, 3, 4]);
    const out = rollMoneyColumn(c, row, 85, false);
    expect(out.detail.kind).toBe('riqueza');
    if (out.detail.kind !== 'riqueza') return;
    expect(out.detail.wealth[0].lookup).toBe(100);
    expect(out.detail.wealth[0].row.valueLabel).toBe('4d10x100 (2.200)');
    expect(out.detail.wealth[0].value).toBe(1000);
    expect(die.remaining()).toBe(0);
  });

  it('"Metade" divide só as moedas', () => {
    // ND 1/4: d%=50 → 1d6x10 TC; 1d6 = 3
    const { c } = ctx('basic', [50, 3, 1]);
    const result = rollTreasure(c, '1/4', 'Metade');
    const money = result.money[0].detail;
    expect(money).toMatchObject({ kind: 'coins', amount: 30, halved: 15 });
  });

  it('"Dobro" rola duas vezes em cada coluna (não quatro)', () => {
    const { c, die } = ctx('basic', [1, 1, 1, 1]);
    const result = rollTreasure(c, '1/4', 'Dobro');
    expect(result.money).toHaveLength(2);
    expect(result.items).toHaveLength(2);
    expect(die.remaining()).toBe(0);
  });

  it('usa as faixas do JdA (ND 1/4: 31-70 = 1d6x10 TC)', () => {
    const row = basic.tables.tesouroPorNd.byNd['1/4'].money[1];
    expect(row).toMatchObject({ min: 31, max: 70, label: '1d6x10 TC' });
  });
});

describe('poções', () => {
  const potionRow = (mode: 'basic' | 'supplements') =>
    TREASURE_DATASETS[mode].tables.tesouroPorNd.byNd['4'].items.find(
      (r) => r.label === '1 poção +%'
    )!;

  it('na planilha, +% alcança as faixas 101-120', () => {
    const { c } = ctx('supplements', [95]);
    const out = rollItemColumn(c, potionRow('supplements'), 60);
    if (out.detail?.kind !== 'pocao') throw new Error('esperava poção');
    expect(out.detail.potions[0].lookup).toBe(115);
    expect(out.detail.potions[0].entry.name).toBe('Premonição');
  });

  it('no livro básico, +% tem teto de 100', () => {
    const { c } = ctx('basic', [95]);
    const out = rollItemColumn(c, potionRow('basic'), 60);
    if (out.detail?.kind !== 'pocao') throw new Error('esperava poção');
    expect(out.detail.potions[0].lookup).toBe(100);
    expect(out.detail.potions[0].entry.name).toBe(
      'Curar Ferimentos (11d8+11 PV)'
    );
  });

  it('Orientação sorteia o atributo na ordem do JdA', () => {
    const row = sup.tables.tesouroPorNd.byNd['1'].items.find(
      (r) => r.label === '1 poção'
    )!;
    const { c } = ctx('supplements', [70, 2]);
    const out = rollItemColumn(c, row, 95);
    if (out.detail?.kind !== 'pocao') throw new Error('esperava poção');
    expect(out.detail.potions[0].entry.name).toMatch(/^Orientação/);
    expect(out.detail.potions[0].attribute).toEqual({
      roll: 2,
      name: 'Destreza',
    });
  });
});

describe('itens superiores', () => {
  // ND 5, 91-100: Superior (2 melhorias), sem 2D.
  const two = () => itemRow('supplements', '5', 95);
  // ND 5, 71-90: Superior (1 melhoria).
  const one = () => itemRow('supplements', '5', 80);

  it('Atroz conta como duas e inclui Cruel (planilha)', () => {
    // tipo 1 (arma), arma d%=2 (Adaga), melhoria 5 (Atroz*)
    const { c, die } = ctx('supplements', [1, 2, 5]);
    const out = rollItemColumn(c, two(), 95);
    if (out.detail?.kind !== 'superior') throw new Error('esperava superior');
    const [pick] = out.detail.improvements.picks;
    expect(pick.entry.name).toBe('Atroz');
    expect(pick.slots).toBe(2);
    expect(pick.includes).toBe('Cruel');
    expect(die.remaining()).toBe(0);
  });

  it('Atroz num item de uma melhoria é rolada novamente', () => {
    // melhoria 5 (Atroz*) rejeitada → 15 (Certeira)
    const { c } = ctx('supplements', [1, 2, 5, 15]);
    const out = rollItemColumn(c, one(), 80);
    if (out.detail?.kind !== 'superior') throw new Error('esperava superior');
    expect(out.detail.improvements.picks.map((p) => p.entry.name)).toEqual([
      'Certeira',
    ]);
    expect(out.detail.improvements.rejected[0].name).toBe('Atroz*');
  });

  it('melhoria repetida é rolada novamente (JdA: só uma vez por item)', () => {
    const { c } = ctx('supplements', [1, 2, 15, 16, 24]);
    const out = rollItemColumn(c, two(), 95);
    if (out.detail?.kind !== 'superior') throw new Error('esperava superior');
    expect(out.detail.improvements.picks.map((p) => p.entry.name)).toEqual([
      'Certeira',
      'Cruel',
    ]);
  });

  it('na planilha, melhoria que não se aplica é rolada novamente', () => {
    // tipo 4 (armadura), d%=1, melhoria 90 (Selada: só armaduras pesadas) → 5 (Ajustada)
    const { c } = ctx('supplements', [4, 1, 90, 5], lightArmor);
    const out = rollItemColumn(c, one(), 80);
    if (out.detail?.kind !== 'superior') throw new Error('esperava superior');
    expect(out.detail.improvements.picks.map((p) => p.entry.name)).toEqual([
      'Ajustada',
    ]);
    expect(out.detail.improvements.rejected[0].name).toBe('Selada');
  });

  it('no livro básico, só avisa (a Tabela 8-5 não manda rolar de novo)', () => {
    const row = itemRow('basic', '5', 80);
    // tipo 4 (armadura), d%=1, melhoria 85 (Selada)
    const { c } = ctx('basic', [4, 1, 85], lightArmor);
    const out = rollItemColumn(c, row, 80);
    if (out.detail?.kind !== 'superior') throw new Error('esperava superior');
    expect(out.detail.improvements.picks[0].entry.name).toBe('Selada');
    expect(out.detail.improvements.warnings.join(' ')).toMatch(
      /armaduras pesadas/
    );
  });

  it('pré-requisito não marcado e ausente vira aviso', () => {
    // Farpada (39-42) exige cruel; o item fica só com ela
    const { c } = ctx('supplements', [1, 2, 40]);
    const out = rollItemColumn(c, one(), 80);
    if (out.detail?.kind !== 'superior') throw new Error('esperava superior');
    expect(out.detail.improvements.picks[0].entry.name).toBe('Farpada');
    expect(out.detail.improvements.warnings.join(' ')).toMatch(/cruel/i);
  });

  it('material especial sorteia 1d6 na lista da nota', () => {
    // Material especial** (66-75) → 1d6 = 2 (adamante)
    const { c } = ctx('supplements', [1, 2, 70, 2]);
    const out = rollItemColumn(c, one(), 80);
    if (out.detail?.kind !== 'superior') throw new Error('esperava superior');
    expect(out.detail.improvements.picks[0].material).toEqual({
      roll: 2,
      name: 'adamante',
    });
  });
});

describe('itens mágicos', () => {
  it('médio recebe 2 encantos (e não 3)', () => {
    // ND 13, 96-100: Mágico (médio). tipo 1 (arma), Adaga, encantos 2 e 7
    const row = itemRow('supplements', '13', 98);
    const { c, die } = ctx('supplements', [1, 2, 2, 7]);
    const out = rollItemColumn(c, row, 98);
    if (out.detail?.kind !== 'magico') throw new Error('esperava mágico');
    expect(out.detail.enchantments?.picks.map((p) => p.entry.name)).toEqual([
      'Ameaçadora',
      'Anticriatura',
    ]);
    expect(die.remaining()).toBe(0);
  });

  it('"Arma específica" substitui os encantos rolados', () => {
    // ND 17, 41-80 Mágico (médio): encanto 2 (Ameaçadora), depois 95 → específica 1
    const row = itemRow('supplements', '17', 50);
    const { c } = ctx('supplements', [1, 2, 2, 95, 1]);
    const out = rollItemColumn(c, row, 50);
    if (out.detail?.kind !== 'magico') throw new Error('esperava mágico');
    expect(out.detail.specific?.entry.name).toBe('Adaga da bruma');
    expect(out.detail.specific?.discarded.map((p) => p.entry.name)).toEqual([
      'Ameaçadora',
    ]);
    expect(out.detail.enchantments?.picks).toEqual([]);
  });

  it('o 1d6 de tipo difere entre os modos (4 = esotérico × acessório)', () => {
    const supRow = itemRow('supplements', '10', 95); // Mágico (menor)
    const basicRow = itemRow('basic', '10', 95);
    const s = ctx('supplements', [4, 1, 3]);
    const b = ctx('basic', [4, 1]);
    const sOut = rollItemColumn(s.c, supRow, 95);
    const bOut = rollItemColumn(b.c, basicRow, 95);
    expect(sOut.detail).toMatchObject({
      kind: 'magico',
      itemKind: 'esoterico',
    });
    expect(bOut.detail).toMatchObject({
      kind: 'magico',
      itemKind: 'acessorio',
    });
  });

  it('encanto "apenas escudos" é rolado novamente numa armadura', () => {
    // Animado** (10-11) só escudos → 3 (Abençoado)
    const row = itemRow('supplements', '10', 95);
    const { c } = ctx('supplements', [3, 1, 10, 3], lightArmor);
    const out = rollItemColumn(c, row, 95);
    if (out.detail?.kind !== 'magico') throw new Error('esperava mágico');
    expect(out.detail.enchantments?.picks.map((p) => p.entry.name)).toEqual([
      'Abençoado',
    ]);
  });
});

describe('2D', () => {
  it('mostra os dois tipos e só rola o item depois da escolha', () => {
    // ND 4, 31-55: Equipamento 2D. Dados 1 (arma) e 6 (esotérico).
    const row = itemRow('supplements', '4', 40);
    const { c, die } = ctx('supplements', [1, 6, 1]);
    const out = rollItemColumn(c, row, 40);
    expect(out.choice?.options).toEqual(['arma', 'esoterico']);
    expect(out.detail).toBeUndefined();
    const chosen = chooseTwoDice(c, out, 'esoterico');
    expect(chosen.detail).toMatchObject({
      kind: 'equipamento',
      itemKind: 'esoterico',
    });
    expect(die.remaining()).toBe(0);
  });
});
