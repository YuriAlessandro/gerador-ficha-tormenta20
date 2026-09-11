import React from 'react';
import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClassPower } from '@/interfaces/Class';
import { GeneralPower, GeneralPowerType } from '@/interfaces/Poderes';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import PowerSelectionStep from '../PowerSelectionStep';

/**
 * A escolha de poder do level-up, sobre o catálogo compartilhado.
 *
 * O defeito que motivou a mudança: a lista de poderes de classe tinha um
 * cabeçalho único com o nome da classe do personagem, então um poder de
 * Bárbaro destravado por "Domínio do Medo" aparecia sob "Poderes de Bucaneiro".
 */

const classPower = (
  name: string,
  extra: Partial<ClassPower> = {}
): ClassPower =>
  ({
    name,
    text: `Texto de ${name}`,
    requirements: [],
    ...extra,
  } as ClassPower);

const generalPower = (name: string): GeneralPower => ({
  name,
  description: `Descrição de ${name}`,
  type: GeneralPowerType.COMBATE,
  requirements: [],
});

const PROPRIO = classPower('Abusar dos Fracos');
const DESTRAVADO = classPower('Alma Inabalável', {
  className: 'Bárbaro',
  unlockedBy: 'Domínio do Medo',
});

interface Overrides {
  knownClassPowers?: string[];
  almaLivrePower?: ClassPower | null;
  almaLivreClassName?: string;
  almaLivrePowerAvailable?: boolean;
}

const renderStep = (overrides: Overrides = {}) => {
  const sheet = createMockCharacterSheet();
  const onClassPowerSelect = vi.fn();
  const onGeneralPowerSelect = vi.fn();
  const onPowerChoiceChange = vi.fn();

  render(
    <PowerSelectionStep
      sheet={sheet}
      classPowers={[PROPRIO, DESTRAVADO]}
      generalPowers={[generalPower('Ataque Poderoso')]}
      selectedPowerChoice={null}
      selectedClassPower={null}
      selectedGeneralPower={null}
      onPowerChoiceChange={onPowerChoiceChange}
      onClassPowerSelect={onClassPowerSelect}
      onGeneralPowerSelect={onGeneralPowerSelect}
      className='Bucaneiro'
      knownClassPowers={overrides.knownClassPowers}
      almaLivrePower={overrides.almaLivrePower}
      almaLivreClassName={overrides.almaLivreClassName}
      almaLivrePowerAvailable={overrides.almaLivrePowerAvailable}
    />
  );

  return { onClassPowerSelect, onGeneralPowerSelect, onPowerChoiceChange };
};

describe('PowerSelectionStep', () => {
  it('separa o poder destravado da classe do personagem', () => {
    renderStep();

    expect(screen.getByText('Poder de Bucaneiro')).toBeInTheDocument();
    // O grupo do poder destravado nomeia a classe REAL e o poder que o abriu.
    expect(
      screen.getByText('Poder de Bárbaro (via Domínio do Medo)')
    ).toBeInTheDocument();
  });

  it('deriva o tipo da escolha do grupo do item clicado', () => {
    const { onClassPowerSelect, onPowerChoiceChange } = renderStep();

    // O clique no NOME expande a linha; quem seleciona é o checkbox.
    fireEvent.click(screen.getByLabelText('Selecionar Alma Inabalável'));

    expect(onPowerChoiceChange).toHaveBeenCalledWith('class');
    expect(onClassPowerSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alma Inabalável', className: 'Bárbaro' })
    );
  });

  it('escolher poder geral muda o tipo sem passar por um seletor à parte', () => {
    const { onGeneralPowerSelect, onPowerChoiceChange } = renderStep();

    fireEvent.click(screen.getByLabelText('Selecionar Ataque Poderoso'));

    expect(onPowerChoiceChange).toHaveBeenCalledWith('general');
    expect(onGeneralPowerSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Ataque Poderoso' })
    );
  });

  it('não seleciona poder de classe já conhecido e não repetível', () => {
    const { onClassPowerSelect } = renderStep({
      knownClassPowers: ['Alma Inabalável'],
    });

    fireEvent.click(screen.getByLabelText('Selecionar Alma Inabalável'));

    expect(onClassPowerSelect).not.toHaveBeenCalled();
  });

  it('Alma Livre vira um grupo próprio, não um poder da classe do personagem', () => {
    renderStep({
      almaLivrePower: classPower('Golpe Pessoal', { className: 'Guerreiro' }),
      almaLivreClassName: 'Guerreiro',
      almaLivrePowerAvailable: true,
    });

    expect(
      screen.getByText('Poder de Guerreiro (via Alma Livre)')
    ).toBeInTheDocument();
  });
});
