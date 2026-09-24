import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import KOBOLDS from '@/data/systems/tormenta20/ameacas-de-arton/races/kobolds';
import PowerEffectSelectionStep from '@/components/CharacterCreationWizard/steps/PowerEffectSelectionStep';
import {
  countRequirementSelections,
  resolvePowerRequirements,
} from '@/functions/powers/manualPowerSelection';
import { ManualPowerSelections } from '@/interfaces/PowerSelections';

/**
 * Talentos do Bando (Kobolds, Ameaças de Arton): a raça concede 2 poderes, e 3
 * deles pedem uma SEGUNDA escolha (familiar, classe+poder, magia). O passo
 * "Efeitos de Poderes" desenhava só o seletor de magia, então escolher
 * Ex-Familiar ou Diferentão travava o botão Próximo para sempre — a validação
 * exigia a escolha, mas não havia onde fazê-la.
 */
const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
];

const GUERREIRO = dataRegistry
  .getClassesBySupplements(SUPPLEMENTS)
  .find((c) => c.name === 'Guerreiro');

const TALENTOS_DO_BANDO = KOBOLDS.abilities.find(
  (ability) => ability.name === 'Talentos do Bando'
);

if (!GUERREIRO || !TALENTOS_DO_BANDO) {
  throw new Error('fixture de Kobolds/Guerreiro indisponível');
}

/** Espelha o `canProceed('Efeitos de Poderes')` do assistente de criação. */
function canProceed(effectSelections: ManualPowerSelections): boolean {
  return resolvePowerRequirements(TALENTOS_DO_BANDO!, effectSelections).every(
    ({ selectionKey, requirement }) => {
      if (requirement.optional) return true;
      const count = countRequirementSelections(
        requirement,
        effectSelections[selectionKey]
      );
      if (count === null) return true;
      return count >= requirement.pick;
    }
  );
}

let currentSelections: ManualPowerSelections = {};

function Harness() {
  const [selections, setSelections] = React.useState<ManualPowerSelections>({});
  currentSelections = selections;
  return (
    <PowerEffectSelectionStep
      race={KOBOLDS}
      classe={GUERREIRO!}
      selections={selections}
      onChange={setSelections}
      supplements={SUPPLEMENTS}
      usedSkills={[]}
    />
  );
}

/** Marca um talento pelo nome na lista de checkboxes. */
function pickTalent(name: string) {
  const input = screen.getByText(name).closest('label')?.querySelector('input');
  if (!input) throw new Error(`checkbox não encontrado: ${name}`);
  fireEvent.click(input);
}

function renderStep() {
  currentSelections = {};
  render(<Harness />);
}

describe('Talentos do Bando (Kobolds)', () => {
  it('Ex-Familiar mostra o seletor de familiar e libera o Próximo', () => {
    renderStep();
    pickTalent('Amontoados (Kobolds)');
    pickTalent('Ex-Familiar (Kobolds)');

    expect(canProceed(currentSelections)).toBe(false);
    expect(screen.getByText(/Selecione 1 familiar/)).toBeTruthy();

    fireEvent.click(screen.getByText('Coruja'));

    expect(currentSelections['Ex-Familiar (Kobolds)']?.familiars).toEqual([
      'CORUJA',
    ]);
    expect(canProceed(currentSelections)).toBe(true);
  });

  it('Diferentão mostra o seletor de classe e poder', () => {
    renderStep();
    pickTalent('Amontoados (Kobolds)');
    pickTalent('Diferentão (Kobolds)');

    expect(canProceed(currentSelections)).toBe(false);
    expect(
      screen.getByText(/Diferentão \(Kobolds\) requer escolha adicional/)
    ).toBeTruthy();
    expect(screen.getByLabelText('Classe *')).toBeTruthy();

    // Escolher a classe: o poder ainda falta, então o Próximo segue travado.
    fireEvent.mouseDown(screen.getByLabelText('Classe *'));
    fireEvent.click(screen.getByRole('option', { name: /Bardo/ }));

    expect(currentSelections['Diferentão (Kobolds)']?.diferentaoClass).toBe(
      'Bardo'
    );
    expect(canProceed(currentSelections)).toBe(false);
  });

  it('Armadilha Terrível mostra o seletor de magia e libera o Próximo', () => {
    renderStep();
    pickTalent('Amontoados (Kobolds)');
    pickTalent('Armadilha Terrível (Kobolds)');

    expect(canProceed(currentSelections)).toBe(false);
    expect(screen.getByText(/Selecione 1 magia/)).toBeTruthy();

    fireEvent.click(screen.getByText('Alarme'));

    expect(
      currentSelections['Armadilha Terrível (Kobolds)']?.spells?.[0].nome
    ).toBe('Alarme');
    expect(canProceed(currentSelections)).toBe(true);
  });

  it('cobre os DOIS talentos escolhidos, não só o primeiro', () => {
    renderStep();
    pickTalent('Armadilha Terrível (Kobolds)');
    pickTalent('Ex-Familiar (Kobolds)');

    fireEvent.click(screen.getByText('Alarme'));
    // Só a magia escolhida: o familiar do segundo talento ainda falta.
    expect(canProceed(currentSelections)).toBe(false);

    fireEvent.click(screen.getByText('Coruja'));
    expect(canProceed(currentSelections)).toBe(true);
  });

  it('esquece a escolha de um talento desmarcado', () => {
    renderStep();
    pickTalent('Amontoados (Kobolds)');
    pickTalent('Ex-Familiar (Kobolds)');
    fireEvent.click(screen.getByText('Coruja'));
    expect(currentSelections['Ex-Familiar (Kobolds)']?.familiars).toEqual([
      'CORUJA',
    ]);

    pickTalent('Ex-Familiar (Kobolds)');
    expect(
      currentSelections['Ex-Familiar (Kobolds)']?.familiars
    ).toBeUndefined();
    expect(
      currentSelections['Talentos do Bando']?.powers?.map((p) => p.name)
    ).toEqual(['Amontoados (Kobolds)']);
  });
});
