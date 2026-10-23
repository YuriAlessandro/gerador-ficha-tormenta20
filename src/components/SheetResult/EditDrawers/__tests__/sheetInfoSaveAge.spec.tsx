import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { cloneDeep } from 'lodash';
import { Provider } from 'react-redux';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import { findClassDescription } from '@/functions/multiclass';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
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
  const input = screen.getByLabelText(/^Idade$/i);
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

  /**
   * "Já Vi Coisas" é opcional, e a complicação do Adulto só é cobrada de quem
   * levou o poder. Cobrar dela mesmo assim desabilitava o Salvar para sempre —
   * a ficha ficava sem poder editar nem o nome, e as saídas eram aceitar uma
   * complicação que a regra não pede ou desligar Idades Variadas inteira.
   */
  it('ficha Adulto sem "Já Vi Coisas" continua editável', () => {
    const sheet = baseSheet();
    sheet.age = {
      years: 30,
      stage: 'jovem',
      bracket: 'adulto',
      complications: [],
      extraLevels: 0,
    };

    render(
      <Provider store={fakeStore}>
        <SheetInfoEditDrawer
          open
          onClose={vi.fn()}
          sheet={sheet}
          onSave={vi.fn()}
        />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /^Salvar$/ })).not.toBeDisabled();
  });

  /**
   * Feedback de usuário (out/2026): numa ficha pronta, escolher Adulto não
   * mostrava nem o toggle de "Já Vi Coisas", nem a complicação, nem um seletor
   * de poder — o drawer assumia que o poder só podia vir da criação.
   */
  describe('Adulto: "Já Vi Coisas" na edição', () => {
    function adultSheet(): CharacterSheet {
      const sheet = baseSheet();
      sheet.age = {
        years: 30,
        stage: 'jovem',
        bracket: 'adulto',
        complications: [],
        extraLevels: 0,
      };
      return sheet;
    }

    function renderDrawer(sheet: CharacterSheet) {
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
      return onSave;
    }

    const toggle = () => screen.getByRole('switch', { name: /Já Vi Coisas/ });
    const saveButton = () => screen.getByRole('button', { name: /^Salvar$/ });

    it('ligar o toggle exige poder e complicação antes de salvar', () => {
      renderDrawer(adultSheet());

      fireEvent.click(toggle());
      expect(saveButton()).toBeDisabled();

      fireEvent.click(screen.getByRole('radio', { name: /^Esquiva/ }));
      // Ainda falta a complicação de idade.
      expect(saveButton()).toBeDisabled();
    });

    it('concede o poder escolhido e grava a complicação', () => {
      const onSave = renderDrawer(adultSheet());

      fireEvent.click(toggle());
      fireEvent.click(screen.getByText('Abatido'));
      fireEvent.click(screen.getByRole('radio', { name: /^Esquiva/ }));
      fireEvent.click(saveButton());

      expect(onSave).toHaveBeenCalledTimes(1);
      const saved = onSave.mock.calls[0][0] as CharacterSheet;
      expect(saved.age?.grantedPowerName).toBe('Esquiva');
      expect(saved.age?.complications.map((c) => c.name)).toEqual(['Abatido']);
      expect(saved.generalPowers.map((p) => p.name)).toContain('Esquiva');
    });

    it('desligar o toggle remove o poder e a complicação', () => {
      const sheet = adultSheet();
      const esquiva = dataRegistry
        .getAllPowersBySupplements([SupplementId.TORMENTA20_CORE])
        .find((p) => p.name === 'Esquiva')!;
      sheet.generalPowers = [cloneDeep(esquiva)];
      sheet.age = {
        ...sheet.age!,
        grantedPowerName: 'Esquiva',
        complications: [{ name: 'Abatido', description: '' }],
      };
      const onSave = renderDrawer(sheet);

      expect(toggle()).toBeChecked();
      fireEvent.click(toggle());
      fireEvent.click(saveButton());

      const saved = onSave.mock.calls[0][0] as CharacterSheet;
      expect(saved.age?.grantedPowerName).toBeUndefined();
      expect(saved.age?.complications).toEqual([]);
      expect(saved.generalPowers.map((p) => p.name)).not.toContain('Esquiva');
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
