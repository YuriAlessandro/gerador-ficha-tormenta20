import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { SupplementId } from '@/types/supplement.types';
import PowersEditorModal from '../PowersEditorModal';

vi.mock('@/hooks/useContentSupplements', () => ({
  useContentSupplements: () => [SupplementId.TORMENTA20_CORE],
}));

/**
 * O editor antigo (3.259 linhas num arquivo só) não tinha nenhum teste de
 * componente. Estes cobrem o contrato que a UI precisa manter: buscar acha e
 * MOSTRA, marcar altera a ficha, e salvar entrega a ficha recalculada.
 */

// Elfo, não Humano: Versátil sorteia um poder geral a cada recálculo e deixa
// qualquer asserção sobre a lista de poderes intermitente.
const buildSheet = (): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  sheet.raca = {
    name: 'Elfo',
    attributes: { attrs: [] },
    faithProbability: {},
    abilities: [],
  };
  return sheet;
};

const renderEditor = (overrides: Partial<CharacterSheet> = {}) => {
  const sheet = { ...buildSheet(), ...overrides };
  const onSave = vi.fn();
  const onClose = vi.fn();

  render(
    <PowersEditorModal open onClose={onClose} sheet={sheet} onSave={onSave} />
  );

  return { sheet, onSave, onClose };
};

const search = (term: string) => {
  const input = screen.getByPlaceholderText('Buscar poder ou habilidade...');
  fireEvent.change(input, { target: { value: term } });
  return input;
};

describe('PowersEditorModal', () => {
  it('mostra o cabeçalho e os dois painéis', () => {
    renderEditor();

    expect(screen.getByText('Poderes e Habilidades')).toBeInTheDocument();
    expect(screen.getByText('Na ficha')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Buscar poder ou habilidade...')
    ).toBeInTheDocument();
  });

  it('a busca achata os grupos e um único resultado aparece sozinho', async () => {
    renderEditor();

    search('Ataque Poderoso');

    // A busca é debounced: espera o modo resultado entrar em cena. Os
    // cabeçalhos de grupo somem quando isso acontece.
    await waitFor(() => {
      expect(screen.queryByText('Poderes de Combate')).not.toBeInTheDocument();
    });

    // De centenas de linhas para um punhado, numa lista só. O editor antigo
    // mudava o contador dos accordions e os deixava fechados.
    const rows = screen.getAllByLabelText(/^Selecionar /);
    expect(rows.length).toBeLessThanOrEqual(3);

    // Casamento exato no nome vem antes de quem só cita o termo na descrição.
    expect(rows[0]).toHaveAccessibleName('Selecionar Ataque Poderoso');
    expect(screen.getByText(/resultado/)).toBeInTheDocument();
  });

  it('a busca varre também as habilidades de raça, antes ignoradas', async () => {
    renderEditor({
      raca: {
        name: 'Elfo',
        attributes: { attrs: [] },
        faithProbability: {},
        abilities: [
          { name: 'Sentidos Élficos', description: 'Você enxerga no escuro.' },
        ],
      } as CharacterSheet['raca'],
    });

    search('Sentidos Élficos');

    await waitFor(() => {
      expect(screen.getByText('Sentidos Élficos')).toBeInTheDocument();
    });
  });

  it('sem resultado, explica o que foi buscado em vez de ficar em branco', async () => {
    renderEditor();

    search('zzzznaoexiste');

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum poder encontrado para «zzzznaoexiste»/)
      ).toBeInTheDocument();
    });
  });

  it('marcar um poder o leva para o painel da ficha', async () => {
    renderEditor();

    search('Ataque Poderoso');
    await waitFor(() =>
      expect(
        screen.getByLabelText('Selecionar Ataque Poderoso')
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText('Selecionar Ataque Poderoso'));

    await waitFor(() => {
      expect(screen.getByText('Poderes Gerais')).toBeInTheDocument();
    });
    expect(
      screen.getByLabelText('Remover Ataque Poderoso')
    ).toBeInTheDocument();
  });

  it('remover pelo painel da ficha desmarca o poder', async () => {
    renderEditor();

    search('Ataque Poderoso');
    await waitFor(() =>
      expect(
        screen.getByLabelText('Selecionar Ataque Poderoso')
      ).toBeInTheDocument()
    );
    fireEvent.click(screen.getByLabelText('Selecionar Ataque Poderoso'));

    const removeButton = await screen.findByLabelText(
      'Remover Ataque Poderoso'
    );
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Remover Ataque Poderoso')
      ).not.toBeInTheDocument();
    });
  });

  it('expandir a linha revela descrição e pré-requisitos com ✓/✗', async () => {
    renderEditor();

    search('Ataque Poderoso');
    await waitFor(() =>
      expect(
        screen.getByLabelText('Selecionar Ataque Poderoso')
      ).toBeInTheDocument()
    );

    const [expandButton] = screen
      .getAllByRole('button')
      .filter((el) => el.getAttribute('aria-expanded') === 'false');
    fireEvent.click(expandButton);

    // Ataque Poderoso exige Força 1; o mock tem Força 2, então atende.
    await waitFor(() => {
      expect(screen.getByText(/Força/)).toBeInTheDocument();
    });
  });

  it('salvar entrega a ficha recalculada e fecha o editor', async () => {
    const { onSave, onClose } = renderEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));

    // `Result` distingue ficha completa de patch por estas chaves.
    const saved = onSave.mock.calls[0][0];
    expect(saved).toHaveProperty('id');
    expect(saved).toHaveProperty('nome');
    expect(saved).toHaveProperty('atributos');
    expect(onClose).toHaveBeenCalled();
  });

  it('cancelar fecha sem salvar', () => {
    const { onSave, onClose } = renderEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('o filtro "só os que posso pegar" esconde os indisponíveis', async () => {
    const sheet = buildSheet();
    // Sem nenhum atributo alto, muita coisa fica fora de alcance.
    sheet.atributos.Força.value = -2;
    sheet.atributos.Destreza.value = -2;

    const onSave = vi.fn();
    render(
      <PowersEditorModal open onClose={vi.fn()} sheet={sheet} onSave={onSave} />
    );

    search('Ataque Poderoso');
    await waitFor(() =>
      expect(
        screen.getByLabelText('Selecionar Ataque Poderoso')
      ).toBeInTheDocument()
    );

    fireEvent.click(screen.getByLabelText('Só os que posso pegar'));

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Selecionar Ataque Poderoso')
      ).not.toBeInTheDocument();
    });
  });

  it('não monta o catálogo quando está fechado', () => {
    render(
      <PowersEditorModal
        open={false}
        onClose={vi.fn()}
        sheet={buildSheet()}
        onSave={vi.fn()}
      />
    );

    expect(
      screen.queryByPlaceholderText('Buscar poder ou habilidade...')
    ).not.toBeInTheDocument();
  });
});
