import { describe, it, expect } from 'vitest';
import {
  getPowerDisplayName,
  getPowerDisplayText,
  getPowerText,
} from '../powerText';

describe('getPowerText (canônico)', () => {
  it('respeita a precedência dynamicText > text > description', () => {
    expect(
      getPowerText({
        dynamicText: 'dinâmico',
        text: 'texto',
        description: 'desc',
      })
    ).toBe('dinâmico');
    expect(getPowerText({ text: 'texto', description: 'desc' })).toBe('texto');
    expect(getPowerText({ description: 'desc' })).toBe('desc');
    expect(getPowerText({})).toBe('');
  });

  it('ignora o override do usuário — é o texto do livro', () => {
    expect(
      getPowerText({ text: 'texto', customDescription: 'meu texto' } as never)
    ).toBe('texto');
  });
});

describe('getPowerDisplayName', () => {
  it('usa o nome customizado quando existe', () => {
    expect(
      getPowerDisplayName({ name: 'Ataque Furtivo', customName: 'Golpe Sujo' })
    ).toBe('Golpe Sujo');
  });

  it('cai no nome do livro sem override, vazio ou só espaços', () => {
    expect(getPowerDisplayName({ name: 'Ataque Furtivo' })).toBe(
      'Ataque Furtivo'
    );
    expect(
      getPowerDisplayName({ name: 'Ataque Furtivo', customName: '' })
    ).toBe('Ataque Furtivo');
    expect(
      getPowerDisplayName({ name: 'Ataque Furtivo', customName: '   ' })
    ).toBe('Ataque Furtivo');
  });
});

describe('getPowerDisplayText', () => {
  it('o override do usuário ganha até de dynamicText', () => {
    expect(
      getPowerDisplayText({
        name: 'Autoridade Eclesiástica',
        dynamicText: 'texto dinâmico',
        text: 'texto do livro',
        customDescription: 'combinado com o mestre',
      })
    ).toBe('combinado com o mestre');
  });

  it('cai no texto canônico sem override ou com override em branco', () => {
    expect(getPowerDisplayText({ name: 'X', text: 'texto do livro' })).toBe(
      'texto do livro'
    );
    expect(
      getPowerDisplayText({
        name: 'X',
        text: 'texto do livro',
        customDescription: '   ',
      })
    ).toBe('texto do livro');
  });
});
