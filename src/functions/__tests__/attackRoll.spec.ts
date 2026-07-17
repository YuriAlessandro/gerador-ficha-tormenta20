import { describe, expect, test } from 'vitest';
import {
  AttackRollPlan,
  AttackRollRequest,
  buildAttackRollPlan,
  diceSpecsToNotation,
  distributeFullAttackValues,
  distributePhase1Values,
  extractValuesBySides,
  getCritExtraDice,
  getPhase1Dice,
  isCriticalHit,
  isFumbleRoll,
  resolveAttackRoll,
  rollAttackLocally,
  takeDiceValues,
  DiceRollerFn,
} from '../attackRoll';

/**
 * Cobre o pipeline puro de rolagem de ataque: decisão de crítico por margem,
 * multiplicação apenas dos dados base, extras/modificadores nunca
 * multiplicados e a matemática de duas fases usada pelos dados 3D.
 */

const makeRequest = (
  overrides: Partial<AttackRollRequest> = {}
): AttackRollRequest => ({
  rollLabel: 'Espada Longa',
  attackBonus: 5,
  crit: { threshold: 19, multiplier: 2 },
  damage: { dice: '1d8+3', damageType: 'Corte' },
  ...overrides,
});

const mustBuild = (request: AttackRollRequest): AttackRollPlan => {
  const plan = buildAttackRollPlan(request);
  if (!plan) throw new Error('plano deveria ser válido');
  return plan;
};

describe('buildAttackRollPlan', () => {
  test('parseia dano multi-grupo com modificador embutido', () => {
    const plan = mustBuild(makeRequest({ damage: { dice: '1d8+1d6+5' } }));
    expect(plan.baseDamage.groups).toEqual([
      { count: 1, sides: 8 },
      { count: 1, sides: 6 },
    ]);
    expect(plan.baseDamage.modifier).toBe(5);
  });

  test('dano inválido retorna null', () => {
    expect(buildAttackRollPlan(makeRequest({ damage: { dice: '-' } }))).toBe(
      null
    );
    expect(buildAttackRollPlan(makeRequest({ damage: { dice: '' } }))).toBe(
      null
    );
  });

  test('extra com string inválida é descartado sem invalidar o plano', () => {
    const plan = mustBuild(
      makeRequest({
        extras: [
          { kind: 'extra', label: 'Dano extra (Fogo)', dice: '1d6' },
          { kind: 'extra', label: 'Inválido', dice: 'abc' },
        ],
      })
    );
    expect(plan.extras).toHaveLength(1);
    expect(plan.extras[0].spec.label).toBe('Dano extra (Fogo)');
  });
});

describe('getPhase1Dice / getCritExtraDice / diceSpecsToNotation', () => {
  test('ordem canônica: d20, dano base, extras', () => {
    const plan = mustBuild(
      makeRequest({
        damage: { dice: '2d6+3' },
        extras: [{ kind: 'extra', label: 'Fogo', dice: '1d6' }],
      })
    );
    expect(getPhase1Dice(plan)).toEqual([
      { count: 1, sides: 20 },
      { count: 2, sides: 6 },
      { count: 1, sides: 6 },
    ]);
  });

  test('dados adicionais de crítico: count × (multiplicador − 1) por grupo', () => {
    const x2 = mustBuild(makeRequest({ damage: { dice: '2d6' } }));
    expect(getCritExtraDice(x2)).toEqual([{ count: 2, sides: 6 }]);

    const x3 = mustBuild(
      makeRequest({
        crit: { threshold: 20, multiplier: 3 },
        damage: { dice: '3d12+5' },
      })
    );
    expect(getCritExtraDice(x3)).toEqual([{ count: 6, sides: 12 }]);

    const multi = mustBuild(makeRequest({ damage: { dice: '1d8+1d6' } }));
    expect(getCritExtraDice(multi)).toEqual([
      { count: 1, sides: 8 },
      { count: 1, sides: 6 },
    ]);

    const x1 = mustBuild(
      makeRequest({ crit: { threshold: 20, multiplier: 1 } })
    );
    expect(getCritExtraDice(x1)).toEqual([]);
  });

  test('notação agrupa por faces com d20 primeiro', () => {
    const plan = mustBuild(
      makeRequest({
        damage: { dice: '2d6' },
        extras: [{ kind: 'extra', label: 'Fogo', dice: '1d6' }],
      })
    );
    expect(diceSpecsToNotation(getPhase1Dice(plan))).toBe('1d20+3d6');
  });
});

