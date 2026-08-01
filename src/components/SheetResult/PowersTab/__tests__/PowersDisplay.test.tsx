import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { GeneralPowerType } from '@/interfaces/Poderes';
import PowersDisplay from '../../PowersDisplay';

/**
 * O setup global devolve `matches: false` para tudo, então os testes rodam no
 * caminho desktop. Isto liga o caminho mobile fazendo as media queries de
 * `max-width` casarem — é assim que `useMediaQuery(down('sm'))` vira true.
 */
const forceMobile = () => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('max-width'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const classPowers = [
  { name: 'Raio Arcano', text: 'Você dispara um raio de energia arcana.' },
  { name: 'Conhecimento Mágico', text: 'Você aprende magias adicionais.' },
];

const raceAbilities = [
  { name: 'Abraço Gélido', description: 'Seu toque congela os inimigos.' },
  { name: 'Memória Póstuma', description: 'Você lembra de sua vida anterior.' },
];

const classAbilities = [
  { name: 'Magias', text: 'Você pode lançar magias arcanas.', nivel: 1 },
];

const generalPowers = [
  {
    name: 'Fome de Mana',
    type: GeneralPowerType.MAGIA,
    description: 'Você consome mana com voracidade.',
    requirements: [],
  },
  {
    name: 'Sangue de Ferro',
    type: GeneralPowerType.RACA,
    description: 'Seu sangue é resistente como ferro.',
    requirements: [],
  },
];

const renderPowers = (overrides = {}) =>
  render(
    <PowersDisplay
      sheetHistory={[]}
      classPowers={classPowers}
      raceAbilities={raceAbilities}
      classAbilities={classAbilities}
      originPowers={[]}
      deityPowers={[]}
      generalPowers={generalPowers}
      className='Arcanista'
      raceName='Soterrado'
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...overrides}
    />
  );

