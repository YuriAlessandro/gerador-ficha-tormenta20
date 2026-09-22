/**
 * Regras do uso de habilidade/magia de ameaça com custo em PM.
 *
 * O `ThreatResult` só renderiza o que estas funções respondem — o bloqueio por
 * PM insuficiente e a leitura de `pmCost` (que é gravado `undefined` quando
 * zero) moram aqui, não no componente.
 */
import { describe, it, expect } from 'vitest';
import {
  getThreatPmCost,
  isPmUsable,
  isPmUseBlocked,
  getUsageAvailablePm,
  formatPmPool,
  pmUseTooltip,
  type ThreatPmUsage,
} from '../threatPmUse';
import { buildThreatAbilityMeta } from '../rollAbilityMeta';
import type { ThreatAbility } from '../../interfaces/ThreatSheet';

const ability = (overrides: Partial<ThreatAbility> = {}): ThreatAbility => ({
  id: 'a1',
  name: 'Bola de Fogo',
  description: 'Causa 4d6 de dano de fogo.',
  ...overrides,
});

const usage = (overrides: Partial<ThreatPmUsage> = {}): ThreatPmUsage => ({
  casterName: 'Goblin 2',
  currentMP: 9,
  tempMP: 0,
  maxMP: 12,
  onUse: () => undefined,
  ...overrides,
});

describe('getThreatPmCost', () => {
  it('trata custo ausente como zero', () => {
    expect(getThreatPmCost(ability())).toBe(0);
    expect(getThreatPmCost(ability({ pmCost: 0 }))).toBe(0);
    expect(getThreatPmCost(ability({ pmCost: 3 }))).toBe(3);
  });

  it('isPmUsable só é verdade com custo positivo', () => {
    expect(isPmUsable(ability())).toBe(false);
    expect(isPmUsable(ability({ pmCost: 0 }))).toBe(false);
    expect(isPmUsable(ability({ pmCost: 1 }))).toBe(true);
  });
});

describe('isPmUseBlocked', () => {
  it('não bloqueia quando o PM cobre o custo', () => {
    expect(isPmUseBlocked(usage(), ability({ pmCost: 3 }))).toBe(false);
  });

  it('bloqueia quando falta PM', () => {
    expect(
      isPmUseBlocked(usage({ currentMP: 1 }), ability({ pmCost: 3 }))
    ).toBe(true);
  });

  it('conta o pool temporário como PM gastável', () => {
    expect(
      isPmUseBlocked(usage({ currentMP: 1, tempMP: 2 }), ability({ pmCost: 3 }))
    ).toBe(false);
  });

  it('nunca bloqueia habilidade sem custo', () => {
    expect(isPmUseBlocked(usage({ currentMP: 0 }), ability())).toBe(false);
  });

  it('getUsageAvailablePm soma os dois pools', () => {
    expect(getUsageAvailablePm(usage({ currentMP: 4, tempMP: 2 }))).toBe(6);
  });
});

describe('formatPmPool', () => {
  it('mostra apenas atual/máximo sem pool temporário', () => {
    expect(formatPmPool(usage())).toBe('9/12');
  });

  it('anota o pool temporário quando existe', () => {
    expect(formatPmPool(usage({ tempMP: 3 }))).toBe('9/12 (+3 temp)');
  });
});

describe('pmUseTooltip', () => {
  it('anuncia o custo quando dá para pagar', () => {
    expect(pmUseTooltip(usage(), ability({ pmCost: 3 }))).toBe(
      'Usar Bola de Fogo (gasta 3 PM)'
    );
  });

  it('explica o bloqueio, com concordância no singular', () => {
    expect(pmUseTooltip(usage({ currentMP: 1 }), ability({ pmCost: 3 }))).toBe(
      'PM insuficiente — Bola de Fogo custa 3 PM, resta 1'
    );
  });

  it('habilidade sem custo continua sendo só rolagem', () => {
    expect(pmUseTooltip(usage(), ability())).toBe('Rolar Bola de Fogo');
  });
});

describe('buildThreatAbilityMeta', () => {
  it('magia entra como spell (sem sourceLabel, o nome já é da magia)', () => {
    const meta = buildThreatAbilityMeta(
      ability({ pmCost: 3 }),
      'spell',
      'Goblin 2'
    );

    expect(meta.kind).toBe('spell');
    expect(meta.name).toBe('Bola de Fogo');
    expect(meta.sourceLabel).toBeUndefined();
    expect(meta.pmCost).toBe(3);
  });

  it('habilidade entra como power com o nome do combatente', () => {
    const meta = buildThreatAbilityMeta(
      ability({ name: 'Fúria', pmCost: 2 }),
      'ability',
      'Goblin 2'
    );

    expect(meta.kind).toBe('power');
    expect(meta.sourceLabel).toBe('Goblin 2');
    expect(meta.pmCost).toBe(2);
  });

  it('omite pmCost quando não há custo', () => {
    expect(
      buildThreatAbilityMeta(ability(), 'spell', 'Goblin 2').pmCost
    ).toBeUndefined();
  });

  it('trunca a descrição como as demais metas do histórico', () => {
    const meta = buildThreatAbilityMeta(
      ability({ description: 'x'.repeat(900) }),
      'spell',
      'Goblin 2'
    );

    expect(meta.descriptionTruncated).toBe(true);
    expect((meta.description ?? '').length).toBeLessThanOrEqual(601);
  });
});
