import type { ThreatSheet } from '../../interfaces/ThreatSheet';
import {
  damageThreatPV,
  getThreatVitals,
  healThreatPV,
  isThreatAtFullVitals,
  recoverThreatPM,
  restoreThreatVitals,
  spendThreatPM,
} from '../threatVitals';

const mkThreat = (
  hitPoints: number,
  manaPoints?: number,
  extra: Partial<ThreatSheet> = {}
): ThreatSheet =>
  ({
    id: 't1',
    name: 'Goblin',
    combatStats: { hitPoints, manaPoints },
    ...extra,
  } as unknown as ThreatSheet);

describe('threatVitals', () => {
  it('ameaça sem campos de PV/PM atuais está cheia', () => {
    const v = getThreatVitals(mkThreat(40, 10));
    expect(v).toMatchObject({
      currentPV: 40,
      tempPV: 0,
      currentPM: 10,
      tempPM: 0,
      hasPM: true,
    });
    expect(isThreatAtFullVitals(mkThreat(40, 10))).toBe(true);
  });

  it('sem manaPoints não tem PM', () => {
    expect(getThreatVitals(mkThreat(40)).hasPM).toBe(false);
    expect(getThreatVitals(mkThreat(40, 0)).hasPM).toBe(false);
  });

  it('limita o atual ao máximo quando a edição baixa o máximo', () => {
    const v = getThreatVitals(mkThreat(20, 5, { currentPV: 35, currentPM: 8 }));
    expect(v.currentPV).toBe(20);
    expect(v.currentPM).toBe(5);
  });

  it('dano consome PV temporário antes', () => {
    const t = damageThreatPV(mkThreat(40, 0, { tempPV: 5 }), 8);
    expect(t.tempPV).toBe(0);
    expect(t.currentPV).toBe(37);
  });

  it('PV desce até o piso de morte', () => {
    expect(damageThreatPV(mkThreat(40), 100).currentPV).toBe(-20);
    expect(damageThreatPV(mkThreat(12), 100).currentPV).toBe(-10);
  });

  it('gasto de PM consome temporário antes e para em 0', () => {
    const t = spendThreatPM(mkThreat(40, 10, { tempPM: 2 }), 5);
    expect(t.tempPM).toBe(0);
    expect(t.currentPM).toBe(7);
    expect(spendThreatPM(mkThreat(40, 10), 50).currentPM).toBe(0);
  });

  it('cura acima do máximo vira temporário', () => {
    const t = healThreatPV(mkThreat(40, 0, { currentPV: 35 }), 10);
    expect(t.currentPV).toBe(40);
    expect(t.tempPV).toBe(5);
    const m = recoverThreatPM(mkThreat(40, 10, { currentPM: 9 }), 3);
    expect(m.currentPM).toBe(10);
    expect(m.tempPM).toBe(2);
  });

  it('restaurar remove os campos e volta a cheia', () => {
    const t = restoreThreatVitals(
      mkThreat(40, 10, { currentPV: 3, tempPV: 1, currentPM: 0, tempPM: 2 })
    );
    expect(t).not.toHaveProperty('currentPV');
    expect(t).not.toHaveProperty('tempPV');
    expect(t).not.toHaveProperty('currentPM');
    expect(t).not.toHaveProperty('tempPM');
    expect(isThreatAtFullVitals(t)).toBe(true);
  });
});
