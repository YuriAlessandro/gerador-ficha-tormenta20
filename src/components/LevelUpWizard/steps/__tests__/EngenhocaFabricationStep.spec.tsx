import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Spell, spellsCircles } from '@/interfaces/Spells';
import EngenhocaFabricationStep, {
  getTotalFabricationCost,
} from '../EngenhocaFabricationStep';

const makeSpell = (nome: string, circle = spellsCircles.c1): Spell => ({
  nome,
  execucao: 'Padrão',
  alcance: 'Curto',
  duracao: 'Instantânea',
  description: `Descrição de ${nome}.`,
  spellCircle: circle,
  school: 'Evoc',
});

const asEngenhoca = (spell: Spell): Spell => ({
  ...spell,
  engenhoca: { forma: 'empunhada' },
});

const raio = makeSpell('Raio Teste');
const escudo = makeSpell('Escudo Teste');
const bola = makeSpell('Bola Teste', spellsCircles.c2);

const renderStep = (
  props: Partial<React.ComponentProps<typeof EngenhocaFabricationStep>> = {}
) => {
  const onChange = vi.fn();
  render(
    <EngenhocaFabricationStep
      availableSpells={[raio, escudo, bola]}
      selectedSpells={[]}
      slots={2}
      maxCircle={2}
      money={500}
      deductMoney
      oficioBonus={7}
      maxAprimoramentoPm={4}
      onChange={onChange}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
  return onChange;
};

describe('EngenhocaFabricationStep', () => {
  it('escolher uma magia a devolve já marcada como engenhoca', () => {
    const onChange = renderStep();
    fireEvent.click(screen.getByText(raio.nome));
    expect(onChange).toHaveBeenCalledWith([asEngenhoca(raio)], true);
  });

  it('não passa do número de vagas', () => {
    const onChange = renderStep({
      selectedSpells: [asEngenhoca(raio), asEngenhoca(escudo)],
    });
    fireEvent.click(screen.getByText(bola.nome));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('soma T$ 100 por PM e mostra a CD de fabricação', () => {
    const selected = [asEngenhoca(raio), asEngenhoca(bola)];
    // 1º círculo (1 PM) + 2º círculo (3 PM).
    expect(getTotalFabricationCost(selected)).toBe(400);

    renderStep({ selectedSpells: selected });
    expect(screen.getByText('T$ 400')).toBeInTheDocument();
    expect(screen.getByText('CD 21')).toBeInTheDocument();
    expect(screen.getByText('CD 23')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('explica que aprimoramentos ficam para a ativação e lista os da magia', () => {
    const comAprimoramento: Spell = {
      ...asEngenhoca(raio),
      aprimoramentos: [{ addPm: 2, text: 'aumenta o dano em +1d6.' }],
    };
    renderStep({ selectedSpells: [comAprimoramento] });

    expect(screen.getAllByRole('alert')[0].textContent).toContain(
      'até 4 PM (sua Inteligência)'
    );
    expect(screen.queryByText('aumenta o dano em +1d6.')).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: /Ver aprimoramentos disponíveis/ })
    );
    expect(screen.getByText('aumenta o dano em +1d6.')).toBeInTheDocument();
  });

  it('avisa quando falta dinheiro e o interruptor desliga o desconto', () => {
    const selected = [asEngenhoca(bola)];
    const onChange = renderStep({ selectedSpells: selected, money: 100 });

    expect(
      screen
        .getAllByRole('alert')
        .some((el) => el.textContent?.includes('faltam T$ 200'))
    ).toBe(true);

    fireEvent.click(screen.getByLabelText('Descontar T$ do personagem'));
    expect(onChange).toHaveBeenCalledWith(selected, false);
  });

  it('sem desconto não há alerta de dinheiro', () => {
    renderStep({
      selectedSpells: [asEngenhoca(bola)],
      money: 0,
      deductMoney: false,
    });
    expect(
      screen
        .getAllByRole('alert')
        .some((el) => el.textContent?.includes('Dinheiro insuficiente'))
    ).toBe(false);
  });

  it('o nome digitado vai para a engenhoca', () => {
    const onChange = renderStep({ selectedSpells: [asEngenhoca(raio)] });
    fireEvent.change(screen.getByLabelText(/Nome da engenhoca/), {
      target: { value: 'Pistola de raios' },
    });
    expect(onChange).toHaveBeenCalledWith(
      [
        {
          ...raio,
          engenhoca: { forma: 'empunhada', nome: 'Pistola de raios' },
        },
      ],
      true
    );
  });
});
