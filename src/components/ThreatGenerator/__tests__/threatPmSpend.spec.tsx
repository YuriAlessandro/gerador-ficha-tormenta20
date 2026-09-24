import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import ThreatResult from '../ThreatResult';
import {
  DEFAULT_RESISTANCE_ASSIGNMENTS,
  type ThreatSheet,
} from '../../../interfaces/ThreatSheet';
import type { ThreatPmUsage } from '../../../functions/threatPmUse';

/**
 * Gasto de PM ao usar habilidade/magia de ameaça no statblock.
 *
 * A regra que este arquivo protege é a ANTI-GASTO-DUPLO: um uso = um clique no
 * NOME. Os chips ao lado repetem só os dados, para o mestre refazer uma
 * rolagem sem pagar de novo. Também garante que o statblock fora do combate
 * (gerador, bestiário, biblioteca, visão do jogador) não gasta nada.
 */

const showDiceResult = vi.fn();
const showAttackRoll = vi.fn();
const logExternalRoll = vi.fn();

vi.mock('../../../premium/hooks/useDiceRoll', () => ({
  useDiceRoll: () => ({ showDiceResult, showAttackRoll, logExternalRoll }),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

vi.mock('../../../hooks/useFeatureAccess', () => ({
  useFeatureAccess: () => ({ isEnabled: false }),
}));

const fakeStore = {
  getState: () => ({ system: { featureFlags: {} }, threatStorage: {} }),
  subscribe: () => () => undefined,
  dispatch: (action: unknown) => action,
  replaceReducer: () => undefined,
} as never;

const threat = {
  id: 't1',
  name: 'Goblin',
  type: 'Humanoide',
  challengeLevel: '1/2',
  size: 'Pequeno',
  displacement: '9m',
  attributes: {
    forca: 10,
    destreza: 14,
    constituicao: 12,
    inteligencia: 10,
    sabedoria: 10,
    carisma: 8,
  },
  combatStats: {
    defense: 15,
    fortitude: 2,
    reflexes: 4,
    will: 0,
    hitPoints: 9,
    standardEffectDC: 13,
    manaPoints: 12,
  },
  hasManaPoints: true,
  skills: [],
  resistanceAssignments: DEFAULT_RESISTANCE_ASSIGNMENTS,
  specialQualities: '',
  attacks: [],
  abilities: [
    {
      id: 'ab1',
      name: 'Grito Aterrador',
      description: 'Assusta os inimigos próximos.',
      pmCost: 3,
    },
  ],
  spells: [
    {
      id: 'sp1',
      name: 'Bola de Fogo',
      description: 'Causa dano de fogo em área.',
      pmCost: 3,
      rolls: [{ id: 'r1', name: 'Dano', dice: '4d6', bonus: 0 }],
    },
  ],
  senses: [],
  resistances: [],
  equipment: '',
  treasureLevel: 'Padrão',
} as unknown as ThreatSheet;

const onUse = vi.fn();

const usage = (overrides: Partial<ThreatPmUsage> = {}): ThreatPmUsage => ({
  casterName: 'Goblin 2',
  currentMP: 12,
  tempMP: 0,
  maxMP: 12,
  onUse,
  ...overrides,
});

const renderStatblock = (pmUsage?: ThreatPmUsage) =>
  render(
    <Provider store={fakeStore}>
      <MemoryRouter>
        <ThreatResult threat={threat} viewOnly pmUsage={pmUsage} />
      </MemoryRouter>
    </Provider>
  );

describe('ThreatResult — gasto de PM da ameaça', () => {
  beforeEach(() => {
    onUse.mockClear();
    showDiceResult.mockClear();
    logExternalRoll.mockClear();
  });

  it('clicar no nome da magia gasta o PM uma vez e rola os dados', () => {
    renderStatblock(usage());

    screen.getByTitle('Usar Bola de Fogo (gasta 3 PM)').click();

    expect(onUse).toHaveBeenCalledTimes(1);
    expect(onUse).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Bola de Fogo' }),
      'spell',
      3
    );
    expect(showDiceResult).toHaveBeenCalledTimes(1);
  });

  it('o chip de rolagem repete os dados sem gastar PM', () => {
    renderStatblock(usage());

    screen.getByTitle(/Rolar Dano: 4d6.*\(não gasta PM\)/).click();

    expect(onUse).not.toHaveBeenCalled();
    expect(showDiceResult).toHaveBeenCalledTimes(1);
  });

  it('habilidade com custo e sem dados fica usável e registra no histórico', () => {
    renderStatblock(usage());

    screen.getByTitle('Usar Grito Aterrador (gasta 3 PM)').click();

    expect(onUse).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Grito Aterrador' }),
      'ability',
      3
    );
    expect(showDiceResult).not.toHaveBeenCalled();
    expect(logExternalRoll).toHaveBeenCalledWith(
      'Goblin 2: Grito Aterrador',
      [],
      'Goblin 2',
      expect.objectContaining({ pmCost: 3 })
    );
  });

  it('sem PM suficiente avisa mas não rola nada', () => {
    renderStatblock(usage({ currentMP: 1 }));

    screen
      .getByTitle('PM insuficiente — Bola de Fogo custa 3 PM, resta 1')
      .click();

    // O aviso ao mestre é responsabilidade do diálogo, então `onUse` é
    // chamado — mas a rolagem NÃO acontece.
    expect(onUse).toHaveBeenCalledTimes(1);
    expect(showDiceResult).not.toHaveBeenCalled();
    expect(logExternalRoll).not.toHaveBeenCalled();
  });

  it('o cabeçalho mostra o pool vivo do combatente', () => {
    const { container } = renderStatblock(usage({ currentMP: 9, tempMP: 3 }));

    expect(container).toHaveTextContent('PM 9/12 (+3 temp)');
  });

  it('sem combatente identificado nada gasta e o PM volta a ser o estático', () => {
    const { container } = renderStatblock();

    expect(container).toHaveTextContent('PM 12');
    expect(screen.queryByTitle(/Usar Bola de Fogo/)).toBeNull();

    screen.getByTitle('Rolar Bola de Fogo').click();

    expect(onUse).not.toHaveBeenCalled();
    expect(showDiceResult).toHaveBeenCalledTimes(1);
  });

  it('rollsDisabled (Bestiário) impede o gasto', () => {
    render(
      <Provider store={fakeStore}>
        <MemoryRouter>
          <ThreatResult
            threat={threat}
            viewOnly
            rollsDisabled
            pmUsage={usage()}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.queryByTitle(/Usar Bola de Fogo/)).toBeNull();
    expect(onUse).not.toHaveBeenCalled();
  });
});
