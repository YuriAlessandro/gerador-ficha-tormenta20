import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import _ from 'lodash';
import Weapon from '../Weapon';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';

vi.mock('../../premium/hooks/useDiceRoll', () => ({
  useDiceRoll: () => ({
    showDiceResult: vi.fn(),
    showAttackRoll: vi.fn(),
    logExternalRoll: vi.fn(),
  }),
  default: () => ({
    showDiceResult: vi.fn(),
    showAttackRoll: vi.fn(),
    logExternalRoll: vi.fn(),
  }),
}));

/**
 * Aviso informativo na linha da arma (fundamentalista fora da arma
 * preferida). A linha inteira rola o ataque: tocar no ícone só explica.
 */
describe('Weapon — aviso informativo', () => {
  const atributos = Object.fromEntries(
    Object.values(Atributo).map((name) => [name, { name, value: 0, mod: 0 }])
  ) as unknown as CharacterAttributes;

  const renderRow = (warning: string | undefined, onRowClick = vi.fn()) => {
    render(
      <div onClick={onRowClick} role='presentation'>
        <Weapon
          equipment={{ ..._.cloneDeep(Armas.ESPADA_LONGA), id: 'espada' }}
          completeSkills={[]}
          atributos={atributos}
          nivel={1}
          warning={warning}
        />
      </div>
    );
    return onRowClick;
  };

  it('mostra o ícone com o texto do aviso', () => {
    renderRow('Fundamentalista: use a arma preferida.');
    expect(
      screen.getByLabelText('Fundamentalista: use a arma preferida.')
    ).toBeInTheDocument();
  });

  it('tocar no ícone não rola o ataque', () => {
    const onRowClick = renderRow('Fundamentalista: use a arma preferida.');
    fireEvent.click(
      screen.getByLabelText('Fundamentalista: use a arma preferida.')
    );
    expect(onRowClick).not.toHaveBeenCalled();
  });

  describe('toque rápido no celular', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    // O MUI espera `enterDelay` (100ms por padrão) mesmo no toque; um toque
    // mais curto que isso não abria o tooltip.
    const tapAndExpectTooltip = (label: string) => {
      vi.useFakeTimers();
      const icon = screen.getByLabelText(label);
      fireEvent.touchStart(icon);
      act(() => {
        vi.advanceTimersByTime(10);
      });
      fireEvent.touchEnd(icon);
      act(() => {
        vi.advanceTimersByTime(10);
      });
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    };

    it('o aviso abre o tooltip num toque curto', () => {
      renderRow('Fundamentalista: use a arma preferida.');
      tapAndExpectTooltip('Fundamentalista: use a arma preferida.');
    });

    it('a marca de edição manual abre o tooltip num toque curto', () => {
      render(
        <Weapon
          equipment={{
            ..._.cloneDeep(Armas.ESPADA_LONGA),
            id: 'espada',
            hasManualEdits: true,
            manualStatFields: ['dano'],
          }}
          completeSkills={[]}
          atributos={atributos}
          nivel={1}
        />
      );
      tapAndExpectTooltip('Estatísticas modificadas manualmente');
    });
  });

  it('sem aviso, sem ícone', () => {
    renderRow(undefined);
    expect(screen.queryByLabelText(/Fundamentalista/)).toBeNull();
  });
});
