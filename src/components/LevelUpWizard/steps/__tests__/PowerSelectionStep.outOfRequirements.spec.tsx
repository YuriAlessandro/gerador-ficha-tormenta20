import React from 'react';
import { vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/react';
import { GeneralPower, GeneralPowerType } from '@/interfaces/Poderes';
import { ClassPower } from '@/interfaces/Class';
import PowerSelectionStep from '../PowerSelectionStep';

/**
 * Opt-in "quebre a regra": com 300+ poderes gerais e frequentemente menos de 50
 * escolhíveis, os reprovados por pré-requisito ficam escondidos enquanto se
 * navega (a busca ainda os encontra, travados) e o checkbox os mostra já
 * escolhíveis.
 */
const generalPower = (name: string): GeneralPower => ({
  name,
  type: GeneralPowerType.COMBATE,
  description: `Descrição de ${name}`,
  requirements: [],
});

const classPower = (name: string): ClassPower => ({
  name,
  text: `Texto de ${name}`,
});

const LIVRE = generalPower('Poder Livre');
const TRAVADO = generalPower('Poder Travado');
const CLASSE_LIVRE = classPower('Classe Livre');
const CLASSE_TRAVADO = classPower('Classe Travado');

const setup = (
  choice: 'class' | 'general',
  overrides: {
    onGeneralPowerSelect?: () => void;
    onClassPowerSelect?: () => void;
  } = {}
) => {
  const onGeneralPowerSelect = overrides.onGeneralPowerSelect ?? vi.fn();
  const onClassPowerSelect = overrides.onClassPowerSelect ?? vi.fn();
  let allow = false;

  const view = render(
    <PowerSelectionStep
      classPowers={[CLASSE_LIVRE, CLASSE_TRAVADO]}
      generalPowers={[LIVRE, TRAVADO]}
      selectedPowerChoice={choice}
      selectedClassPower={null}
      selectedGeneralPower={null}
      onPowerChoiceChange={vi.fn()}
      onClassPowerSelect={onClassPowerSelect}
      onGeneralPowerSelect={onGeneralPowerSelect}
      className='Guerreiro'
      unavailableClassPowers={[CLASSE_TRAVADO.name]}
      unavailableGeneralPowers={[TRAVADO.name]}
      allowOutOfRequirements={allow}
      onAllowOutOfRequirementsChange={vi.fn()}
    />
  );

  // O estado real mora no LevelUpWizardModal; aqui re-renderizamos com o novo
  // valor, que é exatamente o que o modal faz ao marcar o checkbox.
  const toggle = () => {
    allow = !allow;
    view.rerender(
      <PowerSelectionStep
        classPowers={[CLASSE_LIVRE, CLASSE_TRAVADO]}
        generalPowers={[LIVRE, TRAVADO]}
        selectedPowerChoice={choice}
        selectedClassPower={null}
        selectedGeneralPower={null}
        onPowerChoiceChange={vi.fn()}
        onClassPowerSelect={onClassPowerSelect}
        onGeneralPowerSelect={onGeneralPowerSelect}
        className='Guerreiro'
        unavailableClassPowers={[CLASSE_TRAVADO.name]}
        unavailableGeneralPowers={[TRAVADO.name]}
        allowOutOfRequirements={allow}
        onAllowOutOfRequirementsChange={vi.fn()}
      />
    );
  };

  return { onGeneralPowerSelect, onClassPowerSelect, toggle };
};

const search = (query: string) => {
  fireEvent.change(
    screen.getByPlaceholderText('Buscar poderes por nome ou descrição...'),
    { target: { value: query } }
  );
};

const cardOf = (name: string) =>
  screen.getByText(name).closest('.MuiPaper-root') as HTMLElement;

describe('PowerSelectionStep — poderes fora dos requisitos', () => {
  it('esconde o reprovado enquanto navega e conta só os escolhíveis', () => {
    setup('general');

    expect(screen.getByText(LIVRE.name)).toBeInTheDocument();
    expect(screen.queryByText(TRAVADO.name)).not.toBeInTheDocument();
    // Guard da contagem: antes o rótulo somava os reprovados e prometia
    // ~300 opções onde havia ~50.
    expect(
      screen.getByText(/Poder Geral \(1 disponíveis\)/)
    ).toBeInTheDocument();
  });

  it('busca encontra o reprovado, travado e com o motivo à vista', () => {
    const { onGeneralPowerSelect } = setup('general');

    search(TRAVADO.name);

    const card = cardOf(TRAVADO.name);
    expect(within(card).getByText('Indisponível')).toBeInTheDocument();
    fireEvent.click(card);
    expect(onGeneralPowerSelect).not.toHaveBeenCalled();
  });

  it('com o opt-in, o reprovado aparece sem busca e fica escolhível', () => {
    const { onGeneralPowerSelect, toggle } = setup('general');

    toggle();

    expect(
      screen.getByText(/Poder Geral \(2 disponíveis\)/)
    ).toBeInTheDocument();
    const card = cardOf(TRAVADO.name);
    expect(
      within(card).getByText('Fora dos pré-requisitos')
    ).toBeInTheDocument();
    fireEvent.click(card);
    expect(onGeneralPowerSelect).toHaveBeenCalledWith(TRAVADO);
  });

  it('vale igual para a aba de poderes de classe', () => {
    const { onClassPowerSelect, toggle } = setup('class');

    expect(screen.queryByText(CLASSE_TRAVADO.name)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Poder de Guerreiro \(1 disponíveis\)/)
    ).toBeInTheDocument();

    toggle();

    const card = cardOf(CLASSE_TRAVADO.name);
    expect(
      within(card).getByText('Fora dos pré-requisitos')
    ).toBeInTheDocument();
    fireEvent.click(card);
    expect(onClassPowerSelect).toHaveBeenCalledWith(CLASSE_TRAVADO);
  });
});
