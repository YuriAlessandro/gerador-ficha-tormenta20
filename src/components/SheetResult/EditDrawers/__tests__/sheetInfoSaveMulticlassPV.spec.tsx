import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { cloneDeep } from 'lodash';
import { Provider } from 'react-redux';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import {
  calculateMulticlassPV,
  findClassDescription,
} from '@/functions/multiclass';
import SheetInfoEditDrawer from '../SheetInfoEditDrawer';

/**
 * Abrir "Informações Básicas" de uma ficha multiclasse e salvar sem editar nada
 * gravava o PV da fórmula mono-classe (classe primária × nível total) por cima
 * do valor certo. Duas causas somadas: `customPVPMChanged` comparava o
 * `bonusPV` já normalizado com `|| 0` contra o `sheet.bonusPV` cru (então toda
 * ficha com o campo `undefined` acusava mudança), e o save respondia a essa
 * flag escrevendo `updates.pv` sem passar pelo `recalculateSheet` — o único que
 * conhece multiclasse.
 *
 * O teste exercita o `handleSave` pela UI de propósito: é lá que o bug morava,
 * e não no `recalculateSheet`, que sempre acertou o valor.
 */

// O drawer lê os suplementos ativos do Redux. A referência precisa ser estável:
// vários efeitos do drawer têm `userSupplements` na lista de dependências, e um
// array novo a cada render os põe em laço.
vi.mock('@/hooks/useContentSupplements', () => {
  const SUPPLEMENTS = ['tormenta20-core'];
  return { useContentSupplements: () => SUPPLEMENTS };
});

const FAKE_STATE = {
  system: { featureFlags: {} },
  sheetStorage: { sheets: [] },
  auth: {},
  subscription: {},
};

// Store mínimo: montar o store real arrastaria sagas e socket para o teste.
const fakeStore = {
  getState: () => FAKE_STATE,
  subscribe: () => () => undefined,
  dispatch: (action: unknown) => action,
  replaceReducer: () => undefined,
} as never;

function baseSheet(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.classe = cloneDeep(findClassDescription('Guerreiro')!);
  sheet.nivel = 5;
  sheet.atributos[Atributo.CONSTITUICAO].value = 2;
  sheet.bonusPV = undefined;
  sheet.bonusPM = undefined;
  return sheet;
}

// Guerreiro 1 / Necromante 4: só o 1º nível (Guerreiro) soma o PV base.
function multiclassSheet(): CharacterSheet {
  const sheet = baseSheet();
  sheet.classLevels = [
    { level: 1, className: 'Guerreiro' },
    { level: 2, className: 'Necromante' },
    { level: 3, className: 'Necromante' },
    { level: 4, className: 'Necromante' },
    { level: 5, className: 'Necromante' },
  ];
  sheet.pv = calculateMulticlassPV(sheet);
  return sheet;
}

// Guerreiro 5: 20 (base) + 2 (CON) + (5 + 2) × 4 = 50.
function monoclassSheet(): CharacterSheet {
  const sheet = baseSheet();
  sheet.classLevels = [1, 2, 3, 4, 5].map((level) => ({
    level,
    className: 'Guerreiro',
  }));
  sheet.pv = 50;
  return sheet;
}

function openAndSave(sheet: CharacterSheet, edit?: () => void) {
  const onSave = vi.fn();
  render(
    <Provider store={fakeStore}>
      <SheetInfoEditDrawer
        open
        onClose={vi.fn()}
        sheet={sheet}
        onSave={onSave}
      />
    </Provider>
  );

  if (edit) edit();
  fireEvent.click(screen.getByRole('button', { name: /^Salvar$/ }));

  expect(onSave).toHaveBeenCalledTimes(1);
  const saved = onSave.mock.calls[0][0] as Partial<CharacterSheet>;
  // Sem mudança nenhuma o save devolve um Partial sem `pv`: não mexer no campo
  // também é resposta certa, então o PV efetivo é o da ficha.
  return saved.pv ?? sheet.pv;
}

describe('SheetInfoEditDrawer: PV no save de ficha multiclasse', () => {
  it('não corrompe o PV ao abrir e salvar sem editar nada', () => {
    const sheet = multiclassSheet();
    expect(sheet.pv).toBe(38);
    // 50 seria a fórmula mono-classe: 20 + 2 + (5 + 2) × 4.
    expect(openAndSave(sheet)).toBe(38);
  });

  it('soma o Bônus de PV editado sobre o PV multiclasse', () => {
    const sheet = multiclassSheet();
    expect(
      openAndSave(sheet, () => {
        fireEvent.change(screen.getByLabelText('Bônus de PV'), {
          target: { value: '10' },
        });
      })
    ).toBe(48);
  });

  it('mantém o Bônus de PV correto em ficha mono-classe', () => {
    const sheet = monoclassSheet();
    expect(
      openAndSave(sheet, () => {
        fireEvent.change(screen.getByLabelText('Bônus de PV'), {
          target: { value: '10' },
        });
      })
    ).toBe(60);
  });
});
