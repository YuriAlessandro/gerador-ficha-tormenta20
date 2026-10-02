import { describe, it, expect } from 'vitest';
import {
  GRIMOIRE_HARD_LIMIT,
  grimoireLimitMessage,
  grimoireLimitState,
} from '../limit';
import {
  SUPPORT_LIMITS,
  SupportLevel,
} from '../../../types/subscription.types';

describe('limite de grimórios por plano (espelho do backend)', () => {
  it('espelha o limite de fichas em todos os planos', () => {
    (Object.values(SupportLevel) as SupportLevel[]).forEach((level) => {
      expect(SUPPORT_LIMITS[level].maxPocketGrimoires).toBe(
        SUPPORT_LIMITS[level].maxSheets
      );
    });
  });
});

describe('grimoireLimitState', () => {
  it('deslogado não tem limite (é só o navegador)', () => {
    expect(
      grimoireLimitState({ isAuthenticated: false, count: 500, max: 10 })
        .canCreate
    ).toBe(true);
  });

  it('logado abaixo do limite pode criar', () => {
    expect(
      grimoireLimitState({ isAuthenticated: true, count: 9, max: 10 })
    ).toMatchObject({ canCreate: true, limit: 10 });
  });

  it('logado no limite não pode criar', () => {
    expect(
      grimoireLimitState({ isAuthenticated: true, count: 10, max: 10 })
    ).toMatchObject({ canCreate: false, limit: 10 });
  });

  it('ilimitado vai até o teto absoluto', () => {
    expect(
      grimoireLimitState({ isAuthenticated: true, count: 99, max: -1 })
    ).toMatchObject({ canCreate: true, limit: GRIMOIRE_HARD_LIMIT });
    expect(
      grimoireLimitState({
        isAuthenticated: true,
        count: GRIMOIRE_HARD_LIMIT,
        max: -1,
      }).canCreate
    ).toBe(false);
  });
});

describe('grimoireLimitMessage', () => {
  it('diz o limite do plano', () => {
    expect(grimoireLimitMessage(10)).toBe(
      'Você atingiu o limite de 10 grimórios do seu plano. Exclua algum ou apoie o projeto para ter mais.'
    );
  });

  it('no teto absoluto, fala da conta', () => {
    expect(grimoireLimitMessage(GRIMOIRE_HARD_LIMIT)).toBe(
      'Você atingiu o limite de 100 grimórios por conta. Exclua algum para criar outro.'
    );
  });
});
