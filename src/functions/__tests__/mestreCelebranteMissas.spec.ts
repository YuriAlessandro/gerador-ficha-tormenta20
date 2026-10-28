/**
 * Mestre Celebrante (Clérigo): "Pré-requisitos: qualquer poder de Missa, 12º
 * nível de clérigo" (Tormenta20, p. 58). Heróis de Arton (p. 65) traz três
 * Missas novas e explica como o Mestre Celebrante se aplica a elas, mas o
 * requisito só listava as cinco do livro básico.
 */
import { describe, it, expect } from 'vitest';
import { isPowerAvailable } from '../powers';
import { findClassDescription } from '../multiclass';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { RequirementType } from '../../interfaces/Poderes';
import { SupplementId } from '../../types/supplement.types';

const ALL_SUPPLEMENTS = Object.values(SupplementId);

const clerigo = findClassDescription('Clérigo', undefined, ALL_SUPPLEMENTS);
const mestreCelebrante = clerigo?.powers.find(
  (power) => power.name === 'Mestre Celebrante'
);

const missas = (clerigo?.powers ?? []).filter((power) =>
  power.name.startsWith('Missa:')
);

describe('Mestre Celebrante: qualquer poder de Missa', () => {
  it('o catálogo completo do Clérigo tem as Missas de Heróis de Arton', () => {
    expect(mestreCelebrante).toBeDefined();
    expect(missas.map((missa) => missa.name)).toEqual(
      expect.arrayContaining([
        'Missa: Compartilhar Milagre',
        'Missa: Imposição da Vontade',
        'Missa: Mente Abençoada',
      ])
    );
  });

  it('toda Missa de Clérigo, de qualquer suplemento, entra no requisito', () => {
    // Trava contra suplemento novo: a lista é explícita (o powerTree liga os
    // poderes pelo nome), então uma Missa nova tem que ser acrescentada lá.
    const required = (mestreCelebrante?.requirements ?? []).flatMap((group) =>
      group
        .filter((req) => req.type === RequirementType.PODER)
        .map((req) => req.name)
    );
    missas.forEach((missa) => {
      expect(required).toContain(missa.name);
    });
  });

  it.each([
    'Missa: Compartilhar Milagre',
    'Missa: Imposição da Vontade',
    'Missa: Mente Abençoada',
  ])('%s libera o Mestre Celebrante no 12º nível', (missaName) => {
    if (!mestreCelebrante) throw new Error('Mestre Celebrante não encontrado');
    const missa = missas.find((power) => power.name === missaName);
    if (!missa) throw new Error(`${missaName} não encontrada`);

    const sheet = createMockCharacterSheet();
    sheet.nivel = 12;
    sheet.classPowers = [missa];
    expect(isPowerAvailable(sheet, mestreCelebrante)).toBe(true);

    sheet.classPowers = [];
    expect(isPowerAvailable(sheet, mestreCelebrante)).toBe(false);
  });
});
