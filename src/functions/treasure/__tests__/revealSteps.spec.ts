import { TREASURE_DATASETS } from '@/data/treasure/treasureDatasets';
import { buildRevealSteps } from '../revealSteps';
import type { TreasureItemInfo } from '../treasureItemInfo';
import {
  Die,
  ND_ORDER,
  chooseTwoDice,
  createTreasureContext,
  rollTreasure,
} from '../treasureRoller';

function scripted(values: number[]): Die {
  const queue = [...values];
  return (sides) => {
    const v = queue.shift();
    if (v === undefined) throw new Error(`dado sem valor (d${sides})`);
    return v;
  };
}

const lightArmor = (): TreasureItemInfo => ({
  melee: false,
  firingNotSling: false,
  ammo: false,
  cutOrPierce: false,
  armor: true,
  heavyArmor: false,
  shield: false,
});

const sup = TREASURE_DATASETS.supplements;

describe('roteiro da animação', () => {
  it('segue a ordem cronológica, incluindo a rolagem descartada', () => {
    // ND 5: dinheiro d%=1 (nada); itens d%=80 → Superior (1 melhoria).
    // tipo 4 (armadura), d%=1, melhoria 90 (Selada, rejeitada) → 5 (Ajustada).
    const ctx = createTreasureContext(
      sup,
      scripted([1, 80, 4, 1, 90, 5]),
      lightArmor
    );
    const result = rollTreasure(ctx, '5', 'Padrão');
    const steps = buildRevealSteps(result, sup);

    expect(steps.map((s) => s.id)).toEqual([
      'money-0',
      'item-0',
      'item-0-type',
      'item-0-base',
      'item-0-att-0',
      'item-0-att-1',
    ]);
    expect(steps[0].size).toBe('major');
    expect(steps[1].lines[steps[1].finalIndex]).toMatch(
      /Superior \(1 melhoria\)/
    );
    expect(steps[2].lines[steps[2].finalIndex]).toBe('4 · Armadura/escudo');
    expect(steps[4].lines[steps[4].finalIndex]).toMatch(/Selada$/);
    expect(steps[4].rejectedReason).toBeTruthy();
    expect(steps[5].lines[steps[5].finalIndex]).toMatch(/Ajustada$/);
    expect(steps[5].rejectedReason).toBeUndefined();
  });

  it('o motor registra as tentativas na ordem em que aconteceram', () => {
    const ctx = createTreasureContext(
      sup,
      scripted([1, 80, 4, 1, 90, 5]),
      lightArmor
    );
    const item = rollTreasure(ctx, '5', 'Padrão').items[0];
    if (item.detail?.kind !== 'superior') throw new Error('esperava superior');
    expect(
      item.detail.improvements.attempts.map((a) => [a.entry.name, a.accepted])
    ).toEqual([
      ['Selada', false],
      ['Ajustada', true],
    ]);
  });

  it('riqueza com +% aponta para a linha do valor ajustado', () => {
    // ND 4: dinheiro d%=85 → 1 riqueza menor +%; riqueza d%=95 → 100; 4d10.
    const ctx = createTreasureContext(
      sup,
      scripted([85, 95, 1, 2, 3, 4, 1]),
      lightArmor
    );
    const steps = buildRevealSteps(rollTreasure(ctx, '4', 'Padrão'), sup);
    const wealth = steps.find((s) => s.id === 'money-0-wealth-0')!;
    expect(wealth.lines[wealth.finalIndex]).toBe('100 · 4d10x100 (2.200)');
  });

  it('2D vira um passo de escolha; os passos do item só entram depois', () => {
    // ND 4, itens 40 → Equipamento 2D; dados 1 (arma) e 6 (esotérico).
    const ctx = createTreasureContext(
      sup,
      scripted([1, 40, 1, 6, 1]),
      lightArmor
    );
    const result = rollTreasure(ctx, '4', 'Padrão');
    expect(buildRevealSteps(result, sup).map((s) => s.id)).toEqual([
      'money-0',
      'item-0',
      'item-0-choice',
    ]);
    const chosen = chooseTwoDice(ctx, result.items[0], 'esoterico');
    const after = buildRevealSteps({ ...result, items: [chosen] }, sup);
    expect(after.map((s) => s.id)).toEqual([
      'money-0',
      'item-0',
      'item-0-choice',
      'item-0-base',
    ]);
    expect(after[3].lines[after[3].finalIndex]).toMatch(/Afiador solar$/);
  });

  it('"Arma específica" aparece como tentativa e depois a sub-tabela', () => {
    // ND 17, itens 50 → Mágico (médio); arma, Adaga, encanto 2, depois 95 → específica 1.
    const ctx = createTreasureContext(
      sup,
      scripted([1, 50, 1, 2, 2, 95, 1]),
      lightArmor
    );
    const steps = buildRevealSteps(rollTreasure(ctx, '17', 'Padrão'), sup);
    expect(steps.map((s) => s.id).slice(-4)).toEqual([
      'item-0-base',
      'item-0-att-0',
      'item-0-att-1',
      'item-0-specific',
    ]);
    const last = steps[steps.length - 1];
    expect(last.lines[last.finalIndex]).toMatch(/Adaga da bruma$/);
  });

  it.each(Object.values(TREASURE_DATASETS))(
    'rolagens reais ($mode): todo passo aponta para uma linha existente',
    (ds) => {
      const ctx = createTreasureContext(ds);
      ND_ORDER.forEach((nd) => {
        for (let i = 0; i < 40; i += 1) {
          const steps = buildRevealSteps(rollTreasure(ctx, nd, 'Dobro'), ds);
          const ids = new Set(steps.map((s) => s.id));
          expect(ids.size).toBe(steps.length);
          steps
            .filter((s) => s.kind === 'reel')
            .forEach((s) => {
              expect(s.lines.length).toBeGreaterThan(0);
              expect(s.lines[s.finalIndex]).toBeDefined();
            });
        }
      });
    }
  );
});
