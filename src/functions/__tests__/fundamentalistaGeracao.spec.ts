/**
 * Fundamentalista na geração: o assistente (`generateEmptySheet`) grava a
 * marca; a ficha aleatória nunca é fundamentalista.
 */
import { describe, it, expect } from 'vitest';
import generateRandomSheet, { generateEmptySheet } from '../general';
import SelectOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';

const OPTIONS: SelectOptions = {
  nivel: 1,
  // Elfo: o poder sorteado do Humano deixaria asserções intermitentes.
  raca: 'Elfo',
  classe: 'Guerreiro',
  origin: 'Acólito',
  devocao: { label: 'Khalmyr', value: 'KHALMYR' },
  supplements: [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_DEUSES_ARTON,
  ],
  fundamentalista: true,
};

describe('Fundamentalista na geração de ficha', () => {
  it('assistente grava o dogma e sorteia um poder concedido a mais', () => {
    const sheet = generateEmptySheet(OPTIONS, {});
    expect(sheet.devoto?.fundamentalista).toEqual({ dogma: 'sacerdote' });
    // Guerreiro escolhe 1 (padrão) + 1 do fundamentalista.
    expect(sheet.devoto?.poderes).toHaveLength(2);
  });

  it('respeita o dogma escolhido por classe não divina', () => {
    const sheet = generateEmptySheet(
      { ...OPTIONS, dogmaFundamentalista: 'paladino' },
      {}
    );
    expect(sheet.devoto?.fundamentalista).toEqual({ dogma: 'paladino' });
  });

  it('sem Deuses de Arton não marca e não ganha o poder extra', () => {
    const sheet = generateEmptySheet(
      { ...OPTIONS, supplements: [SupplementId.TORMENTA20_CORE] },
      {}
    );
    expect(sheet.devoto?.fundamentalista).toBeUndefined();
    expect(sheet.devoto?.poderes).toHaveLength(1);
  });

  it('desligado não marca', () => {
    const sheet = generateEmptySheet(
      { ...OPTIONS, fundamentalista: false },
      {}
    );
    expect(sheet.devoto?.fundamentalista).toBeUndefined();
  });

  it('ficha aleatória nunca é fundamentalista', () => {
    for (let i = 0; i < 5; i += 1) {
      const sheet = generateRandomSheet(OPTIONS);
      expect(sheet.devoto?.fundamentalista).toBeUndefined();
    }
  });
});
