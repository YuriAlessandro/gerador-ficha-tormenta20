import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import cloneDeep from 'lodash/cloneDeep';
import PowerEffectSelectionStep from '@/components/CharacterCreationWizard/steps/PowerEffectSelectionStep';
import {
  countRequirementSelections,
  getFilteredAvailableOptions,
  resolvePowerRequirements,
} from '@/functions/powers/manualPowerSelection';
import { findClassDescription } from '@/functions/multiclass';
import { ManualPowerSelections } from '@/interfaces/PowerSelections';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { SupplementId } from '@/types/supplement.types';
import { DIVINDADES } from '@/data/systems/tormenta20/divindades';
import {
  applyLinhagemAbencoadaToSpellPath,
  createLinhagemAbencoada,
  getArcanistaSpellPath,
} from '@/data/systems/tormenta20/classes/arcanista';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';

/**
 * Linhagem Abençoada (Deuses de Arton, pág. 33): no 2º nível o Feiticeiro
 * recebe um poder concedido do deus da linhagem "sem precisar ser devoto". O
 * passo "Efeitos de Habilidades" mostrava "Você já possui todas as opções
 * disponíveis deste poder" — os poderes concedidos exigem DEVOTO e o filtro
 * reprovava todos. Sem opção, o `canProceed` liberava o Próximo e o poder saía
 * SORTEADO no apply.
 */
const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_DEUSES_ARTON,
];

const DEUS = 'Khalmyr';
const PODER_CONCEDIDO = 'Linhagem Abençoada (Poder Concedido)';
const PODERES_DO_DEUS = DIVINDADES.find((d) => d.name === DEUS)!.poderes;
const NIVEL = 2;

function makeFeiticeiroAbencoado(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.nivel = NIVEL;
  sheet.classe = cloneDeep(findClassDescription('Arcanista')!);
  sheet.classe.subname = 'Feiticeiro';
  sheet.classe.spellPath = applyLinhagemAbencoadaToSpellPath(
    getArcanistaSpellPath('Feiticeiro')
  );
  sheet.classe.abilities = [
    ...sheet.classe.abilities,
    ...createLinhagemAbencoada(DEUS),
  ];
  sheet.classe.originalAbilities = undefined;
  return sheet;
}

const sheet = makeFeiticeiroAbencoado();

/** Espelha o `canProceed('Efeitos de Habilidades')` do assistente. */
function canProceed(selections: ManualPowerSelections): boolean {
  return sheet.classe.abilities
    .filter((ability) => ability.nivel === NIVEL)
    .every((ability) =>
      resolvePowerRequirements(ability, selections).every(
        ({ selectionKey, requirement }) => {
          if (requirement.optional) return true;
          const options = getFilteredAvailableOptions(requirement, sheet);
          if (options.length === 0) return true;
          const count = countRequirementSelections(
            requirement,
            selections[selectionKey]
          );
          if (count === null) return true;
          return count >= Math.min(requirement.pick, options.length);
        }
      )
    );
}

let currentSelections: ManualPowerSelections = {};

function Harness() {
  const [selections, setSelections] = React.useState<ManualPowerSelections>({});
  currentSelections = selections;
  return (
    <PowerEffectSelectionStep
      race={sheet.raca}
      classe={sheet.classe}
      selections={selections}
      onChange={setSelections}
      actualSheet={sheet}
      skipRaceAbilities
      classAbilityLevel={NIVEL}
      supplements={SUPPLEMENTS}
    />
  );
}

describe('Poder concedido da Linhagem Abençoada no assistente', () => {
  beforeEach(() => {
    currentSelections = {};
    render(<Harness />);
  });

  it('não é devoto e mesmo assim lista os poderes do deus', () => {
    expect(sheet.devoto).toBeUndefined();
    expect(
      screen.queryByText(/já possui todas as opções disponíveis/)
    ).toBeNull();

    PODERES_DO_DEUS.forEach((poder) => {
      expect(screen.getByText(poder.name)).toBeTruthy();
    });
  });

  it('trava o Próximo até o jogador escolher', () => {
    expect(canProceed(currentSelections)).toBe(false);

    const escolhido = PODERES_DO_DEUS[1];
    fireEvent.click(screen.getByText(escolhido.name));

    expect(
      currentSelections[PODER_CONCEDIDO]?.powers?.map((p) => p.name)
    ).toEqual([escolhido.name]);
    expect(canProceed(currentSelections)).toBe(true);
  });
});
