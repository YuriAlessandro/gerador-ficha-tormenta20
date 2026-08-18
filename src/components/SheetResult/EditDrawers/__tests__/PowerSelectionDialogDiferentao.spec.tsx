import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KOBOLDS_TALENTS from '@/data/systems/tormenta20/ameacas-de-arton/powers/koboldsTalents';
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import { SupplementId } from '@/types/supplement.types';
import PowerSelectionDialog from '../PowerSelectionDialog';

// O diálogo lê os suplementos ativos do Redux; aqui só interessam os do core.
vi.mock('@/hooks/useContentSupplements', () => ({
  useContentSupplements: () => [SupplementId.TORMENTA20_CORE],
}));

/**
 * Diferentão (Kobolds) pede uma classe e um poder dela. O diálogo do drawer de
 * poderes não tinha caso para `almaLivreSelectClass`: abria sem seletor nenhum e
 * o Confirmar era rejeitado, deixando o poder impossível de adicionar por ali.
 */
const diferentao = KOBOLDS_TALENTS.find(
  (power) => power.name === 'Diferentão (Kobolds)'
);
if (!diferentao) throw new Error('Diferentão não encontrado');

const requirements = getPowerSelectionRequirements(diferentao);
if (!requirements) throw new Error('Diferentão sem requisitos de seleção');

describe('PowerSelectionDialog + Diferentão (Kobolds)', () => {
  it('desenha o seletor de classe e confirma a escolha', () => {
    const onConfirm = vi.fn();
    const sheet = createMockCharacterSheet();

    render(
      <PowerSelectionDialog
        open
        onClose={vi.fn()}
        onConfirm={onConfirm}
        requirements={requirements}
        sheet={sheet}
      />
    );

    expect(screen.getByLabelText('Classe *')).toBeTruthy();

    fireEvent.mouseDown(screen.getByLabelText('Classe *'));
    fireEvent.click(screen.getByRole('option', { name: /Bardo/ }));

    // Só a classe: ainda falta o poder, então o Confirmar não passa.
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/ }));
    expect(onConfirm).not.toHaveBeenCalled();

    // Os poderes são cards clicáveis, não rádios.
    const powerCard = document.querySelector('.MuiCard-root');
    if (!powerCard) throw new Error('nenhum poder de Bardo oferecido');
    fireEvent.click(powerCard);

    fireEvent.click(screen.getByRole('button', { name: /Confirmar/ }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0][0].diferentaoClass).toBe('Bardo');
    expect(onConfirm.mock.calls[0][0].diferentaoPower).toBeTruthy();
  });
});
