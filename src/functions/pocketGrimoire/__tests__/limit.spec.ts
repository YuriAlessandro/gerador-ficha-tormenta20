import { describe, it, expect } from 'vitest';
import { anonymousGrimoireLimit, anonymousLimitMessage } from '../limit';
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

describe('limite de quem está deslogado', () => {
  it('é o do plano gratuito, sem boost', () => {
    expect(anonymousGrimoireLimit()).toBe(
      SUPPORT_LIMITS[SupportLevel.FREE].maxPocketGrimoires
    );
    expect(anonymousGrimoireLimit()).toBe(10);
  });

  it('a mensagem convida a entrar', () => {
    expect(anonymousLimitMessage(10)).toBe(
      'Você atingiu o limite de 10 grimórios. Exclua algum, ou entre na sua conta e apoie o projeto para ter mais.'
    );
  });
});