describe('isCriticalHit / isFumbleRoll', () => {
  test('honra a margem de ameaça', () => {
    const margin19 = { threshold: 19, multiplier: 2 };
    expect(isCriticalHit(19, margin19)).toBe(true);
    expect(isCriticalHit(20, margin19)).toBe(true);
    expect(isCriticalHit(18, margin19)).toBe(false);

    const margin20 = { threshold: 20, multiplier: 2 };
    expect(isCriticalHit(20, margin20)).toBe(true);
    expect(isCriticalHit(19, margin20)).toBe(false);
  });

  test('falha crítica apenas no 1 natural', () => {
    expect(isFumbleRoll(1)).toBe(true);
    expect(isFumbleRoll(2)).toBe(false);
  });
});

describe('resolveAttackRoll', () => {
  test('crítico por margem: 19 com margem 19 multiplica dados, não o modificador', () => {
    const plan = mustBuild(makeRequest()); // 1d8+3, margem 19/x2, atk +5
    const groups = resolveAttackRoll(plan, {
      d20: 19,
      baseDamage: [6, 4], // fase 1: [6]; adicionado no crítico: [4]
      extras: [],
    });

    const [attack, damage] = groups;
    expect(attack.isCritical).toBe(true);
    expect(attack.isFumble).toBe(false);
    expect(attack.criticalThreshold).toBe(19);
    expect(attack.total).toBe(24);
    expect(attack.diceNotation).toBe('1d20+5');

    expect(damage.label).toBe('Dano x2 (normal: 9)'); // 6 + 3
    expect(damage.diceNotation).toBe('2d8');
    expect(damage.rolls).toEqual([6, 4]);
    expect(damage.modifier).toBe(3); // NÃO multiplicado
    expect(damage.total).toBe(13); // 6 + 4 + 3
    expect(damage.damageType).toBe('Corte');
  });

  test('sem crítico: label "Dano" e apenas dados da fase 1', () => {
    const plan = mustBuild(makeRequest());
    const groups = resolveAttackRoll(plan, {
      d20: 18,
      baseDamage: [6],
      extras: [],
    });
    const [attack, damage] = groups;
    expect(attack.isCritical).toBe(false);
    expect(damage.label).toBe('Dano');
    expect(damage.diceNotation).toBe('1d8');
    expect(damage.total).toBe(9);
  });

  test('extras e trigger nunca são multiplicados, mesmo em crítico', () => {
    const plan = mustBuild(
      makeRequest({
        crit: { threshold: 20, multiplier: 3 },
        damage: { dice: '2d6+2' },
        extras: [
          { kind: 'extra', label: 'Dano extra (Fogo)', dice: '1d6' },
          { kind: 'trigger', label: 'Mecanismo', dice: '1d12' },
        ],
      })
    );
    const groups = resolveAttackRoll(plan, {
      d20: 20,
      baseDamage: [3, 5, 2, 6, 1, 4], // 2 da fase 1 + 4 adicionados (x3)
      extras: [[6], [10]],
    });

    const [, damage, fire, trigger] = groups;
    expect(damage.label).toBe('Dano x3 (normal: 10)'); // 3 + 5 + 2
    expect(damage.diceNotation).toBe('6d6');
    expect(damage.total).toBe(23); // 21 + 2

    expect(fire.label).toBe('Dano extra (Fogo)');
    expect(fire.rolls).toEqual([6]);
    expect(fire.total).toBe(6);

    expect(trigger.label).toBe('Mecanismo (acertou — somar ao dano)');
    expect(trigger.total).toBe(10);
  });

  test('falha crítica: isFumble, sem crítico e trigger marcado como erro', () => {
    const plan = mustBuild(
      makeRequest({
        attackBonus: -3,
        extras: [{ kind: 'trigger', label: 'Mecanismo', dice: '1d12' }],
      })
    );
    const groups = resolveAttackRoll(plan, {
      d20: 1,
      baseDamage: [2],
      extras: [[7]],
    });
    const [attack, , trigger] = groups;
    expect(attack.isFumble).toBe(true);
    expect(attack.isCritical).toBe(false);
    expect(attack.total).toBe(1); // Math.max(1, 1 - 3)
    expect(trigger.label).toBe('Mecanismo (errou — não soma)');
  });

  test('dano normal de referência usa só os primeiros dados de cada grupo', () => {
    const plan = mustBuild(makeRequest({ damage: { dice: '1d8+1d6+3' } }));
    const groups = resolveAttackRoll(plan, {
      d20: 20,
      baseDamage: [8, 6, 1, 1], // fase 1: [8, 6]; adicionados: [1, 1]
      extras: [],
    });
    const [, damage] = groups;
    expect(damage.label).toBe('Dano x2 (normal: 17)'); // 8 + 6 + 3
    expect(damage.diceNotation).toBe('2d8+2d6');
    expect(damage.total).toBe(19); // 8 + 6 + 1 + 1 + 3
  });

  test('dano mínimo clampado em 1', () => {
    const plan = mustBuild(makeRequest({ damage: { dice: '1d4-5' } }));
    const groups = resolveAttackRoll(plan, {
      d20: 10,
      baseDamage: [2],
      extras: [],
    });
    expect(groups[1].total).toBe(1);
  });
});

