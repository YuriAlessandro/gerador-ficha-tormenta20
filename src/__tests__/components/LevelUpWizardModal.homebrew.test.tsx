import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LevelUpWizardModal from '@/components/LevelUpWizard/LevelUpWizardModal';
import { dataRegistry } from '@/data/registry';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import { SupplementId } from '@/types/supplement.types';
import { SupplementData } from '@/data/systems/tormenta20/core';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '@/interfaces/Poderes';
import { ClassPower } from '@/interfaces/Class';
import CharacterSheet from '@/interfaces/CharacterSheet';

vi.mock('@/hooks/useFeatureAccess', () => ({
  useFeatureAccess: () => ({
    hasAccess: false,
    isEnabled: false,
    isLoading: false,
    supporterOnly: false,
  }),
}));

const HOMEBREW_ID = 'homebrew:teste-poderes';

const ACTIVE_SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
  HOMEBREW_ID as SupplementId,
];

const emptyPowers = () => ({
  [GeneralPowerType.COMBATE]: [],
  [GeneralPowerType.DESTINO]: [],
  [GeneralPowerType.MAGIA]: [],
  [GeneralPowerType.CONCEDIDOS]: [],
  [GeneralPowerType.TORMENTA]: [],
  [GeneralPowerType.RACA]: [],
});

const generalPower = (
  name: string,
  type: GeneralPowerType,
  requirements: GeneralPower['requirements'] = []
): GeneralPower => ({
  name,
  type,
  description: `Poder homebrew ${name}.`,
  requirements,
});

const classPower = (name: string): ClassPower => ({
  name,
  text: `Poder de classe homebrew ${name}.`,
});

/**
 * Registra um suplemento em runtime igual ao que o bootstrap de homebrew faz:
 * o `SupplementData` é montado literal (sem passar pelo compilador do premium)
 * para que a suíte rode nos dois modos do CI e teste exatamente a forma que o
 * assistente consome do registry.
 */
const registerHomebrew = (data: Partial<SupplementData>) => {
  dataRegistry.registerRuntimeSupplement(HOMEBREW_ID, {
    id: HOMEBREW_ID as SupplementId,
    displayName: 'Pacote de Teste',
    races: [],
    classes: [],
    powers: emptyPowers(),
    ...data,
  });
};

const elfoSheetOfClass = (className: string): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  const classe = dataRegistry.getClassByName(className, ACTIVE_SUPPLEMENTS);
  if (!classe) throw new Error(`${className} não encontrada no registry`);

  sheet.nivel = 1;
  sheet.classe = classe;
  sheet.classLevels = [{ level: 1, className }];
  // Elfo (e não Humano): Humano sorteia um poder geral a cada recálculo e
  // deixaria a asserção intermitente.
  sheet.raca = { ...sheet.raca, name: 'Elfo' };
  return sheet;
};

const openPowerSelection = (sheet: CharacterSheet) => {
  render(
    <LevelUpWizardModal
      open
      initialSheet={sheet}
      targetLevel={2}
      supplements={ACTIVE_SUPPLEMENTS}
      onConfirm={vi.fn()}
      onCancel={vi.fn()}
    />
  );
  // "Ganhos do Nível" -> "Escolha de Poder"
  fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
};

/** A lista de poderes gerais só é montada depois de marcar o tipo no radio. */
const chooseGeneralPowers = () => {
  fireEvent.click(screen.getByRole('radio', { name: /Poder Geral/ }));
};

const searchPowers = (query: string) => {
  fireEvent.change(
    screen.getByPlaceholderText('Buscar poderes por nome ou descrição...'),
    { target: { value: query } }
  );
};

const toggleOutOfRequirements = () => {
  fireEvent.click(
    screen.getByRole('checkbox', {
      name: 'Mostrar poderes fora dos requisitos',
    })
  );
};

