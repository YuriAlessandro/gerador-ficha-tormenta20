import React from 'react';
import { vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { GeneralPower, GeneralPowerType } from '@/interfaces/Poderes';
import { ClassPower } from '@/interfaces/Class';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import PowerSelectionStep from '../PowerSelectionStep';

/**
 * "Quebre a regra": com 300+ poderes gerais e frequentemente menos de 50
 * escolhíveis, os reprovados por pré-requisito ficam escondidos enquanto se
 * navega (a busca ainda os encontra, travados). Desligar "Só os que posso
 * pegar" os mostra já escolhíveis — não há um segundo controle para isso.
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

const setup = () => {
  const sheet = createMockCharacterSheet();
  const onGeneralPowerSelect = vi.fn();
  const onClassPowerSelect = vi.fn();
  const onAllowOutOfRequirementsChange = vi.fn();

  const renderWith = (allow: boolean) => (
    <PowerSelectionStep
      sheet={sheet}
      classPowers={[CLASSE_LIVRE, CLASSE_TRAVADO]}
      generalPowers={[LIVRE, TRAVADO]}
      selectedPowerChoice={null}
      selectedClassPower={null}
      selectedGeneralPower={null}
      onPowerChoiceChange={vi.fn()}
      onClassPowerSelect={onClassPowerSelect}
      onGeneralPowerSelect={onGeneralPowerSelect}
      className='Guerreiro'
      unavailableClassPowers={[CLASSE_TRAVADO.name]}
      unavailableGeneralPowers={[TRAVADO.name]}
      allowOutOfRequirements={allow}
      onAllowOutOfRequirementsChange={onAllowOutOfRequirementsChange}
    />
  );

  const view = render(renderWith(false));

  // O estado real mora no LevelUpWizardModal; aqui re-renderizamos com o novo
  // valor, que é exatamente o que o modal faz ao desligar o filtro.
  const enableOptIn = () => view.rerender(renderWith(true));

  return {
    onGeneralPowerSelect,
    onClassPowerSelect,
    onAllowOutOfRequirementsChange,
    enableOptIn,
  };
};

describe('PowerSelectionStep — poderes fora dos requisitos', () => {
  it('esconde o reprovado enquanto navega', () => {
    setup();

    expect(screen.getByText(LIVRE.name)).toBeInTheDocument();
    expect(screen.getByText(CLASSE_LIVRE.name)).toBeInTheDocument();
    expect(screen.queryByText(TRAVADO.name)).not.toBeInTheDocument();
    expect(screen.queryByText(CLASSE_TRAVADO.name)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Só os que posso pegar')).toBeChecked();
    expect(
      screen.queryByLabelText('Mostrar poderes fora dos requisitos')
    ).not.toBeInTheDocument();
  });

  it('desligar "Só os que posso pegar" pede ao modal para quebrar a regra', () => {
    const { onAllowOutOfRequirementsChange, enableOptIn } = setup();

    fireEvent.click(screen.getByLabelText('Só os que posso pegar'));
    expect(onAllowOutOfRequirementsChange).toHaveBeenCalledWith(true);

    enableOptIn();
    expect(screen.getByLabelText('Só os que posso pegar')).not.toBeChecked();
    fireEvent.click(screen.getByLabelText('Só os que posso pegar'));
    expect(onAllowOutOfRequirementsChange).toHaveBeenLastCalledWith(false);
  });

  it('busca encontra o reprovado, travado', async () => {
    const { onGeneralPowerSelect } = setup();

    fireEvent.change(
      screen.getByPlaceholderText('Buscar poder ou habilidade...'),
      { target: { value: 'Travado' } }
    );

    // O filtro "Só os que posso pegar" segue ligado, mas não vale na busca.
    // (O nome vem quebrado pelo destaque da busca; o rótulo da linha, não.)
    fireEvent.click(await screen.findByLabelText(`Selecionar ${TRAVADO.name}`));
    expect(onGeneralPowerSelect).not.toHaveBeenCalled();
  });

  it('com o filtro desligado, o reprovado aparece sem busca e fica escolhível', () => {
    const { onGeneralPowerSelect, enableOptIn } = setup();

    enableOptIn();

    expect(screen.getByText(TRAVADO.name)).toBeInTheDocument();
    expect(screen.getAllByText('Fora dos pré-requisitos')).toHaveLength(2);
    fireEvent.click(screen.getByLabelText(`Selecionar ${TRAVADO.name}`));
    expect(onGeneralPowerSelect).toHaveBeenCalledWith(TRAVADO);
  });

  it('vale igual para os poderes de classe', () => {
    const { onClassPowerSelect, enableOptIn } = setup();

    enableOptIn();

    fireEvent.click(screen.getByLabelText(`Selecionar ${CLASSE_TRAVADO.name}`));
    expect(onClassPowerSelect).toHaveBeenCalledWith(CLASSE_TRAVADO);
  });
});
