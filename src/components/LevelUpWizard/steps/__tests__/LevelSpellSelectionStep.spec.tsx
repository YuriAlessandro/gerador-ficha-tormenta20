import React from 'react';
import { vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Spell, spellsCircles } from '@/interfaces/Spells';
import LevelSpellSelectionStep from '../LevelSpellSelectionStep';

/**
 * Teurgista Místico: o limite de magias da tradição oposta é POR CÍRCULO. Num
 * único level-up onde o personagem aprende 2+ magias (ex.: Mago devoto de Wynna
 * no nível 5), ter escolhido 1 magia cross de um círculo NÃO pode bloquear a
 * escolha de outra magia cross de um círculo diferente.
 */
const makeSpell = (
  nome: string,
  circle: spellsCircles,
  school: Spell['school'] = 'Evoc'
): Spell => ({
  nome,
  execucao: 'Padrão',
  alcance: 'Curto',
  duracao: 'Instantânea',
  description: `Descrição de ${nome}`,
  spellCircle: circle,
  school,
});

describe('LevelSpellSelectionStep — limite cross-tradition por círculo', () => {
  const crossC1 = makeSpell('Cross Círculo 1', spellsCircles.c1);
  const crossC2 = makeSpell('Cross Círculo 2', spellsCircles.c2);
  const crossNames = new Set([crossC1.nome, crossC2.nome]);

  it('com 1 magia cross do círculo 1 selecionada, a do círculo 2 continua selecionável', () => {
    const onSpellToggle = vi.fn();
    render(
      <LevelSpellSelectionStep
        availableSpells={[crossC1, crossC2]}
        selectedSpells={[crossC1]}
        requiredCount={2}
        spellCircle={2}
        onSpellToggle={onSpellToggle}
        crossTraditionSpellNames={crossNames}
        crossTraditionLimit={1}
      />
    );

    // A magia cross do círculo 2 é de OUTRO círculo → deve continuar clicável.
    fireEvent.click(screen.getByText(crossC2.nome));
    expect(onSpellToggle).toHaveBeenCalledWith(crossC2);
  });

  it('não permite uma 2ª magia cross do MESMO círculo', () => {
    const onSpellToggle = vi.fn();
    const otherCrossC2 = makeSpell('Outra Cross Círculo 2', spellsCircles.c2);
    render(
      <LevelSpellSelectionStep
        availableSpells={[crossC2, otherCrossC2]}
        selectedSpells={[crossC2]}
        requiredCount={2}
        spellCircle={2}
        onSpellToggle={onSpellToggle}
        crossTraditionSpellNames={new Set([crossC2.nome, otherCrossC2.nome])}
        crossTraditionLimit={1}
      />
    );

    // Círculo 2 já no limite (1 selecionada) → a outra cross do círculo 2 fica
    // bloqueada.
    fireEvent.click(screen.getByText(otherCrossC2.nome));
    expect(onSpellToggle).not.toHaveBeenCalled();
  });
});

/**
 * Linhagem Abençoada via multiclasse: no 1º nível de Feiticeiro uma das
 * magias iniciais tem que ser divina, como na criação de personagem.
 */
describe('LevelSpellSelectionStep — mínimo da tradição oposta', () => {
  const arcana = makeSpell('Arcana Qualquer', spellsCircles.c1);
  const divina = makeSpell('Divina Qualquer', spellsCircles.c1);

  const renderAbencoado = (selectedSpells: Spell[]) =>
    render(
      <LevelSpellSelectionStep
        availableSpells={[arcana, divina]}
        selectedSpells={selectedSpells}
        requiredCount={1}
        spellCircle={1}
        onSpellToggle={vi.fn()}
        crossTraditionSpellNames={new Set([divina.nome])}
        crossTraditionLabel='Divina'
        minCrossTraditionSpells={1}
      />
    );

  it('marca a magia divina e avisa enquanto nenhuma foi escolhida', () => {
    renderAbencoado([arcana]);
    expect(screen.getByText('Divina')).toBeTruthy();
    const alert = screen
      .getAllByRole('alert')
      .find((el) => /precisa ser divina/i.test(el.textContent ?? ''));
    expect(alert?.textContent).toContain('(0 selecionadas)');
  });

  it('conta a divina escolhida', () => {
    renderAbencoado([divina]);
    const alert = screen
      .getAllByRole('alert')
      .find((el) => /precisa ser divina/i.test(el.textContent ?? ''));
    expect(alert?.textContent).toContain('(1 selecionada)');
  });
});