describe('LevelUpWizardModal — poderes de suplemento registrado em runtime', () => {
  afterEach(() => {
    dataRegistry.clearRuntimeSupplements();
  });

  it('oferece poder geral homebrew', () => {
    registerHomebrew({
      powers: {
        ...emptyPowers(),
        [GeneralPowerType.COMBATE]: [
          generalPower('Investida Brutal', GeneralPowerType.COMBATE),
        ],
      },
    });

    openPowerSelection(elfoSheetOfClass('Guerreiro'));
    chooseGeneralPowers();

    expect(screen.getByText('Investida Brutal')).toBeInTheDocument();
  });

  it('oferece poder de classe homebrew para a classe-alvo', () => {
    registerHomebrew({
      classPowers: { Guerreiro: [classPower('Golpe Decisivo')] },
    });

    openPowerSelection(elfoSheetOfClass('Guerreiro'));

    expect(screen.getByText('Golpe Decisivo')).toBeInTheDocument();
  });

  it('oferece poder de classe homebrew endereçado a uma classe VARIANTE', () => {
    registerHomebrew({
      classPowers: { Alquimista: [classPower('Elixir Instável')] },
    });

    openPowerSelection(elfoSheetOfClass('Alquimista'));

    expect(screen.getByText('Elixir Instável')).toBeInTheDocument();
  });

  it('oferece poder de raça homebrew apenas para a raça exigida', () => {
    registerHomebrew({
      powers: {
        ...emptyPowers(),
        [GeneralPowerType.RACA]: [
          generalPower('Graça Élfica', GeneralPowerType.RACA, [
            [{ type: RequirementType.RACA, name: 'Elfo' }],
          ]),
        ],
      },
    });

    openPowerSelection(elfoSheetOfClass('Guerreiro'));
    chooseGeneralPowers();

    expect(screen.getByText('Graça Élfica')).toBeInTheDocument();
  });

  it('esconde poder de raça homebrew de quem é de outra raça', () => {
    registerHomebrew({
      powers: {
        ...emptyPowers(),
        [GeneralPowerType.RACA]: [
          generalPower('Fúria Anã', GeneralPowerType.RACA, [
            [{ type: RequirementType.RACA, name: 'Anão' }],
          ]),
        ],
      },
    });

    openPowerSelection(elfoSheetOfClass('Guerreiro'));
    chooseGeneralPowers();

    expect(screen.queryByText('Fúria Anã')).not.toBeInTheDocument();
  });

  const registerBencaoProibida = () => {
    registerHomebrew({
      powers: {
        ...emptyPowers(),
        [GeneralPowerType.CONCEDIDOS]: [
          generalPower('Bênção Proibida', GeneralPowerType.CONCEDIDOS, [
            [{ type: RequirementType.DEVOTO, name: 'Khalmyr' }],
          ]),
        ],
      },
    });
  };

  const nonDevotoSheet = () => {
    const sheet = elfoSheetOfClass('Guerreiro');
    sheet.devoto = undefined;
    return sheet;
  };

  it('esconde poder concedido de não-devoto, mas a busca ainda o encontra como indisponível', () => {
    registerBencaoProibida();

    openPowerSelection(nonDevotoSheet());
    chooseGeneralPowers();

    // Navegando, o reprovado nem aparece: é o que enxuga a lista de 300+.
    expect(screen.queryByText('Bênção Proibida')).not.toBeInTheDocument();

    // Procurando pelo nome, ele reaparece com o motivo à vista — ninguém
    // conclui que o poder não existe.
    searchPowers('Bênção Proibida');
    const card = screen.getByText('Bênção Proibida').closest('.MuiPaper-root');
    expect(card).not.toBeNull();
    expect(
      within(card as HTMLElement).getByText('Indisponível')
    ).toBeInTheDocument();
  });

  it('opt-in mostra e libera a escolha do poder fora dos requisitos', () => {
    registerBencaoProibida();

    openPowerSelection(nonDevotoSheet());
    chooseGeneralPowers();
    toggleOutOfRequirements();

    const nome = screen.getByText('Bênção Proibida');
    const card = nome.closest('.MuiPaper-root') as HTMLElement;
    expect(
      within(card).getByText('Fora dos pré-requisitos')
    ).toBeInTheDocument();

    // O estado do opt-in mora no modal, então a escolha vale de verdade: o
    // aviso de passo incompleto só sai se o clique tiver selecionado o poder.
    expect(
      screen.getByText('Selecione um poder para continuar.')
    ).toBeInTheDocument();
    fireEvent.click(nome);
    expect(
      screen.queryByText('Selecione um poder para continuar.')
    ).not.toBeInTheDocument();
  });
});
