import { describe, it, expect } from 'vitest';
import { filterOfId, nameFromId, prefixOf } from '../itemId';

describe('prefixOf', () => {
  it('pega o trecho até o primeiro dois-pontos', () => {
    expect(prefixOf('class-power:Arcanista:Magia Acelerada')).toBe(
      'class-power'
    );
    expect(prefixOf('sem-prefixo')).toBe('');
  });
});

describe('nameFromId', () => {
  it('ids de duas partes', () => {
    expect(nameFromId('spell:Bola de Fogo')).toBe('Bola de Fogo');
    expect(nameFromId('class:Arcanista')).toBe('Arcanista');
  });
  it('ids de três partes descartam o dono', () => {
    expect(nameFromId('power:COMBATE:Ataque Poderoso')).toBe('Ataque Poderoso');
    expect(nameFromId('class-power:Arcanista:Magia Acelerada')).toBe(
      'Magia Acelerada'
    );
  });
  it('preserva dois-pontos dentro do nome', () => {
    expect(
      nameFromId(
        'class-ability:Cavaleiro:Postura de Combate: Aríete Implacável'
      )
    ).toBe('Postura de Combate: Aríete Implacável');
  });
  it('id sem forma conhecida volta inteiro', () => {
    expect(nameFromId('esquisito')).toBe('esquisito');
    expect(nameFromId('spell:')).toBe('spell:');
  });
});

describe('filterOfId', () => {
  it('classifica cada prefixo', () => {
    expect(filterOfId('spell:X')).toBe('spells');
    expect(filterOfId('power:MAGIA:X')).toBe('powers');
    expect(filterOfId('class-power:A:X')).toBe('powers');
    expect(filterOfId('origin-power:A:X')).toBe('powers');
    expect(filterOfId('deity-power:A:X')).toBe('powers');
    expect(filterOfId('class-ability:A:X')).toBe('abilities');
    expect(filterOfId('race-ability:A:X')).toBe('abilities');
    expect(filterOfId('class:X')).toBe('others');
    expect(filterOfId('race:X')).toBe('others');
    expect(filterOfId('origin:X')).toBe('others');
    expect(filterOfId('deity:X')).toBe('others');
  });
  it('prefixo desconhecido não tem categoria', () => {
    expect(filterOfId('coisa:X')).toBeNull();
  });
});