describe('PowersDisplay', () => {
  it('agrupa os poderes por origem em vez de repetir o rótulo em cada linha', () => {
    renderPowers();

    // Os cabeçalhos de grupo carregam a origem...
    expect(screen.getByText('Poder de Arcanista')).toBeInTheDocument();
    expect(screen.getByText('Habilidade de Soterrado')).toBeInTheDocument();
    expect(screen.getByText('Habilidade de Arcanista')).toBeInTheDocument();

    // ...e cada rótulo aparece UMA vez só, não uma vez por linha. Era essa
    // repetição que dominava a tela no mobile.
    expect(screen.getAllByText('Habilidade de Soterrado')).toHaveLength(1);
    expect(screen.getAllByText('Poder de Arcanista')).toHaveLength(1);
  });

  it('separa os poderes gerais pelo tipo', () => {
    renderPowers();

    expect(screen.getByText('Poder de Magia')).toBeInTheDocument();
    expect(screen.getByText('Poder de Raça')).toBeInTheDocument();
  });

  it('lista todos os poderes', () => {
    renderPowers();

    [...classPowers, ...raceAbilities, ...classAbilities, ...generalPowers]
      .map((p) => p.name)
      .forEach((name) => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
  });

  it('filtra pela busca, casando nome e descrição', () => {
    renderPowers();

    const search = screen.getByPlaceholderText('Buscar poder...');

    fireEvent.change(search, { target: { value: 'raio' } });
    expect(screen.getByText('Raio Arcano')).toBeInTheDocument();
    expect(screen.queryByText('Abraço Gélido')).not.toBeInTheDocument();

    // Busca na descrição, não só no nome.
    fireEvent.change(search, { target: { value: 'congela' } });
    expect(screen.getByText('Abraço Gélido')).toBeInTheDocument();
    expect(screen.queryByText('Raio Arcano')).not.toBeInTheDocument();
  });

  it('ignora acentos e caixa na busca', () => {
    renderPowers();

    fireEvent.change(screen.getByPlaceholderText('Buscar poder...'), {
      target: { value: 'ABRACO' },
    });

    expect(screen.getByText('Abraço Gélido')).toBeInTheDocument();
  });

  it('mostra estado vazio quando a busca não acha nada', () => {
    renderPowers();

    fireEvent.change(screen.getByPlaceholderText('Buscar poder...'), {
      target: { value: 'xyzzy' },
    });

    expect(screen.getByText('Nenhum poder encontrado.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Limpar busca'));
    expect(screen.getByText('Raio Arcano')).toBeInTheDocument();
  });

  it('filtra por origem ao clicar num chip', () => {
    renderPowers();

    fireEvent.click(screen.getByText('Poder de Arcanista (2)'));

    expect(screen.getByText('Raio Arcano')).toBeInTheDocument();
    expect(screen.queryByText('Abraço Gélido')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Todos'));
    expect(screen.getByText('Abraço Gélido')).toBeInTheDocument();
  });

  it('as contagens dos chips acompanham a busca', () => {
    renderPowers();

    expect(screen.getByText('Poder de Arcanista (2)')).toBeInTheDocument();

    // "magi" casa Conhecimento Mágico (poder de classe) e Magias (habilidade
    // de classe), então sobram dois grupos e os chips continuam úteis.
    fireEvent.change(screen.getByPlaceholderText('Buscar poder...'), {
      target: { value: 'magi' },
    });

    expect(screen.getByText('Poder de Arcanista (1)')).toBeInTheDocument();
    expect(screen.getByText('Habilidade de Arcanista (1)')).toBeInTheDocument();
  });

  it('esconde os chips quando a busca deixa um grupo só', () => {
    renderPowers();

    fireEvent.change(screen.getByPlaceholderText('Buscar poder...'), {
      target: { value: 'raio' },
    });

    // Um único chip de filtro não filtra nada — não vale o espaço vertical.
    expect(screen.queryByText('Todos')).not.toBeInTheDocument();
    expect(screen.getByText('Raio Arcano')).toBeInTheDocument();
  });

  it('renderiza a Complicação no seu próprio grupo', () => {
    renderPowers({
      sheet: {
        complication: {
          name: 'Perseguido',
          description: 'Alguém está atrás de você.',
          grantedPowerName: 'Esquiva',
        },
      },
    });

    expect(screen.getByText('Complicação')).toBeInTheDocument();
    expect(screen.getByText('Perseguido')).toBeInTheDocument();
  });

  it('a linha não mostra mais o rótulo de origem ao lado do nome', () => {
    renderPowers();

    // A linha do poder contém o nome e nada de rótulo de tipo — era a colisão
    // desses dois textos que quebrava o layout no mobile.
    const row = screen.getByText('Abraço Gélido').closest('div');
    expect(row).not.toBeNull();
    expect(
      within(row as HTMLElement).queryByText(/Habilidade de/)
    ).not.toBeInTheDocument();
  });
});

describe('PowersDisplay em modo reordenar', () => {
  const reorderProps = {
    sheet: { powersOrder: undefined },
    onSheetUpdate: () => undefined,
  };

  it('mantém os grupos e esconde busca e filtros', () => {
    renderPowers(reorderProps);

    // Com busca ativa e um filtro aplicado...
    fireEvent.change(screen.getByPlaceholderText('Buscar poder...'), {
      target: { value: 'raio' },
    });
    expect(screen.queryByText('Abraço Gélido')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Reordenar poderes'));

    // ...entrar em reordenar devolve a lista inteira, ainda AGRUPADA: arrastar
    // é confinado ao grupo, então o usuário precisa ver as fronteiras.
    expect(
      screen.queryByPlaceholderText('Buscar poder...')
    ).not.toBeInTheDocument();
    expect(screen.getByText('Poder de Arcanista')).toBeInTheDocument();
    expect(screen.getByText('Abraço Gélido')).toBeInTheDocument();
    expect(screen.getByText('Raio Arcano')).toBeInTheDocument();
  });

  it('cria um Droppable por grupo, e não um só para a lista toda', () => {
    renderPowers(reorderProps);
    fireEvent.click(screen.getByLabelText('Reordenar poderes'));

    const droppableIds = Array.from(
      document.querySelectorAll('[data-rbd-droppable-id]')
    ).map((el) => el.getAttribute('data-rbd-droppable-id'));

    // Poderes de classe, habilidades de raça, habilidades de classe e os dois
    // tipos de poder geral — cada um no seu Droppable.
    expect(droppableIds).toHaveLength(5);
    expect(new Set(droppableIds).size).toBe(5);
    expect(droppableIds).not.toContain('powers-list');
  });

  it('não oferece reordenar quando todo grupo tem um poder só', () => {
    renderPowers({
      ...reorderProps,
      classPowers: [classPowers[0]],
      raceAbilities: [raceAbilities[0]],
      classAbilities,
      generalPowers: [generalPowers[0]],
    });

    expect(
      screen.queryByLabelText('Reordenar poderes')
    ).not.toBeInTheDocument();
  });

  it('volta ao agrupamento ao concluir', () => {
    renderPowers(reorderProps);

    fireEvent.click(screen.getByLabelText('Reordenar poderes'));
    fireEvent.click(screen.getByLabelText('Concluir reordenação'));

    expect(screen.getByPlaceholderText('Buscar poder...')).toBeInTheDocument();
    expect(screen.getByText('Poder de Arcanista')).toBeInTheDocument();
  });
});

describe('PowersDisplay com poder escolhido duas vezes', () => {
  it('mostra uma linha só, com o contador ×2', () => {
    // Herança (Herdeiro) pode ser escolhida duas vezes — a ficha guarda duas
    // entradas em origin.powers e a lista tem que colapsar em uma linha.
    const heranca = {
      name: 'Herança',
      description: 'Você herdou um item de preço de até T$ 1.000.',
      type: 'ORIGEM',
    };

    renderPowers({ originPowers: [heranca, { ...heranca }] });

    expect(screen.getAllByText('Herança')).toHaveLength(1);
    expect(screen.getByText('×2')).toBeInTheDocument();
  });
});

describe('PowersDisplay com nome/texto customizados', () => {
  it('mostra o nome customizado na linha, mas acha pelo nome do livro', () => {
    renderPowers({
      classPowers: [
        {
          ...classPowers[0],
          customName: 'Raio do Mestre',
          customDescription: 'Ganhei no nível 6, depois da quest do porto.',
        },
        classPowers[1],
      ],
    });

    expect(screen.getByText('Raio do Mestre')).toBeInTheDocument();
    expect(screen.queryByText('Raio Arcano')).not.toBeInTheDocument();

    const search = screen.getByPlaceholderText('Buscar poder...');

    // Nome customizado casa...
    fireEvent.change(search, { target: { value: 'mestre' } });
    expect(screen.getByText('Raio do Mestre')).toBeInTheDocument();

    // ...e o nome canônico continua casando: quem renomeou não perde o poder.
    fireEvent.change(search, { target: { value: 'Raio Arcano' } });
    expect(screen.getByText('Raio do Mestre')).toBeInTheDocument();

    // O texto original também continua na busca.
    fireEvent.change(search, { target: { value: 'energia arcana' } });
    expect(screen.getByText('Raio do Mestre')).toBeInTheDocument();
  });
});

describe('PowersDisplay no mobile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('abre o detalhe em bottom sheet em vez de expandir a linha', () => {
    forceMobile();
    renderPowers();

    // Fechado: o texto do poder não está na tela.
    expect(
      screen.queryByText('Seu toque congela os inimigos.')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Abraço Gélido'));

    // O drawer traz o texto E o rótulo de origem, que saiu da linha.
    const dialog = screen.getByRole('presentation');
    expect(
      within(dialog).getByText('Seu toque congela os inimigos.')
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('Habilidade de Soterrado')
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'fechar' })
    ).toBeInTheDocument();
  });

  it('não usa accordion no mobile — a lista não muda de altura sob o dedo', () => {
    forceMobile();
    renderPowers();

    expect(document.querySelector('.MuiAccordion-root')).toBeNull();
  });
});
