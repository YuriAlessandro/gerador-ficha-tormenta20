import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CompanionCreationStep from '@/components/CharacterCreationWizard/steps/CompanionCreationStep';
import { getInnateSpellOptions } from '@/data/systems/tormenta20/herois-de-arton/companion/innateSpells';

/**
 * Regressão: o seletor de Magia Inata renderizava os cards das magias, mas sem
 * os nomes/descrições (lista "em branco"). Este teste renderiza o passo com o
 * truque Magia Inata selecionado e garante que os nomes das magias chegam ao
 * DOM.
 */
describe('CompanionCreationStep — seletor de Magia Inata', () => {
  it('renderiza os nomes das magias de 1º círculo', () => {
    const noop = vi.fn();
    render(
      <CompanionCreationStep
        trainerLevel={1}
        companionType='Espírito'
        companionSize='Médio'
        companionWeaponDamageType='Corte'
        companionSpiritEnergyType='Positiva'
        companionSkills={[]}
        companionTricks={[{ name: 'Magia Inata' }]}
        onNameChange={noop}
        onTypeChange={noop}
        onSizeChange={noop}
        onWeaponDamageTypeChange={noop}
        onSpiritEnergyTypeChange={noop}
        onSkillsChange={noop}
        onTricksChange={noop}
      />
    );

    const firstSpellName = getInnateSpellOptions()[0].nome;
    expect(screen.getAllByText(firstSpellName).length).toBeGreaterThan(0);
  });
});
