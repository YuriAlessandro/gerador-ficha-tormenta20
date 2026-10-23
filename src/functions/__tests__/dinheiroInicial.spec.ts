import { describe, expect, it } from 'vitest';
import generateRandomSheet, { generateEmptySheet } from '../general';
import SelectOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';

/**
 * No 1º nível o dinheiro inicial é 4d6 (JdA p. 140). O passo "Dinheiro
 * Inicial" do histórico mostrava uma rolagem e a ficha guardava outra.
 */

const OPTIONS: SelectOptions = {
  nivel: 1,
  raca: 'Humano',
  classe: 'Guerreiro',
  // Origem não regional: não soma dinheiro de origem.
  origin: 'Acólito',
  devocao: { label: '--', value: '--' },
  supplements: [SupplementId.TORMENTA20_CORE],
};

const valorDoPasso = (sheet: ReturnType<typeof generateEmptySheet>) => {
  const passo = sheet.steps.find((step) => step.label === 'Dinheiro Inicial');
  const texto = String(passo?.value[0]?.value ?? '');
  return Number(texto.match(/T\$ (\d+)/)?.[1]);
};

describe('dinheiro inicial', () => {
  it('ficha aleatória: o passo mostra o mesmo valor que a ficha guarda', () => {
    for (let i = 0; i < 30; i += 1) {
      const sheet = generateRandomSheet(OPTIONS);
      expect(valorDoPasso(sheet)).toBe(sheet.dinheiro);
    }
  });

  it('assistente sem Mercado: usa a rolagem feita no assistente', () => {
    const sheet = generateEmptySheet(OPTIONS, {
      initialMoneyRoll: { amount: 17, details: '(6, 5, 4, 2)' },
    });
    expect(sheet.dinheiro).toBe(17);
    expect(valorDoPasso(sheet)).toBe(17);
  });

  it('assistente sem rolagem guardada: passo e ficha concordam', () => {
    for (let i = 0; i < 30; i += 1) {
      const sheet = generateEmptySheet(OPTIONS, {});
      expect(valorDoPasso(sheet)).toBe(sheet.dinheiro);
    }
  });

  it('assistente com Mercado: o passo mostra o dinheiro inicial do Mercado', () => {
    const sheet = generateEmptySheet(OPTIONS, {
      initialMoneyRoll: { amount: 17 },
      marketSelections: {
        initialMoney: 17,
        remainingMoney: 7,
        bagEquipments: generateEmptySheet(OPTIONS, {}).bag.equipments,
      },
    });
    expect(sheet.dinheiro).toBe(7);
    expect(valorDoPasso(sheet)).toBe(17);
  });
});
