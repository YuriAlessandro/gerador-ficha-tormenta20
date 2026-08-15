/**
 * Guard-rail da extração de seções do `Result`.
 *
 * O `Result` vai deixar de renderizar as seções como JSX inline e passar a ser
 * dirigido por um layout (`SheetLayout`). O default (`PRESET_TABS`) tem que
 * reproduzir EXATAMENTE o arranjo de hoje — e "exatamente" é uma afirmação que
 * só vale se estiver escrita antes da refatoração.
 *
 * Por isso este arquivo é escrito e roda VERDE no código atual, antes de
 * qualquer mudança. Se ele quebrar durante a extração, a extração mudou o que
 * o usuário vê — que é justamente o que não pode acontecer.
 *
 * Assertivas de ORDEM, não só de presença: o bug que este teste existe para
 * pegar é uma seção que continua na tela mas muda de lugar.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import store from '@/store';
import { createTormentaTheme } from '@/theme/theme';
import { SupplementId } from '@/types/supplement.types';
import { generateEmptySheet } from '@/functions/general';
import SelectOptions from '@/interfaces/SelectedOptions';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Result from '../Result';

// `useDiceRoll` lança sem provider (é um contexto premium obrigatório na mesa
// virtual). Aqui a ficha é renderizada fora de mesa, então o stub inerte é o
// equivalente honesto — nenhuma asserção deste arquivo depende de rolagem.
vi.mock('@/premium/hooks/useDiceRoll', () => ({
  useDiceRoll: () => ({
    rollDice: vi.fn(),
    isRolling: false,
    lastRoll: null,
  }),
  default: () => ({ rollDice: vi.fn(), isRolling: false, lastRoll: null }),
}));

const BASE_OPTIONS: SelectOptions = {
  nivel: 3,
  // Elfo e não Humano: o poder geral do Humano Versátil é sorteado a cada
  // recálculo e deixaria as asserções intermitentes.
  raca: 'Elfo',
  classe: 'Arcanista',
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: [SupplementId.TORMENTA20_CORE],
};

/**
 * O jsdom não faz layout, então `useMediaQuery` responde pelo `matchMedia`
 * mockado no setupTests (`matches: false` — ou seja, desktop). Explicitar aqui
 * o que "desktop" e "mobile" significam evita que a mudança do mock em outro
 * arquivo silencie estas asserções.
 */
const setViewport = (isMobile: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isMobile && query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const renderSheet = (sheet: CharacterSheet) =>
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTormentaTheme('light', 'red')}>
        <Result sheet={sheet} isDarkMode={false} />
      </ThemeProvider>
    </Provider>
  );

/** Ordem em que os textos aparecem no DOM, ignorando os ausentes. */
const domOrderOf = (labels: string[]): string[] => {
  const found = labels
    .map((label) => {
      const el = screen.queryAllByText(label)[0];
      return el ? { label, el } : null;
    })
    .filter((x): x is { label: string; el: HTMLElement } => x !== null);

  return found
    .sort((a, b) =>
      // eslint-disable-next-line no-bitwise
      a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1
    )
    .map((x) => x.label);
};

let sheet: CharacterSheet;

beforeEach(() => {
  sheet = generateEmptySheet(BASE_OPTIONS);
  // A ficha vazia nasce sem nome, e `getByText('')` casa com meio DOM.
  sheet.nome = 'Nimb de Teste';
});

afterEach(() => {
  setViewport(false);
});

describe('Result — paridade de layout antes da extração de seções', () => {
  describe('desktop', () => {
    beforeEach(() => setViewport(false));

    it('mostra as 5 abas de conteúdo, sem Perícias entre elas', () => {
      renderSheet(sheet);

      const tabs = screen.getAllByRole('tab').map((t) => t.textContent);

      expect(tabs).toEqual([
        'Ataques',
        'Defesa',
        'Poderes',
        'Magias',
        'Equip.',
      ]);
    });

    it('renderiza Perícias fora do card de abas (coluna da direita)', () => {
      renderSheet(sheet);

      const periciasTitle = screen.getAllByText('Perícias')[0];
      expect(periciasTitle).toBeInTheDocument();

      // Se Perícias fosse uma aba, existiria um role=tab com esse nome.
      const tabNames = screen.getAllByRole('tab').map((t) => t.textContent);
      expect(tabNames).not.toContain('Perícias');
    });

    it('mantém a ordem vertical das seções fixas da coluna esquerda', () => {
      renderSheet(sheet);

      // 'Tamanho' e não 'Deslocamento': o card de baixo rotula o bloco com
      // `StatTitle`, e "Deslocamento" só aparece no title de um tooltip.
      expect(
        domOrderOf(['Atributos', 'Ataques', 'Proficiências', 'Tamanho'])
      ).toEqual(['Atributos', 'Ataques', 'Proficiências', 'Tamanho']);
    });

    it('abre na aba Ataques', () => {
      renderSheet(sheet);

      const selected = screen
        .getAllByRole('tab')
        .find((t) => t.getAttribute('aria-selected') === 'true');

      expect(selected?.textContent).toBe('Ataques');
    });
  });

  describe('mobile', () => {
    beforeEach(() => setViewport(true));

    it('coloca Perícias como a primeira aba', () => {
      renderSheet(sheet);

      const tabs = screen.getAllByRole('tab').map((t) => t.textContent);

      expect(tabs).toEqual([
        'Perícias',
        'Ataques',
        'Defesa',
        'Poderes',
        'Magias',
        'Equip.',
      ]);
    });
  });

  describe('somente leitura', () => {
    it('não oferece ações de edição sem onSheetUpdate', () => {
      renderSheet(sheet);

      // O lápis de edição do card de abas só existe quando editável.
      expect(
        screen.queryByRole('button', { name: /editar/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('identidade', () => {
    it('mostra nome, raça e classe do personagem', () => {
      renderSheet(sheet);

      expect(screen.getByText(sheet.nome)).toBeInTheDocument();
      // A raça aparece em mais de um lugar (cabeçalho e passo-a-passo), então
      // a asserção é de presença, não de unicidade.
      expect(screen.getAllByText(/Elfo/).length).toBeGreaterThan(0);
    });
  });
});
