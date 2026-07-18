import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Skill from '@/interfaces/Skills';
import OficioPicker from '../OficioPicker';

const openMenu = () => {
  fireEvent.click(screen.getByText('Ofício'));
};

describe('OficioPicker', () => {
  it('mostra um gatilho único em vez de um chip por ofício', () => {
    render(
      <OficioPicker
        selected={[]}
        onSelect={() => undefined}
        showSelectedChips
      />
    );
    expect(screen.getByText('Ofício')).toBeInTheDocument();
    expect(screen.queryByText(Skill.OFICIO_ALQUIMIA)).not.toBeInTheDocument();
  });

  it('lista os ofícios do livro ao abrir', () => {
    render(<OficioPicker selected={[]} onSelect={() => undefined} />);
    openMenu();
    expect(screen.getByText(Skill.OFICIO_ALQUIMIA)).toBeInTheDocument();
    expect(screen.getByText(Skill.OFICIO_MINERADOR)).toBeInTheDocument();
  });

  it('seleciona um ofício do catálogo', () => {
    const picked: Skill[] = [];
    render(<OficioPicker selected={[]} onSelect={(o) => picked.push(o)} />);
    openMenu();
    fireEvent.click(screen.getByText(Skill.OFICIO_ESCRIBA));
    expect(picked).toEqual([Skill.OFICIO_ESCRIBA]);
  });

  it('filtra ignorando acento e caixa', () => {
    render(<OficioPicker selected={[]} onSelect={() => undefined} />);
    openMenu();
    fireEvent.change(screen.getByPlaceholderText('Buscar ofício...'), {
      target: { value: 'alquimia' },
    });
    expect(screen.getByText(Skill.OFICIO_ALQUIMIA)).toBeInTheDocument();
    expect(screen.queryByText(Skill.OFICIO_MINERADOR)).not.toBeInTheDocument();
  });

  it('cria um ofício customizado com o texto digitado', () => {
    const picked: Skill[] = [];
    render(
      <OficioPicker
        selected={[]}
        onSelect={(o) => picked.push(o)}
        allowCustom
      />
    );
    openMenu();
    fireEvent.change(screen.getByPlaceholderText('Buscar ou criar ofício...'), {
      target: { value: 'Ferreiro anão' },
    });
    fireEvent.click(screen.getByText('Criar "Ofício (Ferreiro anão)"'));
    expect(picked).toEqual(['Ofício (Ferreiro anão)']);
  });

  it('não oferece criação sem allowCustom', () => {
    render(<OficioPicker selected={[]} onSelect={() => undefined} />);
    openMenu();
    fireEvent.change(screen.getByPlaceholderText('Buscar ofício...'), {
      target: { value: 'Ferreiro anão' },
    });
    expect(screen.queryByText(/^Criar /)).not.toBeInTheDocument();
    expect(screen.getByText('Nenhum ofício encontrado.')).toBeInTheDocument();
  });

  it('recusa customizado duplicado do catálogo', () => {
    const picked: Skill[] = [];
    render(
      <OficioPicker
        selected={[]}
        onSelect={(o) => picked.push(o)}
        allowCustom
      />
    );
    openMenu();
    fireEvent.change(screen.getByPlaceholderText('Buscar ou criar ofício...'), {
      target: { value: 'alquimia' },
    });
    // Bate exatamente com Ofício (Alquímia): oferece o item do catálogo,
    // não a criação de um duplicado
    expect(screen.queryByText(/^Criar /)).not.toBeInTheDocument();
    expect(screen.getByText(Skill.OFICIO_ALQUIMIA)).toBeInTheDocument();
  });

  it('mostra chips dos selecionados e permite remover', () => {
    const removed: Skill[] = [];
    render(
      <OficioPicker
        selected={[Skill.OFICIO_ESCRIBA]}
        onSelect={() => undefined}
        onDeselect={(o) => removed.push(o)}
      />
    );
    expect(screen.getByText(Skill.OFICIO_ESCRIBA)).toBeInTheDocument();
    // O contador aparece no gatilho
    expect(screen.getByText('Ofício (1)')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('CancelIcon'));
    expect(removed).toEqual([Skill.OFICIO_ESCRIBA]);
  });

  it('mantém o customizado selecionado visível na lista', () => {
    const custom = 'Ofício (Ferreiro anão)' as Skill;
    render(
      <OficioPicker
        selected={[custom]}
        onSelect={() => undefined}
        onDeselect={() => undefined}
        showSelectedChips={false}
        allowCustom
      />
    );
    fireEvent.click(screen.getByText('Ofício (1)'));
    expect(screen.getByText(custom)).toBeInTheDocument();
  });

  it('bloqueia novas escolhas quando o limite foi atingido', () => {
    const picked: Skill[] = [];
    const removed: Skill[] = [];
    render(
      <OficioPicker
        selected={[Skill.OFICIO_ESCRIBA]}
        onSelect={(o) => picked.push(o)}
        onDeselect={(o) => removed.push(o)}
        showSelectedChips={false}
        maxReached
      />
    );
    fireEvent.click(screen.getByText('Ofício (1)'));

    fireEvent.click(screen.getByText(Skill.OFICIO_ALQUIMIA));
    expect(picked).toEqual([]);

    // O já selecionado continua desmarcável
    fireEvent.click(screen.getByText(Skill.OFICIO_ESCRIBA));
    expect(removed).toEqual([Skill.OFICIO_ESCRIBA]);
  });

  it('desabilita ofícios já usados em outro passo', () => {
    const picked: Skill[] = [];
    render(
      <OficioPicker
        selected={[]}
        onSelect={(o) => picked.push(o)}
        unavailable={[Skill.OFICIO_ALQUIMIA]}
      />
    );
    openMenu();
    expect(screen.getByText('já escolhida')).toBeInTheDocument();
    fireEvent.click(screen.getByText(Skill.OFICIO_ALQUIMIA));
    expect(picked).toEqual([]);
  });
});
