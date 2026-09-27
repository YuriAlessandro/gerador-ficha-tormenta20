/**
 * Poderes do Treinador (Heróis de Arton) com automação na ficha.
 */
import { describe, it, expect } from 'vitest';
import TREINADOR from '../../data/systems/tormenta20/herois-de-arton/classes/treinador';
import { Atributo } from '../../data/systems/tormenta20/atributos';

describe('Convocar Enxame', () => {
  it('ensina Enxame de Pestes com atributo-chave Carisma', () => {
    const power = TREINADOR.powers.find((p) => p.name === 'Convocar Enxame');
    const action = power?.sheetActions?.[0]?.action;
    expect(action?.type).toBe('learnSpell');
    if (action?.type !== 'learnSpell') return;
    expect(action.availableSpells.map((s) => s.nome)).toEqual([
      'Enxame de Pestes',
    ]);
    expect(action.pick).toBe(1);
    expect(action.customAttribute).toBe(Atributo.CARISMA);
  });
});