describe('rollAttackLocally', () => {
  const fixedRoller =
    (d20: number, dieValue: number): DiceRollerFn =>
    (sides, count) => {
      if (sides === 20) return [d20];
      return Array.from({ length: count }, () => dieValue);
    };

  test('crítico local rola os dados adicionais', () => {
    const plan = mustBuild(makeRequest({ damage: { dice: '2d6+3' } }));
    const groups = rollAttackLocally(plan, fixedRoller(19, 4));
    const [attack, damage] = groups;
    expect(attack.isCritical).toBe(true);
    expect(damage.rolls).toHaveLength(4); // 2 da fase 1 + 2 do crítico
    expect(damage.total).toBe(4 * 4 + 3);
    expect(damage.label).toBe('Dano x2 (normal: 11)');
  });

  test('sem crítico local não rola dados adicionais', () => {
    const plan = mustBuild(makeRequest({ damage: { dice: '2d6+3' } }));
    const groups = rollAttackLocally(plan, fixedRoller(10, 4));
    expect(groups[0].isCritical).toBe(false);
    expect(groups[1].rolls).toHaveLength(2);
    expect(groups[1].total).toBe(11);
  });
});

describe('extractValuesBySides / distributePhase1Values', () => {
  test('extrai valores do formato do DiceBox (rolls[].value com fallback value)', () => {
    expect(
      extractValuesBySides([
        {
          sides: 20,
          value: 19,
          groupId: 0,
          rolls: [{ value: 19 }],
        },
        {
          sides: '6',
          value: 9,
          groupId: 1,
          rolls: [{ value: 4 }, { value: 5 }],
        },
        { sides: 8, value: 7, groupId: 2 }, // sem rolls => fallback value
      ])
    ).toEqual({ 20: [19], 6: [4, 5], 8: [7] });
  });

  test('distribui dados de mesmas faces entre base e extra na ordem canônica', () => {
    const plan = mustBuild(
      makeRequest({
        damage: { dice: '2d6+3' },
        extras: [{ kind: 'extra', label: 'Fogo', dice: '1d6' }],
      })
    );
    const values = distributePhase1Values(plan, {
      20: [15],
      6: [4, 5, 2],
    });
    expect(values).toEqual({
      d20: 15,
      baseDamage: [4, 5], // primeiros 2 d6 são do dano base
      extras: [[2]], // o terceiro é do extra
    });
  });

  test('fila insuficiente retorna null (gatilho de fallback)', () => {
    const plan = mustBuild(makeRequest({ damage: { dice: '2d6+3' } }));
    expect(distributePhase1Values(plan, { 20: [15], 6: [4] })).toBe(null);
    expect(distributePhase1Values(plan, { 6: [4, 5] })).toBe(null);
  });

  test('não muta o objeto de entrada', () => {
    const plan = mustBuild(makeRequest({ damage: { dice: '1d8+3' } }));
    const input = { 20: [15], 8: [4] };
    distributePhase1Values(plan, input);
    expect(input).toEqual({ 20: [15], 8: [4] });
  });
});

