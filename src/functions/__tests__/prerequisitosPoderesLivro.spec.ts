/**
 * Pré-requisitos de poderes conferidos com o livro básico.
 *
 * - Mestre em Arma (Tormenta20, p. 66): "Especialização em Arma com a arma
 *   escolhida, 12º nível de guerreiro."
 * - Mestre Celebrante (Tormenta20, p. 58): "qualquer poder de Missa, 12º nível
 *   de clérigo."
 * - Legião Aberrante (Tormenta20, p. 137): "Anatomia Insana, três outros
 *   poderes da Tormenta." Os dois juntos, não um ou outro.
 */
import { describe, it, expect } from 'vitest';
import { isPowerAvailable } from '../powers';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { ClassPower } from '../../interfaces/Class';
import tormentaPowers from '../../data/systems/tormenta20/powers/tormentaPowers';

function getClassPower(className: string, powerName: string): ClassPower {
  const classe = dataRegistry.getClassByName(className, [
    SupplementId.TORMENTA20_CORE,
  ]);
  const power = classe?.powers.find((p) => p.name === powerName);
  if (!classe || !power) {
    throw new Error(`${powerName} não encontrado em ${className}`);
  }
  return power;
}

function sheetOfClass(className: string, nivel: number) {
  const sheet = createMockCharacterSheet();
  const classe = dataRegistry.getClassByName(className, [
    SupplementId.TORMENTA20_CORE,
  ]);
  if (!classe) throw new Error(`${className} não encontrado`);
  sheet.classe = classe;
  sheet.nivel = nivel;
  return sheet;
}

describe('Mestre em Arma exige 12º nível de guerreiro', () => {
  const mestreEmArma = getClassPower('Guerreiro', 'Mestre em Arma');
  const especializacao = getClassPower('Guerreiro', 'Especialização em Arma');

  it.each([2, 11])('indisponível no nível %i', (nivel) => {
    const sheet = sheetOfClass('Guerreiro', nivel);
    sheet.classPowers = [especializacao];

    expect(isPowerAvailable(sheet, mestreEmArma)).toBe(false);
  });

  it('disponível no nível 12 com Especialização em Arma', () => {
    const sheet = sheetOfClass('Guerreiro', 12);
    sheet.classPowers = [especializacao];

    expect(isPowerAvailable(sheet, mestreEmArma)).toBe(true);
  });

  it('indisponível no nível 12 sem Especialização em Arma', () => {
    const sheet = sheetOfClass('Guerreiro', 12);
    sheet.classPowers = [];

    expect(isPowerAvailable(sheet, mestreEmArma)).toBe(false);
  });
});

describe('Mestre Celebrante exige 12º nível de clérigo', () => {
  const mestreCelebrante = getClassPower('Clérigo', 'Mestre Celebrante');
  const missas = [
    'Missa: Bênção da Vida',
    'Missa: Chamado às Armas',
    'Missa: Elevação do Espírito',
    'Missa: Escudo Divino',
    'Missa: Superar as Limitações',
  ];

  it.each(missas)('indisponível no nível 11 com %s', (missa) => {
    const sheet = sheetOfClass('Clérigo', 11);
    sheet.classPowers = [getClassPower('Clérigo', missa)];

    expect(isPowerAvailable(sheet, mestreCelebrante)).toBe(false);
  });

  it.each(missas)('disponível no nível 12 com %s', (missa) => {
    const sheet = sheetOfClass('Clérigo', 12);
    sheet.classPowers = [getClassPower('Clérigo', missa)];

    expect(isPowerAvailable(sheet, mestreCelebrante)).toBe(true);
  });

  it('indisponível no nível 12 sem nenhuma Missa', () => {
    const sheet = sheetOfClass('Clérigo', 12);
    sheet.classPowers = [];

    expect(isPowerAvailable(sheet, mestreCelebrante)).toBe(false);
  });
});

describe('Legião Aberrante exige Anatomia Insana E três outros poderes da Tormenta', () => {
  const {
    LEGIAO_ABERRANTE,
    ANATOMIA_INSANA,
    ANTENAS,
    CARAPACA,
    DENTES_AFIADOS,
    MAOS_MEMBRANOSAS,
  } = tormentaPowers;

  it('indisponível só com Anatomia Insana', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANATOMIA_INSANA];

    expect(isPowerAvailable(sheet, LEGIAO_ABERRANTE)).toBe(false);
  });

  it('indisponível com quatro poderes da Tormenta sem Anatomia Insana', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANTENAS, CARAPACA, DENTES_AFIADOS, MAOS_MEMBRANOSAS];

    expect(isPowerAvailable(sheet, LEGIAO_ABERRANTE)).toBe(false);
  });

  it('disponível com Anatomia Insana e três outros poderes da Tormenta', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [ANATOMIA_INSANA, ANTENAS, CARAPACA, DENTES_AFIADOS];

    expect(isPowerAvailable(sheet, LEGIAO_ABERRANTE)).toBe(true);
  });
});
