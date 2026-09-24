/**
 * Os três templates, com seções falsas.
 *
 * Nós falsos de propósito: o que está sob teste é ONDE as coisas aparecem e
 * como se navega entre elas, não o conteúdo da ficha. Montar o `Result` inteiro
 * aqui tornaria o teste lento e o faria quebrar por motivos que não têm nada a
 * ver com layout.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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
  const openMenu = () =>
    userEvent.click(screen.getByRole('button', { name: /trocar de tela/i }));
  const menu = () =>
    screen.queryByRole('navigation', { name: 'Telas da ficha' });

  it('abre direto na primeira tela, com a barra dizendo qual é', () => {
    renderLayout(PRESET_ACTION_MENU);

    expect(screen.getByText('corpo-attacks')).toBeInTheDocument();
    expect(screen.getByText('corpo-defense')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Trocar de tela (atual: Combate)' })
    ).toBeInTheDocument();
    // A barra resume o que tem dentro da tela.
    expect(
      screen.getByText('Título attacks, Título defense')
    ).toBeInTheDocument();
    expect(screen.queryByText('corpo-equipment')).not.toBeInTheDocument();
    expect(menu()).not.toBeInTheDocument();
  });

  it('o menu abre embaixo da barra, troca de tela e fecha', () => {
    renderLayout(PRESET_ACTION_MENU);

    openMenu();
    expect(menu()).toBeInTheDocument();
    // A tela atual vem marcada na lista.
    expect(menu()?.querySelector('[aria-current="page"]')).toHaveTextContent(
      'Combate'
    );

    userEvent.click(screen.getByText('Inventário'));

    expect(screen.getByText('corpo-equipment')).toBeInTheDocument();
    expect(screen.queryByText('corpo-attacks')).not.toBeInTheDocument();
    expect(menu()).not.toBeInTheDocument();
  });

  it('fecha pelo Esc, pelo véu e pela própria barra', () => {
    renderLayout(PRESET_ACTION_MENU);

    openMenu();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menu()).not.toBeInTheDocument();

    openMenu();
    userEvent.click(screen.getByTestId('action-menu-scrim'));
    expect(menu()).not.toBeInTheDocument();

    openMenu();
    openMenu();
    expect(menu()).not.toBeInTheDocument();
    // Nada disso trocou de tela.
    expect(screen.getByText('corpo-attacks')).toBeInTheDocument();
  });

  it('volta para a tela aberta quando a árvore remonta', () => {
    // O caso real é a mesa virtual: girar o tablet troca o layout inteiro e
    // remonta o <Result/>, zerando todo o useState. O jogador estava lendo o
    // próprio inventário e não pode cair de volta na primeira tela.
    const first = renderLayout(PRESET_ACTION_MENU);
    openMenu();
    userEvent.click(screen.getByText('Inventário'));
    expect(screen.getByText('corpo-equipment')).toBeInTheDocument();

    first.unmount();
    renderLayout(PRESET_ACTION_MENU);

    expect(screen.getByText('corpo-equipment')).toBeInTheDocument();
  });

  it('mantém a identidade e o rodapé em qualquer tela', () => {
    renderLayout(PRESET_ACTION_MENU);
    openMenu();
    userEvent.click(screen.getByText('Magias'));

    expect(screen.getByText('corpo-identity')).toBeInTheDocument();
    expect(screen.getByText('corpo-bugReport')).toBeInTheDocument();
  });

  it('cada seção da tela é um card próprio', () => {
    renderLayout(PRESET_ACTION_MENU);

    const attacks = screen.getByText('corpo-attacks').closest('.MuiCard-root');
    const defense = screen.getByText('corpo-defense').closest('.MuiCard-root');
    expect(attacks).not.toBeNull();
    expect(attacks).not.toBe(defense);
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

    expect(screen.getByText('acao-ataque')).toBeInTheDocument();
    expect(screen.getByText('acao-defesa')).toBeInTheDocument();
  });
});

describe('coluna lateral — um card por seção', () => {
  // Levar Equipamentos para a lateral leva o CARD de Equipamentos, e não o
  // conteúdo dele para dentro do card de outra seção.
  const withEquipmentInAside = (base: SheetLayout): SheetLayout => ({
    ...base,
    regions: base.regions.map((r) => {
      if (r.role === 'aside') {
        return {
          ...r,
          sections: [
            ...r.sections,
            { id: 'eq', payload: { kind: 'equipment' }, width: 'full' },
          ],
        };
      }
      return {
        ...r,
        sections: r.sections.filter((s) => s.payload.kind !== 'equipment'),
      };
    }),
  });

  const cardOf = (text: string) =>
    screen.getByText(text).closest('.MuiCard-root');

  it.each([
    ['abas', PRESET_TABS],
    ['página única', PRESET_SINGLE],
  ])('%s: Perícias e Equipamentos ficam em cards separados', (_, preset) => {
    renderLayout(withEquipmentInAside(preset));

    const skills = cardOf('corpo-skills');
    const equipment = cardOf('corpo-equipment');

    expect(skills).not.toBeNull();
    expect(equipment).not.toBeNull();
    expect(skills).not.toBe(equipment);
  });
});

describe('ícones escolhidos no editor aparecem na ficha', () => {
  it('a aba mostra o ícone da área', () => {
    renderLayout(PRESET_TABS);

    const tab = screen.getByRole('tab', { name: 'Ataques' });
    expect(tab.querySelector('[data-testid="ColorizeIcon"]')).not.toBeNull();
  });

  it('o título da seção mostra só o ícone escolhido', () => {
    const withIcon: SheetLayout = {
      ...PRESET_SINGLE,
      regions: PRESET_SINGLE.regions.map((r) => ({
        ...r,
        sections: r.sections.map((s) =>
          s.payload.kind === 'attacks' ? { ...s, iconKey: 'mui:Shield' } : s
        ),
      })),
    };
    renderLayout(withIcon);

    const attacksTitle = screen.getByText('Título attacks');
    expect(
      attacksTitle.querySelector('[data-testid="ShieldIcon"]')
    ).not.toBeNull();
    // Sem escolha, o título continua só com o texto.
    expect(screen.getByText('Título spells').querySelector('svg')).toBeNull();
  });
});