describe('distributeFullAttackValues / takeDiceValues (fase 2 do crítico)', () => {
  test('cena completa após o add: Maça 1d8 x2 com 20 natural (cenário do bug)', () => {
    // Fase 1: d20=20 + 1d8=6; fase 2 adicionou 1d8=4. getRollResults devolve
    // a cena inteira, com os dados da fase 1 no início de cada fila.
    const plan = mustBuild(
      makeRequest({
        crit: { threshold: 20, multiplier: 2 },
        damage: { dice: '1d8+2' },
      })
    );
    const values = distributeFullAttackValues(plan, { 20: [20], 8: [6, 4] });
    expect(values).toEqual({ d20: 20, baseDamage: [6, 4], extras: [] });

    const groups = resolveAttackRoll(
      plan,
      values as NonNullable<typeof values>
    );
    expect(groups[0].isCritical).toBe(true);
    expect(groups[0].rolls).toEqual([20]);
    expect(groups[1].label).toBe('Dano x2 (normal: 8)'); // 6 + 2
    expect(groups[1].total).toBe(12); // 6 + 4 + 2
  });

  test('cena completa com extra de mesmas faces: crítico não rouba dado do extra', () => {
    // Base 2d6 (x2 => +2d6) + extra 1d6. Ordem nas filas: fase 1 (2 base +
    // 1 extra) e depois os 2 adicionados do crítico.
    const plan = mustBuild(
      makeRequest({
        crit: { threshold: 19, multiplier: 2 },
        damage: { dice: '2d6+1' },
        extras: [{ kind: 'extra', label: 'Fogo', dice: '1d6' }],
      })
    );
    const values = distributeFullAttackValues(plan, {
      20: [19],
      6: [3, 5, 2, 6, 1],
    });
    expect(values).toEqual({
      d20: 19,
      baseDamage: [3, 5, 6, 1],
      extras: [[2]],
    });
  });

  test('contagem que não fecha retorna null', () => {
    const plan = mustBuild(makeRequest({ damage: { dice: '1d8+2' } }));
    // Falta o dado adicionado do crítico (só a fase 1 presente).
    expect(distributeFullAttackValues(plan, { 20: [20], 8: [6] })).toBe(null);
    // Falta o d20.
    expect(distributeFullAttackValues(plan, { 8: [6, 4] })).toBe(null);
  });

  test('takeDiceValues consome specs em ordem e devolve null se faltar', () => {
    expect(takeDiceValues([{ count: 1, sides: 8 }], { 8: [4] })).toEqual([4]);
    expect(
      takeDiceValues(
        [
          { count: 1, sides: 8 },
          { count: 1, sides: 6 },
        ],
        { 8: [4, 7], 6: [2] }
      )
    ).toEqual([4, 2]);
    expect(takeDiceValues([{ count: 2, sides: 8 }], { 8: [4] })).toBe(null);
    const input = { 8: [4, 7] };
    takeDiceValues([{ count: 1, sides: 8 }], input);
    expect(input).toEqual({ 8: [4, 7] }); // não muta
  });
});
