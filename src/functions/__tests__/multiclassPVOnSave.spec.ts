import { describe, it, expect } from 'vitest';
import { cloneDeep } from 'lodash';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { createMockCharacterSheet } from '@/__mocks__/characterSheet';
import {
  calculateMulticlassPV,
  findClassDescription,
} from '@/functions/multiclass';
import { recalculateSheet } from '@/functions/recalculateSheet';

// Anão CON +2, Guerreiro 1 / Necromante 4, +7 de PV vindo de bônus (Duro como Pedra)
function makeSheet(): CharacterSheet {
  const base = createMockCharacterSheet();
  base.classe = cloneDeep(findClassDescription('Guerreiro')!);
  base.nivel = 5;
  base.atributos[Atributo.CONSTITUICAO].value = 2;
  base.bonusPV = 7;
  base.classLevels = [
    { level: 1, className: 'Guerreiro' },
    { level: 2, className: 'Necromante' },
    { level: 3, className: 'Necromante' },
    { level: 4, className: 'Necromante' },
    { level: 5, className: 'Necromante' },
  ];
  base.pv = calculateMulticlassPV(base);
  return base;
}

describe('PV multiclasse Guerreiro 1 / Necromante 4', () => {
  it('preview e valor recalculado batem em 45', () => {
    const sheet = makeSheet();
    expect(calculateMulticlassPV(sheet)).toBe(45);

    // O que o save faz agora: delega PV/PM ao recalculateSheet
    const saved = recalculateSheet(cloneDeep(sheet));
    expect(saved.pv).toBe(45);
  });

  it('nao cai na formula mono-classe (57)', () => {
    const sheet = makeSheet();
    const saved = recalculateSheet(cloneDeep(sheet));
    // 57 = 20 (base Guerreiro) + 2 (CON) + 7*4 (niveis como Guerreiro) + 7
    expect(saved.pv).not.toBe(57);
  });
});
