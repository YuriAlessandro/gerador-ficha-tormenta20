import { describe, it, expect } from 'vitest';
import {
  GRIMOIRE_HARD_LIMIT,
  grimoireLimitMessage,
  grimoireLimitState,
  lockedGrimoireIds,
  lockedGrimoireMessage,
} from '../limit';
import { PocketGrimoire } from '../../../interfaces/PocketGrimoire';
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
  it('abaixo do limite pode criar', () => {
    expect(grimoireLimitState({ count: 9, max: 10 })).toMatchObject({
      canCreate: true,
      limit: 10,
    });
  });

  it('no limite não pode criar (logado ou não: o deslogado usa o gratuito)', () => {
    expect(grimoireLimitState({ count: 10, max: 10 })).toMatchObject({
      canCreate: false,
      limit: 10,
    });
  });

  it('ilimitado vai até o teto absoluto', () => {
    expect(grimoireLimitState({ count: 99, max: -1 })).toMatchObject({
      canCreate: true,
      limit: GRIMOIRE_HARD_LIMIT,
    });
    expect(
      grimoireLimitState({ count: GRIMOIRE_HARD_LIMIT, max: -1 }).canCreate
    ).toBe(false);
  });
});

describe('grimoireLimitMessage', () => {
  it('diz o limite do plano', () => {
    expect(grimoireLimitMessage(10)).toBe(
      'Você atingiu o limite de 10 grimórios do seu plano. Exclua algum ou apoie o projeto para ter mais.'
    );
  });

  it('deslogado: convida a entrar', () => {
    expect(grimoireLimitMessage(10, false)).toBe(
      'Você atingiu o limite de 10 grimórios. Exclua algum, ou entre na sua conta e apoie o projeto para ter mais.'
    );
  });

  it('no teto absoluto, fala da conta', () => {
    expect(grimoireLimitMessage(GRIMOIRE_HARD_LIMIT)).toBe(
      'Você atingiu o limite de 100 grimórios por conta. Exclua algum para criar outro.'
    );
  });
});

describe('lockedGrimoireMessage', () => {
  it('logado', () => {
    expect(lockedGrimoireMessage(10)).toBe(
      'Este grimório está acima do limite de 10 grimórios do seu plano. Exclua algum grimório para liberá-lo ou apoie o projeto para ter mais.'
    );
  });

  it('deslogado', () => {
    expect(lockedGrimoireMessage(10, false)).toBe(
      'Este grimório está acima do limite de 10 grimórios. Exclua algum grimório para liberá-lo, ou entre na sua conta e apoie o projeto para ter mais.'
    );
  });
});

describe('lockedGrimoireIds', () => {
  const list = (...ids: string[]): PocketGrimoire[] =>
    ids.map((id) => ({
      id,
      name: id,
      itemIds: [],
      createdAt: '',
      updatedAt: '',
    }));
  const locked = (ids: string[], rejected: string[], limit: number) =>
    Array.from(lockedGrimoireIds(list(...ids), rejected, limit)).sort();

  it('dentro do limite, nada fica bloqueado', () => {
    expect(locked(['a', 'b'], ['b'], 2)).toEqual([]);
  });

  it('sem recusados (deslogado), bloqueia o fim da lista', () => {
    expect(locked(['a', 'b', 'c', 'd'], [], 2)).toEqual(['c', 'd']);
  });

  it('os da conta têm prioridade sobre os recusados pelo servidor', () => {
    // 7 na conta + 5 do navegador, limite 10: 2 sobras bloqueadas.
    const conta = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
    const navegador = ['n1', 'n2', 'n3', 'n4', 'n5'];
    expect(locked([...navegador, ...conta], ['n4', 'n5'], 10)).toEqual([
      'n4',
      'n5',
    ]);
  });

  it('um recusado no meio da lista não toma a vaga de um da conta', () => {
    expect(locked(['r', 'a', 'b'], ['r'], 2)).toEqual(['r']);
  });

  it('excluir qualquer grimório libera o primeiro bloqueado', () => {
    expect(locked(['a', 'r1', 'r2'], ['r1', 'r2'], 2)).toEqual(['r2']);
  });

  it('plano rebaixado: os da conta além do limite também ficam bloqueados', () => {
    expect(locked(['a', 'b', 'c'], [], 1)).toEqual(['b', 'c']);
  });

  it('ids recusados que já não existem são ignorados', () => {
    expect(locked(['a', 'b'], ['sumiu'], 2)).toEqual([]);
  });
});
