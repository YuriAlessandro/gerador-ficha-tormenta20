import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GrimoireNameDialog from '../GrimoireNameDialog';
import ImportGrimoireDialog from '../ImportGrimoireDialog';
import GrimoireMenu from '../GrimoireMenu';
import { renderWithProviders } from './renderWithProviders';
import { createInitialState } from '../../../functions/pocketGrimoire/state';
import { IMPORT_ERRORS } from '../../../functions/pocketGrimoire/exchange';

describe('GrimoireNameDialog', () => {
  it('confirma nome limpo e bloqueia vazio', () => {
    const onConfirm = vi.fn();
    renderWithProviders(
      <GrimoireNameDialog
        open
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );
    const confirm = screen.getByRole('button', { name: 'Criar' });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Nome'), {
      target: { value: '  Mago  ' },
    });
    fireEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith('Mago');
  });
});

const FILE_TWO_ITEMS = JSON.stringify({
  formato: 'fichas-de-nimb/grimorio-de-bolso',
  versao: 1,
  exportadoEm: '2026-09-18T00:00:00.000Z',
  grimorio: {
    nome: 'Do arquivo',
    itens: [{ id: 'spell:Bola de Fogo' }, { id: 'spell:Teia' }],
  },
});

describe('GrimoireNameDialog com importar', () => {
  it('oferece importar em vez de criar vazio', () => {
    const onImport = vi.fn();
    renderWithProviders(
      <GrimoireNameDialog
        open
        title='Novo grimório'
        confirmLabel='Criar'
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        onImport={onImport}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Importar/ }));
    expect(onImport).toHaveBeenCalled();
  });
});

describe('ImportGrimoireDialog substituindo', () => {
  it('confirma, substitui os itens mantendo o nome e permite desfazer', async () => {
    const state = createInitialState();
    state.grimoires[0].itemIds = ['spell:Velha'];
    const onClose = vi.fn();
    // Como no app: fechar o diálogo de fato (senão o modal esconde a
    // notificação dos leitores de tela).
    const Harness = () => {
      const [open, setOpen] = React.useState(true);
      return (
        <ImportGrimoireDialog
          open={open}
          onClose={() => {
            onClose();
            setOpen(false);
          }}
          replaceTarget={state.grimoires[0]}
        />
      );
    };
    const { store } = renderWithProviders(<Harness />, {
      preloadedState: state,
    });
    expect(
      screen.getByRole('heading', { name: 'Importar e substituir' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Colar texto' }));
    fireEvent.change(screen.getByLabelText('JSON do grimório'), {
      target: { value: FILE_TWO_ITEMS },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));
    expect(
      screen.getByText(
        /O conteúdo atual de “Padrão” \(1 item\) será trocado pelos 2 itens do arquivo/
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Substituir' }));

    const { grimoires } = store.getState().pocketGrimoire;
    expect(grimoires).toHaveLength(1);
    expect(grimoires[0]).toMatchObject({
      name: 'Padrão',
      itemIds: ['spell:Bola de Fogo', 'spell:Teia'],
    });
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Desfazer' }));
    expect(store.getState().pocketGrimoire.grimoires[0].itemIds).toEqual([
      'spell:Velha',
    ]);
  });
});

describe('ImportGrimoireDialog', () => {
  const pasteAndImport = (text: string) => {
    fireEvent.click(screen.getByRole('tab', { name: 'Colar texto' }));
    fireEvent.change(screen.getByLabelText('JSON do grimório'), {
      target: { value: text },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Importar' }));
  };

  it('mostra erro para texto inválido', () => {
    renderWithProviders(<ImportGrimoireDialog open onClose={vi.fn()} />);
    pasteAndImport('não é json');
    expect(screen.getByText(IMPORT_ERRORS.notJson)).toBeInTheDocument();
  });

  it('importa texto válido como grimório novo', async () => {
    const onClose = vi.fn();
    const { store } = renderWithProviders(
      <ImportGrimoireDialog open onClose={onClose} />
    );
    pasteAndImport(
      JSON.stringify({
        formato: 'fichas-de-nimb/grimorio-de-bolso',
        versao: 1,
        exportadoEm: '2026-09-18T00:00:00.000Z',
        grimorio: {
          nome: 'Trazido',
          itens: [{ id: 'spell:Bola de Fogo' }, { id: 'spell:Sumida' }],
        },
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const { grimoires } = store.getState().pocketGrimoire;
    expect(grimoires[1]).toMatchObject({
      name: 'Trazido',
      itemIds: ['spell:Bola de Fogo', 'spell:Sumida'],
    });
    expect(
      await screen.findByText('Trazido importado: 2 itens (1 não encontrado).')
    ).toBeInTheDocument();
  });
});

describe('GrimoireMenu', () => {
  it('Excluir fica desativado quando é o único grimório', () => {
    const state = createInitialState();
    renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    expect(screen.getByRole('menuitem', { name: /Excluir/ })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('Excluir fica liberado no Padrão quando há outro grimório', () => {
    const state = createInitialState();
    state.grimoires.push({
      id: 'outro',
      name: 'Outro',
      itemIds: [],
      createdAt: '',
      updatedAt: '',
    });
    renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    expect(
      screen.getByRole('menuitem', { name: /Excluir/ })
    ).not.toHaveAttribute('aria-disabled');
  });

  it('Importar e substituir abre a importação no modo substituir', () => {
    const state = createInitialState();
    renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    fireEvent.click(
      screen.getByRole('menuitem', { name: /Importar e substituir/ })
    );
    expect(
      screen.getByRole('heading', { name: 'Importar e substituir' })
    ).toBeInTheDocument();
  });

  it('Duplicar cria uma cópia', () => {
    const state = createInitialState();
    const { store } = renderWithProviders(
      <GrimoireMenu grimoire={state.grimoires[0]} isActive />,
      { preloadedState: state }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Opções de Padrão' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Duplicar/ }));
    expect(store.getState().pocketGrimoire.grimoires[1].name).toBe(
      'Padrão (cópia)'
    );
  });
});
