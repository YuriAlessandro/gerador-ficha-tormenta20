import React from 'react';
import { vi } from 'vitest';
import _ from 'lodash';
import { render, screen, fireEvent } from '@testing-library/react';
import atlasOriginPowers from '@/data/systems/tormenta20/atlas-de-arton/powers/originPowers';
import { getPowerSelectionRequirements } from '@/functions/powers/manualPowerSelection';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import GUERREIRO from '@/data/systems/tormenta20/classes/guerreiro';
import { SupplementId } from '@/types/supplement.types';
import PowerSelectionDialog from '../PowerSelectionDialog';

vi.mock('@/hooks/useContentSupplements', () => ({
  useContentSupplements: () => [SupplementId.TORMENTA20_CORE],
}));

/**
 * Cosmopolita (Valkaria) oferece "um poder geral OU um poder de classe" — um
 * `chooseFromOptions` cujos requisitos só existem depois que o ramo é escolhido.
 *
 * O diálogo do editor de poderes não resolvia requisito aninhado (só recebia o
 * primeiro nível) e não tinha caso para `getClassPower` (caía no
 * `default: return null`). Resultado: o segundo passo nunca aparecia e o
 * Confirmar era rejeitado — a escolha ficava impossível de refazer pela ficha.
 */
const { COSMOPOLITA } = atlasOriginPowers;
const requirements = getPowerSelectionRequirements(COSMOPOLITA);
if (!requirements) throw new Error('Cosmopolita sem requisitos de seleção');

const mkSheet = () => {
  const sheet = createMockCharacterSheet();
  sheet.nivel = 1;
  sheet.classe = _.cloneDeep(GUERREIRO);
  sheet.generalPowers = [];
  sheet.classPowers = [];
  return sheet;
};

describe('PowerSelectionDialog + escolha de poder do Cosmopolita', () => {
  it('só revela o segundo passo depois de escolher o ramo', () => {
    const onConfirm = vi.fn();

    render(
      <PowerSelectionDialog
        open
        onClose={vi.fn()}
        onConfirm={onConfirm}
        requirements={requirements}
        ownerPower={COSMOPOLITA}
        sheet={mkSheet()}
      />
    );

    // Primeiro passo: os dois ramos.
    expect(screen.getByRole('radio', { name: /Poder geral/ })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /Poder de classe/ })).toBeTruthy();
    expect(screen.queryByText('Selecione um poder de classe')).toBeNull();

    // Sem nada escolhido, o Confirmar não passa.
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/ }));
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('radio', { name: /Poder de classe/ }));

    // Segundo passo revelado: a lista de poderes de classe.
    expect(screen.getByText('Selecione um poder de classe')).toBeTruthy();

    // O ramo escolhido sozinho ainda não fecha a escolha.
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/ }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirma com o ramo e o poder escolhidos', () => {
    const onConfirm = vi.fn();

    render(
      <PowerSelectionDialog
        open
        onClose={vi.fn()}
        onConfirm={onConfirm}
        requirements={requirements}
        ownerPower={COSMOPOLITA}
        sheet={mkSheet()}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /Poder geral/ }));

    // O primeiro rádio de poder que não é um dos dois ramos.
    const radios = screen.getAllByRole('radio');
    const powerRadio = radios.find(
      (radio) =>
        !['Poder geral', 'Poder de classe'].some((branch) =>
          radio.closest('label')?.textContent?.startsWith(branch)
        )
    );
    if (!powerRadio) throw new Error('nenhum poder geral oferecido');
    fireEvent.click(powerRadio);

    fireEvent.click(screen.getByRole('button', { name: /Confirmar/ }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0][0].chosenOption).toEqual(['Poder geral']);
    expect(onConfirm.mock.calls[0][0].powers).toHaveLength(1);
  });

  it('semeia a escolha atual quando reaberto para troca', () => {
    render(
      <PowerSelectionDialog
        open
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        requirements={requirements}
        ownerPower={COSMOPOLITA}
        initialSelections={{ chosenOption: ['Poder de classe'] }}
        sheet={mkSheet()}
      />
    );

    expect(
      screen.getByRole('radio', { name: /Poder de classe/ })
    ).toHaveProperty('checked', true);
    expect(screen.getByText('Selecione um poder de classe')).toBeTruthy();
  });
});
