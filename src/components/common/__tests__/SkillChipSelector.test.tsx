import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Skill, { ALL_SPECIFIC_OFICIOS } from '@/interfaces/Skills';
import SkillChipSelector from '../SkillChipSelector';

const manySkills = [
  Skill.ACROBACIA,
  Skill.ADESTRAMENTO,
  Skill.ATLETISMO,
  Skill.ATUACAO,
  Skill.CAVALGAR,
  Skill.CONHECIMENTO,
  Skill.CURA,
  Skill.DIPLOMACIA,
  Skill.ENGANACAO,
  Skill.FORTITUDE,
  Skill.FURTIVIDADE,
];

describe('SkillChipSelector', () => {
  it('renderiza um chip para cada perícia disponível', () => {
    render(
      <SkillChipSelector
        availableSkills={manySkills}
        selectedSkills={[]}
        onToggle={() => undefined}
        maxReached={false}
      />
    );
    manySkills.forEach((skill) => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });
  });

  it('filtra perícias ignorando acentos e caixa', () => {
    render(
      <SkillChipSelector
        availableSkills={manySkills}
        selectedSkills={[]}
        onToggle={() => undefined}
        maxReached={false}
      />
    );
    const input = screen.getByPlaceholderText('Buscar perícia...');
    fireEvent.change(input, { target: { value: 'atuacao' } });

    expect(screen.getByText(Skill.ATUACAO)).toBeInTheDocument();
    expect(screen.queryByText(Skill.ACROBACIA)).not.toBeInTheDocument();
  });

  it('mantém perícias selecionadas visíveis mesmo fora do filtro', () => {
    render(
      <SkillChipSelector
        availableSkills={manySkills}
        selectedSkills={[Skill.CURA]}
        onToggle={() => undefined}
        maxReached={false}
      />
    );
    const input = screen.getByPlaceholderText('Buscar perícia...');
    fireEvent.change(input, { target: { value: 'diplo' } });

    expect(screen.getByText(Skill.DIPLOMACIA)).toBeInTheDocument();
    expect(screen.getByText(Skill.CURA)).toBeInTheDocument();
    expect(screen.queryByText(Skill.ACROBACIA)).not.toBeInTheDocument();
  });

  it('chama onToggle ao clicar em um chip', () => {
    const toggled: Skill[] = [];
    render(
      <SkillChipSelector
        availableSkills={manySkills}
        selectedSkills={[]}
        onToggle={(skill) => toggled.push(skill)}
        maxReached={false}
      />
    );
    fireEvent.click(screen.getByText(Skill.ACROBACIA));
    expect(toggled).toEqual([Skill.ACROBACIA]);
  });

  it('desabilita chips não selecionados quando o limite foi atingido', () => {
    const toggled: Skill[] = [];
    render(
      <SkillChipSelector
        availableSkills={manySkills}
        selectedSkills={[Skill.CURA]}
        onToggle={(skill) => toggled.push(skill)}
        maxReached
      />
    );
    fireEvent.click(screen.getByText(Skill.ACROBACIA));
    expect(toggled).toEqual([]);

    // Chips selecionados continuam clicáveis para desmarcar
    fireEvent.click(screen.getByText(Skill.CURA));
    expect(toggled).toEqual([Skill.CURA]);
  });

  it('não exibe busca para listas pequenas', () => {
    render(
      <SkillChipSelector
        availableSkills={[Skill.CURA, Skill.LUTA]}
        selectedSkills={[]}
        onToggle={() => undefined}
        maxReached={false}
      />
    );
    expect(
      screen.queryByPlaceholderText('Buscar perícia...')
    ).not.toBeInTheDocument();
  });

  it('exibe mensagem quando nenhuma perícia corresponde à busca', () => {
    render(
      <SkillChipSelector
        availableSkills={manySkills}
        selectedSkills={[]}
        onToggle={() => undefined}
        maxReached={false}
      />
    );
    const input = screen.getByPlaceholderText('Buscar perícia...');
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.getByText('Nenhuma perícia encontrada.')).toBeInTheDocument();
  });

  it('limpa a busca pelo botão de limpar', () => {
    render(
      <SkillChipSelector
        availableSkills={manySkills}
        selectedSkills={[]}
        onToggle={() => undefined}
        maxReached={false}
      />
    );
    const input = screen.getByPlaceholderText(
      'Buscar perícia...'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'cura' } });
    expect(screen.queryByText(Skill.ACROBACIA)).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Limpar busca'));
    expect(input.value).toBe('');
    expect(screen.getByText(Skill.ACROBACIA)).toBeInTheDocument();
  });

  describe('agrupamento de Ofício', () => {
    const withOficios = [Skill.CURA, Skill.LUTA, ...ALL_SPECIFIC_OFICIOS];

    it('colapsa os ofícios num chip único', () => {
      render(
        <SkillChipSelector
          availableSkills={withOficios}
          selectedSkills={[]}
          onToggle={() => undefined}
          maxReached={false}
        />
      );
      expect(screen.getByText('Ofício')).toBeInTheDocument();
      ALL_SPECIFIC_OFICIOS.forEach((oficio) => {
        expect(screen.queryByText(oficio)).not.toBeInTheDocument();
      });
    });

    it('não exibe busca: 2 perícias + o grupo de ofícios ficam abaixo do limite', () => {
      render(
        <SkillChipSelector
          availableSkills={withOficios}
          selectedSkills={[]}
          onToggle={() => undefined}
          maxReached={false}
        />
      );
      expect(
        screen.queryByPlaceholderText('Buscar perícia...')
      ).not.toBeInTheDocument();
    });

    it('seleciona um ofício pelo menu', () => {
      const toggled: Skill[] = [];
      render(
        <SkillChipSelector
          availableSkills={withOficios}
          selectedSkills={[]}
          onToggle={(skill) => toggled.push(skill)}
          maxReached={false}
        />
      );
      fireEvent.click(screen.getByText('Ofício'));
      fireEvent.click(screen.getByText(Skill.OFICIO_ESCRIBA));
      expect(toggled).toEqual([Skill.OFICIO_ESCRIBA]);
    });

    it('cria ofício customizado só com allowCustomOficio', () => {
      const toggled: Skill[] = [];
      const { rerender } = render(
        <SkillChipSelector
          availableSkills={withOficios}
          selectedSkills={[]}
          onToggle={(skill) => toggled.push(skill)}
          maxReached={false}
        />
      );
      fireEvent.click(screen.getByText('Ofício'));
      expect(
        screen.queryByPlaceholderText('Buscar ou criar ofício...')
      ).not.toBeInTheDocument();
      fireEvent.keyDown(document.body, { key: 'Escape' });

      rerender(
        <SkillChipSelector
          availableSkills={withOficios}
          selectedSkills={[]}
          onToggle={(skill) => toggled.push(skill)}
          maxReached={false}
          allowCustomOficio
        />
      );
      fireEvent.click(screen.getByText('Ofício'));
      fireEvent.change(
        screen.getByPlaceholderText('Buscar ou criar ofício...'),
        { target: { value: 'Ferreiro anão' } }
      );
      fireEvent.click(screen.getByText('Criar "Ofício (Ferreiro anão)"'));
      expect(toggled).toEqual(['Ofício (Ferreiro anão)']);
    });

    it('mantém visível o ofício customizado selecionado, fora de availableSkills', () => {
      const custom = 'Ofício (Ferreiro anão)' as Skill;
      render(
        <SkillChipSelector
          availableSkills={withOficios}
          selectedSkills={[custom]}
          onToggle={() => undefined}
          maxReached={false}
          allowCustomOficio
        />
      );
      expect(screen.getByText(custom)).toBeInTheDocument();
      expect(screen.getByText('Ofício (1)')).toBeInTheDocument();
    });

    it('esconde o grupo de ofícios quando a busca não casa', () => {
      render(
        <SkillChipSelector
          availableSkills={[...manySkills, ...ALL_SPECIFIC_OFICIOS]}
          selectedSkills={[]}
          onToggle={() => undefined}
          maxReached={false}
        />
      );
      const input = screen.getByPlaceholderText('Buscar perícia...');

      fireEvent.change(input, { target: { value: 'escriba' } });
      expect(screen.getByText('Ofício')).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'cura' } });
      expect(screen.queryByText('Ofício')).not.toBeInTheDocument();
    });
  });
});
