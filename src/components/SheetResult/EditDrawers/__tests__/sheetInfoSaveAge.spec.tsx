import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { cloneDeep } from 'lodash';
import { Provider } from 'react-redux';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import { findClassDescription } from '@/functions/multiclass';
import SheetInfoEditDrawer from '../SheetInfoEditDrawer';

/**
 * Idade em "Informações Básicas": mudar os anos tem que mexer nos atributos.
 *
 * O envelhecimento do livro básico (T20, p. 108) não é regra opcional, então o
 * campo mora aqui junto de nome e gênero — e o save aplica o DELTA entre o
 * total antigo e o novo, nunca o conjunto inteiro, porque os modificadores de
 * idade são permanentes e já estão somados em `atributos`.
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

const fakeStore = {
  getState: () => FAKE_STATE,
  subscribe: () => () => undefined,
  dispatch: (action: unknown) => action,
  replaceReducer: () => undefined,
} as never;

const PHYSICAL = [Atributo.FORCA, Atributo.DESTREZA, Atributo.CONSTITUICAO];
const MENTAL = [Atributo.INTELIGENCIA, Atributo.SABEDORIA, Atributo.CARISMA];

function baseSheet(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.classe = cloneDeep(findClassDescription('Guerreiro')!);
  sheet.nivel = 1;
  [...PHYSICAL, ...MENTAL].forEach((attr) => {
    sheet.atributos[attr].value = 2;
  });
  return sheet;
}

function openAndSave(sheet: CharacterSheet, edit: () => void) {
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

  edit();
  fireEvent.click(screen.getByRole('button', { name: /^Salvar$/ }));

  expect(onSave).toHaveBeenCalledTimes(1);
  return onSave.mock.calls[0][0] as CharacterSheet;
}

function typeAge(years: string) {
  const input = screen.getByLabelText(/Idade \(anos\)/i);
  fireEvent.change(input, { target: { value: years } });
  fireEvent.blur(input);
}

describe('SheetInfoEditDrawer: idade', () => {
  it('envelhecer para 50 anos aplica os modificadores de Maduro', () => {
    const sheet = baseSheet();
    const saved = openAndSave(sheet, () => typeAge('50'));

    expect(saved.age?.years).toBe(50);
    expect(saved.age?.stage).toBe('maduro');
    PHYSICAL.forEach((attr) => {
      expect(saved.atributos[attr].value).toBe(1);
    });
    MENTAL.forEach((attr) => {
      expect(saved.atributos[attr].value).toBe(3);
    });
  });

  it('envelhecer para 70 anos aplica o total acumulado de Velho', () => {
    const sheet = baseSheet();
    const saved = openAndSave(sheet, () => typeAge('70'));

    expect(saved.age?.stage).toBe('velho');
    PHYSICAL.forEach((attr) => {
      expect(saved.atributos[attr].value).toBe(-1);
    });
    MENTAL.forEach((attr) => {
      expect(saved.atributos[attr].value).toBe(4);
    });
  });

  it('rejuvenescer devolve os atributos, sem descontar duas vezes', () => {
    // Ficha que JÁ nasceu velha: os −3/+2 estão somados em `atributos`.
    const sheet = baseSheet();
    sheet.age = {
      years: 75,
      stage: 'velho',
      complications: [],
      extraLevels: 0,
    };
    PHYSICAL.forEach((attr) => {
      sheet.atributos[attr].value = -1;
    });
    MENTAL.forEach((attr) => {
      sheet.atributos[attr].value = 4;
    });

    const saved = openAndSave(sheet, () => typeAge('30'));

    expect(saved.age?.stage).toBe('jovem');
    PHYSICAL.forEach((attr) => {
      expect(saved.atributos[attr].value).toBe(2);
    });
    MENTAL.forEach((attr) => {
      expect(saved.atributos[attr].value).toBe(2);
    });
  });

  it('de Maduro para Velho aplica só a diferença entre os dois', () => {
    const sheet = baseSheet();
    sheet.age = {
      years: 50,
      stage: 'maduro',
      complications: [],
      extraLevels: 0,
    };
    PHYSICAL.forEach((attr) => {
      sheet.atributos[attr].value = 1;
    });
    MENTAL.forEach((attr) => {
      sheet.atributos[attr].value = 3;
    });

    const saved = openAndSave(sheet, () => typeAge('72'));

    // Maduro já cobrava −1/+1; de Maduro para Velho faltam −2/+1.
    PHYSICAL.forEach((attr) => {
      expect(saved.atributos[attr].value).toBe(-1);
    });
    MENTAL.forEach((attr) => {
      expect(saved.atributos[attr].value).toBe(4);
    });
  });

  it('salvar sem mexer na idade não altera atributo nenhum', () => {
    const sheet = baseSheet();
    sheet.age = {
      years: 50,
      stage: 'maduro',
      complications: [],
      extraLevels: 0,
    };
    PHYSICAL.forEach((attr) => {
      sheet.atributos[attr].value = 1;
    });

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
    fireEvent.click(screen.getByRole('button', { name: /^Salvar$/ }));

    const saved = onSave.mock.calls[0][0] as Partial<CharacterSheet>;
    const attrs = saved.atributos ?? sheet.atributos;
    PHYSICAL.forEach((attr) => {
      expect(attrs[attr].value).toBe(1);
    });
  });
});
