import { describe, expect, it } from 'vitest';
import { getAbilityQualifiers } from '../abilityQualifiers';

describe('getAbilityQualifiers', () => {
  it('omite Padrão (default gravado como undefined)', () => {
    expect(getAbilityQualifiers({})).toEqual([]);
    expect(getAbilityQualifiers({ actionType: 'Padrão' })).toEqual([]);
  });

  it('omite Passiva, que não tem ativação', () => {
    expect(getAbilityQualifiers({ actionType: 'Passiva' })).toEqual([]);
  });

  it('mantém o custo de PM numa habilidade passiva', () => {
    expect(getAbilityQualifiers({ actionType: 'Passiva', pmCost: 2 })).toEqual([
      '2 PM',
    ]);
  });

  it('mostra ação e PM na ordem do livro', () => {
    expect(getAbilityQualifiers({ actionType: 'Livre' })).toEqual(['Livre']);
    expect(getAbilityQualifiers({ actionType: 'Completa', pmCost: 3 })).toEqual(
      ['Completa', '3 PM']
    );
  });
});
