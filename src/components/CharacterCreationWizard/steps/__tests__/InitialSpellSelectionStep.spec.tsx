import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { allSpellSchools, Spell } from '@/interfaces/Spells';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import InitialSpellSelectionStep from '../InitialSpellSelectionStep';

/**
 * Linhagem Abençoada (Deuses de Arton, pág. 33): a lista divina de 1º círculo
 * SOMA à arcana e uma das 4 magias iniciais tem que ser divina.
 */
const SUPPLEMENTS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_DEUSES_ARTON,
];

const ABENCOADA_RULES = {
  maxCircle: 1,
  minInitialSpells: 1,
};

function circle1(tradition: 'arcane' | 'divine'): Spell[] {
  return tradition === 'arcane'
    ? dataRegistry.getArcaneSpellsByCircleAndSupplements(1, SUPPLEMENTS)
    : dataRegistry.getDivineSpellsByCircleAndSupplements(1, SUPPLEMENTS);
}

/** Magia que existe SÓ na lista divina. */
function exclusiveDivineSpell(): Spell {
  const arcaneNames = new Set(circle1('arcane').map((s) => s.nome));
  const spell = circle1('divine').find((s) => !arcaneNames.has(s.nome));
  if (!spell) throw new Error('nenhuma magia exclusivamente divina no core');
  return spell;
}

/** Magia que existe SÓ na lista arcana. */
function exclusiveArcaneSpell(): Spell {
  const divineNames = new Set(circle1('divine').map((s) => s.nome));
  const spell = circle1('arcane').find((s) => !divineNames.has(s.nome));
  if (!spell) throw new Error('nenhuma magia exclusivamente arcana no core');
  return spell;
}

function renderAbencoado(selectedSpells: Spell[]) {
  return render(
    <InitialSpellSelectionStep
      selectedSpells={selectedSpells}
      onChange={vi.fn()}
      requiredCount={4}
      className='Arcanista'
      spellType='Arcane'
      includeDivineSchools={allSpellSchools}
      crossTraditionRules={ABENCOADA_RULES}
      minCrossTraditionSpells={1}
      supplements={SUPPLEMENTS}
    />
  );
}

/**
 * O aviso do mínimo é montado com várias interpolações, então lemos o
 * `textContent` do alerta em vez de casar um texto único.
 */
function minDivinaAlertText(): string {
  const alert = screen
    .getAllByRole('alert')
    .find((el) => /precisa ser divina/i.test(el.textContent ?? ''));
  if (!alert) throw new Error('alerta do mínimo divino não encontrado');
  return alert.textContent ?? '';
}

describe('InitialSpellSelectionStep — Linhagem Abençoada', () => {
  it('oferta as duas tradições e marca as divinas com o chip "Divina"', () => {
    renderAbencoado([]);

    const arcana = exclusiveArcaneSpell();
    const divina = exclusiveDivineSpell();

    expect(screen.getAllByText(arcana.nome).length).toBeGreaterThan(0);
    expect(screen.getAllByText(divina.nome).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Divina').length).toBeGreaterThan(0);
  });

  it('avisa enquanto nenhuma divina foi escolhida', () => {
    const arcanas = circle1('arcane').slice(0, 4);
    renderAbencoado(arcanas);

    expect(minDivinaAlertText()).toMatch(
      /Ao menos 1 das 4 magias precisa ser divina/i
    );
    expect(minDivinaAlertText()).toContain('(0 selecionadas)');
  });

  it('conta a magia divina escolhida', () => {
    const divina = exclusiveDivineSpell();
    renderAbencoado([divina]);

    expect(minDivinaAlertText()).toContain('(1 selecionada)');
  });

  it('magia presente nas duas tradições NÃO conta como divina', () => {
    // "Luz" e afins são arcanas E divinas — não satisfazem a exigência.
    const arcaneNames = new Set(circle1('arcane').map((s) => s.nome));
    const compartilhada = circle1('divine').find((s) =>
      arcaneNames.has(s.nome)
    );
    expect(compartilhada).toBeDefined();

    renderAbencoado([compartilhada!]);
    expect(minDivinaAlertText()).toContain('(0 selecionadas)');
  });
});

describe('InitialSpellSelectionStep — Feiticeiro comum (não-regressão)', () => {
  it('sem a linhagem, nenhuma magia divina exclusiva é ofertada', () => {
    render(
      <InitialSpellSelectionStep
        selectedSpells={[]}
        onChange={vi.fn()}
        requiredCount={3}
        className='Arcanista'
        spellType='Arcane'
        supplements={SUPPLEMENTS}
      />
    );

    expect(screen.queryByText(exclusiveDivineSpell().nome)).toBeNull();
    expect(screen.queryByText('Divina')).toBeNull();
    expect(screen.queryByText(/precisa ser divina/i)).toBeNull();
  });
});
