/**
 * Os três templates, com seções falsas.
 *
 * Nós falsos de propósito: o que está sob teste é ONDE as coisas aparecem e
 * como se navega entre elas, não o conteúdo da ficha. Montar o `Result` inteiro
 * aqui tornaria o teste lento e o faria quebrar por motivos que não têm nada a
 * ver com layout.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import store from '@/store';
import { createTormentaTheme } from '@/theme/theme';
import { SheetLayout, SheetSectionKind } from '@/interfaces/SheetLayout';
import {
  PRESET_ACTION_MENU,
  PRESET_SINGLE,
  PRESET_TABS,
} from '@/interfaces/sheetLayoutPresets';
import { clearSheetSurfaceMemory } from '../../sheetSurfaceMemory';
import SheetLayoutRenderer from '../SheetLayoutRenderer';
import { SheetSectionNode, SheetSectionNodeMap } from '../sheetSectionTypes';

const ALL_KINDS: SheetSectionKind[] = [
  'identity',
  'attributes',
  'skills',
  'attacks',
  'defense',
  'powers',
  'spells',
  'equipment',
  'proficiencies',
  'sizeDisplacement',
  'partners',
  'animalCompanions',
  'creationSteps',
  'supportCta',
  'bugReport',
];

const makeNode = (
  kind: SheetSectionKind,
  overrides: Partial<SheetSectionNode> = {}
): SheetSectionNode => ({
  kind,
  defaultTitle: `Título ${kind}`,
  iconKey: 'mui:Widgets',
  body: <div>{`corpo-${kind}`}</div>,
  actions: [],
  withTitle: true,
  available: true,
  ...overrides,
});

const makeNodes = (
  overrides: Partial<Record<SheetSectionKind, Partial<SheetSectionNode>>> = {}
): SheetSectionNodeMap =>
  ALL_KINDS.reduce((acc, kind) => {
    acc[kind] = makeNode(kind, overrides[kind]);
    return acc;
  }, {} as SheetSectionNodeMap);

const renderLayout = (
  layout: SheetLayout,
  nodes: SheetSectionNodeMap = makeNodes(),
  forceSurface: 'desktop' | 'mobile' = 'desktop'
) =>
  render(
    // O store é necessário porque o `BookTitle` lê a cor de destaque do
    // usuário (`useAccentSectionBg`) para escolher a imagem do título.
    <Provider store={store}>
      <ThemeProvider theme={createTormentaTheme('light', 'red')}>
        <SheetLayoutRenderer
          layout={layout}
          nodes={nodes}
          sheetId='ficha-1'
          forceSurface={forceSurface}
        />
      </ThemeProvider>
    </Provider>
  );

beforeEach(() => {
  clearSheetSurfaceMemory();
});

describe('TabsTemplate', () => {
  it('renderiza uma aba por região de superfície, na ordem do documento', () => {
    renderLayout(PRESET_TABS);

    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Ataques',
      'Defesa',
      'Poderes',
      'Magias',
      'Equip.',
    ]);
  });

  it('troca o conteúdo ao clicar numa aba', () => {
    renderLayout(PRESET_TABS);

    expect(screen.getByText('corpo-attacks')).toBeInTheDocument();

    userEvent.click(screen.getByRole('tab', { name: 'Magias' }));

    expect(screen.getByText('corpo-spells')).toBeInTheDocument();
  });

  it('no estreito, Perícias vira a primeira aba', () => {
    renderLayout(PRESET_TABS, makeNodes(), 'mobile');

    expect(screen.getAllByRole('tab')[0].textContent).toBe('Perícias');
  });

  it('não cria aba para seção que a ficha não tem', () => {
    const nodes = makeNodes({ spells: { available: false } });
    renderLayout(PRESET_TABS, nodes);

    expect(screen.getAllByRole('tab').map((t) => t.textContent)).not.toContain(
      'Magias'
    );
  });
});

describe('SinglePageTemplate', () => {
  it('não usa abas', () => {
    renderLayout(PRESET_SINGLE);

    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('mostra todas as seções ao mesmo tempo', () => {
    renderLayout(PRESET_SINGLE);

    ['attacks', 'defense', 'powers', 'spells', 'equipment'].forEach((kind) => {
      expect(screen.getByText(`corpo-${kind}`)).toBeInTheDocument();
    });
  });
});

describe('ActionMenuTemplate', () => {
  it('abre na lista-mestra de telas, não numa seção', () => {
    renderLayout(PRESET_ACTION_MENU);

    expect(screen.getByText('Combate')).toBeInTheDocument();
    expect(screen.getByText('Inventário')).toBeInTheDocument();
    // O conteúdo de uma tela só aparece depois de escolhida.
    expect(screen.queryByText('corpo-attacks')).not.toBeInTheDocument();
  });

  it('entra numa tela e volta', () => {
    renderLayout(PRESET_ACTION_MENU);

    userEvent.click(screen.getByText('Combate'));
    expect(screen.getByText('corpo-attacks')).toBeInTheDocument();
    expect(screen.getByText('corpo-defense')).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /voltar/i }));
    expect(screen.queryByText('corpo-attacks')).not.toBeInTheDocument();
    expect(screen.getByText('Combate')).toBeInTheDocument();
  });

  it('o overlay do menu abre, troca de tela e fecha', () => {
    renderLayout(PRESET_ACTION_MENU);

    userEvent.click(screen.getByText('Combate'));
    userEvent.click(screen.getByRole('button', { name: '' }));

    // Com o overlay aberto, o mesmo rótulo existe na lista de trás e na de
    // cima; escolher "Inventário" troca a tela sem passar pelo Voltar.
    userEvent.click(screen.getAllByText('Inventário')[0]);

    expect(screen.getByText('corpo-equipment')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Fechar menu' })
    ).not.toBeInTheDocument();
  });

  it('volta para a tela aberta quando a árvore remonta', () => {
    // O caso real é a mesa virtual: girar o tablet troca o layout inteiro e
    // remonta o <Result/>, zerando todo o useState. O jogador estava lendo os
    // próprios ataques e não pode cair de volta na lista-mestra.
    const first = renderLayout(PRESET_ACTION_MENU);
    userEvent.click(screen.getByText('Combate'));
    expect(screen.getByText('corpo-attacks')).toBeInTheDocument();

    first.unmount();
    renderLayout(PRESET_ACTION_MENU);

    expect(screen.getByText('corpo-attacks')).toBeInTheDocument();
  });

  it('mantém o cabeçalho visível dentro de uma tela', () => {
    renderLayout(PRESET_ACTION_MENU);

    userEvent.click(screen.getByText('Combate'));

    expect(screen.getByText('corpo-identity')).toBeInTheDocument();
  });
});

describe('ações da seção', () => {
  it('não renderiza a barra quando não há ação (somente leitura)', () => {
    const { container } = renderLayout(PRESET_TABS);

    expect(
      container.querySelectorAll('button[class*=MuiIconButton]')
    ).toHaveLength(0);
  });

  it('mostra a ação da seção visível e esconde a das outras', () => {
    const onAttack = vi.fn();
    const nodes = makeNodes({
      attacks: {
        actions: [
          {
            key: 'edit-weapons',
            icon: <span>editar-armas</span>,
            tooltip: 'Editar armas',
            onClick: onAttack,
          },
        ],
      },
      spells: {
        actions: [
          {
            key: 'edit-spells',
            icon: <span>editar-magias</span>,
            tooltip: 'Editar magias',
            onClick: vi.fn(),
          },
        ],
      },
    });

    renderLayout(PRESET_TABS, nodes);

    expect(screen.getByText('editar-armas')).toBeInTheDocument();
    expect(screen.queryByText('editar-magias')).not.toBeInTheDocument();

    userEvent.click(screen.getByText('editar-armas'));
    expect(onAttack).toHaveBeenCalled();
  });

  it('junta as ações de todas as seções de uma tela agrupada', () => {
    const nodes = makeNodes({
      attacks: {
        actions: [
          {
            key: 'a',
            icon: <span>acao-ataque</span>,
            tooltip: 'Ataque',
            onClick: vi.fn(),
          },
        ],
      },
      defense: {
        actions: [
          {
            key: 'd',
            icon: <span>acao-defesa</span>,
            tooltip: 'Defesa',
            onClick: vi.fn(),
          },
        ],
      },
    });

    renderLayout(PRESET_ACTION_MENU, nodes);
    userEvent.click(screen.getByText('Combate'));

    expect(screen.getByText('acao-ataque')).toBeInTheDocument();
    expect(screen.getByText('acao-defesa')).toBeInTheDocument();
  });
});
