import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import store from '../../../store';
import { createTormentaTheme } from '../../../theme/theme';
import { SEOProvider } from '../../SEO';
import PowersTable from '../PowersTable';
import DivindadesTable from '../DivindadesTable';
import UnifiedSpellsTable from '../../Database/UnifiedSpellsTable';
import RacesTable from '../RacesTable';
import ClassesTable from '../ClassesTable';
import OriginsTable from '../OriginsTable';

const renderWithProviders = (
  ui: React.ReactNode,
  initialEntry: string,
  routePath: string
) =>
  render(
    <Provider store={store}>
      <SEOProvider>
        <ThemeProvider theme={createTormentaTheme('dark')}>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Route path={routePath}>{ui}</Route>
          </MemoryRouter>
        </ThemeProvider>
      </SEOProvider>
    </Provider>
  );

describe('Database UI — Grid aberto, textos integrais e subfiltros clicáveis', () => {
  it('PowersTable inicia na aba Todos com cards abertos, subfiltros clicáveis de Raça, Concedidos e Classe', () => {
    renderWithProviders(
      <PowersTable />,
      '/database/poderes',
      '/database/poderes/:selectedPower?'
    );

    // Aba inicial padrão = Todos
    const todosTab = screen.getByRole('tab', { name: /^Todos/ });
    expect(todosTab).toHaveAttribute('aria-selected', 'true');

    // Textos integrais visíveis sem clicar em expandir (ex.: Acuidade com Arma)
    expect(
      screen.getByText(/Quando usa uma arma corpo a corpo leve/i)
    ).toBeInTheDocument();

    // Clica na aba Raça -> aparece filtro clicável de raças
    fireEvent.click(screen.getByRole('tab', { name: /^Raça/ }));
    expect(screen.getByText('Filtrar por Raça:')).toBeInTheDocument();
    const elfoChip = screen.getByRole('button', { name: /^Elfo \(/ });
    fireEvent.click(elfoChip);
    expect(screen.getByText('Arquearia Élfica')).toBeInTheDocument();
    expect(
      screen.getByText(/Para você, todos os arcos são armas simples/i)
    ).toBeInTheDocument();

    // Clica na aba Concedidos -> aparece filtro clicável de divindades
    fireEvent.click(screen.getByRole('tab', { name: /^Concedidos/ }));
    expect(screen.getByText('Filtrar por Divindade:')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Arsenal \(/ }));
    expect(screen.getByText('Armas da Destruição')).toBeInTheDocument();

    // Clica na aba Poderes de Classe -> aparece filtro clicável de classes
    fireEvent.click(screen.getByRole('tab', { name: /^Poderes de Classe/ }));
    expect(screen.getByText('Filtrar por Classe:')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Usurpador \(/ }));
    expect(
      screen.getByRole('heading', { name: 'Abençoar Arma' })
    ).toBeInTheDocument();

    // Clica na aba Distinção -> sem crash no stub público
    fireEvent.click(screen.getByRole('tab', { name: /^Distinção/ }));
    expect(
      screen.getByText(/stub público do repositório/i)
    ).toBeInTheDocument();
  });

  it('DivindadesTable filtra entre Deuses Maiores, Menores e Status Divino em grid aberto', () => {
    renderWithProviders(
      <DivindadesTable />,
      '/database/divindades',
      '/database/divindades/:selectedGod?'
    );

    expect(screen.getByText('Categoria do Panteão:')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Deuses Menores/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Status Divino 5/ }));

    expect(screen.getByText('Sckhar')).toBeInTheDocument();
    expect(screen.getByText('Tibar')).toBeInTheDocument();
    expect(screen.queryByText('Valkaria')).not.toBeInTheDocument();
  });

  it('UnifiedSpellsTable exibe filtro de tradição Universal, ontologia e separa efeitos em lista', () => {
    renderWithProviders(
      <UnifiedSpellsTable />,
      '/database/magias/Controlar%20Fogo',
      '/database/magias/:selectedSpell?'
    );

    // Tradição Universal visível como chip clicável
    expect(
      screen.getByRole('button', { name: 'Universal' })
    ).toBeInTheDocument();

    // Controlar Fogo renderizada diretamente com efeitos em bullets (<ul><li>)
    expect(screen.getByText('Controlar Fogo')).toBeInTheDocument();
    expect(screen.getByText(/Chamejar:/)).toBeInTheDocument();
    expect(screen.getByText(/Esquentar:/)).toBeInTheDocument();
  });

  it('RacesTable, ClassesTable e OriginsTable seguem o mesmo padrão de grid aberto com subfiltros clicáveis', () => {
    const r = renderWithProviders(
      <RacesTable />,
      '/database/raças',
      '/database/raças/:selectedRace?'
    );
    expect(screen.getByLabelText('Grade de raças')).toBeInTheDocument();
    expect(screen.getByText('Bônus de Atributo:')).toBeInTheDocument();
    r.unmount();

    const c = renderWithProviders(
      <ClassesTable />,
      '/database/classes',
      '/database/classes/:selectedClass?'
    );
    expect(screen.getByLabelText('Grade de classes')).toBeInTheDocument();
    expect(screen.getByText('Tipo de Classe:')).toBeInTheDocument();
    c.unmount();

    const o = renderWithProviders(
      <OriginsTable />,
      '/database/origens',
      '/database/origens/:selectedOrigin?'
    );
    expect(screen.getByLabelText('Grade de origens')).toBeInTheDocument();
    expect(
      screen.getByText('Filtrar por Perícia Concedida:')
    ).toBeInTheDocument();
    o.unmount();
  });
});
